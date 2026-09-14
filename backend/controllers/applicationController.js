import db from "../config/db.js";
import { sendRecruiterInterviewAlertEmail, sendCandidateShortlistedEmail } from "../services/emailService.js";


// ======================================================
// APPLY JOB
// Creates application before interview
// ======================================================

export const applyJob = (req, res) => {

    const userId = req.user.userId;
    const { jobId } = req.params;


    // ==================================================
    // STEP 1
    // Check Job + Vacancies
    // ==================================================

    db.query(

        `
        SELECT
            id,
            vacancies,
            deadline
        FROM jobs
        WHERE id = ?
        LIMIT 1
        `,

        [jobId],

        (jobError, jobResult) => {

            if (jobError) {

                console.log(
                    "CHECK JOB ERROR:",
                    jobError
                );

                return res.status(500).json({

                    success: false,
                    message: "Database Error"

                });

            }


            // ==========================================
            // Job Not Found
            // ==========================================

            if (jobResult.length === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Job not found"

                });

            }


            const job = jobResult[0];


            // ==========================================
            // Check Vacancies
            // ==========================================

            if (Number(job.vacancies) <= 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No vacancies available for this job."

                });

            }


            // ==================================================
            // STEP 2
            // Check if Already Applied
            // ==================================================

            db.query(

                `
                SELECT *
                FROM applications
                WHERE job_id = ?
                AND user_id = ?
                `,

                [
                    jobId,
                    userId
                ],

                (err, result) => {

                    if (err) {

                        console.log(
                            "CHECK APPLICATION ERROR:",
                            err
                        );

                        return res.status(500).json({

                            success: false,
                            message: "Database Error"

                        });

                    }


                    // ==========================================
                    // Already Applied
                    // ==========================================

                    if (result.length > 0) {

                        return res.status(400).json({

                            success: false,
                            message: "Already Applied"

                        });

                    }


                    // ==================================================
                    // STEP 3
                    // Create Application
                    // ==================================================

                    db.query(

                        `
                        INSERT INTO applications
                        (
                            job_id,
                            user_id
                        )
                        VALUES (?, ?)
                        `,

                        [
                            jobId,
                            userId
                        ],

                        (insertError, insertResult) => {

                            if (insertError) {

                                console.log(
                                    "CREATE APPLICATION ERROR:",
                                    insertError
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed To Start Application"

                                });

                            }


                            return res.status(201).json({

                                success: true,

                                message:
                                    "Application Started Successfully",

                                applicationId:
                                    insertResult.insertId

                            });

                        }

                    );

                }

            );

        }

    );

};



// ======================================================
// RECRUITER - GET ALL APPLICANTS
// ======================================================

export const getRecruiterApplicants = (req, res) => {

    const userId = req.user.userId;


    const sql = `

        SELECT

            applications.id,

            applications.status,

            applications.applied_at,

            applications.interview_completed,

            applications.interview_id,

            jobs.id AS job_id,

            jobs.title,

            jobs.company,

            jobs.vacancies,

            users.id AS user_id,

            users.email,

            job_seekers.full_name,

            job_seekers.phone,

            job_seekers.resume_path,

            job_seekers.ats_score,

            job_seekers.hire_probability,

            job_seekers.summary,

            job_seekers.skills,

            job_seekers.education,

            job_seekers.experience,

            job_seekers.projects,

            job_seekers.certifications,

            job_seekers.github,

            job_seekers.linkedin,

            job_seekers.profile_pic,

            job_interviews.technical_score,

            job_interviews.communication_score,

            job_interviews.confidence_score,

            job_interviews.overall_score,

            job_interviews.ai_feedback,

            job_interviews.recommendation,

            job_interviews.completed_at


        FROM applications

        JOIN jobs
            ON applications.job_id = jobs.id

        JOIN recruiters
            ON jobs.recruiter_id = recruiters.id

        JOIN users
            ON applications.user_id = users.id

        LEFT JOIN job_seekers
            ON users.id = job_seekers.user_id

        LEFT JOIN job_interviews
            ON applications.interview_id = job_interviews.id

        WHERE recruiters.user_id = ?

        ORDER BY applications.applied_at DESC

    `;


    db.query(

        sql,

        [
            userId
        ],

        (err, result) => {

            if (err) {

                console.log(
                    "GET RECRUITER APPLICANTS ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,
                    message: "Database Error"

                });

            }


            return res.json({

                success: true,

                applicants: result

            });

        }

    );

};



// ======================================================
// UPDATE APPLICATION STATUS
//
// IMPORTANT:
// PENDING -> SHORTLISTED
// decreases vacancies by 1
//
// SHORTLISTED -> SHORTLISTED
// does NOT decrease again
//
// PENDING -> REJECTED
// vacancy unchanged
// ======================================================

export const updateApplicationStatus = (req, res) => {

    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;


    // ==================================================
    // STEP 1
    // Validate Status
    // ==================================================

    const allowedStatuses = [

        "PENDING",
        "SHORTLISTED",
        "REJECTED"

    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid Application Status"

        });

    }


    // ==================================================
    // STEP 2
    // Get Application + Job
    // Verify Recruiter Ownership
    // ==================================================

    const findSql = `

        SELECT

            a.id AS application_id,

            a.status AS current_status,

            j.id AS job_id,

            j.vacancies,

            r.user_id AS recruiter_user_id

        FROM applications AS a

        INNER JOIN jobs AS j
            ON a.job_id = j.id

        INNER JOIN recruiters AS r
            ON j.recruiter_id = r.id

        WHERE

            a.id = ?

            AND r.user_id = ?

        LIMIT 1

    `;


    db.query(

        findSql,

        [
            id,
            userId
        ],

        (findError, applicationResult) => {

            if (findError) {

                console.log(
                    "GET APPLICATION STATUS ERROR:",
                    findError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            // ==================================================
            // Application Not Found
            // ==================================================

            if (applicationResult.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found or you are not authorized"

                });

            }


            const application =
                applicationResult[0];


            const currentStatus =
                application.current_status;

            const currentVacancies =
                Number(application.vacancies);


            // ==================================================
            // STEP 3
            // Prevent Duplicate Status
            // ==================================================

            if (currentStatus === status) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Application is already ${status}`

                });

            }


            // ==================================================
            // STEP 4
            // SHORTLIST CANDIDATE
            // ==================================================

            if (status === "SHORTLISTED") {


                // ==============================================
                // Check Vacancy
                // ==============================================

                if (currentVacancies <= 0) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "No vacancies remaining for this job."

                    });

                }


                // ==============================================
                // Start Transaction
                // ==============================================

                db.beginTransaction(

                    (transactionError) => {

                        if (transactionError) {

                            console.log(
                                "TRANSACTION START ERROR:",
                                transactionError
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed to start transaction"

                            });

                        }


                        // ==========================================
                        // STEP 4A
                        // Shortlist Application
                        // ==========================================

                        db.query(

                            `

                            UPDATE applications

                            SET status = 'SHORTLISTED'

                            WHERE id = ?

                            AND status = 'PENDING'

                            `,

                            [
                                id
                            ],

                            (statusError, statusResult) => {

                                if (statusError) {

                                    return db.rollback(

                                        () => {

                                            console.log(
                                                "SHORTLIST APPLICATION ERROR:",
                                                statusError
                                            );

                                            return res.status(500).json({

                                                success: false,

                                                message:
                                                    "Failed to shortlist application"

                                            });

                                        }

                                    );

                                }


                                // ==========================================
                                // Make sure status changed
                                // ==========================================

                                if (
                                    statusResult.affectedRows === 0
                                ) {

                                    return db.rollback(

                                        () => {

                                            return res.status(400).json({

                                                success: false,

                                                message:
                                                    "Application is no longer pending."

                                            });

                                        }

                                    );

                                }


                                // ==========================================
                                // STEP 4B
                                // Decrease Vacancy
                                // ==========================================

                                db.query(

                                    `

                                    UPDATE jobs

                                    SET vacancies = vacancies - 1

                                    WHERE id = ?

                                    AND vacancies > 0

                                    `,

                                    [
                                        application.job_id
                                    ],

                                    (vacancyError, vacancyResult) => {

                                        if (vacancyError) {

                                            return db.rollback(

                                                () => {

                                                    console.log(
                                                        "VACANCY UPDATE ERROR:",
                                                        vacancyError
                                                    );

                                                    return res.status(500).json({

                                                        success: false,

                                                        message:
                                                            "Failed to update vacancies"

                                                    });

                                                }

                                            );

                                        }


                                        // ==========================================
                                        // Vacancy could not be reduced
                                        // ==========================================

                                        if (
                                            vacancyResult.affectedRows === 0
                                        ) {

                                            return db.rollback(

                                                () => {

                                                    return res.status(400).json({

                                                        success: false,

                                                        message:
                                                            "No vacancies remaining for this job."

                                                    });

                                                }

                                            );

                                        }


                                        // ==========================================
                                        // STEP 4C
                                        // Commit Transaction
                                        // ==========================================

                                        db.commit(

                                            (commitError) => {

                                                if (commitError) {

                                                    return db.rollback(

                                                        () => {

                                                            console.log(
                                                                "COMMIT ERROR:",
                                                                commitError
                                                            );

                                                            return res.status(500).json({

                                                                success: false,

                                                                message:
                                                                    "Failed to complete shortlist"

                                                            });

                                                        }

                                                    );

                                                }


                                                // ==========================================
                                                // SUCCESS - Trigger Shortlist Notification Email
                                                // ==========================================
                                                const shortlistQuery = `
                                                    SELECT 
                                                        applications.id AS application_id,
                                                        jobs.title AS job_title,
                                                        jobs.company AS company_name,
                                                        recruiters.official_email,
                                                        recruiters.hr_name,
                                                        candidate_user.email AS candidate_email,
                                                        candidate_user.name AS candidate_user_name,
                                                        job_seekers.full_name AS candidate_full_name,
                                                        job_seekers.phone AS candidate_phone,
                                                        job_seekers.ats_score,
                                                        job_interviews.overall_score
                                                    FROM applications
                                                    JOIN jobs ON applications.job_id = jobs.id
                                                    JOIN recruiters ON jobs.recruiter_id = recruiters.id
                                                    JOIN users candidate_user ON applications.user_id = candidate_user.id
                                                    LEFT JOIN job_seekers ON candidate_user.id = job_seekers.user_id
                                                    LEFT JOIN job_interviews ON applications.interview_id = job_interviews.id
                                                    WHERE applications.id = ?
                                                    LIMIT 1
                                                `;

                                                db.query(shortlistQuery, [id], (sErr, sRows) => {
                                                    if (!sErr && sRows && sRows.length > 0) {
                                                        const sRow = sRows[0];
                                                        const candEmail = (sRow.candidate_email || "").trim();
                                                        if (candEmail) {
                                                            sendCandidateShortlistedEmail({
                                                                toEmail: candEmail,
                                                                candidateName: sRow.candidate_full_name || sRow.candidate_user_name || "Candidate",
                                                                jobTitle: sRow.job_title || "Job Position",
                                                                companyName: sRow.company_name || "Hiring Company",
                                                                hrName: sRow.hr_name || "Hiring Manager",
                                                                companyEmail: sRow.official_email || "",
                                                                atsScore: sRow.ats_score,
                                                                interviewScore: sRow.overall_score
                                                            }).catch(mailErr => console.error("⚠️ Shortlist candidate email error:", mailErr.message));
                                                        }
                                                    }
                                                });

                                                const remainingVacancies =
                                                    currentVacancies - 1;

                                                return res.status(200).json({
                                                    success: true,
                                                    message:
                                                        "Candidate shortlisted successfully.",
                                                    remainingVacancies:
                                                        remainingVacancies
                                                });


                                            }

                                        );

                                    }

                                );

                            }

                        );

                    }

                );

                return;

            }


            // ==================================================
            // STEP 5
            // REJECT / OTHER STATUS
            //
            // Vacancy does NOT change
            // ==================================================

            const updateSql = `

                UPDATE applications AS a

                INNER JOIN jobs AS j
                    ON a.job_id = j.id

                INNER JOIN recruiters AS r
                    ON j.recruiter_id = r.id

                SET a.status = ?

                WHERE

                    a.id = ?

                    AND r.user_id = ?

            `;


            db.query(

                updateSql,

                [
                    status,
                    id,
                    userId
                ],

                (updateError, result) => {

                    if (updateError) {

                        console.log(
                            "UPDATE APPLICATION STATUS ERROR:",
                            updateError
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Database Error"

                        });

                    }


                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            message:
                                "Application not found"

                        });

                    }


                    return res.status(200).json({

                        success: true,

                        message:
                            "Status Updated Successfully"

                    });

                }

            );

        }

    );

};



// ======================================================
// DELETE APPLICATION
//
// PENDING      -> Cannot Delete
// SHORTLISTED  -> Cannot Delete
// REJECTED     -> Can Delete
//
// Only recruiter who owns the job can delete.
// ======================================================

export const deleteApplication = (req, res) => {

    const userId = req.user.userId;
    const { id } = req.params;


    // ==================================================
    // Find Application
    // ==================================================

    const findSql = `

        SELECT

            a.id,

            a.status,

            a.interview_id,

            a.interview_completed

        FROM applications AS a

        INNER JOIN jobs AS j
            ON a.job_id = j.id

        INNER JOIN recruiters AS r
            ON j.recruiter_id = r.id

        WHERE

            a.id = ?

            AND r.user_id = ?

    `;


    db.query(

        findSql,

        [
            id,
            userId
        ],

        (err, applications) => {

            if (err) {

                console.log(
                    "DELETE APPLICATION FIND ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            // ==========================================
            // Application Not Found
            // ==========================================

            if (applications.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found"

                });

            }


            const application =
                applications[0];


            // ==========================================
            // ONLY REJECTED CAN BE DELETED
            // ==========================================

            if (
                application.status !== "REJECTED"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only rejected applications can be deleted"

                });

            }


            // ==========================================
            // Start Transaction
            // ==========================================

            db.beginTransaction(

                (transactionError) => {

                    if (transactionError) {

                        console.log(
                            "TRANSACTION ERROR:",
                            transactionError
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to start delete transaction"

                        });

                    }


                    // ==========================================
                    // STEP 1
                    // Remove interview link
                    // ==========================================

                    db.query(

                        `
                        UPDATE applications

                        SET interview_id = NULL

                        WHERE id = ?
                        `,

                        [
                            id
                        ],

                        (err) => {

                            if (err) {

                                return db.rollback(

                                    () => {

                                        console.log(
                                            "STEP 1 ERROR:",
                                            err
                                        );

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Failed to unlink interview"

                                        });

                                    }

                                );

                            }


                            // ==========================================
                            // STEP 2
                            // Delete interview
                            // ==========================================

                            db.query(

                                `
                                DELETE FROM job_interviews

                                WHERE application_id = ?
                                `,

                                [
                                    id
                                ],

                                (err) => {

                                    if (err) {

                                        return db.rollback(

                                            () => {

                                                console.log(
                                                    "STEP 2 ERROR:",
                                                    err
                                                );

                                                return res.status(500).json({

                                                    success: false,

                                                    message:
                                                        "Failed to delete interview data"

                                                });

                                            }

                                        );

                                    }


                                    // ==========================================
                                    // STEP 3
                                    // Delete Application
                                    // ==========================================

                                    db.query(

                                        `
                                        DELETE FROM applications

                                        WHERE id = ?
                                        `,

                                        [
                                            id
                                        ],

                                        (err, result) => {

                                            if (err) {

                                                return db.rollback(

                                                    () => {

                                                        console.log(
                                                            "STEP 3 ERROR:",
                                                            err
                                                        );

                                                        return res.status(500).json({

                                                            success: false,

                                                            message:
                                                                "Failed to delete application"

                                                        });

                                                    }

                                                );

                                            }


                                            if (
                                                result.affectedRows === 0
                                            ) {

                                                return db.rollback(

                                                    () => {

                                                        return res.status(404).json({

                                                            success: false,

                                                            message:
                                                                "Application not found"

                                                        });

                                                    }

                                                );

                                            }


                                            // ==========================================
                                            // COMMIT
                                            // ==========================================

                                            db.commit(

                                                (commitError) => {

                                                    if (commitError) {

                                                        return db.rollback(

                                                            () => {

                                                                console.log(
                                                                    "COMMIT ERROR:",
                                                                    commitError
                                                                );

                                                                return res.status(500).json({

                                                                    success: false,

                                                                    message:
                                                                        "Failed to complete deletion"

                                                                });

                                                            }

                                                        );

                                                    }


                                                    return res.status(200).json({

                                                        success: true,

                                                        message:
                                                            "Rejected application deleted successfully"

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

};



// ======================================================
// GET MY APPLICATIONS
// JOB SEEKER
// ======================================================

export const getAppliedJobs = (req, res) => {

    const userId = req.user.userId;


    const sql = `

        SELECT

            applications.id AS application_id,

            applications.job_id,

            applications.status,

            applications.applied_at,

            applications.interview_completed,

            applications.interview_id,

            jobs.title,

            jobs.company,

            jobs.location,

            jobs.salary,

            jobs.experience,

            jobs.employment_type,

            jobs.vacancies,

            jobs.deadline,

            job_interviews.technical_score,

            job_interviews.communication_score,

            job_interviews.confidence_score,

            job_interviews.overall_score,

            job_interviews.ai_feedback,

            job_interviews.recommendation,

            job_interviews.completed_at

        FROM applications

        JOIN jobs

            ON applications.job_id = jobs.id

        LEFT JOIN job_interviews

            ON applications.interview_id = job_interviews.id

        WHERE applications.user_id = ?

        ORDER BY applications.applied_at DESC

    `;


    db.query(

        sql,

        [
            userId
        ],

        (err, result) => {

            if (err) {

                console.log(
                    "GET MY APPLICATIONS ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.status(200).json({

                success: true,

                applications: result

            });

        }

    );

};



// ======================================================
// SUBMIT JOB APPLICATION
// Requires completed AI interview
// ======================================================

export const submitApplication = (req, res) => {

    const userId = req.user.userId;
    const { jobId } = req.body;


    // ==========================================
    // Validate Job ID
    // ==========================================

    if (!jobId) {

        return res.status(400).json({

            success: false,

            message:
                "Job ID is required"

        });

    }


    // ==========================================
    // Find Application
    // ==========================================

    db.query(

        `
        SELECT *

        FROM applications

        WHERE job_id = ?

        AND user_id = ?

        `,

        [
            jobId,
            userId
        ],

        (err, applications) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                applications.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found"

                });

            }


            const application =
                applications[0];


            // ==========================================
            // Check Interview
            // ==========================================

            if (
                !application.interview_completed
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please complete the AI interview first"

                });

            }


            // ==========================================
            // Check Interview Result
            // ==========================================

            if (
                !application.interview_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Interview result not found"

                });

            }


            // ==========================================
            // Submit Application
            // ==========================================

            db.query(

                `
                UPDATE applications

                SET status = 'PENDING'

                WHERE id = ?

                AND user_id = ?

                `,

                [
                    application.id,
                    userId
                ],

                (err) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed To Submit Application"

                        });

                    }


                    // Trigger automated email to Recruiter with candidate's interview scorecard & details (asynchronous)
                    const recruiterQuery = `
                        SELECT 
                            applications.id AS application_id,
                            jobs.id AS job_id,
                            jobs.title AS job_title,
                            jobs.company AS company_name,
                            recruiters.official_email,
                            recruiters.hr_name,
                            recruiter_user.email AS recruiter_user_email,
                            candidate_user.email AS candidate_email,
                            candidate_user.name AS candidate_user_name,
                            job_seekers.full_name AS candidate_full_name,
                            job_seekers.phone AS candidate_phone,
                            job_seekers.ats_score,
                            job_interviews.technical_score,
                            job_interviews.communication_score,
                            job_interviews.confidence_score,
                            job_interviews.overall_score,
                            job_interviews.ai_feedback,
                            job_interviews.recommendation
                        FROM applications
                        JOIN jobs ON applications.job_id = jobs.id
                        JOIN recruiters ON jobs.recruiter_id = recruiters.id
                        JOIN users recruiter_user ON recruiters.user_id = recruiter_user.id
                        JOIN users candidate_user ON applications.user_id = candidate_user.id
                        LEFT JOIN job_seekers ON candidate_user.id = job_seekers.user_id
                        LEFT JOIN job_interviews ON applications.interview_id = job_interviews.id
                        WHERE applications.id = ?
                        LIMIT 1
                    `;

                    db.query(recruiterQuery, [application.id], (rErr, rRows) => {
                        if (rErr) {
                            console.error("⚠️ Failed to query recruiter info for email alert:", rErr.message);
                            return;
                        }

                        if (rRows && rRows.length > 0) {
                            const row = rRows[0];
                            const recruiterEmail = (row.official_email || row.recruiter_user_email || "").trim();

                            if (recruiterEmail) {
                                sendRecruiterInterviewAlertEmail({
                                    toEmail: recruiterEmail,
                                    hrName: row.hr_name || "Recruiter",
                                    candidateName: row.candidate_full_name || row.candidate_user_name || "Candidate",
                                    candidateEmail: row.candidate_email || "",
                                    candidatePhone: row.candidate_phone || "",
                                    atsScore: row.ats_score,
                                    jobTitle: row.job_title || "Job Position",
                                    companyName: row.company_name || "Company",
                                    interview: {
                                        technical_score: row.technical_score,
                                        communication_score: row.communication_score,
                                        confidence_score: row.confidence_score,
                                        overall_score: row.overall_score,
                                        ai_feedback: row.ai_feedback,
                                        recommendation: row.recommendation
                                    },
                                    applicationId: row.application_id
                                }).catch(mErr => console.error("⚠️ Recruiter email alert error:", mErr.message));
                            }
                        }
                    });

                    return res.status(200).json({

                        success: true,

                        message:
                            "Application Submitted Successfully",

                        applicationId:
                            application.id

                    });

                }

            );

        }

    );

};



// ======================================================
// GET APPLICATION COUNT
// JOB SEEKER DASHBOARD
// ======================================================

export const getApplicationCount = (req, res) => {

    const userId = req.user.userId;


    const sql = `

        SELECT COUNT(*) AS total

        FROM applications

        WHERE user_id = ?

    `;


    db.query(

        sql,

        [
            userId
        ],

        (err, result) => {

            if (err) {

                console.log(
                    "GET APPLICATION COUNT ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to get application count"

                });

            }


            return res.status(200).json({

                success: true,

                count:
                    result[0].total

            });

        }

    );

};