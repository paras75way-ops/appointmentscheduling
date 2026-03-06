import { Request, Response } from "express";
import * as authService from "./auth.service";
import jwt from "jsonwebtoken";
import User from "./auth.models";
import { AuthRequest } from "../../middleware/auth.middleware";
import { generateAccessToken } from "../../utils/token";

interface RefreshTokenPayload {
  id: string;
  role: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return res.status(400).json({ message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const result = await authService.verifyOtp(email, otp);

    return res.json(result);
  } catch (err: unknown) {
    return res
      .status(400)
      .json({
        message: err instanceof Error ? err.message : "An error occurred",
      });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const result = await authService.resendOtp(email);

    return res.json(result);
  } catch (err: unknown) {
    return res
      .status(400)
      .json({
        message: err instanceof Error ? err.message : "An error occurred",
      });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await authService.loginUser(
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.json({ accessToken });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return res.status(400).json({ message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!
    ) as RefreshTokenPayload;

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!
      ) as RefreshTokenPayload;

      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    } catch { }
  }

  res.clearCookie("refreshToken");

  return res.json({ message: "Logged out" });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findById(userId).select("-password -refreshToken -otp -otpExpires");

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json(user);
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.json(result);
  } catch (err: unknown) {
    return res
      .status(400)
      .json({
        message: err instanceof Error ? err.message : "An error occurred",
      });
  }
};