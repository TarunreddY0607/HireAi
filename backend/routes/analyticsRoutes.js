import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    getRecruiterAnalytics
} from "../controllers/analyticsController.js";

const router = express.Router();

// ==========================================
// Recruiter Analytics
// ==========================================

router.get(
    "/recruiter",
    authMiddleware,
    getRecruiterAnalytics
);

export default router;