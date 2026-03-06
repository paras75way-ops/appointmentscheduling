import mongoose, { Document, Schema } from "mongoose";
import { IAppointment, AppointmentStatus } from "./appointment.types";

export interface IAppointmentDocument extends IAppointment, Document { }

const appointmentSchema = new Schema<IAppointmentDocument>(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        staffId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["booked", "cancelled", "completed", "rescheduled", "no-show"] as AppointmentStatus[],
            default: "booked",
        },
        notes: {
            type: String,
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
        previousStartTime: {
            type: Date,
        },
        rescheduledAt: {
            type: Date,
        },
        rescheduleCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

appointmentSchema.index(
    { staffId: 1, startTime: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $in: ["booked", "rescheduled"] } },
    }
);

export default mongoose.model<IAppointmentDocument>(
    "Appointment",
    appointmentSchema
);
