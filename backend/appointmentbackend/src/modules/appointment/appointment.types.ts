import { Types } from "mongoose";

export type AppointmentStatus = "booked" | "cancelled" | "completed" | "rescheduled" | "no-show";

export interface IAppointment {
    organizationId: Types.ObjectId;
    staffId: Types.ObjectId;
    userId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: AppointmentStatus;
    notes?: string;
    reminderSent: boolean;
    previousStartTime?: Date;
    rescheduledAt?: Date;
    rescheduleCount: number;
    serviceId: Types.ObjectId; 
}
