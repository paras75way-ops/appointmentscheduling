import bcrypt from "bcryptjs";
import User from "./auth.models";
import Organization from "../organization/organization.models";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { IUser } from "./auth.types";
import { sendOtpEmail } from "../../utils/email";
import { OrganizationType } from "../organization/organization.types";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

interface RegisterData extends IUser {
  organizationName?: string;
  organizationType?: OrganizationType;
}

export const registerUser = async (data: RegisterData) => {
  const { name, email, password, role, organizationName, organizationType } =
    data;

  if (role === "staff") {
    throw new Error("Staff members cannot self-register. Contact your admin.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  if (role === "admin") {
    if (!organizationName || !organizationType) {
      throw new Error(
        "Organization name and type are required for admin signup"
      );
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
    otp,
    otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    isVerified: false,
  });

  if (role === "admin" && organizationName && organizationType) {
    const org = await Organization.create({
      name: organizationName,
      type: organizationType,
      owner: user._id,
      staff: [],
    });

    user.organizationId = org._id;
    await user.save();
  }

  await sendOtpEmail(email, otp);

  return {
    message: "OTP sent to email",
  };
};

export const verifyOtp = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("User already verified");

  if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return { message: "Email verified successfully" };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  if (!user.isVerified) throw new Error("Please verify your email first");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return { message: "Password changed successfully" };
};

export const resendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("Email already verified");

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOtpEmail(email, otp);

  return { message: "OTP resent successfully" };
};