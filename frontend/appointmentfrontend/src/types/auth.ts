export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "staff";
  organizationId?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface IOrganization {
  _id: string;
  name: string;
  type: "clinic" | "salon" | "service_provider" | "coworking_space";
  owner: string;
  staff: IStaffMember[];
}

export interface IStaffMember {
  _id: string;
  name: string;
  email: string;
  role: "staff";
  createdAt?: string;
}

export interface ISignInForm {
  email: string;
  password: string;
}

export interface ISignUpForm {
  role: "user" | "admin";
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  organizationType?: "clinic" | "salon" | "service_provider" | "coworking_space";
}

export interface IAddStaffForm {
  name: string;
  email: string;
  password: string;
}

export type DayOfWeek =
  | "monday" | "tuesday" | "wednesday" | "thursday"
  | "friday" | "saturday" | "sunday";

export interface IDaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface IBusinessHours {
  _id: string;
  organizationId: string;
  slotDuration: number;
  schedule: IDaySchedule[];
}

export interface IUtcSlot {
  startTimeUtc: string;
  endTimeUtc: string;
}

export type AppointmentStatus = "booked" | "cancelled" | "completed" | "rescheduled" | "no-show";

export interface IAppointment {
  _id: string;
  organizationId: string | { _id: string; name: string; type: string };
  staffId: string | { _id: string; name: string; email: string };
  userId: string | { _id: string; name: string; email: string };
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  previousStartTime?: string;
  rescheduleCount?: number;
  rescheduledAt?: string;
}

export interface IBookAppointmentForm {
  organizationId: string;
  staffId: string;
  startTimeUtc: string;
  notes?: string;
}

export interface IRescheduleAppointmentForm {
  startTimeUtc: string;
  notes?: string;
}

export interface IReschedulePolicy {
  _id?: string;
  organizationId?: string;
  minHoursBefore: number;
  maxReschedules: number;
  penaltyLastMinute: boolean;
}