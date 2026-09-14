import express from "express";

import {
    getJobs,
    getJobById,
    getRecruiterJobs,
    createJob,
    updateJob,
    deleteJob,
    getRecommendedJobs
} from "../controllers/jobController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


// ==================================================
// PUBLIC ROUTES
// ==================================================


// --------------------------------------------------
// Get All Jobs
// GET /api/jobs
// --------------------------------------------------

router.get(
    "/",
    getJobs
);


// ==================================================
// PROTECTED GET ROUTES
// ==================================================


// --------------------------------------------------
// Recruiter's Own Jobs
// IMPORTANT: MUST COME BEFORE /:id
//
// GET /api/jobs/recruiter
// --------------------------------------------------

router.get(
    "/recruiter",
    authMiddleware,
    getRecruiterJobs
);


// --------------------------------------------------
// Recommended Jobs
//
// GET /api/jobs/recommended
// --------------------------------------------------

router.get(
    "/recommended",
    authMiddleware,
    getRecommendedJobs
);


// ==================================================
// SINGLE JOB
// ==================================================


// --------------------------------------------------
// Get Single Job
//
// MUST COME AFTER /recruiter
// AND /recommended
//
// GET /api/jobs/:id
// --------------------------------------------------

router.get(
    "/:id",
    getJobById
);


// ==================================================
// CREATE JOB
// ==================================================


// POST /api/jobs

router.post(
    "/",
    authMiddleware,
    createJob
);


// ==================================================
// UPDATE JOB
// ==================================================


// PUT /api/jobs/:id

router.put(
    "/:id",
    authMiddleware,
    updateJob
);


// ==================================================
// DELETE JOB
// ==================================================


// DELETE /api/jobs/:id

router.delete(
    "/:id",
    authMiddleware,
    deleteJob
);


export default router;