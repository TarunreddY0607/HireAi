import db from "../config/db.js";
import bcrypt from "bcrypt";
import { analyzeCompanyWebsite } from "../services/aiService.js";

// ==========================================
// Domain Normalization & Duplicate Checker
// ==========================================

export const extractNormalizedDomain = (url) => {
    if (!url || typeof url !== "string" || !url.trim()) return "";
    let formatted = url.trim().toLowerCase();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
        formatted = `https://${formatted}`;
    }
    try {
        const parsed = new URL(formatted);
        return parsed.hostname.replace(/^www\./, "").trim();
    } catch {
        return formatted.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].split("?")[0].trim();
    }
};

export const checkDuplicateWebsite = (websiteUrl, excludeUserId = null) => {
    return new Promise((resolve, reject) => {
        const targetDomain = extractNormalizedDomain(websiteUrl);
        if (!targetDomain) return resolve(null);

        db.query(
            "SELECT id, user_id, company_name, website FROM recruiters WHERE website IS NOT NULL AND website != ''",
            (err, results) => {
                if (err) return reject(err);
                for (const row of results) {
                    if (excludeUserId && String(row.user_id) === String(excludeUserId)) continue;
                    const existingDomain = extractNormalizedDomain(row.website);
                    if (existingDomain && existingDomain === targetDomain) {
                        return resolve(row);
                    }
                }
                return resolve(null);
            }
        );
    });
};

// ==========================================
// Recruiter Registration
// ==========================================

export const registerRecruiter = async (req, res) => {

    try {

        const {
            companyName,
            hrName,
            officialEmail,
            phone,
            website,
            industry,
            companySize,
            password,
            otp
        } = req.body;

        if (!companyName || !hrName || !officialEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Company name, HR name, official email, and password are required."
            });
        }

        const normalizedEmail = officialEmail.trim().toLowerCase();
        const cleanOtp = otp ? otp.toString().trim() : "";

        // ==========================================
        // Verify Email OTP
        // ==========================================
        const verifySql = `
            SELECT id FROM email_verifications 
            WHERE LOWER(email) = ? 
              AND ( (otp = ? AND expires_at > NOW()) OR (is_verified = TRUE AND expires_at > NOW()) )
            ORDER BY created_at DESC LIMIT 1
        `;

        db.query(verifySql, [normalizedEmail, cleanOtp], async (vErr, vResults) => {
            if (vErr) {
                console.error("Email verification check error:", vErr);
                return res.status(500).json({
                    success: false,
                    message: "Database error verifying company email."
                });
            }

            if (!vResults || vResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter the valid 6-digit verification code sent to your company email."
                });
            }

            // Check duplicate website
            if (website && website.trim()) {
                const duplicate = await checkDuplicateWebsite(website);
                if (duplicate) {
                    return res.status(400).json({
                        success: false,
                        message: `This company website domain is already registered by "${duplicate.company_name}". Each company must have a unique website.`
                    });
                }
            }

            // ==========================================
            // Check Existing Email
            // ==========================================

            db.query(
                "SELECT * FROM users WHERE LOWER(email) = ?",
                [normalizedEmail],
                async (err, userResult) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            success: false,
                            message: "Database Error"
                        });

                    }

                    if (userResult.length > 0) {

                        return res.status(400).json({
                            success: false,
                            message: "Email already registered"
                        });

                    }

                // ==========================================
                // Encrypt Password
                // ==========================================

                const hashedPassword = await bcrypt.hash(
                    password,
                    10
                );

                // ==========================================
                // Insert User
                // ==========================================

                db.query(
                    `
                    INSERT INTO users(
                        role,
                        email,
                        account_name,
                        password
                    )
                    VALUES(?,?,?,?)
                    `,
                    [
                        "recruiter",
                        officialEmail,
                        hrName || companyName,
                        hashedPassword
                    ],
                    async (err, userInsert) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message: "Registration Failed"
                            });

                        }

                        const userId = userInsert.insertId;

                        // ==========================================
                        // Run AI Website Analysis
                        // ==========================================
                        let websiteStatus = "PENDING";
                        let websiteAnalysis = null;

                        if (website && website.trim()) {
                            try {
                                const analysis = await analyzeCompanyWebsite(website, companyName);
                                websiteStatus = analysis.hasActivePage ? "ACTIVE" : (analysis.status || "INACTIVE");
                                websiteAnalysis = JSON.stringify(analysis);
                            } catch (aiErr) {
                                console.log("AI website analysis failed during registration:", aiErr);
                            }
                        } else {
                            websiteStatus = "NO_URL";
                        }

                        // ==========================================
                        // Insert Recruiter Profile
                        // ==========================================

                        db.query(
                            `
                            INSERT INTO recruiters(
                                user_id,
                                hr_name,
                                official_email,
                                company_name,
                                phone,
                                website,
                                industry,
                                company_size,
                                website_status,
                                website_analysis
                            )
                            VALUES(?,?,?,?,?,?,?,?,?,?)
                            `,
                            [
                                userId,
                                hrName,
                                officialEmail,
                                companyName,
                                phone || null,
                                website || null,
                                industry || null,
                                companySize || null,
                                websiteStatus,
                                websiteAnalysis
                            ],
                            (err) => {

                                if (err) {

                                    console.log(err);

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Recruiter Registration Failed"
                                    });

                                }

                                // Clean up verification records
                                db.query(
                                    "DELETE FROM email_verifications WHERE LOWER(email) = ?",
                                    [normalizedEmail],
                                    () => {}
                                );

                                return res.status(201).json({

                                    success: true,

                                    message:
                                        "Recruiter Registered Successfully",
                                    
                                    website_status: websiteStatus

                                });

                            }
                        );

                    }
                );

            }
        );
        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};

// ==========================================
// Get Recruiter Company Profile
// ==========================================

export const getCompanyProfile = (req, res) => {

    const userId = req.user.userId;

    db.query(
        `
        SELECT

            id,
            user_id,
            hr_name,
            official_email,
            company_name,
            phone,
            website,
            industry,
            company_size,
            company_description,
            logo,
            verification_status,
            verification_reason,
            website_status,
            website_analysis,
            created_at

        FROM recruiters

        WHERE user_id = ?
        `,
        [userId],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,

                    message: "Database Error"

                });

            }

            if (result.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Recruiter Profile Not Found"

                });

            }

            const profile = result[0];
            if (profile.website_analysis && typeof profile.website_analysis === "string") {
                try {
                    profile.website_analysis = JSON.parse(profile.website_analysis);
                } catch (e) {}
            }

            return res.status(200).json({

                success: true,

                profile: profile

            });

        }
    );

};

// ==========================================
// Update Recruiter Company Profile
// ==========================================

export const updateCompanyProfile = async (req, res) => {

    try {

        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID not found in token"
            });
        }

        const {
            hr_name,
            official_email,
            company_name,
            phone,
            website,
            industry,
            company_size,
            company_description
        } = req.body;

        // ==========================================
        // Basic Validation
        // ==========================================

        if (
            !hr_name ||
            !official_email ||
            !company_name
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "HR Name, Official Email and Company Name are required"

            });

        }

        // Check duplicate website domain across recruiter accounts
        if (website && website.trim()) {
            const duplicate = await checkDuplicateWebsite(website, userId);
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: `This company website domain (${duplicate.website}) is already registered by another recruiter account ("${duplicate.company_name}"). Duplicate company websites are not permitted.`
                });
            }
        }

        // Run AI Website Analysis
        let websiteStatus = "NO_URL";
        let websiteAnalysis = null;
        let parsedAnalysis = null;

        if (website && website.trim()) {
            try {
                console.log(`🔍 Auto-analyzing website for ${company_name}:`, website);
                const analysis = await analyzeCompanyWebsite(website, company_name);
                websiteStatus = analysis.hasActivePage ? "ACTIVE" : (analysis.status || "INACTIVE");
                websiteAnalysis = JSON.stringify(analysis);
                parsedAnalysis = analysis;
            } catch (e) {
                console.error("Website analysis error on update:", e);
                websiteStatus = "UNREACHABLE";
                parsedAnalysis = {
                    hasActivePage: false,
                    status: "UNREACHABLE",
                    reason: "Failed to connect to website URL.",
                    companySummary: "Unable to reach website."
                };
                websiteAnalysis = JSON.stringify(parsedAnalysis);
            }
        }

        const updateSql = `
            UPDATE recruiters
            SET
                hr_name = ?,
                official_email = ?,
                company_name = ?,
                phone = ?,
                website = ?,
                industry = ?,
                company_size = ?,
                company_description = ?,
                website_status = ?,
                website_analysis = ?
            WHERE user_id = ?
        `;

        const updateParams = [
            hr_name,
            official_email,
            company_name,
            phone || null,
            website || null,
            industry || null,
            company_size || null,
            company_description || null,
            websiteStatus,
            websiteAnalysis,
            userId
        ];

        db.query(
            updateSql,
            updateParams,
            (err, result) => {

                if (err) {

                    console.error("Database Update Error:", err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed To Update Company Profile in Database",

                        error: err.message

                    });

                }

                if (result.affectedRows === 0) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Recruiter Profile Not Found"

                    });

                }

                // Also update account_name in users table
                db.query(
                    "UPDATE users SET account_name = ? WHERE id = ?",
                    [hr_name || company_name, userId],
                    () => {}
                );

                return res.status(200).json({

                    success: true,

                    message: parsedAnalysis?.hasActivePage
                        ? "Company Profile Updated & Website Verified by AI!"
                        : "Company Profile Updated (Note: Website link has no active page)",

                    website: website || "",

                    website_status: websiteStatus,

                    website_analysis: parsedAnalysis

                });

            }
        );

    } catch (serverErr) {

        console.error("Server Error in updateCompanyProfile:", serverErr);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error while updating company profile",

            error: serverErr.message

        });

    }

};

// ==========================================
// Dedicated Website AI Analysis Endpoint
// ==========================================

export const analyzeWebsiteController = async (req, res) => {

    try {

        const userId = req.user.userId;
        const { website } = req.body;

        db.query(
            "SELECT id, company_name, website FROM recruiters WHERE user_id = ?",
            [userId],
            async (err, results) => {

                if (err) {
                    console.error("Recruiter query error:", err);
                    return res.status(500).json({ success: false, message: "Database Error" });
                }

                if (results.length === 0) {
                    return res.status(404).json({ success: false, message: "Recruiter Profile Not Found" });
                }

                const recruiter = results[0];
                const targetUrl = (website !== undefined && website !== null) ? website : recruiter.website;
                const companyName = recruiter.company_name;

                // Check duplicate website
                if (targetUrl && targetUrl.trim()) {
                    const duplicate = await checkDuplicateWebsite(targetUrl, userId);
                    if (duplicate) {
                        return res.status(400).json({
                            success: false,
                            message: `This company website domain is already registered by another recruiter account ("${duplicate.company_name}"). Duplicate company websites are not permitted.`
                        });
                    }
                }

                console.log(`🔍 Analyzing website for recruiter (${companyName}):`, targetUrl);

                const analysis = await analyzeCompanyWebsite(targetUrl, companyName);
                const websiteStatus = analysis.hasActivePage ? "ACTIVE" : (analysis.status || "INACTIVE");
                const analysisJson = JSON.stringify(analysis);

                db.query(
                    `
                    UPDATE recruiters
                    SET
                        website = ?,
                        website_status = ?,
                        website_analysis = ?
                    WHERE user_id = ?
                    `,
                    [targetUrl || null, websiteStatus, analysisJson, userId],
                    (updateErr) => {

                        if (updateErr) {
                            console.error("Failed to update website analysis in DB:", updateErr);
                        }

                        return res.status(200).json({
                            success: true,
                            message: analysis.hasActivePage
                                ? "Company website verified and analyzed by AI!"
                                : "Website analysis complete: No active web page detected.",
                            website: targetUrl,
                            website_status: websiteStatus,
                            website_analysis: analysis
                        });

                    }
                );

            }
        );

    } catch (err) {
        console.error("Website analysis controller error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to analyze website with AI."
        });
    }

};