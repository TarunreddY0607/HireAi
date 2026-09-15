import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db.js";

// ======================================
// Routes
// ======================================

import recruiterRoutes from "./routes/recruiterRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import interviewHistoryRoutes from "./routes/interviewHistoryRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


// ======================================
// Load Environment Variables
// ======================================

dotenv.config();


// ======================================
// Create Express App
// ======================================

const app = express();


// ======================================
// Middleware
// ======================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================
// Serve Uploaded Files
// ======================================

app.use(
    "/uploads",
    express.static("uploads")
);


// ======================================
// API ROUTES
// ======================================


// ======================================
// Authentication
// ======================================

app.use(
    "/api/auth",
    authRoutes
);


// ======================================
// Job Seeker Profile
// ======================================

app.use(
    "/api/jobseeker",
    profileRoutes
);


// ======================================
// Resume Editor
// ======================================

app.use(
    "/api/resume",
    resumeRoutes
);


// ======================================
// AI Resume Analysis
// ======================================

app.use(
    "/api/ai",
    aiRoutes
);


// ======================================
// Jobs
// ======================================

app.use(
    "/api/jobs",
    jobRoutes
);


// ======================================
// AI Interview
// ======================================

app.use(
    "/api/interview",
    interviewRoutes
);


// ======================================
// Interview History
// ======================================

app.use(
    "/api/interview-history",
    interviewHistoryRoutes
);


// ======================================
// Recruiter
// ======================================
//
// POST /api/recruiter/register
// GET  /api/recruiter/dashboard
// GET  /api/recruiter/company-profile
// PUT  /api/recruiter/company-profile
// GET  /api/recruiter/test
//

app.use(
    "/api/recruiter",
    recruiterRoutes
);


// ======================================
// Applications
// ======================================

app.use(
    "/api/applications",
    applicationRoutes
);


// ======================================
// Recruiter Analytics
// ======================================

app.use(
    "/api/analytics",
    analyticsRoutes
);


// ======================================
// Admin
// ======================================
//
// GET /api/admin/companies
// PUT /api/admin/companies/:id/verify
// PUT /api/admin/companies/:id/reject
//

app.use(
    "/api/admin",
    adminRoutes
);


// ======================================
// PUBLIC STATS
// ======================================

app.get(
    "/api/stats",
    (req, res) => {

        const query = `
            SELECT
                (SELECT COUNT(*) FROM users) AS totalRegistered,
                (SELECT COUNT(*) FROM job_seekers) AS jobSeekers,
                (SELECT COUNT(*) FROM recruiters)  AS recruiters,
                (SELECT COUNT(*) FROM job_seekers WHERE (resume_path IS NOT NULL AND resume_path != '') OR ats_score IS NOT NULL) AS resumesAnalyzed,
                (SELECT COUNT(*) FROM jobs) AS totalJobs,
                (SELECT COUNT(*) FROM applications) AS totalApplications,
                (SELECT COALESCE(ROUND(AVG(ats_score), 1), 95.0) FROM job_seekers WHERE ats_score > 0) AS avgScore
        `;

        db.query(query, (err, results) => {

            if (err) {
                console.error("❌ Stats query failed:", err);
                return res.status(500).json({ success: false, message: "DB error" });
            }

            const row = results[0] || {};

            res.json({
                success: true,
                stats: {
                    totalRegistered:   row.totalRegistered   || 0,
                    jobSeekers:        row.jobSeekers        || 0,
                    recruiters:        row.recruiters        || 0,
                    resumesAnalyzed:   row.resumesAnalyzed   || 0,
                    totalJobs:         row.totalJobs         || 0,
                    totalApplications: row.totalApplications || 0,
                    avgScore:          row.avgScore          || 95.0
                }
            });

        });

    }
);


// ======================================
// ROOT TEST ROUTE
// ======================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message: "🚀 HireAI Backend Running..."

        });

    }
);


// ======================================
// 404 HANDLER
// ======================================

app.use(
    (req, res) => {

        console.log(
            "❌ 404 ROUTE NOT FOUND:",
            req.method,
            req.originalUrl
        );

        res.status(404).json({

            success: false,

            message: "Route Not Found",

            route: req.originalUrl

        });

    }
);


// ======================================
// GLOBAL ERROR HANDLER
// ======================================

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ SERVER ERROR:",
            err
        );

        res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }
);


// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 HireAI Server running on port ${PORT}`
        );

        console.log(
            `🏠 Backend: http://localhost:${PORT}`
        );

        console.log(
            `🔐 Auth API: http://localhost:${PORT}/api/auth`
        );

        console.log(
            `👨‍💼 Recruiter API: http://localhost:${PORT}/api/recruiter`
        );

        console.log(
            `📊 Recruiter Dashboard: http://localhost:${PORT}/api/recruiter/dashboard`
        );

        console.log(
            `🔐 Admin API: http://localhost:${PORT}/api/admin`
        );

        // Ensure profile_pic column exists in job_seekers table
        const addColumnSql = `
            ALTER TABLE job_seekers
            ADD COLUMN IF NOT EXISTS profile_pic LONGTEXT DEFAULT NULL;
        `;
        db.query(addColumnSql, (err) => {
            if (err) {
                const addColumnFallback = `
                    ALTER TABLE job_seekers
                    ADD COLUMN profile_pic LONGTEXT DEFAULT NULL;
                `;
                db.query(addColumnFallback, (err2) => {
                    if (err2) {
                        console.log("ℹ️ profile_pic column already exists or could not be added.");
                    } else {
                        console.log("✅ Added profile_pic column to job_seekers table.");
                    }
                });
            } else {
                console.log("✅ Verified profile_pic column in job_seekers table.");
            }
        });

    }
);