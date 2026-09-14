import express from "express";

import {

    saveInterviewHistory,

    getInterviewHistory,

    getInterviewById,

    deleteInterview

} from "../controllers/interviewHistoryController.js";

import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// Save Interview
// ==========================================

router.post(

    "/",

    verifyToken,

    saveInterviewHistory

);

// ==========================================
// Get All Interview History
// ==========================================

router.get(

    "/",

    verifyToken,

    getInterviewHistory

);

// ==========================================
// Get Single Interview
// ==========================================

router.get(

    "/:id",

    verifyToken,

    getInterviewById

);

// ==========================================
// Delete Interview
// ==========================================

router.delete(

    "/:id",

    verifyToken,

    deleteInterview

);

export default router;