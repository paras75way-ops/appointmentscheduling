import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  verifyOtp,
  resendOtp,
  changePassword,
} from "./auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", getMe);
router.post("/change-password", changePassword);

export default router;