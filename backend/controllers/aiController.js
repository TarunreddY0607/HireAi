import fs from "fs";
import path from "path";

import db from "../config/db.js";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import {
    extractResumeData,
    analyzeResumeData
} from "../services/aiService.js";

import { buildResumeText } from "../services/resumeBuilder.js";

import { calculateATS } from "../services/atsCalculator.js";
import { robustJSONParse } from "../utils/jsonParser.js";
import { notifyCandidateForMatchingJobs } from "../services/jobMatchAlertService.js";



// ===================================================
// Extract PDF Text
// ===================================================

async function extractText(filePath) {

    const data = new Uint8Array(
        fs.readFileSync(filePath)
    );

    const pdf =
        await pdfjsLib.getDocument({
            data
        }).promise;

    let text = "";

    for (
        let page = 1;
        page <= pdf.numPages;
        page++
    ) {

        const currentPage =
            await pdf.getPage(page);

        const content =
            await currentPage.getTextContent();

        const pageText =
            content.items
                .map(item => item.str)
                .join(" ");

        text +=
            pageText + "\n\n";
    }

    return text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/[ ]{2,}/g, " ")
        .replace(/\n{2,}/g, "\n")
        .trim();
}


// ===================================================
// Safe JSON Parse
// ===================================================

function safeParse(value) {

    if (!value) {
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

    } catch (err) {

        console.log(
            "JSON Parse Error:",
            err
        );

        return [];
    }
}


// ===================================================
// Parse AI JSON
// ===================================================

function parseAIResponse(text) {

    try {

        return robustJSONParse(text);

    } catch (err) {

        console.log(
            "\n========== INVALID AI RESPONSE ==========\n"
        );

        console.log(text);

        console.log(
            "\n=========================================\n"
        );

        try {
            fs.writeFileSync("invalid_response.log", String(text || ""));
        } catch (logErr) {
            console.error("Failed to write invalid response log:", logErr);
        }

        throw new Error(
            "AI returned invalid JSON."
        );
    }
}


// ===================================================
// Prepare Stored Resume
// ===================================================

function prepareStoredResume(resume) {

    return {

        name:
            resume.full_name ||
            "",

        email:
            resume.resume_email ||
            resume.email ||
            "",

        phone:
            resume.resume_phone ||
            resume.phone ||
            "",

        summary:
            resume.summary ||
            "",

        skills:
            safeParse(
                resume.skills
            ),

        education:
            safeParse(
                resume.education
            ),

        experience:
            safeParse(
                resume.experience
            ),

        projects:
            safeParse(
                resume.projects
            ),

        certifications:
            safeParse(
                resume.certifications
            ),

        github:
            resume.github ||
            "",

        linkedin:
            resume.linkedin ||
            ""
    };
}


// ===================================================
// Return Stored Analysis
// ===================================================

function returnStoredAnalysis(
    req,
    res,
    resume
) {

    const storedResume =
        prepareStoredResume(resume);

    const storedSuggestions =
        safeParse(
            resume.ai_suggestions
        );

    const storedMissingSkills =
        safeParse(
            resume.missing_skills
        );

    const storedRecommendedRoles =
        safeParse(
            resume.recommended_roles
        );

    const storedRecommendedCompanies =
        safeParse(
            resume.recommended_companies
        );

    const storedInterviewQuestions =
        safeParse(
            resume.interview_questions
        );


    console.log(
        "\n========== USING STORED ANALYSIS ==========\n"
    );

    console.log(
        "User ID:",
        req.user.userId
    );

    console.log(
        "Resume ID:",
        resume.resume_id
    );

    console.log(
        "Stored ATS Score:",
        resume.ats_score
    );

    console.log(
        "Stored Hire Probability:",
        resume.hire_probability
    );

    console.log(
        "Last Analyzed:",
        resume.last_analyzed
    );

    console.log(
        "\n===========================================\n"
    );


    return res.status(200).json({

        success: true,

        message:
            "Existing resume analysis returned.",

        userId:
            Number(req.user.userId),

        resumeId:
            Number(resume.resume_id),

        atsScore:
            Number(
                resume.ats_score || 0
            ),

        hireProbability:
            Number(
                resume.hire_probability || 0
            ),

        summary:
            storedResume.summary,

        skills:
            storedResume.skills,

        education:
            storedResume.education,

        experience:
            storedResume.experience,

        projects:
            storedResume.projects,

        certifications:
            storedResume.certifications,

        github:
            storedResume.github,

        linkedin:
            storedResume.linkedin,

        missingSkills:
            storedMissingSkills,

        suggestions:
            storedSuggestions,

        recommendedRoles:
            storedRecommendedRoles,

        recommendedCompanies:
            storedRecommendedCompanies,

        interviewQuestions:
            storedInterviewQuestions,

        cached:
            true
    });
}


// ===================================================
// Analyze Resume
// ===================================================
//
// POST /api/ai/analyze/:resumeId
//
// IMPORTANT:
//
// 1. Resume belongs to logged-in user.
// 2. If resume row does not exist, create it.
// 3. Actual analysis status is stored in job_seekers.
// 4. If already analyzed, return stored result.
// 5. Gemini is NOT called repeatedly.
// ===================================================

export const analyzeResumeController = async (
    req,
    res
) => {

    try {

        // =================================================
        // IDs
        // =================================================

        const requestedResumeId =
            Number(
                req.params.resumeId
            );

        const loggedInUserId =
            Number(
                req.user.userId
            );


        console.log(
            "\n========== AUTH DEBUG ==========\n"
        );

        console.log(
            "req.user:",
            req.user
        );

        console.log(
            "Logged In User ID:",
            loggedInUserId
        );

        console.log(
            "Requested Resume ID:",
            requestedResumeId
        );

        console.log(
            "================================\n"
        );


        // =================================================
        // Validate User
        // =================================================

        if (!loggedInUserId) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid user session"

            });
        }


        // =================================================
        // Get Logged-In User + Job Seeker
        // =================================================
        //
        // We use job_seekers as the main source because
        // your actual ATS/AI data is stored there.
        //
        // =================================================

        const userSql = `

            SELECT

                js.*,

                u.email AS account_email,

                r.id AS resume_id,

                r.user_id AS resume_user_id,

                r.resume_title,

                r.template_name,

                r.resume_path AS editor_resume_path

            FROM job_seekers js

            INNER JOIN users u

                ON u.id = js.user_id

            LEFT JOIN resumes r

                ON r.user_id = js.user_id

            WHERE

                js.user_id = ?

            ORDER BY
                r.id DESC

            LIMIT 1

        `;


        db.query(

            userSql,

            [
                loggedInUserId
            ],

            async (
                err,
                results
            ) => {

                if (err) {

                    console.log(
                        "DATABASE ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error",

                        error:
                            err.message

                    });
                }


                // =================================================
                // Job Seeker Does Not Exist
                // =================================================

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Job seeker profile not found."

                    });
                }


                let resume =
                    results[0];


                // =================================================
                // IMPORTANT:
                // CREATE RESUME RECORD IF MISSING
                // =================================================
                //
                // This fixes the problem where a newly registered
                // user exists in job_seekers but has no resumes row.
                //
                // =================================================

                if (!resume.resume_id) {

                    console.log(
                        "\n========== RESUME RECORD MISSING ==========\n"
                    );

                    console.log(
                        "Creating resume record for User ID:",
                        loggedInUserId
                    );


                    const createResumeSql = `

                        INSERT INTO resumes
                        (
                            user_id,
                            resume_title,
                            template_name,
                            full_name,
                            email,
                            phone,
                            resume_path,
                            ats_score,
                            hire_probability
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

                    `;


                    const createResumeValues = [

                        loggedInUserId,

                        "My Resume",

                        "default",

                        resume.full_name ||
                        "",

                        resume.resume_email ||
                        resume.account_email ||
                        "",

                        resume.resume_phone ||
                        resume.phone ||
                        "",

                        resume.resume_path ||
                        null,

                        resume.ats_score ||
                        null,

                        resume.hire_probability ||
                        null

                    ];


                    db.query(

                        createResumeSql,

                        createResumeValues,

                        (createErr, createResult) => {

                            if (createErr) {

                                console.log(
                                    "CREATE RESUME ERROR:",
                                    createErr
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to create resume record",

                                    error:
                                        createErr.message

                                });
                            }


                            console.log(
                                "Created Resume ID:",
                                createResult.insertId
                            );


                            // Set newly created resume ID
                            resume.resume_id =
                                createResult.insertId;

                            resume.resume_user_id =
                                loggedInUserId;

                            resume.resume_title =
                                "My Resume";

                            resume.template_name =
                                "default";

                            resume.editor_resume_path =
                                resume.resume_path ||
                                null;


                            continueAnalysis();

                        }

                    );

                } else {

                    continueAnalysis();

                }


                // =================================================
                // MAIN ANALYSIS FUNCTION
                // =================================================

                async function continueAnalysis() {

                    try {

                        console.log(
                            "\n========== RESUME FOUND ==========\n"
                        );

                        console.log(
                            "Resume ID:",
                            resume.resume_id
                        );

                        console.log(
                            "Resume User ID:",
                            resume.resume_user_id
                        );

                        console.log(
                            "Logged User ID:",
                            loggedInUserId
                        );

                        console.log(
                            "Resume Title:",
                            resume.resume_title
                        );

                        console.log(
                            "Full Name:",
                            resume.full_name
                        );

                        console.log(
                            "Resume File:",
                            resume.resume_path
                        );

                        console.log(
                            "Job Seeker File:",
                            resume.resume_path
                        );

                        console.log(
                            "Is Analyzed:",
                            resume.is_analyzed
                        );


                        // =================================================
                        // SECURITY CHECK
                        // =================================================

                        if (
                            Number(resume.resume_user_id) !==
                            Number(loggedInUserId)
                        ) {

                            return res.status(403).json({

                                success: false,

                                message:
                                    "Unauthorized resume analysis"

                            });
                        }


                        // =================================================
                        // IMPORTANT CACHE CHECK
                        // =================================================
                        //
                        // is_analyzed belongs to job_seekers.
                        //
                        // If already analyzed, DO NOT call AI again.
                        //
                        // =================================================

                        if (
                            Number(resume.is_analyzed) === 1
                        ) {

                            return returnStoredAnalysis(
                                req,
                                res,
                                resume
                            );
                        }


                        // =================================================
                        // Determine if we should prioritize Database over PDF
                        // =================================================
                        //
                        // If the database already contains resume details (e.g., summary, skills),
                        // we prioritize the database contents (which contain any builder edits).
                        // Otherwise, we extract from the PDF file.
                        // =================================================

                        const hasDatabaseDetails =
                            (resume.summary && resume.summary.trim() !== "") ||
                            (resume.skills && safeParse(resume.skills).length > 0) ||
                            (resume.education && safeParse(resume.education).length > 0) ||
                            (resume.experience && safeParse(resume.experience).length > 0) ||
                            (resume.projects && safeParse(resume.projects).length > 0);

                        const resumeFileName =
                            resume.resume_path ||
                            resume.editor_resume_path;

                        let extracted;

                        if (hasDatabaseDetails) {
                            console.log("\nUsing Database Resume details (prioritizing user edits)...\n");
                            extracted = {
                                name: resume.full_name || "",
                                email: resume.resume_email || resume.account_email || "",
                                phone: resume.resume_phone || resume.phone || "",
                                summary: resume.summary || "",
                                skills: safeParse(resume.skills),
                                education: safeParse(resume.education),
                                experience: safeParse(resume.experience),
                                projects: safeParse(resume.projects),
                                certifications: safeParse(resume.certifications),
                                github: resume.github || "",
                                linkedin: resume.linkedin || ""
                            };
                        } else {
                            console.log("\nNo database details found. Performing fresh PDF extraction...\n");
                            let resumeText = "";

                            if (resumeFileName) {
                                const filePath = path.resolve("uploads", resumeFileName);
                                console.log("Resume File Path:", filePath);

                                if (fs.existsSync(filePath)) {
                                    console.log("\nReading Resume PDF...\n");
                                    try {
                                        resumeText = await extractText(filePath);
                                    } catch (pdfError) {
                                        console.log("PDF Extraction Error:", pdfError);
                                    }
                                } else {
                                    console.log("PDF file does not exist:", filePath);
                                }
                            }

                            // Fallback to empty database build if PDF extraction produced nothing
                            if (!resumeText || resumeText.trim() === "") {
                                console.log("\nUsing Empty Database Resume fallback...\n");
                                resumeText = buildResumeText({
                                    name: resume.full_name || "",
                                    email: resume.resume_email || resume.account_email || "",
                                    phone: resume.resume_phone || resume.phone || "",
                                    summary: resume.summary || "",
                                    skills: safeParse(resume.skills),
                                    education: safeParse(resume.education),
                                    experience: safeParse(resume.experience),
                                    projects: safeParse(resume.projects),
                                    certifications: safeParse(resume.certifications),
                                    github: resume.github || "",
                                    linkedin: resume.linkedin || ""
                                });
                            }

                            if (!resumeText || resumeText.trim() === "") {
                                return res.status(400).json({
                                    success: false,
                                    message: "Resume contains no readable data"
                                });
                            }

                            console.log("\n========== RESUME TEXT ==========\n");
                            console.log(resumeText);

                            // AI Resume Extraction from text
                            let extractedResponse;
                            try {
                                extractedResponse = await extractResumeData(resumeText);
                            } catch (err) {
                                console.log("AI Extraction Error:", err);
                                return res.status(500).json({
                                    success: false,
                                    message: "AI Resume Extraction Failed",
                                    error: err.message
                                });
                            }

                            extracted = parseAIResponse(extractedResponse);
                        }


                        // =================================================
                        // Build Updated Resume
                        // =================================================

                        const updatedResume = {

                            name:

                                typeof extracted.name ===
                                "string"

                                    ? extracted.name

                                    : (
                                        resume.full_name ||
                                        ""
                                    ),


                            email:

                                typeof extracted.email ===
                                "string"

                                    ? extracted.email

                                    : (
                                        resume.resume_email ||
                                        resume.account_email ||
                                        ""
                                    ),


                            phone:

                                typeof extracted.phone ===
                                "string"

                                    ? extracted.phone

                                    : (
                                        resume.resume_phone ||
                                        resume.phone ||
                                        ""
                                    ),


                            summary:

                                typeof extracted.summary ===
                                "string"

                                    ? extracted.summary

                                    : (
                                        resume.summary ||
                                        ""
                                    ),


                            skills:

                                Array.isArray(
                                    extracted.skills
                                )

                                    ? extracted.skills

                                    : safeParse(
                                        resume.skills
                                    ),


                            education:

                                Array.isArray(
                                    extracted.education
                                )

                                    ? extracted.education

                                    : safeParse(
                                        resume.education
                                    ),


                            experience:

                                Array.isArray(
                                    extracted.experience
                                )

                                    ? extracted.experience

                                    : safeParse(
                                        resume.experience
                                    ),


                            projects:

                                Array.isArray(
                                    extracted.projects
                                )

                                    ? extracted.projects

                                    : safeParse(
                                        resume.projects
                                    ),


                            certifications:

                                Array.isArray(
                                    extracted.certifications
                                )

                                    ? extracted.certifications

                                    : safeParse(
                                        resume.certifications
                                    ),


                            github:

                                typeof extracted.github ===
                                "string"

                                    ? extracted.github

                                    : (
                                        resume.github ||
                                        ""
                                    ),


                            linkedin:

                                typeof extracted.linkedin ===
                                "string"

                                    ? extracted.linkedin

                                    : (
                                        resume.linkedin ||
                                        ""
                                    )
                        };


                        // =================================================
                        // ATS Calculation
                        // =================================================

                        const atsResult =
                            calculateATS(
                                updatedResume
                            );


                        console.log(
                            "\n========== ATS RESULT ==========\n"
                        );

                        console.log(
                            atsResult
                        );


                        // =================================================
                        // AI Resume Analysis
                        // =================================================

                        let analysisResponse;


                        try {

                            analysisResponse =
                                await analyzeResumeData(
                                    updatedResume
                                );

                        } catch (err) {

                            console.log(
                                "AI Analysis Error:",
                                err
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "AI Resume Analysis Failed",

                                error:
                                    err.message

                            });
                        }


                        // =================================================
                        // Parse AI Analysis
                        // =================================================

                        const result =
                            parseAIResponse(
                                analysisResponse
                            );


                        // =================================================
                        // Save Results
                        // =================================================

                        const updateSql = `

                            UPDATE job_seekers

                            SET

                                full_name = ?,

                                resume_email = ?,

                                resume_phone = ?,

                                summary = ?,

                                skills = ?,

                                education = ?,

                                experience = ?,

                                projects = ?,

                                certifications = ?,

                                github = ?,

                                linkedin = ?,

                                ats_score = ?,

                                hire_probability = ?,

                                ai_suggestions = ?,

                                missing_skills = ?,

                                recommended_roles = ?,

                                recommended_companies = ?,

                                interview_questions = ?,

                                is_analyzed = 1,

                                last_analyzed = ?

                            WHERE user_id = ?

                        `;


                        db.query(

                            updateSql,

                            [

                                updatedResume.name,

                                updatedResume.email,

                                updatedResume.phone,

                                updatedResume.summary,


                                JSON.stringify(
                                    updatedResume.skills
                                ),


                                JSON.stringify(
                                    updatedResume.education
                                ),


                                JSON.stringify(
                                    updatedResume.experience
                                ),


                                JSON.stringify(
                                    updatedResume.projects
                                ),


                                JSON.stringify(
                                    updatedResume.certifications
                                ),


                                updatedResume.github,

                                updatedResume.linkedin,


                                atsResult.atsScore,

                                atsResult.hireProbability,


                                JSON.stringify(
                                    result.suggestions ||
                                    []
                                ),


                                JSON.stringify(
                                    result.missingSkills ||
                                    []
                                ),


                                JSON.stringify(
                                    result.recommendedRoles ||
                                    []
                                ),


                                JSON.stringify(
                                    result.recommendedCompanies ||
                                    []
                                ),


                                JSON.stringify(
                                    result.interviewQuestions ||
                                    []
                                ),

                                new Date(),

                                loggedInUserId

                            ],

                            (
                                updateErr,
                                updateResult
                            ) => {

                                if (updateErr) {

                                    console.log(
                                        "SAVE AI RESULTS ERROR:",
                                        updateErr
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Failed to save AI results.",

                                        error:
                                            updateErr.message

                                    });
                                }


                                if (
                                    updateResult.affectedRows ===
                                    0
                                ) {

                                    return res.status(404).json({

                                        success: false,

                                        message:
                                            "Job seeker profile not found"

                                    });
                                }


                                // =================================================
                                // Also update resumes table
                                // =================================================
                                //
                                // This keeps the resume record synchronized.
                                //
                                // =================================================

                                const updateResumeSql = `

                                    UPDATE resumes

                                    SET

                                        full_name = ?,

                                        email = ?,

                                        phone = ?,

                                        resume_path = COALESCE(
                                            resume_path,
                                            ?
                                        ),

                                        ats_score = ?,

                                        hire_probability = ?

                                    WHERE
                                        id = ?

                                        AND user_id = ?

                                `;


                                db.query(

                                    updateResumeSql,

                                    [

                                        updatedResume.name,

                                        updatedResume.email,

                                        updatedResume.phone,

                                        resume.resume_path ||
                                        resume.editor_resume_path ||
                                        null,

                                        atsResult.atsScore,

                                        atsResult.hireProbability,

                                        resume.resume_id,

                                        loggedInUserId

                                    ],

                                    (
                                        resumeUpdateErr
                                    ) => {

                                        if (
                                            resumeUpdateErr
                                        ) {

                                            console.log(
                                                "RESUMES TABLE UPDATE WARNING:",
                                                resumeUpdateErr
                                            );

                                            // Do not fail analysis.
                                        }


                                        // =================================================
                                        // Final Response
                                        // =================================================

                                        console.log(
                                            "\n========== RESUME ANALYZED ==========\n"
                                        );

                                        console.log(
                                            "User ID:",
                                            loggedInUserId
                                        );

                                        console.log(
                                            "Resume ID:",
                                            resume.resume_id
                                        );

                                        console.log(
                                            "ATS Score:",
                                            atsResult.atsScore
                                        );

                                        console.log(
                                            "Hire Probability:",
                                            atsResult.hireProbability
                                        );

                                        console.log(
                                            "=====================================\n"
                                        );

                                        // Trigger automated 60%+ skill match job alerts for the candidate
                                        if (updatedResume.skills && updatedResume.skills.length > 0) {
                                            notifyCandidateForMatchingJobs(loggedInUserId, updatedResume.skills)
                                                .catch(err => console.error("Candidate Job Alert Error:", err));
                                        }

                                        return res.status(200).json({

                                            success: true,

                                            message:
                                                "Resume analyzed successfully.",

                                            userId:
                                                Number(
                                                    loggedInUserId
                                                ),

                                            resumeId:
                                                Number(
                                                    resume.resume_id
                                                ),

                                            atsScore:
                                                atsResult.atsScore,

                                            hireProbability:
                                                atsResult.hireProbability,

                                            name:
                                                updatedResume.name,

                                            email:
                                                updatedResume.email,

                                            phone:
                                                updatedResume.phone,

                                            summary:
                                                updatedResume.summary,

                                            skills:
                                                updatedResume.skills,

                                            education:
                                                updatedResume.education,

                                            experience:
                                                updatedResume.experience,

                                            projects:
                                                updatedResume.projects,

                                            certifications:
                                                updatedResume.certifications,

                                            github:
                                                updatedResume.github,

                                            linkedin:
                                                updatedResume.linkedin,

                                            missingSkills:
                                                result.missingSkills ||
                                                [],

                                            suggestions:
                                                result.suggestions ||
                                                [],

                                            recommendedRoles:
                                                result.recommendedRoles ||
                                                [],

                                            recommendedCompanies:
                                                result.recommendedCompanies ||
                                                [],

                                            interviewQuestions:
                                                result.interviewQuestions ||
                                                [],

                                            cached:
                                                false

                                        });

                                    }

                                );

                            }

                        );

                    } catch (error) {

                        console.log(
                            "\n========== ANALYSIS PROCESS ERROR ==========\n"
                        );

                        console.log(
                            error
                        );

                        console.log(
                            "\n============================================\n"
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                error.message ||
                                "Resume analysis failed"

                        });
                    }
                }

            }

        );

    } catch (error) {

        console.log(
            "\n========== AI CONTROLLER ERROR ==========\n"
        );

        console.log(
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Server Error"

        });
    }
};