import express from "express";

import {
    getRecruiterDashboard
} from "../controllers/recruiterDashboardController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// Recruiter Dashboard
// ==========================================

router.get(
    "/dashboard",
    authMiddleware,
    getRecruiterDashboard
);

export default router;