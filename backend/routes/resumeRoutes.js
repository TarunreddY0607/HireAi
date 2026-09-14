import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import upload from "../middleware/upload.js";

import {
    getResume,
    updateResume,
    uploadNewResume
} from "../controllers/resumeController.js";


const router = express.Router();


// ==========================================
// Authentication
// ==========================================

router.use(authMiddleware);


// ==========================================
// GET CURRENT / MAIN RESUME
// ==========================================

router.get(
    "/",
    getResume
);


// ==========================================
// UPDATE CURRENT / MAIN RESUME
// ==========================================

router.put(
    "/",
    updateResume
);


// ==========================================
// UPLOAD NEW RESUME
// ==========================================
// POST /api/resume/upload
//
// The uploaded PDF becomes the MAIN resume.
// ==========================================

router.post(
    "/upload",
    upload.single("resume"),
    uploadNewResume
);


export default router;