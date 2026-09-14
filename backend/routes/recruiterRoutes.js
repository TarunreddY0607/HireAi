import express from "express";

import {
    registerRecruiter,
    getCompanyProfile,
    updateCompanyProfile,
    analyzeWebsiteController
} from "../controllers/recruiterController.js";

import {
    getRecruiterDashboard
} from "../controllers/recruiterDashboardController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// Recruiter Registration
// ==========================================

router.post(
    "/register",
    registerRecruiter
);


// ==========================================
// Recruiter Dashboard
// ==========================================

router.get(
    "/dashboard",
    authMiddleware,
    getRecruiterDashboard
);


// ==========================================
// Analyze Company Website (AI Intelligence)
// ==========================================

router.post(
    "/analyze-website",
    authMiddleware,
    analyzeWebsiteController
);


// ==========================================
// Company Profile
// ==========================================

// GET Company Profile

router.get(
    "/company-profile",
    authMiddleware,
    getCompanyProfile
);


// UPDATE Company Profile

router.put(
    "/company-profile",
    authMiddleware,
    updateCompanyProfile
);


// ==========================================
// Recruiter Route Test
// ==========================================

router.get(
    "/test",
    (req, res) => {

        res.status(200).json({

            success: true,

            message: "Recruiter routes are working"

        });

    }
);


export default router;