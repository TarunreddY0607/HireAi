// resumeController.js

import db from "../config/db.js";
import { calculateATS } from "../services/atsCalculator.js";
import { notifyCandidateForMatchingJobs } from "../services/jobMatchAlertService.js";


// =========================================================
// SAFE JSON PARSER
// =========================================================

const safeParse = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "object") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch (error) {

        console.log(
            "JSON PARSE ERROR:",
            error
        );

        return [];
    }
};


// =========================================================
// GET CURRENT USER RESUME
// =========================================================

export const getResume = (req, res) => {

    const userId = req.user.userId;

    // =====================================================
    // GET JOB SEEKER PROFILE
    // =====================================================

    const jobSeekerSQL = `

        SELECT

            id,
            user_id,
            full_name,
            phone,
            resume_path,

            resume_name,
            resume_email,
            resume_phone,

            summary,
            skills,
            education,
            experience,
            projects,
            certifications,

            github,
            linkedin,

            ats_score,
            hire_probability,

            ai_suggestions,
            recommended_roles,

            is_analyzed,
            last_analyzed,

            missing_skills,
            recommended_companies,
            interview_questions

        FROM job_seekers

        WHERE user_id = ?

        LIMIT 1

    `;

    db.query(
        jobSeekerSQL,
        [userId],

        (err, jobSeekerResult) => {

            if (err) {

                console.log(
                    "GET JOB SEEKER ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message: "Database Error"

                });
            }


            if (
                !jobSeekerResult ||
                jobSeekerResult.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job seeker profile not found"

                });
            }


            const jobSeeker =
                jobSeekerResult[0];


            // =====================================================
            // GET MAIN RESUME
            //
            // MAIN RESUME = LATEST RESUME
            // =====================================================

            const resumeSQL = `

                SELECT

                    id,
                    user_id,

                    resume_title,
                    template_name,

                    full_name,
                    email,
                    phone,

                    summary,

                    skills,
                    education,
                    experience,
                    projects,
                    certifications,

                    github,
                    linkedin,

                    ats_score,
                    hire_probability,

                    resume_path,

                    created_at,
                    updated_at

                FROM resumes

                WHERE user_id = ?

                ORDER BY id DESC

                LIMIT 1

            `;

            db.query(
                resumeSQL,
                [userId],

                (resumeErr, resumeResult) => {

                    if (resumeErr) {

                        console.log(
                            "GET RESUME ERROR:",
                            resumeErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Database Error"

                        });
                    }


                    // =====================================================
                    // NO RESUME EXISTS
                    //
                    // CREATE FIRST RESUME
                    // =====================================================

                    if (
                        !resumeResult ||
                        resumeResult.length === 0
                    ) {

                        const createResumeSQL = `

                            INSERT INTO resumes
                            (
                                user_id,
                                resume_title,
                                full_name,
                                email,
                                phone,
                                resume_path
                            )

                            VALUES (?, ?, ?, ?, ?, ?)

                        `;

                        db.query(
                            createResumeSQL,

                            [
                                userId,
                                "My Resume",

                                jobSeeker.full_name || "",

                                jobSeeker.resume_email || "",

                                jobSeeker.resume_phone ||
                                    jobSeeker.phone ||
                                    "",

                                jobSeeker.resume_path ||
                                    null
                            ],

                            (createErr, createResult) => {

                                if (createErr) {

                                    console.log(
                                        "CREATE MISSING RESUME ERROR:",
                                        createErr
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Failed to create resume"

                                    });
                                }


                                return sendResumeResponse(
                                    userId,
                                    createResult.insertId,
                                    jobSeeker,
                                    res
                                );
                            }
                        );

                        return;
                    }


                    // =====================================================
                    // EXISTING MAIN RESUME
                    // =====================================================

                    const resume =
                        resumeResult[0];


                    return sendResumeResponse(
                        userId,
                        resume.id,
                        jobSeeker,
                        res,
                        resume
                    );
                }
            );
        }
    );
};


// =========================================================
// SEND RESUME RESPONSE
// =========================================================

const sendResumeResponse = (
    userId,
    resumeId,
    jobSeeker,
    res,
    resumeFromDB = null
) => {

    const resume =
        resumeFromDB || {

            id: resumeId,

            user_id: userId,

            resume_title:
                "My Resume",

            full_name:
                jobSeeker.full_name || "",

            email:
                jobSeeker.resume_email || "",

            phone:
                jobSeeker.resume_phone ||
                jobSeeker.phone ||
                "",

            resume_path:
                jobSeeker.resume_path ||
                null
        };


    // =====================================================
    // RESUME IDS
    // =====================================================

    resume.resume_id =
        resumeId;

    resume.job_seeker_id =
        jobSeeker.id;


    // =====================================================
    // RESUME CONTENT
    //
    // IMPORTANT:
    // FULL NAME = NAME INSIDE RESUME
    // =====================================================

    resume.resume_name =
        resume.resume_title ||
        jobSeeker.resume_name ||
        "";

    resume.resume_email =
        resume.email ||
        jobSeeker.resume_email ||
        "";

    resume.resume_phone =
        resume.phone ||
        jobSeeker.resume_phone ||
        jobSeeker.phone ||
        "";

    resume.resume_path =
        resume.resume_path ||
        jobSeeker.resume_path ||
        null;


    // =====================================================
    // RESUME FULL NAME
    //
    // This is the resume's actual name.
    // =====================================================

    resume.full_name =
        resume.full_name ||
        jobSeeker.full_name ||
        "";


    // =====================================================
    // ANALYSIS DATA
    //
    // Analysis is stored in job_seekers.
    // =====================================================

    resume.ats_score =
        jobSeeker.ats_score ?? null;

    resume.hire_probability =
        jobSeeker.hire_probability ?? null;

    resume.is_analyzed =
        jobSeeker.is_analyzed ?? 0;

    resume.last_analyzed =
        jobSeeker.last_analyzed ?? null;


    // =====================================================
    // JSON DATA
    // =====================================================

    resume.skills =
        safeParse(
            jobSeeker.skills ??
            resume.skills
        );

    resume.education =
        safeParse(
            jobSeeker.education ??
            resume.education
        );

    resume.experience =
        safeParse(
            jobSeeker.experience ??
            resume.experience
        );

    resume.projects =
        safeParse(
            jobSeeker.projects ??
            resume.projects
        );

    resume.certifications =
        safeParse(
            jobSeeker.certifications ??
            resume.certifications
        );

    resume.ai_suggestions =
        safeParse(
            jobSeeker.ai_suggestions
        );

    resume.recommended_roles =
        safeParse(
            jobSeeker.recommended_roles
        );

    resume.missing_skills =
        safeParse(
            jobSeeker.missing_skills
        );

    resume.recommended_companies =
        safeParse(
            jobSeeker.recommended_companies
        );

    resume.interview_questions =
        safeParse(
            jobSeeker.interview_questions
        );


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "RESUME LOADED"
    );

    console.log(
        "Logged User ID:",
        userId
    );

    console.log(
        "Job Seeker ID:",
        jobSeeker.id
    );

    console.log(
        "MAIN RESUME ID:",
        resume.resume_id
    );

    console.log(
        "Full Name:",
        resume.full_name
    );

    console.log(
        "Resume Title:",
        resume.resume_name
    );

    console.log(
        "Resume Email:",
        resume.resume_email
    );

    console.log(
        "Resume Phone:",
        resume.resume_phone
    );

    console.log(
        "Resume File:",
        resume.resume_path
    );

    console.log(
        "========================================\n"
    );


    return res.status(200).json({

        success: true,

        resume

    });
};


// =========================================================
// UPLOAD NEW RESUME
//
// The newly uploaded resume becomes the MAIN resume.
// The previous resume remains in the resumes table.
// =========================================================

export const uploadNewResume = (req, res) => {

    const userId =
        req.user.userId;


    // =====================================================
    // CHECK FILE
    // =====================================================

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message:
                "Please upload a PDF resume"

        });
    }


    const fileName =
        req.file.filename;


    const originalFileName =
        req.file.originalname;


    console.log(
        "\n========================================"
    );

    console.log(
        "NEW RESUME UPLOAD"
    );

    console.log(
        "User ID:",
        userId
    );

    console.log(
        "Original File:",
        originalFileName
    );

    console.log(
        "Saved File:",
        fileName
    );


    // =====================================================
    // GET CURRENT JOB SEEKER
    // =====================================================

    const getUserSQL = `

        SELECT

            id,
            full_name,
            phone,
            resume_email,
            resume_phone

        FROM job_seekers

        WHERE user_id = ?

        LIMIT 1

    `;


    db.query(
        getUserSQL,
        [userId],

        (userErr, userResult) => {

            if (userErr) {

                console.log(
                    "GET JOB SEEKER FOR UPLOAD ERROR:",
                    userErr
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });
            }


            if (
                !userResult ||
                userResult.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job seeker profile not found"

                });
            }


            const jobSeeker =
                userResult[0];


            // =====================================================
            // INSERT NEW RESUME
            //
            // Because getResume() uses ORDER BY id DESC,
            // this new row automatically becomes MAIN.
            // =====================================================

            const insertResumeSQL = `

                INSERT INTO resumes
                (
                    user_id,
                    resume_title,
                    template_name,
                    full_name,
                    email,
                    phone,
                    resume_path
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)

            `;


            db.query(
                insertResumeSQL,

                [
                    userId,

                    originalFileName ||
                        "My Resume",

                    "default",

                    jobSeeker.full_name ||
                        "",

                    jobSeeker.resume_email ||
                        "",

                    jobSeeker.resume_phone ||
                        jobSeeker.phone ||
                        "",

                    fileName
                ],

                (insertErr, insertResult) => {

                    if (insertErr) {

                        console.log(
                            "INSERT NEW RESUME ERROR:",
                            insertErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to save new resume",

                            error:
                                insertErr.message

                        });
                    }


                    const newResumeId =
                        insertResult.insertId;


                    // =====================================================
                    // UPDATE JOB SEEKER
                    //
                    // New file becomes the active resume.
                    //
                    // IMPORTANT:
                    // Old AI analysis is cleared.
                    // =====================================================

                    const updateJobSeekerSQL = `

                        UPDATE job_seekers

                        SET

                            resume_path = ?,

                            resume_name = ?,

                            resume_email = COALESCE(
                                NULLIF(resume_email, ''),
                                ?
                            ),

                            resume_phone = COALESCE(
                                NULLIF(resume_phone, ''),
                                phone
                            ),

                            is_analyzed = 0,

                            ats_score = NULL,

                            hire_probability = NULL,

                            last_analyzed = NULL,

                            ai_suggestions = NULL,

                            recommended_roles = NULL,

                            missing_skills = NULL,

                            recommended_companies = NULL,

                            interview_questions = NULL,

                            summary = NULL,

                            skills = NULL,

                            education = NULL,

                            experience = NULL,

                            projects = NULL,

                            certifications = NULL

                        WHERE user_id = ?

                    `;


                    db.query(
                        updateJobSeekerSQL,

                        [
                            fileName,

                            originalFileName ||
                                "My Resume",

                            jobSeeker.resume_email ||
                                "",

                            userId
                        ],

                        (updateErr) => {

                            if (updateErr) {

                                console.log(
                                    "UPDATE JOB SEEKER AFTER UPLOAD ERROR:",
                                    updateErr
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Resume uploaded but profile update failed",

                                    error:
                                        updateErr.message

                                });
                            }


                            // =====================================================
                            // SUCCESS
                            // =====================================================

                            console.log(
                                "New Main Resume ID:",
                                newResumeId
                            );

                            console.log(
                                "New Main Resume File:",
                                fileName
                            );

                            console.log(
                                "Old analysis cleared"
                            );

                            console.log(
                                "========================================\n"
                            );


                            return res.status(201).json({

                                success: true,

                                message:
                                    "New resume uploaded successfully",

                                resumeId:
                                    newResumeId,

                                resumePath:
                                    fileName,

                                resumeName:
                                    originalFileName ||
                                    "My Resume",

                                isAnalyzed:
                                    false

                            });
                        }
                    );
                }
            );
        }
    );
};


// =========================================================
// UPDATE CURRENT MAIN RESUME
// =========================================================

export const updateResume = (req, res) => {

    const userId =
        req.user.userId;


    const {

        full_name,

        phone,

        resume_name,

        resume_email,

        resume_phone,

        summary,

        education,

        experience,

        projects,

        certifications,

        github,

        linkedin,

        skills

    } = req.body;


    // =====================================================
    // JSON
    // =====================================================

    const educationJSON =
        education !== undefined
            ? JSON.stringify(
                education || []
            )
            : null;

    const experienceJSON =
        experience !== undefined
            ? JSON.stringify(
                experience || []
            )
            : null;

    const projectsJSON =
        projects !== undefined
            ? JSON.stringify(
                projects || []
            )
            : null;

    const certificationsJSON =
        certifications !== undefined
            ? JSON.stringify(
                certifications || []
            )
            : null;

    const skillsJSON =
        skills !== undefined
            ? JSON.stringify(
                skills || []
            )
            : null;


    // =====================================================
    // ATS SCORE CALCULATION
    // =====================================================

    const calculatedATS = calculateATS({
        summary: summary || "",
        skills: skills || [],
        education: education || [],
        experience: experience || [],
        projects: projects || [],
        certifications: certifications || [],
        github: github || "",
        linkedin: linkedin || ""
    });


    // =====================================================
    // UPDATE JOB SEEKER
    //
    // Editing resume invalidates old AI analysis.
    // =====================================================

    const sql = `

        UPDATE job_seekers

        SET

            full_name =
                COALESCE(
                    NULLIF(?, ''),
                    full_name
                ),

            phone =
                COALESCE(
                    NULLIF(?, ''),
                    phone
                ),

            resume_name =
                COALESCE(
                    NULLIF(?, ''),
                    resume_name
                ),

            resume_email =
                COALESCE(
                    NULLIF(?, ''),
                    resume_email
                ),

            resume_phone =
                COALESCE(
                    NULLIF(?, ''),
                    resume_phone
                ),

            summary =
                COALESCE(
                    NULLIF(?, ''),
                    summary
                ),

            education =
                COALESCE(
                    ?,
                    education
                ),

            experience =
                COALESCE(
                    ?,
                    experience
                ),

            projects =
                COALESCE(
                    ?,
                    projects
                ),

            certifications =
                COALESCE(
                    ?,
                    certifications
                ),

            github =
                COALESCE(
                    NULLIF(?, ''),
                    github
                ),

            linkedin =
                COALESCE(
                    NULLIF(?, ''),
                    linkedin
                ),

            skills =
                COALESCE(
                    ?,
                    skills
                ),

            is_analyzed = 0,

            ats_score = ?,

            hire_probability = ?,

            last_analyzed = NULL,

            ai_suggestions = NULL,

            recommended_roles = NULL,

            missing_skills = NULL,

            recommended_companies = NULL,

            interview_questions = NULL

        WHERE user_id = ?

    `;


    const values = [

        full_name || "",

        phone || "",

        resume_name || "",

        resume_email || "",

        resume_phone || "",

        summary || "",

        educationJSON,

        experienceJSON,

        projectsJSON,

        certificationsJSON,

        github || "",

        linkedin || "",

        skillsJSON,

        calculatedATS.atsScore,

        calculatedATS.hireProbability,

        userId

    ];


    try {
        fs.writeFileSync("save_resume_debug.log", JSON.stringify({
            timestamp: new Date(),
            body: req.body,
            skillsJSON,
            values
        }, null, 2));
    } catch (logErr) {}

    db.query(
        sql,
        values,

        (err, result) => {

            try {
                fs.appendFileSync("save_resume_debug.log", "\n\n" + JSON.stringify({
                    err: err ? { message: err.message, stack: err.stack } : null,
                    result: result ? { affectedRows: result.affectedRows, changedRows: result.changedRows } : null
                }, null, 2));
            } catch (logErr) {}

            if (err) {

                console.log(
                    "UPDATE RESUME ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to update resume",

                    error:
                        err.message

                });
            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Resume not found"

                });
            }


            // =====================================================
            // FIND CURRENT MAIN RESUME
            // =====================================================

            const findMainResumeSQL = `

                SELECT id

                FROM resumes

                WHERE user_id = ?

                ORDER BY id DESC

                LIMIT 1

            `;


            db.query(
                findMainResumeSQL,
                [userId],

                (findErr, findResult) => {

                    if (findErr) {

                        console.log(
                            "FIND MAIN RESUME ERROR:",
                            findErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to find main resume"

                        });
                    }


                    if (
                        !findResult ||
                        findResult.length === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            message:
                                "Main resume not found"

                        });
                    }


                    const mainResumeId =
                        findResult[0].id;


                    // =====================================================
                    // UPDATE ONLY MAIN RESUME
                    //
                    // IMPORTANT:
                    // We DO NOT update every resume belonging to user.
                    // =====================================================

                    const updateResumesSQL = `

                        UPDATE resumes

                        SET

                            full_name =
                                COALESCE(
                                    NULLIF(?, ''),
                                    full_name
                                ),

                            email =
                                COALESCE(
                                    NULLIF(?, ''),
                                    email
                                ),

                            phone =
                                COALESCE(
                                    NULLIF(?, ''),
                                    phone
                                ),

                            resume_title =
                                COALESCE(
                                    NULLIF(?, ''),
                                    resume_title
                                ),

                            summary =
                                COALESCE(
                                    NULLIF(?, ''),
                                    summary
                                ),

                            skills =
                                COALESCE(
                                    ?,
                                    skills
                                ),

                            education =
                                COALESCE(
                                    ?,
                                    education
                                ),

                            experience =
                                COALESCE(
                                    ?,
                                    experience
                                ),

                            projects =
                                COALESCE(
                                    ?,
                                    projects
                                ),

                            certifications =
                                COALESCE(
                                    ?,
                                    certifications
                                ),

                            github =
                                COALESCE(
                                    NULLIF(?, ''),
                                    github
                                ),

                            linkedin =
                                COALESCE(
                                    NULLIF(?, ''),
                                    linkedin
                                ),

                            ats_score = ?,

                            hire_probability = ?

                        WHERE id = ?

                        AND user_id = ?

                    `;


                    const resumeValues = [

                        full_name || "",

                        resume_email || "",

                        resume_phone ||
                            phone ||
                            "",

                        resume_name || "",

                        summary || "",

                        skillsJSON,

                        educationJSON,

                        experienceJSON,

                        projectsJSON,

                        certificationsJSON,

                        github || "",

                        linkedin || "",

                        calculatedATS.atsScore,

                        calculatedATS.hireProbability,

                        mainResumeId,

                        userId

                    ];


                    db.query(
                        updateResumesSQL,
                        resumeValues,

                        (resumeErr) => {

                            if (resumeErr) {

                                console.log(
                                    "UPDATE MAIN RESUME ERROR:",
                                    resumeErr
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to update main resume",

                                    error:
                                        resumeErr.message

                                });
                            }


                            // =====================================================
                            // SUCCESS
                            // =====================================================

                            console.log(
                                "\n========================================"
                            );

                            console.log(
                                "RESUME UPDATED"
                            );

                            console.log(
                                "User ID:",
                                userId
                            );

                            console.log(
                                "Main Resume ID:",
                                mainResumeId
                            );

                            console.log(
                                "AI Analysis Reset: YES"
                            );

                            console.log(
                                "========================================\n"
                            );

                            // Trigger automated 60%+ skill match job alerts for candidate if skills exist
                            if (skills && Array.isArray(skills) && skills.length > 0) {
                                notifyCandidateForMatchingJobs(userId, skills)
                                    .catch(err => console.error("Resume Update Job Alert Error:", err));
                            }

                            return res.status(200).json({

                                success: true,

                                message:
                                    "Resume updated successfully",

                                resumeId:
                                    mainResumeId,

                                atsScore:
                                    calculatedATS.atsScore,

                                hireProbability:
                                    calculatedATS.hireProbability

                            });
                        }
                    );
                }
            );
        }
    );
};