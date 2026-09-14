import db from "../config/db.js";
import { sendJobMatchAlertEmail } from "./emailService.js";

// =======================================================
// TABLE INITIALIZATION
// =======================================================
export const initJobMatchAlertsTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS job_match_alerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_id INT NOT NULL,
            user_id INT NOT NULL,
            match_score INT NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_job_user (job_id, user_id)
        )
    `;
    db.query(sql, (err) => {
        if (err) {
            console.error("⚠️ Failed to initialize job_match_alerts table:", err.message);
        } else {
            console.log("✅ job_match_alerts table ready");
        }
    });
};

// Automatically attempt table creation
initJobMatchAlertsTable();

// =======================================================
// SKILL PARSING & NORMALIZATION HELPERS
// =======================================================
export const parseSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "string") {
        try {
            const parsed = JSON.parse(skills);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return skills
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);
        }
    }
    return [];
};

export const normalizeSkill = (skill) => {
    if (!skill || typeof skill !== "string") return "";
    let s = skill.toLowerCase().trim();
    // Normalize common variations
    if (s === "reactjs" || s === "react.js") return "react";
    if (s === "nodejs" || s === "node.js") return "node";
    if (s === "expressjs" || s === "express.js") return "express";
    if (s === "vuejs" || s === "vue.js") return "vue";
    if (s === "nextjs" || s === "next.js") return "next";
    if (s === "javascript") return "js";
    if (s === "typescript") return "ts";
    if (s === "rest api" || s === "restful api" || s === "rest apis" || s === "rest-api") return "rest api";
    if (s === "spring boot" || s === "springboot") return "spring boot";
    return s;
};

export const normalizeSkillsList = (skillsList) => {
    return skillsList
        .map(normalizeSkill)
        .filter(Boolean);
};

/**
 * Calculates skill matching percentage between candidate skills and job requirements.
 */
export const calculateSkillMatch = (userSkillsInput, requiredSkillsInput) => {
    const rawUserSkills = parseSkills(userSkillsInput);
    const rawReqSkills = parseSkills(requiredSkillsInput);

    const normUserSkills = normalizeSkillsList(rawUserSkills);
    const normReqSkills = normalizeSkillsList(rawReqSkills);

    if (normReqSkills.length === 0) {
        return { matchScore: 0, matchedSkills: [], totalRequired: 0, rawReqSkills };
    }

    // Find original matched skills preserving readable casing
    const matchedSkills = [];
    rawReqSkills.forEach((reqSkill) => {
        const norm = normalizeSkill(reqSkill);
        if (normUserSkills.includes(norm) || normUserSkills.some(u => u.includes(norm) || norm.includes(u))) {
            matchedSkills.push(reqSkill);
        }
    });

    const matchScore = Math.min(
        100,
        Math.round((matchedSkills.length / normReqSkills.length) * 100)
    );

    return {
        matchScore,
        matchedSkills,
        totalRequired: normReqSkills.length,
        rawReqSkills
    };
};

// =======================================================
// TRIGGER: WHEN RECRUITER POSTS A NEW JOB
// Notify all candidates matching >= 60%
// =======================================================
export const notifyMatchingCandidatesForJob = async (jobId, jobData) => {
    try {
        if (!jobId) return;

        const reqSkills = jobData.required_skills || jobData.requiredSkills || [];

        // Query all registered job seekers with verified/valid emails
        const query = `
            SELECT 
                js.user_id,
                js.skills,
                u.email,
                u.name,
                COALESCE(u.name, 'Candidate') AS candidate_name
            FROM job_seekers js
            INNER JOIN users u ON u.id = js.user_id
            WHERE u.email IS NOT NULL AND u.email != ''
        `;

        db.query(query, async (err, candidates) => {
            if (err) {
                console.error("⚠️ Failed to query job seekers for job match alerts:", err.message);
                return;
            }

            if (!candidates || candidates.length === 0) {
                console.log("ℹ️ No registered job seekers found for job match check.");
                return;
            }

            console.log(`🔍 Checking 60%+ skill match for Job #${jobId} against ${candidates.length} candidates...`);

            for (const candidate of candidates) {
                const { matchScore, matchedSkills, rawReqSkills } = calculateSkillMatch(
                    candidate.skills,
                    reqSkills
                );

                // Threshold is 60%
                if (matchScore >= 60) {
                    console.log(`🎯 Match found! ${candidate.candidate_name} (${candidate.email}) matched ${matchScore}% for Job #${jobId}`);

                    // Deduplication check: only email once per job opening
                    db.query(
                        `SELECT id FROM job_match_alerts WHERE job_id = ? AND user_id = ? LIMIT 1`,
                        [jobId, candidate.user_id],
                        async (checkErr, checkRows) => {
                            if (checkErr) {
                                console.error("⚠️ Deduplication check error:", checkErr.message);
                                return;
                            }

                            if (checkRows && checkRows.length > 0) {
                                console.log(`⏩ Alert already sent to ${candidate.email} for Job #${jobId}. Skipping.`);
                                return;
                            }

                            // Record alert sent in DB
                            db.query(
                                `INSERT INTO job_match_alerts (job_id, user_id, match_score) VALUES (?, ?, ?)`,
                                [jobId, candidate.user_id, matchScore],
                                async (insErr) => {
                                    if (insErr && insErr.code !== "ER_DUP_ENTRY") {
                                        console.error("⚠️ Failed to record job match alert:", insErr.message);
                                    }

                                    // Send the email
                                    try {
                                        await sendJobMatchAlertEmail({
                                            toEmail: candidate.email,
                                            candidateName: candidate.candidate_name,
                                            job: {
                                                id: jobId,
                                                title: jobData.title,
                                                company: jobData.company,
                                                location: jobData.location,
                                                salary: jobData.salary,
                                                experience: jobData.experience,
                                                employmentType: jobData.employmentType || jobData.employment_type,
                                                deadline: jobData.deadline,
                                                description: jobData.description
                                            },
                                            matchScore,
                                            matchedSkills,
                                            requiredSkills: rawReqSkills
                                        });
                                    } catch (mailErr) {
                                        console.error(`⚠️ Failed to send match email to ${candidate.email}:`, mailErr.message);
                                    }
                                }
                            );
                        }
                    );
                }
            }
        });
    } catch (error) {
        console.error("⚠️ notifyMatchingCandidatesForJob encountered an error:", error.message);
    }
};

// =======================================================
// TRIGGER: WHEN CANDIDATE UPDATES RESUME / SKILLS
// Check against all active open jobs
// =======================================================
export const notifyCandidateForMatchingJobs = async (userId, candidateSkills) => {
    try {
        if (!userId) return;

        // Query user info
        db.query(
            `SELECT u.email, COALESCE(u.name, 'Candidate') AS candidate_name FROM users u WHERE u.id = ? LIMIT 1`,
            [userId],
            (userErr, userRows) => {
                if (userErr || !userRows || userRows.length === 0) return;

                const candidate = userRows[0];
                if (!candidate.email) return;

                // Query active jobs
                const jobQuery = `
                    SELECT 
                        id,
                        title,
                        company,
                        location,
                        salary,
                        experience,
                        employment_type,
                        deadline,
                        description,
                        required_skills
                    FROM jobs
                    WHERE (deadline IS NULL OR deadline >= CURDATE())
                    AND vacancies > 0
                    ORDER BY created_at DESC
                    LIMIT 25
                `;

                db.query(jobQuery, async (jobErr, jobs) => {
                    if (jobErr || !jobs || jobs.length === 0) return;

                    for (const job of jobs) {
                        const { matchScore, matchedSkills, rawReqSkills } = calculateSkillMatch(
                            candidateSkills,
                            job.required_skills
                        );

                        if (matchScore >= 60) {
                            // Deduplication check
                            db.query(
                                `SELECT id FROM job_match_alerts WHERE job_id = ? AND user_id = ? LIMIT 1`,
                                [job.id, userId],
                                (checkErr, checkRows) => {
                                    if (checkErr || (checkRows && checkRows.length > 0)) return;

                                    db.query(
                                        `INSERT INTO job_match_alerts (job_id, user_id, match_score) VALUES (?, ?, ?)`,
                                        [job.id, userId, matchScore],
                                        async (insErr) => {
                                            if (insErr && insErr.code !== "ER_DUP_ENTRY") return;

                                            try {
                                                await sendJobMatchAlertEmail({
                                                    toEmail: candidate.email,
                                                    candidateName: candidate.candidate_name,
                                                    job: {
                                                        id: job.id,
                                                        title: job.title,
                                                        company: job.company,
                                                        location: job.location,
                                                        salary: job.salary,
                                                        experience: job.experience,
                                                        employmentType: job.employment_type,
                                                        deadline: job.deadline,
                                                        description: job.description
                                                    },
                                                    matchScore,
                                                    matchedSkills,
                                                    requiredSkills: rawReqSkills
                                                });
                                            } catch (e) {
                                                console.error("⚠️ Error sending job match email:", e.message);
                                            }
                                        }
                                    );
                                }
                            );
                        }
                    }
                });
            }
        );
    } catch (error) {
        console.error("⚠️ notifyCandidateForMatchingJobs encountered an error:", error.message);
    }
};
