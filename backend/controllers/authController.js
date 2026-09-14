import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { sendOtpEmail, sendRegistrationOtpEmail } from "../services/emailService.js";

// Initialize necessary auth tables if not exist
const initAuthTables = () => {
    const createResetsTable = `
        CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    const createVerificationsTable = `
        CREATE TABLE IF NOT EXISTS email_verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createResetsTable, (err) => {
        if (err) console.error("Could not ensure password_resets table:", err.message);
    });
    db.query(createVerificationsTable, (err) => {
        if (err) console.error("Could not ensure email_verifications table:", err.message);
    });
};
initAuthTables();

/* =========================================================
   JOB SEEKER REGISTRATION
========================================================= */

export const registerJobSeeker = async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            password,
            otp
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (!fullName || !email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name, email and password are required"

            });

        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanOtp = otp ? otp.toString().trim() : "";

        // =====================================================
        // VERIFY EMAIL OTP
        // =====================================================
        const verifySql = `
            SELECT id FROM email_verifications 
            WHERE LOWER(email) = ? 
              AND ( (otp = ? AND expires_at > NOW()) OR (is_verified = TRUE AND expires_at > NOW()) )
            ORDER BY created_at DESC LIMIT 1
        `;

        db.query(verifySql, [normalizedEmail, cleanOtp], (vErr, vResults) => {
            if (vErr) {
                console.error("Email verification check error:", vErr);
                return res.status(500).json({
                    success: false,
                    message: "Database error verifying email code."
                });
            }

            if (!vResults || vResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter the valid 6-digit verification code sent to your email."
                });
            }

            // =====================================================
            // RESUME FILE
            // =====================================================

            const resume =
                req.file
                    ? req.file.filename
                    : null;


            // =====================================================
            // CHECK EXISTING EMAIL
            // =====================================================

            db.query(

                "SELECT id FROM users WHERE LOWER(email) = ?",

                [normalizedEmail],

                async (err, result) => {

                if (err) {

                    console.log(
                        "Check Email Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database Error"

                    });

                }


                if (result.length > 0) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Email already exists"

                    });

                }


                // =====================================================
                // HASH PASSWORD
                // =====================================================

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                // =====================================================
                // CREATE USER
                // =====================================================
                //
                // IMPORTANT:
                //
                // account_name belongs to the USER ACCOUNT.
                //
                // It must NEVER be taken from the resume.
                //
                // =====================================================

                db.query(

                    `INSERT INTO users
                    (
                        email,
                        account_name,
                        password,
                        role
                    )
                    VALUES (?, ?, ?, ?)`,

                    [
                        email,
                        fullName,
                        hashedPassword,
                        "job_seeker"
                    ],

                    (userErr, userResult) => {

                        if (userErr) {

                            console.log(
                                "Create User Error:",
                                userErr
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed to create user",

                                error:
                                    userErr.message

                            });

                        }


                        // =================================================
                        // NEW USER ID
                        // =================================================

                        const userId =
                            userResult.insertId;


                        console.log(
                            "\n========== USER CREATED =========="
                        );

                        console.log(
                            "User ID:",
                            userId
                        );

                        console.log(
                            "Account Name:",
                            fullName
                        );

                        console.log(
                            "Email:",
                            email
                        );

                        console.log(
                            "Role:",
                            "job_seeker"
                        );

                        console.log(
                            "==================================\n"
                        );


                        // =================================================
                        // CREATE JOB SEEKER PROFILE
                        // =================================================
                        //
                        // NOTE:
                        // job_seekers.full_name can now be used by
                        // resume information without changing the
                        // actual account name.
                        //
                        // =================================================

                        db.query(

                            `INSERT INTO job_seekers
                            (
                                user_id,
                                full_name,
                                phone,
                                resume_path
                            )
                            VALUES (?, ?, ?, ?)`,

                            [
                                userId,
                                fullName,
                                phone || "",
                                resume
                            ],

                            (profileErr) => {

                                if (profileErr) {

                                    console.log(
                                        "Create Job Seeker Error:",
                                        profileErr
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Failed to create job seeker",

                                        error:
                                            profileErr.message

                                    });

                                }


                                // =================================================
                                // CREATE RESUME RECORD
                                // =================================================

                                db.query(

                                    `INSERT INTO resumes
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
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                                    [

                                        userId,

                                        "My Resume",

                                        "default",

                                        "",

                                        "",

                                        "",

                                        resume,

                                        null,

                                        null

                                    ],

                                    (resumeErr, resumeResult) => {

                                        if (resumeErr) {

                                            console.log(
                                                "Create Resume Error:",
                                                resumeErr
                                            );

                                            return res.status(500).json({

                                                success: false,

                                                message:
                                                    "Failed to create resume",

                                                error:
                                                    resumeErr.message

                                            });

                                        }


                                        // =================================================
                                        // REGISTRATION COMPLETE
                                        // =================================================

                                        console.log(
                                            "\n========== REGISTRATION COMPLETE =========="
                                        );

                                        console.log(
                                            "User ID:",
                                            userId
                                        );

                                        console.log(
                                            "Resume ID:",
                                            resumeResult.insertId
                                        );

                                        console.log(
                                            "Account Name:",
                                            fullName
                                        );

                                        console.log(
                                            "Account Email:",
                                            email
                                        );

                                        console.log(
                                            "Resume File:",
                                            resume
                                        );

                                        console.log(
                                            "============================================\n"
                                        );


                                        // Clean up verification records
                                        db.query(
                                            "DELETE FROM email_verifications WHERE LOWER(email) = ?",
                                            [normalizedEmail],
                                            () => {}
                                        );

                                        return res.status(201).json({

                                            success:
                                                true,

                                            message:
                                                "Job Seeker Registered Successfully",

                                            userId:
                                                userId,

                                            resumeId:
                                                resumeResult.insertId

                                        });

                                    }

                                );

                            }

                        );

                    }

                );

            }

        );
        });

    }

    catch (error) {

        console.log(
            "Job Seeker Registration Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server Error",

            error:
                error.message

        });

    }

};


/* =========================================================
   LOGIN
========================================================= */

export const login = (req, res) => {

    const {
        email,
        password
    } = req.body;


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!email || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Email and password are required"

        });

    }


    // =====================================================
    // FIND USER
    // =====================================================
    //
    // IMPORTANT:
    //
    // Account name comes ONLY from:
    //
    // users.account_name
    //
    // NOT from job_seekers.full_name
    // NOT from resumes.full_name
    //
    // =====================================================

    const sql = `

        SELECT

            u.id,

            u.email,

            u.account_name,

            u.password,

            u.role,

            js.phone

        FROM users u

        LEFT JOIN job_seekers js

            ON js.user_id = u.id

        WHERE u.email = ?

    `;


    db.query(

        sql,

        [email],

        async (err, result) => {

            if (err) {

                console.log(
                    "Login Database Error:",
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
            // USER NOT FOUND
            // =================================================

            if (result.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid Email or Password"

                });

            }


            const user =
                result[0];


            // =================================================
            // PASSWORD CHECK
            // =================================================

            const passwordMatch =
                await bcrypt.compare(

                    password,

                    user.password

                );


            if (!passwordMatch) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid Email or Password"

                });

            }


            // =================================================
            // CREATE JWT
            // =================================================

            const token =
                jwt.sign(

                    {

                        userId:
                            user.id,

                        role:
                            user.role

                    },

                    process.env.JWT_SECRET,

                    {

                        expiresIn:
                            "1d"

                    }

                );


            // =================================================
            // ACCOUNT NAME
            // =================================================

            const accountName =
                user.account_name || "";


            // =================================================
            // LOGIN DEBUG
            // =================================================

            console.log(
                "\n========== LOGIN =========="
            );

            console.log(
                "User ID:",
                user.id
            );

            console.log(
                "Email:",
                user.email
            );

            console.log(
                "Role:",
                user.role
            );

            console.log(
                "ACCOUNT NAME:",
                accountName
            );

            console.log(
                "Phone:",
                user.phone
            );

            console.log(
                "===========================\n"
            );


            // =================================================
            // LOGIN RESPONSE
            // =================================================

            return res.status(200).json({

                success: true,

                message:
                    "Login Successful",

                token:

                    token,

                userId:
                    user.id,

                role:
                    user.role,

                // =============================================
                // ACCOUNT INFORMATION
                // =============================================

                fullName:
                    accountName,

                accountName:
                    accountName,

                email:
                    user.email || "",

                phone:
                    user.phone || ""

            });

        }

    );

};


/* =========================================================
   FORGOT PASSWORD: SEND OTP
========================================================= */

export const sendForgotOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Check if user exists in database
        db.query(
            "SELECT id, email, account_name, role FROM users WHERE LOWER(email) = ?",
            [normalizedEmail],
            async (err, results) => {
                if (err) {
                    console.error("Check user error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Database Error while verifying account."
                    });
                }

                if (!results || results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        accountNotFound: true,
                        message: "No account registered with this email address."
                    });
                }

                const user = results[0];

                // 2. Generate 6-digit numeric OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

                // 3. Clear old OTPs for this email and insert new OTP
                db.query(
                    "DELETE FROM password_resets WHERE LOWER(email) = ?",
                    [normalizedEmail],
                    (delErr) => {
                        if (delErr) {
                            console.error("Delete old OTP error:", delErr);
                        }

                        db.query(
                            "INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)",
                            [normalizedEmail, otp, expiresAt],
                            async (insErr) => {
                                if (insErr) {
                                    console.error("Insert OTP error:", insErr);
                                    return res.status(500).json({
                                        success: false,
                                        message: "Failed to generate verification code."
                                    });
                                }

                                // 4. Send Email
                                const sendResult = await sendOtpEmail(
                                    normalizedEmail,
                                    otp,
                                    user.account_name || "User"
                                );

                                return res.status(200).json({
                                    success: true,
                                    message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
                                    email: normalizedEmail
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Send Forgot OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


/* =========================================================
   FORGOT PASSWORD: VERIFY OTP
========================================================= */

export const verifyForgotOtp = (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();

        db.query(
            "SELECT * FROM password_resets WHERE LOWER(email) = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [normalizedEmail, cleanOtp],
            (err, results) => {
                if (err) {
                    console.error("Verify OTP error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Database Error while verifying code."
                    });
                }

                if (!results || results.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid or expired verification code. Please request a new code."
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: "Verification code verified successfully!"
                });
            }
        );
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


/* =========================================================
   FORGOT PASSWORD: RESET PASSWORD
========================================================= */

export const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, verification code, and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();

        // 1. Verify OTP
        db.query(
            "SELECT * FROM password_resets WHERE LOWER(email) = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [normalizedEmail, cleanOtp],
            async (err, results) => {
                if (err) {
                    console.error("Reset password verify error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Database Error."
                    });
                }

                if (!results || results.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid or expired verification code. Please try again."
                    });
                }

                // 2. Hash New Password
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                // 3. Update User Password
                db.query(
                    "UPDATE users SET password = ? WHERE LOWER(email) = ?",
                    [hashedPassword, normalizedEmail],
                    (updateErr, updateResult) => {
                        if (updateErr) {
                            console.error("Password update error:", updateErr);
                            return res.status(500).json({
                                success: false,
                                message: "Failed to update password."
                            });
                        }

                        // 4. Clean up used OTPs
                        db.query(
                            "DELETE FROM password_resets WHERE LOWER(email) = ?",
                            [normalizedEmail],
                            () => {}
                        );

                        return res.status(200).json({
                            success: true,
                            message: "Password reset successfully! You can now log in with your new password."
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Reset Password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


/* =========================================================
   REGISTRATION: SEND EMAIL VERIFICATION OTP
========================================================= */

export const sendRegisterOtp = async (req, res) => {
    try {
        const { email, fullName } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Check if email already registered in users table
        db.query(
            "SELECT id FROM users WHERE LOWER(email) = ?",
            [normalizedEmail],
            async (err, results) => {
                if (err) {
                    console.error("Check email error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Database error while verifying email."
                    });
                }

                if (results && results.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "This email address is already registered. Please log in or reset your password."
                    });
                }

                // 2. Generate 6-digit numeric OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

                // 3. Clear existing OTPs for this email and save new OTP
                db.query(
                    "DELETE FROM email_verifications WHERE LOWER(email) = ?",
                    [normalizedEmail],
                    (delErr) => {
                        if (delErr) {
                            console.error("Delete old registration OTP error:", delErr);
                        }

                        db.query(
                            "INSERT INTO email_verifications (email, otp, expires_at, is_verified) VALUES (?, ?, ?, FALSE)",
                            [normalizedEmail, otp, expiresAt],
                            async (insErr) => {
                                if (insErr) {
                                    console.error("Insert registration OTP error:", insErr);
                                    return res.status(500).json({
                                        success: false,
                                        message: "Failed to generate email verification code."
                                    });
                                }

                                // 4. Send Registration OTP email
                                const sendResult = await sendRegistrationOtpEmail(
                                    normalizedEmail,
                                    otp,
                                    fullName || "User"
                                );

                                return res.status(200).json({
                                    success: true,
                                    message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
                                    email: normalizedEmail
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Send Register OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


/* =========================================================
   REGISTRATION: VERIFY EMAIL OTP
========================================================= */

export const verifyRegisterOtp = (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();

        db.query(
            "SELECT * FROM email_verifications WHERE LOWER(email) = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [normalizedEmail, cleanOtp],
            (err, results) => {
                if (err) {
                    console.error("Verify Register OTP error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Database error while verifying code."
                    });
                }

                if (!results || results.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid or expired verification code. Please request a new code."
                    });
                }

                // Mark verified
                db.query(
                    "UPDATE email_verifications SET is_verified = TRUE WHERE id = ?",
                    [results[0].id],
                    () => {
                        return res.status(200).json({
                            success: true,
                            message: "Email verified successfully!"
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Verify Register OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};