import db from "../config/db.js";

// ==========================================
// Get All Recruiter Companies
// ==========================================

export const getCompanies = (req, res) => {

    console.log("🔥 ADMIN: GET COMPANIES");
    console.log("👤 USER:", req.user);

    const sql = `
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
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(
                "❌ GET COMPANIES DATABASE ERROR:",
                err
            );

            return res.status(500).json({

                success: false,
                message: "Database Error"

            });

        }

        const parsedResult = (result || []).map((company) => {
            let parsedAnalysis = null;
            if (company.website_analysis) {
                if (typeof company.website_analysis === "string") {
                    try {
                        parsedAnalysis = JSON.parse(company.website_analysis);
                    } catch (e) {
                        parsedAnalysis = null;
                    }
                } else if (typeof company.website_analysis === "object") {
                    parsedAnalysis = company.website_analysis;
                }
            }
            return {
                ...company,
                website_analysis: parsedAnalysis
            };
        });

        console.log(
            "✅ COMPANIES FOUND:",
            parsedResult.length
        );

        return res.status(200).json({

            success: true,
            companies: parsedResult

        });

    });

};


// ==========================================
// Verify Company
// ==========================================

export const verifyCompany = (req, res) => {

    console.log("🔥 ADMIN: VERIFY COMPANY");

    console.log(
        "👤 USER:",
        req.user
    );

    console.log(
        "🏢 COMPANY ID:",
        req.params.id
    );

    const { id } = req.params;

    const sql = `
        UPDATE recruiters
        SET
            verification_status = 'VERIFIED',
            verification_reason = NULL
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(
                    "❌ VERIFY DATABASE ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,
                    message: "Database Error"

                });

            }

            console.log(
                "📊 AFFECTED ROWS:",
                result.affectedRows
            );

            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Company Not Found"

                });

            }

            console.log(
                "✅ COMPANY VERIFIED:",
                id
            );

            return res.status(200).json({

                success: true,
                message: "Company Verified Successfully"

            });

        }
    );

};


// ==========================================
// Reject Company
// ==========================================

export const rejectCompany = (req, res) => {

    console.log("🔥 ADMIN: REJECT COMPANY");

    console.log(
        "👤 USER:",
        req.user
    );

    console.log(
        "🏢 COMPANY ID:",
        req.params.id
    );

    const { id } = req.params;

    const { reason } = req.body;

    // ==========================================
    // Validate Reason
    // ==========================================

    if (
        !reason ||
        reason.trim() === ""
    ) {

        return res.status(400).json({

            success: false,
            message: "Rejection Reason is Required"

        });

    }

    const sql = `
        UPDATE recruiters
        SET
            verification_status = 'REJECTED',
            verification_reason = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            reason.trim(),
            id
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "❌ REJECT DATABASE ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,
                    message: "Database Error"

                });

            }

            console.log(
                "📊 AFFECTED ROWS:",
                result.affectedRows
            );

            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Company Not Found"

                });

            }

            console.log(
                "❌ COMPANY REJECTED:",
                id
            );

            return res.status(200).json({

                success: true,
                message: "Company Rejected Successfully"

            });

        }
    );

};