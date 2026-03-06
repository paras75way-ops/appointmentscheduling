import BusinessHours from "./businessHours.models";
import { IBusinessHours, IDaySchedule } from "./businessHours.types";
import { Types } from "mongoose";

interface UpsertBusinessHoursInput {
    organizationId: string;
    slotDuration: number;
    schedule: IDaySchedule[];
}

export const upsertBusinessHours = async (
    input: UpsertBusinessHoursInput
): Promise<IBusinessHours> => {
    const { organizationId, slotDuration, schedule } = input;

    if (!slotDuration || slotDuration < 5) {
        throw new Error("slotDuration must be at least 5 minutes");
    }

    if (!schedule || schedule.length === 0) {
        throw new Error("Schedule must include at least one day");
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    for (const day of schedule) {
        if (day.isOpen) {
            if (!timeRegex.test(day.openTime) || !timeRegex.test(day.closeTime)) {
                throw new Error(
                    `Invalid time format for ${day.day}. Use HH:mm (e.g. "09:00")`
                );
            }
            if (day.openTime >= day.closeTime) {
                throw new Error(
                    `openTime must be before closeTime for ${day.day}`
                );
            }
        }
    }

    const doc = await BusinessHours.findOneAndUpdate(
        { organizationId: new Types.ObjectId(organizationId) },
        { $set: { slotDuration, schedule } },
        {
            returnDocument: "after",
            upsert: true, runValidators: true
        }
    );

    return doc;
};

export const getBusinessHours = async (
    organizationId: string
): Promise<IBusinessHours> => {
    const doc = await BusinessHours.findOne({
        organizationId: new Types.ObjectId(organizationId),
    });

    if (!doc) {
        throw new Error("Business hours not configured for this organization");
    }

    return doc;
};
