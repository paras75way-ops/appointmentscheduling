import { Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "staff";

  organizationId?: Types.ObjectId;

  refreshToken?: string;

  isVerified: boolean;

  otp?: string;
  otpExpires?: Date;
}