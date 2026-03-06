import { Types } from "mongoose";

export interface IReschedulePolicy {
    organizationId: Types.ObjectId;
    minHoursBefore: number;
    maxReschedules: number;
    penaltyLastMinute: boolean;
}
