import db from "../config/db.js";

import {
    generateInterviewQuestions,
    evaluateInterviewAnswer
} from "../services/aiService.js";
import { robustJSONParse } from "../utils/jsonParser.js";



// ==========================================
// SAFE JSON PARSER
// ==========================================

const safeParse = (value) => {

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    try {

        return JSON.parse(value);

    }

    catch (error) {

        console.log("JSON Parse Error:", error);

        return [];

    }

};


// ==========================================
// START INTERVIEW
// ==========================================

export const startInterview = async (req, res) => {

    try {

        const userId = req.user.userId;

        const {
            role,
            difficulty,
            questions,
            mode,
            jobId
        } = req.body;


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (!role) {

            return res.status(400).json({

                success: false,

                message: "Interview role is required"

            });

        }


        if (!difficulty) {

            return res.status(400).json({

                success: false,

                message: "Interview difficulty is required"

            });

        }


        if (!questions) {

            return res.status(400).json({

                success: false,

                message: "Number of questions is required"

            });

        }


        const interviewMode =
            mode || "practice";


        console.log(
            "\n=========================================="
        );

        console.log(
            "🚀 STARTING INTERVIEW"
        );

        console.log(
            "User ID:",
            userId
        );

        console.log(
            "Mode:",
            interviewMode
        );

        console.log(
            "Role:",
            role
        );

        console.log(
            "Difficulty:",
            difficulty
        );

        console.log(
            "Questions:",
            questions
        );

        console.log(
            "Job ID:",
            jobId || "None"
        );

        console.log(
            "==========================================\n"
        );


        // ==========================================
        // GET USER RESUME
        // ==========================================

        // IMPORTANT:
        // email and phone were removed because
        // they do not exist in job_seekers table.

        const resumeSql = `

            SELECT

                full_name,

                summary,

                education,

                experience,

                projects,

                certifications,

                github,

                linkedin,

                skills

            FROM job_seekers

            WHERE user_id = ?

        `;


        db.query(

            resumeSql,

            [userId],

            async (err, resumeResult) => {

                try {

                    // ==========================================
                    // DATABASE ERROR
                    // ==========================================

                    if (err) {

                        console.log(
                            "\n========== RESUME DATABASE ERROR ==========\n"
                        );

                        console.log(err);

                        console.log(
                            "\n===========================================\n"
                        );


                        return res.status(500).json({

                            success: false,

                            message: "Database Error",

                            error: err.message

                        });

                    }


                    // ==========================================
                    // RESUME NOT FOUND
                    // ==========================================

                    if (
                        resumeResult.length === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            message: "Resume Not Found"

                        });

                    }


                    const resume =
                        resumeResult[0];


                    // ==========================================
                    // PARSE RESUME JSON
                    // ==========================================

                    resume.education =
                        safeParse(
                            resume.education
                        );


                    resume.experience =
                        safeParse(
                            resume.experience
                        );


                    resume.projects =
                        safeParse(
                            resume.projects
                        );


                    resume.certifications =
                        safeParse(
                            resume.certifications
                        );


                    resume.skills =
                        safeParse(
                            resume.skills
                        );


                    console.log(
                        "\n========== RESUME LOADED =========="
                    );

                    console.log(
                        "Candidate:",
                        resume.full_name
                    );

                    console.log(
                        "Skills:",
                        resume.skills
                    );

                    console.log(
                        "===================================\n"
                    );


                    // ==========================================
                    // JOB INTERVIEW MODE
                    // ==========================================

                    if (
                        interviewMode === "job"
                    ) {

                        // ==========================================
                        // JOB ID REQUIRED
                        // ==========================================

                        if (!jobId) {

                            return res.status(400).json({

                                success: false,

                                message:
                                    "Job ID is required for job interview"

                            });

                        }


                        // ==========================================
                        // CHECK APPLICATION + GET JOB
                        // ==========================================

                        const applicationSql = `

                            SELECT

                                a.id AS application_id,

                                j.id AS job_id,

                                j.title,

                                j.company,

                                j.location,

                                j.description,

                                j.required_skills,

                                j.salary,

                                j.experience,

                                j.employment_type,

                                j.vacancies,

                                j.deadline

                            FROM applications a

                            INNER JOIN jobs j

                                ON j.id = a.job_id

                            WHERE a.job_id = ?

                            AND a.user_id = ?

                            ORDER BY a.applied_at DESC

                            LIMIT 1

                        `;


                        db.query(

                            applicationSql,

                            [
                                jobId,
                                userId
                            ],

                            async (
                                jobErr,
                                jobResult
                            ) => {

                                try {

                                    // ==========================================
                                    // JOB DATABASE ERROR
                                    // ==========================================

                                    if (jobErr) {

                                        console.log(
                                            "\n========== JOB DATABASE ERROR ==========\n"
                                        );

                                        console.log(
                                            jobErr
                                        );

                                        console.log(
                                            "\n========================================\n"
                                        );


                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Failed to Load Applied Job",

                                            error:
                                                jobErr.message

                                        });

                                    }


                                    // ==========================================
                                    // APPLICATION NOT FOUND
                                    // ==========================================

                                    if (
                                        jobResult.length === 0
                                    ) {

                                        return res.status(403).json({

                                            success: false,

                                            message:
                                                "You have not applied for this job"

                                        });

                                    }


                                    const job =
                                        jobResult[0];


                                    // ==========================================
                                    // PARSE REQUIRED SKILLS
                                    // ==========================================

                                    job.required_skills =
                                        safeParse(
                                            job.required_skills
                                        );


                                    console.log(
                                        "\n========== APPLIED JOB =========="
                                    );

                                    console.log(
                                        "Application ID:",
                                        job.application_id
                                    );

                                    console.log(
                                        "Job ID:",
                                        job.job_id
                                    );

                                    console.log(
                                        "Title:",
                                        job.title
                                    );

                                    console.log(
                                        "Company:",
                                        job.company
                                    );

                                    console.log(
                                        "Required Skills:",
                                        job.required_skills
                                    );

                                    console.log(
                                        "=================================\n"
                                    );


                                    // ==========================================
                                    // GENERATE JOB-SPECIFIC QUESTIONS
                                    // ==========================================

                                    const aiResponse =
                                        await generateInterviewQuestions(

                                            resume,

                                            job.title,

                                            difficulty,

                                            questions,

                                            job

                                        );


                                    console.log(
                                        "\n========== JOB INTERVIEW QUESTIONS ==========\n"
                                    );

                                    console.log(
                                        aiResponse
                                    );

                                    console.log(
                                        "\n=============================================\n"
                                    );


                                    // ==========================================
                                    // PARSE AI RESPONSE
                                    // ==========================================

                                    let parsed;

                                    try {

                                        parsed =
                                            robustJSONParse(
                                                aiResponse
                                            );

                                    }

                                    catch (parseError) {

                                        console.log(
                                            "AI JSON Parse Error:",
                                            parseError
                                        );


                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Invalid AI Interview Response"

                                        });

                                    }


                                    // ==========================================
                                    // VALIDATE QUESTIONS
                                    // ==========================================

                                    if (
                                        !parsed.questions ||
                                        !Array.isArray(
                                            parsed.questions
                                        )
                                    ) {

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "AI did not generate valid questions"

                                        });

                                    }


                                    // ==========================================
                                    // RETURN JOB INTERVIEW
                                    // ==========================================

                                    return res.status(200).json({

                                        success: true,

                                        mode: "job",

                                        jobId:
                                            job.job_id,

                                        applicationId:
                                            job.application_id,

                                        job: {

                                            id:
                                                job.job_id,

                                            title:
                                                job.title,

                                            company:
                                                job.company,

                                            location:
                                                job.location,

                                            required_skills:
                                                job.required_skills,

                                            experience:
                                                job.experience,

                                            employment_type:
                                                job.employment_type

                                        },

                                        questions:
                                            parsed.questions

                                    });

                                }

                                catch (error) {

                                    console.log(
                                        "\n========== JOB INTERVIEW GENERATION ERROR ==========\n"
                                    );

                                    console.log(
                                        error
                                    );

                                    console.log(
                                        "\n====================================================\n"
                                    );


                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Job Interview Generation Failed",

                                        error:
                                            error.message

                                    });

                                }

                            }

                        );


                        return;

                    }


                    // ==========================================
                    // NORMAL PRACTICE INTERVIEW
                    // ==========================================

                    console.log(
                        "🧪 Generating Practice Interview"
                    );


                    const aiResponse =
                        await generateInterviewQuestions(

                            resume,

                            role,

                            difficulty,

                            questions

                        );


                    console.log(
                        "\n========== PRACTICE INTERVIEW QUESTIONS ==========\n"
                    );

                    console.log(
                        aiResponse
                    );

                    console.log(
                        "\n==================================================\n"
                    );


                    // ==========================================
                    // PARSE AI RESPONSE
                    // ==========================================

                    let parsed;

                    try {

                        parsed =
                            robustJSONParse(
                                aiResponse
                            );

                    }

                    catch (parseError) {

                        console.log(
                            "AI JSON Parse Error:",
                            parseError
                        );


                        return res.status(500).json({

                            success: false,

                            message:
                                "Invalid AI Interview Response"

                        });

                    }


                    // ==========================================
                    // VALIDATE QUESTIONS
                    // ==========================================

                    if (
                        !parsed.questions ||
                        !Array.isArray(
                            parsed.questions
                        )
                    ) {

                        return res.status(500).json({

                            success: false,

                            message:
                                "AI did not generate valid questions"

                        });

                    }


                    // ==========================================
                    // SEND PRACTICE INTERVIEW
                    // ==========================================

                    return res.status(200).json({

                        success: true,

                        mode: "practice",

                        questions:
                            parsed.questions

                    });

                }

                catch (innerError) {

                    console.log(
                        "\n========== INTERVIEW GENERATION ERROR ==========\n"
                    );

                    console.log(
                        innerError
                    );

                    console.log(
                        "\n=================================================\n"
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Interview Generation Failed",

                        error:
                            innerError.message

                    });

                }

            }

        );

    }

    catch (err) {

        console.log(
            "\n========== INTERVIEW ERROR ==========\n"
        );

        console.log(err);

        console.log(
            "\n=====================================\n"
        );


        return res.status(500).json({

            success: false,

            message:
                "Interview Generation Failed",

            error:
                err.message

        });

    }

};


// ==========================================
// EVALUATE ANSWER
// ==========================================

export const evaluateAnswer = async (req, res) => {

    try {

        const {
            question,
            answer
        } = req.body;


        // ==========================================
        // VALIDATE QUESTION
        // ==========================================

        if (!question) {

            return res.status(400).json({

                success: false,

                message:
                    "Question is required"

            });

        }


        // ==========================================
        // VALIDATE ANSWER
        // ==========================================

        if (!answer) {

            return res.status(400).json({

                success: false,

                message:
                    "Answer is required"

            });

        }


        // ==========================================
        // AI EVALUATION
        // ==========================================

        const aiResponse =
            await evaluateInterviewAnswer(

                question,

                answer

            );


        console.log(
            "\n========== RAW AI RESPONSE ==========\n"
        );

        console.log(
            aiResponse
        );

        console.log(
            "\n=====================================\n"
        );


        // ==========================================
        // PARSE AI RESPONSE
        // ==========================================

        let parsed;

        try {

            parsed =
                robustJSONParse(
                    aiResponse
                );

        }

        catch (parseError) {

            console.log(
                "Evaluation JSON Parse Error:",
                parseError
            );


            return res.status(500).json({

                success: false,

                message:
                    "Invalid AI Evaluation Response"

            });

        }


        console.log(
            "\n========== PARSED AI RESPONSE ==========\n"
        );

        console.log(
            parsed
        );

        console.log(
            "\n========================================\n"
        );


        // ==========================================
        // RETURN RESULT
        // ==========================================

        return res.status(200).json({

            success: true,

            result:
                parsed

        });

    }

    catch (err) {

        console.log(
            "\n========== INTERVIEW ERROR ==========\n"
        );

        console.log(err);

        console.log(
            "\n=====================================\n"
        );


        return res.status(500).json({

            success: false,

            message:
                "Evaluation Failed",

            error:
                err.message

        });

    }

};


// ==========================================
// SAVE JOB APPLICATION INTERVIEW
// ==========================================

export const saveJobInterview = (req, res) => {

    const userId =
        req.user.userId;


    const {
        jobId,
        technicalScore,
        communicationScore,
        confidenceScore,
        overallScore,
        aiFeedback,
        recommendation
    } = req.body;


    // ==========================================
    // VALIDATE JOB ID
    // ==========================================

    if (!jobId) {

        return res.status(400).json({

            success: false,

            message:
                "Job ID is required"

        });

    }


    // ==========================================
    // FIND USER APPLICATION
    // ==========================================

    db.query(

        `

        SELECT

            id

        FROM applications

        WHERE job_id = ?

        AND user_id = ?

        ORDER BY applied_at DESC

        LIMIT 1

        `,

        [
            jobId,
            userId
        ],

        (err, applications) => {

            // ==========================================
            // DATABASE ERROR
            // ==========================================

            if (err) {

                console.log(
                    "Application Database Error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            // ==========================================
            // APPLICATION NOT FOUND
            // ==========================================

            if (
                applications.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found"

                });

            }


            const applicationId =
                applications[0].id;


            // ==========================================
            // SAVE INTERVIEW RESULT
            // ==========================================

            db.query(

                `

                INSERT INTO job_interviews

                (

                    application_id,

                    user_id,

                    job_id,

                    technical_score,

                    communication_score,

                    confidence_score,

                    overall_score,

                    ai_feedback,

                    recommendation

                )

                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

                `,

                [

                    applicationId,

                    userId,

                    jobId,

                    technicalScore,

                    communicationScore,

                    confidenceScore,

                    overallScore,

                    aiFeedback,

                    recommendation

                ],

                (err, result) => {

                    // ==========================================
                    // SAVE ERROR
                    // ==========================================

                    if (err) {

                        console.log(
                            "Interview Save Error:",
                            err
                        );


                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to Save Interview Result"

                        });

                    }


                    const interviewId =
                        result.insertId;


                    // ==========================================
                    // UPDATE APPLICATION
                    // ==========================================

                    db.query(

                        `

                        UPDATE applications

                        SET

                            interview_completed = 1,

                            interview_id = ?

                        WHERE id = ?

                        AND user_id = ?

                        `,

                        [

                            interviewId,

                            applicationId,

                            userId

                        ],

                        (err) => {

                            // ==========================================
                            // UPDATE ERROR
                            // ==========================================

                            if (err) {

                                console.log(
                                    "Application Update Error:",
                                    err
                                );


                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to Update Application"

                                });

                            }


                            // ==========================================
                            // SUCCESS
                            // ==========================================

                            return res.status(200).json({

                                success: true,

                                message:
                                    "Job Interview Saved Successfully",

                                interviewId

                            });

                        }

                    );

                }

            );

        }

    );

};