import mongoose, { Document, Schema } from "mongoose";
import { IReschedulePolicy } from "./reschedulePolicy.types";

export interface IReschedulePolicyDocument extends IReschedulePolicy, Document { }

const reschedulePolicySchema = new Schema<IReschedulePolicyDocument>(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            unique: true,
        },
        minHoursBefore: {
            type: Number,
            default: 24,
            min: 0,
        },
        maxReschedules: {
            type: Number,
            default: 2,
            min: 0,
        },
        penaltyLastMinute: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IReschedulePolicyDocument>(
    "ReschedulePolicy",
    reschedulePolicySchema
);
