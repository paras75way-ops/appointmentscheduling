import BusinessHours from "../businessHours/businessHours.models";
import Appointment from "./appointment.models";
import Organization from "../organization/organization.models";
import User from "../auth/auth.models";
import ReschedulePolicy from "./reschedulePolicy.models";
import { ServiceModel } from "../services/services.model";
import { generateSlotsForDay, timeToMinutes } from "../../utils/slotGenerator";
import { buildUtcFromIst, utcToIstHHmm } from "../../utils/timezone";
import { Types } from "mongoose";
import { DayOfWeek } from "../businessHours/businessHours.types";

const DAY_NAMES: DayOfWeek[] = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
];

export interface UtcSlot {
    startTimeUtc: string;
    endTimeUtc: string;
}

interface AvailableSlotsInput {
    organizationId: string;
    staffId: string;
    date: string;
    serviceId?: string;
}

export const getOrganizationStaff = async (organizationId: string) => {
    const org = await Organization.findById(organizationId).populate<{
        staff: { _id: Types.ObjectId; name: string; email: string }[];
    }>("staff", "name email");

    if (!org) throw new Error("Organization not found");
    return org.staff;
};

export const getStaffForService = async (serviceId: string, organizationId: string) => {
    const staff = await User.find({
        services: new Types.ObjectId(serviceId),
        organizationId: new Types.ObjectId(organizationId),
        role: "staff",
    }).select("name email role");

    return staff;
};

export const getAvailableSlots = async (
    input: AvailableSlotsInput
): Promise<UtcSlot[]> => {
    const { organizationId, staffId, date, serviceId } = input;

    const staffUser = await User.findOne({
        _id: new Types.ObjectId(staffId),
        organizationId: new Types.ObjectId(organizationId),
        role: "staff",
    });
    if (!staffUser) throw new Error("Staff member not found in this organization");


    let slotDuration: number;
    if (serviceId) {
        const service = await ServiceModel.findById(serviceId);
        if (!service) throw new Error("Service not found");

        const isAssigned = staffUser.services?.some(
            (s) => s.toString() === serviceId
        );
        if (!isAssigned) {
            throw new Error("Staff member is not assigned to this service");
        }
        slotDuration = service.duration;
    } else {
        const bh = await BusinessHours.findOne({
            organizationId: new Types.ObjectId(organizationId),
        });
        if (!bh) throw new Error("Business hours not configured for this organization");
        slotDuration = bh.slotDuration;
    }

    const bh = await BusinessHours.findOne({
        organizationId: new Types.ObjectId(organizationId),
    });
    if (!bh) throw new Error("Business hours not configured for this organization");

    const dateForDay = new Date(`${date}T12:00:00.000Z`);
    if (isNaN(dateForDay.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    const dayName = DAY_NAMES[dateForDay.getUTCDay()];
    const daySchedule = bh.schedule.find((s) => s.day === dayName);

    if (!daySchedule || !daySchedule.isOpen) return [];

    const hhmmSlots = generateSlotsForDay(
        daySchedule.openTime,
        daySchedule.closeTime,
        slotDuration
    );

    const dayStart = new Date(`${date}T00:00:00.000+05:30`);
    const dayEnd = new Date(`${date}T23:59:59.999+05:30`);


    const booked = await Appointment.find({
        staffId: new Types.ObjectId(staffId),
        startTime: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ["booked", "rescheduled"] },
    }).select("startTime endTime");

    const now = Date.now();


    return hhmmSlots
        .map((slot) => {
            const startUtc = buildUtcFromIst(date, slot.startTime);
            const endUtc = buildUtcFromIst(date, slot.endTime);
            return { startTimeUtc: startUtc.toISOString(), endTimeUtc: endUtc.toISOString() };
        })
        .filter((slot) => {
            const slotStart = new Date(slot.startTimeUtc).getTime();
            const slotEnd = new Date(slot.endTimeUtc).getTime();


            if (slotStart <= now) return false;


            for (const appt of booked) {
                const apptStart = appt.startTime.getTime();
                const apptEnd = appt.endTime.getTime();

                if (slotStart < apptEnd && slotEnd > apptStart) {
                    return false;
                }
            }
            return true;
        });
};

interface BookAppointmentInput {
    organizationId: string;
    staffId: string;
    userId: string;
    serviceId: string;
    startTimeUtc: string;
    notes?: string;
}

export const bookAppointment = async (input: BookAppointmentInput) => {
    const { organizationId, staffId, userId, serviceId, startTimeUtc, notes } = input;


    const service = await ServiceModel.findById(serviceId);
    if (!service) throw new Error("Service not found");
    if (service.organizationId.toString() !== organizationId) {
        throw new Error("Service does not belong to this organization");
    }


    const staffUser = await User.findById(staffId);
    if (!staffUser) throw new Error("Staff member not found");
    const isAssigned = staffUser.services?.some(
        (s) => s.toString() === serviceId
    );
    if (!isAssigned) {
        throw new Error("Staff member is not assigned to this service");
    }

    const startDate = new Date(startTimeUtc);
    if (isNaN(startDate.getTime())) {
        throw new Error("Invalid startTimeUtc — must be a valid ISO 8601 UTC string");
    }

    if (startDate.getTime() <= Date.now()) {
        throw new Error("Cannot book an appointment in the past");
    }


    const endDate = new Date(startDate.getTime() + service.duration * 60 * 1000);


    const overlapping = await Appointment.findOne({
        staffId: new Types.ObjectId(staffId),
        status: { $in: ["booked", "rescheduled"] },
        startTime: { $lt: endDate },
        endTime: { $gt: startDate },
    });

    if (overlapping) {
        throw new Error(
            "The selected time slot is not available — it clashes with an existing appointment"
        );
    }

    const appointment = await Appointment.create({
        organizationId: new Types.ObjectId(organizationId),
        staffId: new Types.ObjectId(staffId),
        userId: new Types.ObjectId(userId),
        serviceId: new Types.ObjectId(serviceId),
        startTime: startDate,
        endTime: endDate,
        status: "booked",
        notes,
    });

    return appointment;
};

export const cancelAppointment = async (
    appointmentId: string,
    requestingUserId: string,
    requestingRole: string
) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new Error("Appointment not found");
    if (appt.status !== "booked") throw new Error("Appointment is not in booked state");

    const isOwner = appt.userId.toString() === requestingUserId;
    const isPrivileged = ["admin", "staff"].includes(requestingRole);

    if (!isOwner && !isPrivileged) {
        throw new Error("Not authorized to cancel this appointment");
    }

    appt.status = "cancelled";
    await appt.save();
    return { message: "Appointment cancelled successfully" };
};

export const rescheduleAppointment = async (
    appointmentId: string,
    requestingUserId: string,
    requestingRole: string,
    startTimeUtc: string,
    notes?: string
) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new Error("Appointment not found");
    if (appt.status !== "booked" && appt.status !== "rescheduled") {
        throw new Error("Only active appointments can be rescheduled");
    }

    const isOwner = appt.userId.toString() === requestingUserId;
    const isPrivileged = ["admin", "staff"].includes(requestingRole);

    if (!isOwner && !isPrivileged) {
        throw new Error("Not authorized to reschedule this appointment");
    }

    const policy = await ReschedulePolicy.findOne({
        organizationId: appt.organizationId,
    });
    const maxReschedules = policy?.maxReschedules ?? 2;
    const minHoursBefore = policy?.minHoursBefore ?? 24;

    if ((appt.rescheduleCount || 0) >= maxReschedules) {
        throw new Error(
            `Maximum reschedules (${maxReschedules}) reached for this appointment`
        );
    }

    const hoursUntilAppt =
        (appt.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilAppt < minHoursBefore) {
        throw new Error(
            `Rescheduling must be done at least ${minHoursBefore}h before the appointment`
        );
    }

    const startDate = new Date(startTimeUtc);
    if (isNaN(startDate.getTime())) {
        throw new Error("Invalid startTimeUtc — must be a valid ISO 8601 UTC string");
    }

    if (startDate.getTime() <= Date.now()) {
        throw new Error("Cannot reschedule to a time in the past");
    }


    let duration: number;
    if (appt.serviceId) {
        const service = await ServiceModel.findById(appt.serviceId);
        duration = service ? service.duration : 30;
    } else {
        const bh = await BusinessHours.findOne({
            organizationId: appt.organizationId,
        });
        duration = bh ? bh.slotDuration : 30;
    }

    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);


    const overlapping = await Appointment.findOne({
        _id: { $ne: appt._id },
        staffId: appt.staffId,
        status: { $in: ["booked", "rescheduled"] },
        startTime: { $lt: endDate },
        endTime: { $gt: startDate },
    });

    if (overlapping) {
        throw new Error(
            "The selected time slot is not available — it clashes with an existing appointment"
        );
    }

    appt.previousStartTime = appt.startTime;
    appt.startTime = startDate;
    appt.endTime = endDate;
    appt.status = "rescheduled";
    appt.rescheduledAt = new Date();
    appt.rescheduleCount = (appt.rescheduleCount || 0) + 1;
    if (notes !== undefined) {
        appt.notes = notes;
    }

    await appt.save();
    return appt;
};

export const getUserAppointments = async (
    userId: string,
    upcoming = true
) => {
    if (upcoming) {
        return Appointment.find({
            userId: new Types.ObjectId(userId),
            status: { $in: ["booked", "rescheduled"] },
            startTime: { $gte: new Date() },
        })
            .populate("staffId", "name email")
            .populate("organizationId", "name type")
            .populate("serviceId", "name duration price")
            .sort({ startTime: 1 });
    }
    return Appointment.find({
        userId: new Types.ObjectId(userId),
        startTime: { $lt: new Date() },
    })
        .populate("staffId", "name email")
        .populate("organizationId", "name type")
        .populate("serviceId", "name duration price")
        .sort({ startTime: -1 });
};

export const getStaffAppointments = async (staffId: string, date?: string) => {
    const query: {
        staffId: Types.ObjectId;
        startTime?: { $gte: Date; $lte: Date };
    } = {
        staffId: new Types.ObjectId(staffId),
    };

    if (date) {
        query.startTime = {
            $gte: new Date(`${date}T00:00:00.000Z`),
            $lte: new Date(`${date}T23:59:59.999Z`),
        };
    }

    return Appointment.find(query)
        .populate("userId", "name email")
        .populate("serviceId", "name duration price")
        .sort({ startTime: 1 });
};

export const getOrganizationAppointments = async (
    organizationId: string,
    date?: string,
    upcoming = false
) => {
    const query: {
        organizationId: Types.ObjectId;
        startTime?: { $gte: Date; $lte?: Date };
    } = {
        organizationId: new Types.ObjectId(organizationId),
    };

    if (date) {
        query.startTime = {
            $gte: new Date(`${date}T00:00:00.000Z`),
            $lte: new Date(`${date}T23:59:59.999Z`),
        };
    } else if (upcoming) {
        query.startTime = { $gte: new Date() };
    }

    return Appointment.find(query)
        .populate("staffId", "name email")
        .populate("userId", "name email")
        .populate("serviceId", "name duration price")
        .sort({ startTime: -1 });
};

export const getReschedulePolicy = async (organizationId: string) => {
    const policy = await ReschedulePolicy.findOne({
        organizationId: new Types.ObjectId(organizationId),
    });
    if (policy) return policy;
    return {
        organizationId,
        minHoursBefore: 24,
        maxReschedules: 2,
        penaltyLastMinute: false,
    };
};

export const upsertReschedulePolicy = async (
    organizationId: string,
    data: { minHoursBefore?: number; maxReschedules?: number; penaltyLastMinute?: boolean }
) => {
    return ReschedulePolicy.findOneAndUpdate(
        { organizationId: new Types.ObjectId(organizationId) },
        { $set: { ...data, organizationId: new Types.ObjectId(organizationId) } },
        { upsert: true, new: true, runValidators: true }
    );
};
