import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    analyzeResumeController
} from "../controllers/aiController.js";

const router = express.Router();


// ==========================================
// Authentication
// ==========================================

router.use(authMiddleware);


// ==========================================
// Analyze Resume
// ==========================================

// POST /api/ai/analyze/:resumeId

router.post(
    "/analyze/:resumeId",
    analyzeResumeController
);


export default router;