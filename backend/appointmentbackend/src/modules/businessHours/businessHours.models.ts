import mongoose, { Document, Schema } from "mongoose";
import { IBusinessHours, IDaySchedule, DayOfWeek } from "./businessHours.types";

export interface IBusinessHoursDocument extends IBusinessHours, Document { }

const dayScheduleSchema = new Schema<IDaySchedule>(
    {
        day: {
            type: String,
            enum: [
                "monday", "tuesday", "wednesday", "thursday",
                "friday", "saturday", "sunday",
            ] as DayOfWeek[],
            required: true,
        },
        isOpen: { type: Boolean, required: true, default: true },
        openTime: { type: String, required: true },
        closeTime: { type: String, required: true },
    },
    { _id: false }
);

const businessHoursSchema = new Schema<IBusinessHoursDocument>(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            unique: true, // one BusinessHours doc per org
        },
        slotDuration: {
            type: Number,
            required: true,
            min: 5,
            default: 30,
        },
        schedule: {
            type: [dayScheduleSchema],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IBusinessHoursDocument>(
    "BusinessHours",
    businessHoursSchema
);
