import { Types } from "mongoose";

export type DayOfWeek =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export interface IDaySchedule {
    day: DayOfWeek;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

export interface IBusinessHours {
    organizationId: Types.ObjectId;
    slotDuration: number;
    schedule: IDaySchedule[];
}
