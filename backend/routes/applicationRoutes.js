import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    applyJob,
    getRecruiterApplicants,
    updateApplicationStatus,
    getAppliedJobs,
    submitApplication,
    getApplicationCount,
    deleteApplication
} from "../controllers/applicationController.js";


const router = express.Router();


// ======================================================
// APPLY JOB
// ======================================================

router.post(

    "/apply/:jobId",

    authMiddleware,

    applyJob

);


// ======================================================
// RECRUITER - GET ALL APPLICANTS
// ======================================================

router.get(

    "/recruiter",

    authMiddleware,

    getRecruiterApplicants

);


// ======================================================
// LOGGED-IN USER - GET APPLIED JOBS
// ======================================================

router.get(

    "/my",

    authMiddleware,

    getAppliedJobs

);


// ======================================================
// APPLICATION COUNT
// JOB SEEKER DASHBOARD
// ======================================================

router.get(

    "/count",

    authMiddleware,

    getApplicationCount

);


// ======================================================
// SUBMIT APPLICATION
// ======================================================

router.post(

    "/submit",

    authMiddleware,

    submitApplication

);


// ======================================================
// UPDATE APPLICATION STATUS
//
// Recruiter uses this endpoint to:
//
// PENDING
//     ↓
// SHORTLISTED
//
// When shortlisted:
// vacancies decrease by 1
//
// PENDING
//     ↓
// REJECTED
//
// Vacancy does NOT decrease.
// ======================================================

router.put(

    "/:id/status",

    authMiddleware,

    updateApplicationStatus

);


// ======================================================
// DELETE APPLICATION
//
// Only REJECTED applications can be deleted.
//
// PENDING      → Cannot Delete
// SHORTLISTED  → Cannot Delete
// REJECTED     → Can Delete
// ======================================================

router.delete(

    "/:id",

    authMiddleware,

    deleteApplication

);


export default router;