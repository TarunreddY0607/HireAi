import db from "../config/db.js";

// ==========================================
// Recruiter Analytics
// ==========================================

export const getRecruiterAnalytics = (req, res) => {

    const userId = req.user.userId;

    // ------------------------------------------
    // Get recruiter ID
    // ------------------------------------------

    db.query(
        `
        SELECT id
        FROM recruiters
        WHERE user_id = ?
        `,
        [userId],

        (err, recruiterResult) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            if (recruiterResult.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Recruiter Not Found"
                });

            }

            const recruiterId = recruiterResult[0].id;

            // ------------------------------------------
            // Overall Statistics
            // ------------------------------------------

            const statsQuery = `
                SELECT

                    COUNT(DISTINCT jobs.id) AS total_jobs,

                    COUNT(applications.id) AS total_applicants,

                    SUM(
                        CASE
                            WHEN applications.status = 'PENDING'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pending_applicants,

                    SUM(
                        CASE
                            WHEN applications.status = 'SHORTLISTED'
                            THEN 1
                            ELSE 0
                        END
                    ) AS shortlisted_applicants,

                    SUM(
                        CASE
                            WHEN applications.status = 'REJECTED'
                            THEN 1
                            ELSE 0
                        END
                    ) AS rejected_applicants,

                    SUM(
                        CASE
                            WHEN applications.interview_completed = 1
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_interviews,

                    ROUND(
                        AVG(job_seekers.ats_score),
                        1
                    ) AS average_ats_score,

                    ROUND(
                        AVG(job_interviews.overall_score),
                        1
                    ) AS average_interview_score

                FROM jobs

                LEFT JOIN applications
                    ON jobs.id = applications.job_id

                LEFT JOIN job_seekers
                    ON applications.user_id = job_seekers.user_id

                LEFT JOIN job_interviews
                    ON applications.interview_id = job_interviews.id

                WHERE jobs.recruiter_id = ?
            `;

            db.query(
                statsQuery,
                [recruiterId],

                (err, statsResult) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            success: false,
                            message: "Failed To Load Statistics"
                        });

                    }

                    // ------------------------------------------
                    // Job-wise Analytics
                    // ------------------------------------------

                    const jobsQuery = `
                        SELECT

                            jobs.id,

                            jobs.title,

                            COUNT(applications.id)
                                AS applicants,

                            SUM(
                                CASE
                                    WHEN applications.status = 'SHORTLISTED'
                                    THEN 1
                                    ELSE 0
                                END
                            ) AS shortlisted,

                            SUM(
                                CASE
                                    WHEN applications.status = 'REJECTED'
                                    THEN 1
                                    ELSE 0
                                END
                            ) AS rejected,

                            SUM(
                                CASE
                                    WHEN applications.interview_completed = 1
                                    THEN 1
                                    ELSE 0
                                END
                            ) AS interviews_completed

                        FROM jobs

                        LEFT JOIN applications
                            ON jobs.id = applications.job_id

                        WHERE jobs.recruiter_id = ?

                        GROUP BY jobs.id, jobs.title

                        ORDER BY applicants DESC
                    `;

                    db.query(
                        jobsQuery,
                        [recruiterId],

                        (err, jobsResult) => {

                            if (err) {

                                console.log(err);

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed To Load Job Analytics"
                                });

                            }

                            // ------------------------------------------
                            // Send Response
                            // ------------------------------------------

                            return res.json({

                                success: true,

                                statistics: statsResult[0],

                                jobs: jobsResult

                            });

                        }
                    );

                }
            );

        }
    );

};