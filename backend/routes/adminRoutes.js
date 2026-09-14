import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
    getCompanies,
    verifyCompany,
    rejectCompany
} from "../controllers/adminController.js";

const router = express.Router();

// ==========================================
// Admin Authentication
// ==========================================

router.use(authMiddleware);

router.use(adminMiddleware);

// ==========================================
// Get All Companies
// ==========================================

router.get(
    "/companies",
    getCompanies
);

// ==========================================
// Verify Company
// ==========================================

router.put(
    "/companies/:id/verify",
    verifyCompany
);

// ==========================================
// Reject Company
// ==========================================

router.put(
    "/companies/:id/reject",
    rejectCompany
);

export default router;