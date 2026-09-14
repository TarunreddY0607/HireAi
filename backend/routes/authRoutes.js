import express from "express";
import upload from "../middleware/upload.js";
import {
    registerJobSeeker,
    login,
    sendForgotOtp,
    verifyForgotOtp,
    resetPasswordWithOtp,
    sendRegisterOtp,
    verifyRegisterOtp
} from "../controllers/authController.js";

const router = express.Router();

// Registration - Send Email Verification OTP
router.post(
    "/send-register-otp",
    sendRegisterOtp
);

// Registration - Verify Email OTP
router.post(
    "/verify-register-otp",
    verifyRegisterOtp
);

// Job Seeker Registration
router.post(
    "/jobseeker/register",
    upload.single("resume"),
    registerJobSeeker
);

// Login
router.post(
    "/login",
    login
);

// Forgot Password - Send OTP
router.post(
    "/forgot-password/send-otp",
    sendForgotOtp
);

// Forgot Password - Verify OTP
router.post(
    "/forgot-password/verify-otp",
    verifyForgotOtp
);

// Forgot Password - Reset Password
router.post(
    "/forgot-password/reset-password",
    resetPasswordWithOtp
);

export default router;