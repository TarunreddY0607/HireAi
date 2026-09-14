import db from "../config/db.js";

// ==========================================
// Recruiter Dashboard
// ==========================================

export const getRecruiterDashboard = (req, res) => {

    const userId = req.user.userId;

    // ==========================================
    // Debug Information
    // ==========================================

    console.log("🔥 DASHBOARD REQUEST");
    console.log("🔥 USER ID:", userId);

    // ==========================================
    // Get Recruiter Details
    // ==========================================

    const recruiterSql = `

        SELECT

            id,
            user_id,
            company_name,
            hr_name,
            official_email,
            phone,
            website,
            industry,
            company_size,
            company_description,
            logo,
            verification_status,
            website_status,
            website_analysis

        FROM recruiters

        WHERE user_id = ?

    `;

    db.query(
        recruiterSql,
        [userId],
        (err, recruiterResult) => {

            if (err) {

                console.log(
                    "Recruiter Query Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message: "Database Error"

                });

            }

            // ==========================================
            // Recruiter Not Found
            // ==========================================

            if (recruiterResult.length === 0) {

                console.log(
                    "❌ NO RECRUITER FOUND FOR USER ID:",
                    userId
                );

                return res.status(404).json({

                    success: false,

                    message: "Recruiter Profile Not Found"

                });

            }

            const recruiter = recruiterResult[0];

            console.log(
                "✅ RECRUITER FOUND:",
                recruiter.company_name
            );

            const recruiterId = recruiter.id;

            console.log(
                "🔥 RECRUITER ID:",
                recruiterId
            );

            // ==========================================
            // Total Jobs
            // ==========================================

            const jobsSql = `

                SELECT COUNT(*) AS totalJobs

                FROM jobs

                WHERE recruiter_id = ?

            `;

            db.query(
                jobsSql,
                [recruiterId],
                (err, jobsResult) => {

                    if (err) {

                        console.log(
                            "Jobs Count Error:",
                            err
                        );

                        return res.status(500).json({

                            success: false,

                            message: "Database Error"

                        });

                    }

                    const totalJobs =
                        jobsResult[0].totalJobs || 0;

                    // ==========================================
                    // Total Applications
                    // ==========================================

                    const applicationsSql = `

                        SELECT COUNT(*) AS applications

                        FROM applications

                        INNER JOIN jobs
                            ON applications.job_id = jobs.id

                        WHERE jobs.recruiter_id = ?

                    `;

                    db.query(
                        applicationsSql,
                        [recruiterId],
                        (err, applicationsResult) => {

                            if (err) {

                                console.log(
                                    "Applications Count Error:",
                                    err
                                );

                                return res.status(500).json({

                                    success: false,

                                    message: "Database Error"

                                });

                            }

                            const applications =
                                applicationsResult[0].applications || 0;

                            // ==========================================
                            // Shortlisted
                            // ==========================================

                            const shortlistedSql = `

                                SELECT COUNT(*) AS shortlisted

                                FROM applications

                                INNER JOIN jobs
                                    ON applications.job_id = jobs.id

                                WHERE jobs.recruiter_id = ?

                                AND applications.status = 'SHORTLISTED'

                            `;

                            db.query(
                                shortlistedSql,
                                [recruiterId],
                                (err, shortlistedResult) => {

                                    if (err) {

                                        console.log(
                                            "Shortlisted Count Error:",
                                            err
                                        );

                                        return res.status(500).json({

                                            success: false,

                                            message: "Database Error"

                                        });

                                    }

                                    const shortlisted =
                                        shortlistedResult[0].shortlisted || 0;

                                    // ==========================================
                                    // Rejected
                                    // ==========================================

                                    const rejectedSql = `

                                        SELECT COUNT(*) AS rejected

                                        FROM applications

                                        INNER JOIN jobs
                                            ON applications.job_id = jobs.id

                                        WHERE jobs.recruiter_id = ?

                                        AND applications.status = 'REJECTED'

                                    `;

                                    db.query(
                                        rejectedSql,
                                        [recruiterId],
                                        (err, rejectedResult) => {

                                            if (err) {

                                                console.log(
                                                    "Rejected Count Error:",
                                                    err
                                                );

                                                return res.status(500).json({

                                                    success: false,

                                                    message: "Database Error"

                                                });

                                            }

                                            const rejected =
                                                rejectedResult[0].rejected || 0;

                                            // ==========================================
                                            // Recent Jobs
                                            // ==========================================

                                            const recentJobsSql = `

                                                SELECT

                                                    id,
                                                    title,
                                                    company,
                                                    location,
                                                    created_at

                                                FROM jobs

                                                WHERE recruiter_id = ?

                                                ORDER BY created_at DESC

                                                LIMIT 5

                                            `;

                                            db.query(
                                                recentJobsSql,
                                                [recruiterId],
                                                (err, recentJobsResult) => {

                                                    if (err) {

                                                        console.log(
                                                            "Recent Jobs Error:",
                                                            err
                                                        );

                                                        return res.status(500).json({

                                                            success: false,

                                                            message: "Database Error"

                                                        });

                                                    }

                                                    // ==========================================
                                                    // Recent Applicants
                                                    // ==========================================

                                                    const recentApplicantsSql = `

                                                        SELECT

                                                            applications.id,

                                                            applications.status,

                                                            applications.applied_at,

                                                            job_seekers.full_name AS name,

                                                            job_seekers.profile_pic,

                                                            jobs.title

                                                        FROM applications

                                                        INNER JOIN jobs

                                                            ON applications.job_id = jobs.id

                                                        INNER JOIN job_seekers

                                                            ON applications.user_id = job_seekers.user_id

                                                        WHERE jobs.recruiter_id = ?

                                                        ORDER BY applications.applied_at DESC

                                                        LIMIT 5

                                                    `;

                                                    db.query(
                                                        recentApplicantsSql,
                                                        [recruiterId],
                                                        (err, recentApplicantsResult) => {

                                                            if (err) {

                                                                console.log(
                                                                    "Recent Applicants Error:",
                                                                    err
                                                                );

                                                                return res.status(500).json({

                                                                    success: false,

                                                                    message: "Database Error"

                                                                });

                                                            }

                                                            // ==========================================
                                                            // Final Response
                                                            // ==========================================

                                                            console.log(
                                                                "✅ DASHBOARD DATA LOADED"
                                                            );

                                                            if (recruiter.website_analysis && typeof recruiter.website_analysis === "string") {
                                                                try {
                                                                    recruiter.website_analysis = JSON.parse(recruiter.website_analysis);
                                                                } catch (e) {}
                                                            }

                                                            return res.status(200).json({

                                                                success: true,

                                                                recruiter: recruiter,

                                                                stats: {

                                                                    totalJobs:
                                                                        totalJobs,

                                                                    applications:
                                                                        applications,

                                                                    shortlisted:
                                                                        shortlisted,

                                                                    rejected:
                                                                        rejected

                                                                },

                                                                recentJobs:
                                                                    recentJobsResult,

                                                                recentApplicants:
                                                                    recentApplicantsResult

                                                            });

                                                        }
                                                    );

                                                }
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};