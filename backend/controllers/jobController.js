import db from "../config/db.js";

import {
    extractJobSkills
} from "../services/aiService.js";

import {
    notifyMatchingCandidatesForJob
} from "../services/jobMatchAlertService.js";


// ======================================================
// HELPER FUNCTIONS
// ======================================================

// Safely parse JSON
const safeJsonParse = (value, fallback = []) => {

    if (!value) {
        return fallback;
    }

    if (Array.isArray(value)) {
        return value;
    }

    try {
        return JSON.parse(value);
    }

    catch (error) {

        console.log("JSON Parse Error:", error);

        return fallback;
    }
};


// Normalize skills
const normalizeSkills = (skills) => {

    if (!Array.isArray(skills)) {
        return [];
    }

    return skills
        .map(skill => {

            if (typeof skill === "string") {

                return skill
                    .trim()
                    .toLowerCase();

            }

            if (
                typeof skill === "object" &&
                skill !== null
            ) {

                return (
                    skill.name ||
                    skill.skill ||
                    skill.title ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            }

            return "";

        })
        .filter(Boolean);

};


// ======================================================
// JOB VALIDATION
// ======================================================

const validateJobData = ({
    title,
    location,
    salary,
    experience,
    vacancies,
    deadline,
    description
}) => {


    // ==================================================
    // TITLE
    // ==================================================

    if (!title || !title.trim()) {

        return "Job title is required.";

    }

    if (title.trim().length > 100) {

        return "Job title cannot exceed 100 characters.";

    }


    // ==================================================
    // LOCATION
    // ==================================================

    if (!location || !location.trim()) {

        return "Location is required.";

    }

    if (location.trim().length > 100) {

        return "Location cannot exceed 100 characters.";

    }


    // ==================================================
    // DESCRIPTION
    // ==================================================

    if (!description || !description.trim()) {

        return "Job description is required.";

    }

    if (description.trim().length < 20) {

        return "Job description must contain at least 20 characters.";

    }

    if (description.trim().length > 10000) {

        return "Job description cannot exceed 10000 characters.";

    }


    // ==================================================
    // SALARY
    // ==================================================

    if (
        salary &&
        String(salary).length > 50
    ) {

        return "Salary cannot exceed 50 characters.";

    }


    // ==================================================
    // EXPERIENCE
    // ==================================================

    if (
        experience &&
        String(experience).length > 50
    ) {

        return "Experience cannot exceed 50 characters.";

    }


    // ==================================================
    // VACANCIES
    // ==================================================

    const vacancyNumber =
        Number(vacancies);

    if (
        !Number.isInteger(vacancyNumber) ||
        vacancyNumber < 1 ||
        vacancyNumber > 50
    ) {

        return "Vacancies must be between 1 and 50.";

    }


    // ==================================================
    // DEADLINE
    // ==================================================

    if (!deadline) {

        return "Application deadline is required.";

    }


    const selectedDate =
        new Date(`${deadline}T00:00:00`);

    if (
        Number.isNaN(
            selectedDate.getTime()
        )
    ) {

        return "Invalid application deadline.";

    }


    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const maxDate = new Date();

    maxDate.setHours(
        0,
        0,
        0,
        0
    );

    maxDate.setDate(
        maxDate.getDate() + 40
    );


    if (selectedDate < today) {

        return "Application deadline cannot be before today.";

    }


    if (selectedDate > maxDate) {

        return "Application deadline can only be within the next 40 days.";

    }


    return null;

};


// ======================================================
// GET ALL ACTIVE JOBS
// ======================================================

export const getJobs = (req, res) => {

    db.query(

        `
        SELECT 
            jobs.*,
            recruiters.verification_status AS company_verification_status
        FROM jobs
        LEFT JOIN recruiters 
            ON jobs.recruiter_id = recruiters.id 
            OR (jobs.recruiter_id IS NULL AND LOWER(TRIM(jobs.company)) = LOWER(TRIM(recruiters.company_name)))
        WHERE
            (jobs.deadline IS NULL OR jobs.deadline >= CURDATE())
            AND jobs.vacancies > 0
        ORDER BY jobs.created_at DESC
        `,

        (err, results) => {

            if (err) {

                console.log(
                    "GET JOBS ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message: "Database Error"

                });

            }


            const jobs =
                results.map(job => ({

                    ...job,

                    is_company_verified:
                        job.company_verification_status === "VERIFIED" ||
                        job.verification_status === "VERIFIED",

                    company_verification_status:
                        job.company_verification_status ||
                        job.verification_status ||
                        "PENDING",

                    required_skills:
                        safeJsonParse(
                            job.required_skills
                        )

                }));


            return res.status(200).json({

                success: true,

                jobs

            });

        }

    );

};


// ======================================================
// GET SINGLE JOB
// ======================================================

export const getJobById = (req, res) => {

    const { id } = req.params;


    db.query(

        `
        SELECT 
            jobs.*,
            recruiters.verification_status AS company_verification_status
        FROM jobs
        LEFT JOIN recruiters 
            ON jobs.recruiter_id = recruiters.id
            OR (jobs.recruiter_id IS NULL AND LOWER(TRIM(jobs.company)) = LOWER(TRIM(recruiters.company_name)))
        WHERE jobs.id = ?
        `,

        [id],

        (err, results) => {

            if (err) {

                console.log(
                    "GET JOB ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message: "Database Error"

                });

            }


            if (
                results.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message: "Job not found"

                });

            }


            const job = {

                ...results[0],

                is_company_verified:
                    results[0].company_verification_status === "VERIFIED" ||
                    results[0].verification_status === "VERIFIED",

                company_verification_status:
                    results[0].company_verification_status ||
                    results[0].verification_status ||
                    "PENDING",

                required_skills:
                    safeJsonParse(
                        results[0].required_skills
                    )

            };


            return res.status(200).json({

                success: true,

                job

            });

        }

    );

};


// ======================================================
// CREATE JOB
// ======================================================

export const createJob = async (req, res) => {

    try {

        const userId =
            req.user.userId;


        const {
            title,
            location,
            description,
            salary,
            experience,
            employmentType,
            vacancies,
            deadline
        } = req.body;


        // ==================================================
        // VALIDATE JOB
        // ==================================================

        const validationError =
            validateJobData({

                title,
                location,
                salary,
                experience,
                vacancies,
                deadline,
                description

            });


        if (validationError) {

            return res.status(400).json({

                success: false,

                message: validationError

            });

        }


        // ==================================================
        // GET RECRUITER
        // ==================================================

        db.query(

            `
            SELECT *

            FROM recruiters

            WHERE user_id = ?

            LIMIT 1
            `,

            [userId],

            async (
                err,
                recruiterResult
            ) => {

                if (err) {

                    console.log(
                        "RECRUITER QUERY ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message: "Database Error"

                    });

                }


                if (
                    recruiterResult.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message: "Recruiter Not Found"

                    });

                }


                const recruiter =
                    recruiterResult[0];


                const recruiterId =
                    recruiter.id;


                // ==================================================
                // COMPANY FROM RECRUITER PROFILE
                // ==================================================

                const company =

                    recruiter.company_name ||

                    recruiter.company ||

                    recruiter.organization_name ||

                    recruiter.companyName ||

                    "";


                if (!company) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Please complete your company profile before posting a job."

                    });

                }


                // ==================================================
                // AI SKILL EXTRACTION
                // ==================================================

                let requiredSkills = [];


                try {

                    const aiResponse =
                        await extractJobSkills(
                            description
                        );


                    const parsed =
                        JSON.parse(
                            aiResponse
                        );


                    requiredSkills =
                        Array.isArray(
                            parsed.skills
                        )
                            ? parsed.skills
                            : [];

                }

                catch (aiError) {

                    console.log(
                        "AI SKILL EXTRACTION ERROR:",
                        aiError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "AI Job Skill Extraction Failed"

                    });

                }


                // ==================================================
                // INSERT JOB
                // ==================================================

                const sql = `

                    INSERT INTO jobs (

                        recruiter_id,

                        title,

                        company,

                        location,

                        description,

                        required_skills,

                        salary,

                        experience,

                        employment_type,

                        vacancies,

                        deadline

                    )

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

                `;


                db.query(

                    sql,

                    [

                        recruiterId,

                        title.trim(),

                        company.trim(),

                        location.trim(),

                        description.trim(),

                        JSON.stringify(
                            requiredSkills
                        ),

                        salary
                            ? String(
                                salary
                            ).trim()
                            : "",

                        experience
                            ? String(
                                experience
                            ).trim()
                            : "",

                        employmentType ||
                            "Full Time",

                        Number(vacancies),

                        deadline

                    ],

                    (
                        insertError,
                        result
                    ) => {

                        if (insertError) {

                            console.log(
                                "CREATE JOB ERROR:",
                                insertError
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed to Create Job"

                            });

                        }


                        console.log(
                            "======================================"
                        );

                        console.log(
                            "JOB CREATED"
                        );

                        console.log(
                            "Job ID:",
                            result.insertId
                        );

                        console.log(
                            "Recruiter ID:",
                            recruiterId
                        );

                        console.log(
                            "Company:",
                            company
                        );

                        console.log(
                            "Title:",
                            title
                        );

                        console.log(
                            "======================================"
                        );

                        // Trigger automated 60%+ skill match email alerts to candidates (asynchronous)
                        notifyMatchingCandidatesForJob(result.insertId, {
                            title: title.trim(),
                            company: company.trim(),
                            location: location.trim(),
                            description: description.trim(),
                            required_skills: requiredSkills,
                            salary: salary ? String(salary).trim() : "",
                            experience: experience ? String(experience).trim() : "",
                            employment_type: employmentType || "Full Time",
                            deadline: deadline
                        }).catch(err => console.error("Job Match Notification Error:", err));

                        return res.status(201).json({

                            success: true,

                            message:
                                "Job Posted Successfully",

                            jobId:
                                result.insertId,

                            company,

                            skills:
                                requiredSkills

                        });

                    }

                );

            }

        );

    }

    catch (error) {

        console.log(
            "CREATE JOB ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to Create Job"

        });

    }

};


// ======================================================
// GET RECRUITER JOBS
// ======================================================

export const getRecruiterJobs = (req, res) => {

    const userId =
        req.user.userId;


    db.query(

        `
        SELECT
            jobs.*,
            recruiters.verification_status AS company_verification_status,
            recruiters.verification_status
        FROM jobs
        INNER JOIN recruiters
            ON recruiters.id = jobs.recruiter_id
        WHERE recruiters.user_id = ?
        ORDER BY
            jobs.created_at DESC
        `,
        [userId],
        (err, result) => {
            if (err) {
                console.log(
                    "GET RECRUITER JOBS ERROR:",
                    err
                );
                return res.status(500).json({
                    success: false,
                    message:
                        "Database Error"
                });
            }

            const jobs =
                result.map(job => ({
                    ...job,
                    is_company_verified:
                        job.company_verification_status === "VERIFIED" ||
                        job.verification_status === "VERIFIED",
                    company_verification_status:
                        job.company_verification_status ||
                        job.verification_status ||
                        "PENDING",
                    required_skills:
                        safeJsonParse(
                            job.required_skills
                        )
                }));



            console.log(
                `Recruiter ${userId} Jobs:`,
                jobs.length
            );


            return res.status(200).json({

                success: true,

                jobs

            });

        }

    );

};


// ======================================================
// UPDATE JOB
// ======================================================

export const updateJob = async (req, res) => {

    try {

        const { id } =
            req.params;


        const userId =
            req.user.userId;


        const {

            title,

            location,

            description,

            salary,

            experience,

            employment_type,

            employmentType,

            vacancies,

            deadline

        } = req.body;


        // ==================================================
        // VALIDATE
        // ==================================================

        const validationError =
            validateJobData({

                title,
                location,
                salary,
                experience,
                vacancies,
                deadline,
                description

            });


        if (validationError) {

            return res.status(400).json({

                success: false,

                message:
                    validationError

            });

        }


        // ==================================================
        // CHECK JOB OWNERSHIP
        // ==================================================

        db.query(

            `

            SELECT

                jobs.id,

                jobs.company

            FROM jobs

            INNER JOIN recruiters

                ON recruiters.id =
                    jobs.recruiter_id

            WHERE

                jobs.id = ?

                AND recruiters.user_id = ?

            LIMIT 1

            `,

            [
                id,
                userId
            ],

            async (
                ownerError,
                ownerResult
            ) => {

                if (ownerError) {

                    console.log(
                        "JOB OWNERSHIP ERROR:",
                        ownerError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                if (
                    ownerResult.length === 0
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "You are not authorized to update this job."

                    });

                }


                // ==================================================
                // AI SKILL EXTRACTION
                // ==================================================

                let requiredSkills = [];


                try {

                    const aiResponse =
                        await extractJobSkills(
                            description
                        );


                    const parsed =
                        JSON.parse(
                            aiResponse
                        );


                    requiredSkills =
                        Array.isArray(
                            parsed.skills
                        )
                            ? parsed.skills
                            : [];

                }

                catch (aiError) {

                    console.log(
                        "UPDATE AI ERROR:",
                        aiError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "AI Skill Extraction Failed"

                    });

                }


                // ==================================================
                // UPDATE JOB
                // ==================================================

                const finalEmploymentType =

                    employmentType ||

                    employment_type ||

                    "Full Time";


                const sql = `

                    UPDATE jobs

                    SET

                        title = ?,

                        location = ?,

                        description = ?,

                        required_skills = ?,

                        salary = ?,

                        experience = ?,

                        employment_type = ?,

                        vacancies = ?,

                        deadline = ?

                    WHERE id = ?

                `;


                db.query(

                    sql,

                    [

                        title.trim(),

                        location.trim(),

                        description.trim(),

                        JSON.stringify(
                            requiredSkills
                        ),

                        salary
                            ? String(
                                salary
                            ).trim()
                            : "",

                        experience
                            ? String(
                                experience
                            ).trim()
                            : "",

                        finalEmploymentType,

                        Number(vacancies),

                        deadline,

                        id

                    ],

                    (
                        updateError
                    ) => {

                        if (updateError) {

                            console.log(
                                "UPDATE JOB ERROR:",
                                updateError
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed To Update Job"

                            });

                        }


                        return res.status(200).json({

                            success: true,

                            message:
                                "Job Updated Successfully",

                            skills:
                                requiredSkills

                        });

                    }

                );

            }

        );

    }

    catch (error) {

        console.log(
            "UPDATE JOB ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Update Failed"

        });

    }

};


// ======================================================
// DELETE JOB
// ======================================================

export const deleteJob = (req, res) => {

    const { id } =
        req.params;


    const userId =
        req.user.userId;


    // ==================================================
    // STEP 1
    // VERIFY JOB OWNERSHIP
    // ==================================================

    db.query(

        `

        SELECT

            jobs.id

        FROM jobs

        INNER JOIN recruiters

            ON recruiters.id =
                jobs.recruiter_id

        WHERE

            jobs.id = ?

            AND recruiters.user_id = ?

        LIMIT 1

        `,

        [
            id,
            userId
        ],

        (checkError, jobResult) => {

            if (checkError) {

                console.log(
                    "CHECK DELETE JOB ERROR:",
                    checkError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to verify job"

                });

            }


            if (
                jobResult.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job not found or you are not authorized to delete it."

                });

            }


            // ==================================================
            // STEP 2
            // DELETE JOB INTERVIEWS
            //
            // IMPORTANT:
            // job_interviews.application_id references
            // applications.id
            // ==================================================

            db.query(

                `

                DELETE FROM job_interviews

                WHERE job_id = ?

                `,

                [id],

                (interviewError) => {

                    if (interviewError) {

                        console.log(
                            "DELETE JOB INTERVIEWS ERROR:",
                            interviewError
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to delete job interview records"

                        });

                    }


                    // ==================================================
                    // STEP 3
                    // DELETE APPLICATIONS
                    // ==================================================

                    db.query(

                        `

                        DELETE FROM applications

                        WHERE job_id = ?

                        `,

                        [id],

                        (applicationError) => {

                            if (applicationError) {

                                console.log(
                                    "DELETE APPLICATIONS ERROR:",
                                    applicationError
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Failed to delete job applications"

                                });

                            }


                            // ==================================================
                            // STEP 4
                            // DELETE JOB
                            // ==================================================

                            db.query(

                                `

                                DELETE FROM jobs

                                WHERE id = ?

                                `,

                                [id],

                                (
                                    deleteError,
                                    result
                                ) => {

                                    if (deleteError) {

                                        console.log(
                                            "DELETE JOB ERROR:",
                                            deleteError
                                        );

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Failed to delete job"

                                        });

                                    }


                                    if (
                                        result.affectedRows === 0
                                    ) {

                                        return res.status(404).json({

                                            success: false,

                                            message:
                                                "Job not found"

                                        });

                                    }


                                    console.log(
                                        `Job ${id} deleted by recruiter ${userId}`
                                    );


                                    return res.status(200).json({

                                        success: true,

                                        message:
                                            "Job and all related applications and interviews deleted successfully"

                                    });

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
// GET RECOMMENDED JOBS
// ======================================================
// Matches logged-in user's resume skills
// against recruiter-posted jobs.
// ======================================================

export const getRecommendedJobs = (req, res) => {

    const userId =
        req.user.userId;


    // ==================================================
    // GET USER RESUME SKILLS
    // ==================================================

    db.query(

        `

        SELECT

            skills

        FROM job_seekers

        WHERE user_id = ?

        LIMIT 1

        `,

        [userId],

        (err, resumeResult) => {

            if (err) {

                console.log(
                    "GET RESUME SKILLS ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to load resume skills"

                });

            }


            // ==================================================
            // NO JOB SEEKER PROFILE
            // ==================================================

            if (
                resumeResult.length === 0
            ) {

                return res.status(200).json({

                    success: true,

                    jobs: []

                });

            }


            // ==================================================
            // PARSE RESUME SKILLS
            // ==================================================

            let userSkills =
                safeJsonParse(
                    resumeResult[0].skills
                );


            // ==================================================
            // NORMALIZE USER SKILLS
            // ==================================================

            userSkills =
                normalizeSkills(
                    userSkills
                );


            console.log(
                "User Resume Skills:",
                userSkills
            );


            // ==================================================
            // GET ACTIVE JOBS
            // ==================================================

            db.query(

                `

                SELECT

                    jobs.id,

                    jobs.recruiter_id,

                    jobs.title,

                    jobs.company,

                    jobs.location,

                    jobs.description,

                    jobs.required_skills,

                    jobs.salary,

                    jobs.experience,

                    jobs.created_at,

                    jobs.employment_type,

                    jobs.vacancies,

                    jobs.deadline,

                    recruiters.verification_status AS company_verification_status

                FROM jobs

                LEFT JOIN recruiters 
                    ON jobs.recruiter_id = recruiters.id 
                    OR (jobs.recruiter_id IS NULL AND LOWER(TRIM(jobs.company)) = LOWER(TRIM(recruiters.company_name)))

                WHERE
                    (jobs.deadline IS NULL OR jobs.deadline >= CURDATE())
                    AND jobs.vacancies > 0

                ORDER BY
                    jobs.created_at DESC

                `,

                (jobError, jobsResult) => {

                    if (jobError) {

                        console.log(
                            "GET RECOMMENDED JOBS ERROR:",
                            jobError
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to load recommended jobs"

                        });

                    }


                    // ==================================================
                    // CALCULATE MATCH SCORE
                    // ==================================================

                    const recommendedJobs =
                        jobsResult.map(
                            job => {

                                const requiredSkills =
                                    safeJsonParse(
                                        job.required_skills
                                    );


                                const normalizedRequiredSkills =
                                    normalizeSkills(
                                        requiredSkills
                                    );


                                // ==================================================
                                // MATCHING SKILLS
                                // ==================================================

                                const matchedSkills =
                                    normalizedRequiredSkills
                                        .filter(
                                            skill =>
                                                userSkills.includes(
                                                    skill
                                                )
                                        );


                                // ==================================================
                                // MATCH %
                                // ==================================================

                                let matchScore =
                                    0;


                                if (
                                    normalizedRequiredSkills.length >
                                    0
                                ) {

                                    matchScore =
                                        Math.round(

                                            (
                                                matchedSkills.length /
                                                normalizedRequiredSkills.length
                                            ) * 100

                                        );

                                }


                                return {

                                    ...job,

                                    is_company_verified:
                                        job.company_verification_status === "VERIFIED" ||
                                        job.verification_status === "VERIFIED",

                                    company_verification_status:
                                        job.company_verification_status ||
                                        job.verification_status ||
                                        "PENDING",

                                    required_skills:
                                        requiredSkills,

                                    matched_skills:
                                        matchedSkills,

                                    match_score:
                                        matchScore

                                };

                            }
                        );


                    // ==================================================
                    // SORT
                    // HIGHEST MATCH FIRST
                    // ==================================================

                    recommendedJobs.sort(

                        (a, b) => {

                            if (
                                b.match_score !==
                                a.match_score
                            ) {

                                return (
                                    b.match_score -
                                    a.match_score
                                );

                            }


                            return (

                                new Date(
                                    b.created_at
                                ) -

                                new Date(
                                    a.created_at
                                )

                            );

                        }

                    );


                    // ==================================================
                    // RETURN TOP 6
                    // ==================================================

                    return res.status(200).json({

                        success: true,

                        jobs:
                            recommendedJobs.slice(
                                0,
                                6
                            )

                    });

                }

            );

        }

    );

};