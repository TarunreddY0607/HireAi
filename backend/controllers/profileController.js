import db from "../config/db.js";
import bcrypt from "bcrypt";

// ==========================================
// SAFE JSON PARSER
// ==========================================

const parseJsonField = (value) => {

    if (!value) return [];

    if (Array.isArray(value)) {
        return value;
    }

    try {

        return JSON.parse(value);

    }

    catch {

        if (typeof value === "string") {

            return value
                .split(",")
                .map(item => item.trim())
                .filter(item => item);

        }

        return [];

    }

};

// ==========================================
// GET PROFILE
// ==========================================

export const getProfile = (req, res) => {

    const userId = req.user.userId;

    const sql = `

        SELECT

            /* =====================================
               ACCOUNT INFORMATION
               This is the name used for Dashboard
               and Sidebar.
               ===================================== */

            COALESCE(NULLIF(u.account_name, ''), js.full_name) AS account_name,
u.email,
                        /* =====================================
               RESUME INFORMATION
               This can be different from account name.
               ===================================== */

            js.full_name AS resume_full_name,
            js.phone,

            js.resume_name,
            js.resume_email,
            js.resume_phone,

            js.resume_path,

            js.summary,
            js.education,
            js.experience,
            js.projects,
            js.certifications,
            js.github,
            js.linkedin,

            js.ats_score,
            js.hire_probability,

            js.skills,
            js.missing_skills,
            js.ai_suggestions,

            js.recommended_roles,
            js.recommended_companies,
            js.interview_questions,

            js.is_analyzed,
            js.last_analyzed

        FROM users u

        INNER JOIN job_seekers js

            ON u.id = js.user_id

        WHERE u.id = ?

    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {

            console.log(
                "GET PROFILE ERROR:",
                err
            );

            return res.status(500).json({

                success: false,

                message: "Database Error"

            });

        }

        if (result.length === 0) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        const profile = result[0];

        // ==========================================
        // JSON FIELDS
        // ==========================================

        profile.skills =
            parseJsonField(
                profile.skills
            );

        profile.missing_skills =
            parseJsonField(
                profile.missing_skills
            );

        profile.ai_suggestions =
            parseJsonField(
                profile.ai_suggestions
            );

        profile.education =
            parseJsonField(
                profile.education
            );

        profile.experience =
            parseJsonField(
                profile.experience
            );

        profile.projects =
            parseJsonField(
                profile.projects
            );

        profile.certifications =
            parseJsonField(
                profile.certifications
            );

        profile.recommended_roles =
            parseJsonField(
                profile.recommended_roles
            );

        profile.recommended_companies =
            parseJsonField(
                profile.recommended_companies
            );

        profile.interview_questions =
            parseJsonField(
                profile.interview_questions
            );

        // ==========================================
        // IMPORTANT
        //
        // Dashboard / Sidebar should use:
        //
        // profile.account_name
        //
        // Resume Analysis should use:
        //
        // profile.resume_full_name
        //
        // ==========================================

        return res.status(200).json({

            success: true,

            profile

        });

    });

};

// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = (req, res) => {

    const userId = req.user.userId;

    const {

        full_name,
        phone

    } = req.body;

    // ==========================================
    // Update ACCOUNT NAME
    //
    // Do NOT update job_seekers.full_name here.
    // That field belongs to the analyzed resume.
    // ==========================================

    const updateUserSql = `

        UPDATE users

        SET account_name = ?

        WHERE id = ?

    `;

    db.query(

        updateUserSql,

        [

            full_name,

            userId

        ],

        (err) => {

            if (err) {

                console.log(
                    "UPDATE ACCOUNT NAME ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to Update Account Name"

                });

            }

            // ==========================================
            // Update phone separately
            // ==========================================

            const updatePhoneSql = `

                UPDATE job_seekers

                SET phone = ?

                WHERE user_id = ?

            `;

            db.query(

                updatePhoneSql,

                [

                    phone,

                    userId

                ],

                (err) => {

                    if (err) {

                        console.log(
                            "UPDATE PHONE ERROR:",
                            err
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to Update Phone"

                        });

                    }

                    return res.status(200).json({

                        success: true,

                        message:
                            "Profile Updated Successfully"

                    });

                }

            );

        }

    );

};

// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changePassword = (req, res) => {

    const userId = req.user.userId;

    const {

        currentPassword,
        newPassword

    } = req.body;

    // ==========================================
    // GET CURRENT PASSWORD
    // ==========================================

    const sql = `

        SELECT password

        FROM users

        WHERE id = ?

    `;

    db.query(

        sql,

        [userId],

        async (err, result) => {

            if (err) {

                console.log(
                    "GET PASSWORD ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }

            if (result.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }

            // ==========================================
            // CHECK CURRENT PASSWORD
            // ==========================================

            const isMatch =
                await bcrypt.compare(

                    currentPassword,

                    result[0].password

                );

            if (!isMatch) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current Password is Incorrect"

                });

            }

            // ==========================================
            // HASH NEW PASSWORD
            // ==========================================

            const hashedPassword =
                await bcrypt.hash(

                    newPassword,

                    10

                );

            // ==========================================
            // UPDATE PASSWORD
            // ==========================================

            db.query(

                `

                    UPDATE users

                    SET password = ?

                    WHERE id = ?

                `,

                [

                    hashedPassword,

                    userId

                ],

                (err) => {

                    if (err) {

                        console.log(
                            "UPDATE PASSWORD ERROR:",
                            err
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to Update Password"

                        });

                    }

                    return res.status(200).json({

                        success: true,

                        message:
                            "Password Changed Successfully"

                    });

                }

            );

        }

    );

};

export const updateAvatar = (req, res) => {
    const userId = req.user.userId;
    const { profile_pic } = req.body;

    const sql = `
        UPDATE job_seekers
        SET profile_pic = ?
        WHERE user_id = ?
    `;

    db.query(sql, [profile_pic || null, userId], (err) => {
        if (err) {
            console.log("UPDATE AVATAR ERROR:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update profile picture"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully"
        });
    });
};