import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    startInterview,
    evaluateAnswer,
    saveJobInterview
} from "../controllers/interviewController.js";

const router = express.Router();


// ==========================================
// Start Interview
// ==========================================

router.post(
    "/start",
    authMiddleware,
    startInterview
);


// ==========================================
// Evaluate Answer
// ==========================================

router.post(
    "/evaluate",
    authMiddleware,
    evaluateAnswer
);


// ==========================================
// Save Job Application Interview
// ==========================================

router.post(
    "/job",
    authMiddleware,
    saveJobInterview
);


export default router;