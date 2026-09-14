import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter if SMTP credentials are provided
const createTransporter = () => {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

    if (user && rawPass) {
        const pass = rawPass.replace(/\s+/g, "").trim();

        if (user.includes("@gmail.com")) {
            return nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: user.trim(),
                    pass: pass
                }
            });
        }

        const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
        const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587");

        return nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465,
            auth: {
                user: user.trim(),
                pass: pass
            }
        });
    }

    return null;
};

/**
 * Send 6-digit OTP email for password reset
 */
export const sendOtpEmail = async (toEmail, otp, recipientName = "User") => {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 560px;
                margin: 30px auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .header span {
                color: #93c5fd;
            }
            .content {
                padding: 35px 30px;
                color: #334155;
            }
            .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #1e293b;
            }
            .message {
                font-size: 15px;
                line-height: 1.6;
                color: #64748b;
                margin-bottom: 25px;
            }
            .otp-box {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 2px dashed #0284c7;
                border-radius: 14px;
                padding: 22px;
                text-align: center;
                margin: 25px 0;
            }
            .otp-code {
                font-size: 38px;
                font-weight: 800;
                letter-spacing: 10px;
                color: #0369a1;
                font-family: 'Courier New', Courier, monospace;
            }
            .otp-expiry {
                margin-top: 8px;
                font-size: 13px;
                color: #0284c7;
                font-weight: 500;
            }
            .security-notice {
                background: #fffbeb;
                border-left: 4px solid #f59e0b;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 13px;
                color: #b45309;
                margin-top: 25px;
            }
            .footer {
                background: #f8fafc;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Hire<span>AI</span></h1>
                <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Password Reset Verification</p>
            </div>
            <div class="content">
                <div class="greeting">Hello ${recipientName},</div>
                <div class="message">
                    We received a request to reset your password for your <strong>HireAI</strong> account. Please use the verification code below to proceed:
                </div>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-expiry">⏳ Valid for 10 minutes</div>
                </div>
                <div class="security-notice">
                    🔒 If you did not request this password reset, please ignore this email. Your password will remain unchanged.
                </div>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} HireAI Inc. All rights reserved. • AI-Powered Recruitment Platform
            </div>
        </div>
    </body>
    </html>
    `;

    console.log(`\n========================================`);
    console.log(`🔑 PASSWORD RESET OTP for ${toEmail}: [ ${otp} ]`);
    console.log(`========================================\n`);

    if (transporter) {
        try {
            const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
            const sender = process.env.EMAIL_FROM || (smtpUser ? `"HireAI" <${smtpUser}>` : `"HireAI Security" <no-reply@hireai.com>`);
            const info = await transporter.sendMail({
                from: sender,
                to: toEmail,
                subject: `HireAI Password Reset Code: ${otp}`,
                html: htmlContent
            });
            console.log("✅ Email sent successfully via SMTP to:", toEmail, "| Message ID:", info.messageId);
            return { sent: true, mode: "smtp", messageId: info.messageId };
        } catch (err) {
            console.error("⚠️ SMTP send failed to", toEmail, ":", err.message);
            return { sent: true, mode: "fallback", error: err.message };
        }
    } else {
        console.log("ℹ️ No SMTP configured in .env; OTP logged to server console.");
        return { sent: true, mode: "dev_log" };
    }
};

/**
 * Send 6-digit OTP email for account registration verification
 */
export const sendRegistrationOtpEmail = async (toEmail, otp, recipientName = "User") => {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 560px;
                margin: 30px auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .header span {
                color: #93c5fd;
            }
            .content {
                padding: 35px 30px;
                color: #334155;
            }
            .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #1e293b;
            }
            .message {
                font-size: 15px;
                line-height: 1.6;
                color: #64748b;
                margin-bottom: 25px;
            }
            .otp-box {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px dashed #16a34a;
                border-radius: 14px;
                padding: 22px;
                text-align: center;
                margin: 25px 0;
            }
            .otp-code {
                font-size: 38px;
                font-weight: 800;
                letter-spacing: 10px;
                color: #15803d;
                font-family: 'Courier New', Courier, monospace;
            }
            .otp-expiry {
                margin-top: 8px;
                font-size: 13px;
                color: #16a34a;
                font-weight: 500;
            }
            .security-notice {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 13px;
                color: #1e40af;
                margin-top: 25px;
            }
            .footer {
                background: #f8fafc;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Hire<span>AI</span></h1>
                <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Email Verification Code</p>
            </div>
            <div class="content">
                <div class="greeting">Welcome ${recipientName}!</div>
                <div class="message">
                    Thank you for signing up with <strong>HireAI</strong>. To complete your account registration, please enter this 6-digit verification code:
                </div>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-expiry">⏳ Valid for 10 minutes</div>
                </div>
                <div class="security-notice">
                    🔒 This verification code confirms your ownership of this email address. If you did not create a HireAI account, you can safely ignore this email.
                </div>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} HireAI Inc. All rights reserved. • AI-Powered Recruitment Platform
            </div>
        </div>
    </body>
    </html>
    `;

    console.log(`\n========================================`);
    console.log(`🚀 REGISTRATION VERIFICATION OTP for ${toEmail}: [ ${otp} ]`);
    console.log(`========================================\n`);

    if (transporter) {
        try {
            const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
            const sender = process.env.EMAIL_FROM || (smtpUser ? `"HireAI" <${smtpUser}>` : `"HireAI Security" <no-reply@hireai.com>`);
            const info = await transporter.sendMail({
                from: sender,
                to: toEmail,
                subject: `HireAI Email Verification Code: ${otp}`,
                html: htmlContent
            });
            console.log("✅ Registration OTP sent successfully via SMTP to:", toEmail, "| Message ID:", info.messageId);
            return { sent: true, mode: "smtp", messageId: info.messageId };
        } catch (err) {
            console.error("⚠️ SMTP registration OTP send failed to", toEmail, ":", err.message);
            return { sent: true, mode: "fallback", error: err.message };
        }
    } else {
        console.log("ℹ️ No SMTP configured in .env; OTP logged to server console.");
        return { sent: true, mode: "dev_log" };
    }
};

/**
 * Send 60%+ Job Match Alert Email to Candidate
 */
export const sendJobMatchAlertEmail = async ({
    toEmail,
    candidateName = "Candidate",
    job = {},
    matchScore = 60,
    matchedSkills = [],
    requiredSkills = []
}) => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const jobUrl = `${clientUrl}/jobs`;

    const matchedChips = matchedSkills.length > 0
        ? matchedSkills.map(s => `<span style="display:inline-block;background:#dcfce7;color:#15803d;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;margin:3px 4px 3px 0;">✓ ${s}</span>`).join("")
        : `<span style="color:#64748b;font-size:13px;">None</span>`;

    const allSkillsChips = Array.isArray(requiredSkills) && requiredSkills.length > 0
        ? requiredSkills.map(s => `<span style="display:inline-block;background:#f1f5f9;color:#334155;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500;margin:3px 4px 3px 0;">${s}</span>`).join("")
        : `<span style="color:#64748b;font-size:13px;">Not specified</span>`;

    // Format deadline if present
    let deadlineStr = "Open until filled";
    if (job.deadline) {
        try {
            deadlineStr = new Date(job.deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch (e) {
            deadlineStr = String(job.deadline);
        }
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 25px auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                padding: 28px 30px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .header span {
                color: #93c5fd;
            }
            .content {
                padding: 30px;
                color: #334155;
            }
            .match-badge {
                display: inline-block;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: #ffffff;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 15px;
                box-shadow: 0 2px 8px rgba(34,197,94,0.3);
            }
            .job-title {
                font-size: 22px;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 6px;
            }
            .company-name {
                font-size: 16px;
                font-weight: 600;
                color: #2563eb;
                margin-bottom: 18px;
            }
            .details-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px 20px;
                margin: 18px 0;
            }
            .details-row {
                display: flex;
                margin: 8px 0;
                font-size: 14px;
            }
            .details-label {
                color: #64748b;
                width: 120px;
                font-weight: 600;
            }
            .details-value {
                color: #1e293b;
                font-weight: 500;
            }
            .skills-section {
                margin: 18px 0;
                padding: 16px;
                background: #f0fdf4;
                border-left: 4px solid #16a34a;
                border-radius: 8px;
            }
            .description-box {
                margin: 18px 0;
                padding: 14px;
                background: #fdfdfd;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
                color: #475569;
                max-height: 180px;
                overflow: hidden;
            }
            .btn-cta {
                display: block;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: #ffffff !important;
                text-align: center;
                padding: 14px 24px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 700;
                font-size: 15px;
                margin: 25px 0 10px;
                box-shadow: 0 4px 14px rgba(37,99,235,0.35);
            }
            .footer {
                background: #f8fafc;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Hire<span>AI</span> Job Match</h1>
                <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">New Job Matches Your Profile</p>
            </div>
            <div class="content">
                <div class="match-badge">🎯 ${matchScore}% Skill Match with your Resume</div>
                <div class="job-title">${job.title || "Job Opportunity"}</div>
                <div class="company-name">🏢 ${job.company || "Hiring Company"}</div>

                <p style="font-size: 14px; line-height: 1.5; color: #475569; margin-bottom: 16px;">
                    Hi <strong>${candidateName}</strong>, our AI match engine identified a new job opening that strongly aligns with your skills and qualifications!
                </p>

                <div class="skills-section">
                    <div style="font-size: 13px; font-weight: 700; color: #15803d; margin-bottom: 8px;">
                        🎯 Your Matching Skills:
                    </div>
                    <div>${matchedChips}</div>
                </div>

                <div class="details-card">
                    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 40%;">📍 Location:</td>
                            <td style="padding: 6px 0; color: #1e293b; font-weight: 500;">${job.location || "Remote / Not specified"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">💰 Salary / CTC:</td>
                            <td style="padding: 6px 0; color: #1e293b; font-weight: 500;">${job.salary || "Competitive"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">⏳ Experience:</td>
                            <td style="padding: 6px 0; color: #1e293b; font-weight: 500;">${job.experience || "Not specified"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">💼 Employment Type:</td>
                            <td style="padding: 6px 0; color: #1e293b; font-weight: 500;">${job.employment_type || job.employmentType || "Full Time"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">📅 Deadline:</td>
                            <td style="padding: 6px 0; color: #e11d48; font-weight: 600;">${deadlineStr}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 14px;">
                    <div style="font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">All Required Skills:</div>
                    <div>${allSkillsChips}</div>
                </div>

                ${job.description ? `
                <div style="margin-top: 16px;">
                    <div style="font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Job Description:</div>
                    <div class="description-box">
                        ${job.description.length > 280 ? job.description.substring(0, 280) + "..." : job.description}
                    </div>
                </div>` : ""}

                <a href="${jobUrl}" class="btn-cta">🚀 View Job & Apply on HireAI</a>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} HireAI Inc. • AI Matching Alert<br>
                You received this email because your resume skills matched this job opening.
            </div>
        </div>
    </body>
    </html>
    `;

    console.log(`\n========================================`);
    console.log(`🎯 60%+ JOB MATCH ALERT EMAIL FOR: ${toEmail}`);
    console.log(`Candidate: ${candidateName}`);
    console.log(`Job: ${job.title} at ${job.company} (${matchScore}% match)`);
    console.log(`Matched Skills: [ ${matchedSkills.join(", ")} ]`);
    console.log(`========================================\n`);

    if (transporter) {
        try {
            const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
            const sender = process.env.EMAIL_FROM || (smtpUser ? `"HireAI Job Alerts" <${smtpUser}>` : `"HireAI Job Alerts" <no-reply@hireai.com>`);
            const info = await transporter.sendMail({
                from: sender,
                to: toEmail,
                subject: `🔥 New Job Match (${matchScore}% Match): ${job.title} at ${job.company}`,
                html: htmlContent
            });
            console.log("✅ Job match alert email sent via SMTP to:", toEmail, "| Message ID:", info.messageId);
            return { sent: true, mode: "smtp", messageId: info.messageId };
        } catch (err) {
            console.error("⚠️ SMTP job match alert email failed to", toEmail, ":", err.message);
            return { sent: true, mode: "fallback", error: err.message };
        }
    } else {
        console.log("ℹ️ No SMTP configured in .env; Job match alert email logged to server console.");
        return { sent: true, mode: "dev_log" };
    }
};

/**
 * Send Candidate AI Interview Scorecard & Application Email to Recruiter
 */
export const sendRecruiterInterviewAlertEmail = async ({
    toEmail,
    hrName = "Recruiter",
    candidateName = "Candidate",
    candidateEmail = "",
    candidatePhone = "",
    atsScore = null,
    jobTitle = "Job Opening",
    companyName = "Company",
    interview = {},
    applicationId = null
}) => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const dashboardUrl = `${clientUrl}/recruiter/applicants`;

    const overallScore = Number(interview.overall_score ?? interview.overallScore ?? 0);
    const techScore = Number(interview.technical_score ?? interview.technicalScore ?? 0);
    const commScore = Number(interview.communication_score ?? interview.communicationScore ?? 0);
    const confScore = Number(interview.confidence_score ?? interview.confidenceScore ?? 0);
    const recommendation = interview.recommendation || "Consider";
    const aiFeedback = interview.ai_feedback || interview.aiFeedback || "Candidate demonstrated relevant domain knowledge and successfully completed all interview stages.";

    // Format recommendation badge color
    let badgeBg = "#22c55e";
    let badgeText = "#ffffff";
    const recUpper = recommendation.toUpperCase();
    if (recUpper.includes("STRONGLY HIRE") || recUpper.includes("HIRE")) {
        badgeBg = "#16a34a";
    } else if (recUpper.includes("CONSIDER")) {
        badgeBg = "#f59e0b";
    } else if (recUpper.includes("REJECT")) {
        badgeBg = "#ef4444";
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 25px auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                padding: 28px 30px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .header span {
                color: #38bdf8;
            }
            .content {
                padding: 30px;
                color: #334155;
            }
            .status-banner {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 12px;
                padding: 14px 18px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
            }
            .rec-badge {
                display: inline-block;
                background: ${badgeBg};
                color: ${badgeText};
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 700;
                margin-top: 4px;
            }
            .card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 18px 20px;
                margin: 16px 0;
            }
            .score-grid {
                display: table;
                width: 100%;
                margin: 15px 0 5px;
            }
            .score-col {
                display: table-cell;
                width: 25%;
                text-align: center;
                padding: 10px 4px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
            }
            .score-value {
                font-size: 20px;
                font-weight: 800;
                color: #0f172a;
            }
            .score-label {
                font-size: 11px;
                color: #64748b;
                font-weight: 600;
                margin-top: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .feedback-box {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 14px 18px;
                border-radius: 8px;
                font-size: 13px;
                line-height: 1.6;
                color: #1e3a8a;
                margin: 16px 0;
            }
            .btn-cta {
                display: block;
                background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                color: #ffffff !important;
                text-align: center;
                padding: 14px 24px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 700;
                font-size: 15px;
                margin: 25px 0 10px;
                box-shadow: 0 4px 14px rgba(2,132,199,0.35);
            }
            .footer {
                background: #f8fafc;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Hire<span>AI</span> Recruiter Alert</h1>
                <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">New Applicant & AI Interview Result</p>
            </div>
            <div class="content">
                <p style="font-size: 15px; color: #1e293b; margin-top: 0;">
                    Hello <strong>${hrName}</strong>,
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                    A candidate has completed their AI Technical & Behavioral Interview and submitted an application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
                </p>

                <!-- CANDIDATE PROFILE -->
                <div class="card">
                    <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">
                        👤 Candidate Information
                    </div>
                    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 5px 0; color: #64748b; font-weight: 600; width: 35%;">Name:</td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 700;">${candidateName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Email:</td>
                            <td style="padding: 5px 0; color: #2563eb; font-weight: 500;">${candidateEmail || "Not provided"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Phone:</td>
                            <td style="padding: 5px 0; color: #1e293b; font-weight: 500;">${candidatePhone || "Not provided"}</td>
                        </tr>
                        ${atsScore !== null && atsScore !== undefined ? `
                        <tr>
                            <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Resume ATS Score:</td>
                            <td style="padding: 5px 0; color: #16a34a; font-weight: 700;">${atsScore}%</td>
                        </tr>` : ""}
                    </table>
                </div>

                <!-- INTERVIEW SCORECARD -->
                <div class="card" style="background: #ffffff; border: 2px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
                            🤖 AI Interview Scorecard
                        </span>
                        <span class="rec-badge">${recommendation}</span>
                    </div>

                    <table style="width: 100%; border-spacing: 8px 0; border-collapse: separate; margin: 10px 0;">
                        <tr>
                            <td style="text-align: center; padding: 12px 6px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; width: 25%;">
                                <div style="font-size: 22px; font-weight: 800; color: #16a34a;">${overallScore}</div>
                                <div style="font-size: 10px; font-weight: 700; color: #15803d; text-transform: uppercase; margin-top: 3px;">Overall</div>
                            </td>
                            <td style="text-align: center; padding: 12px 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; width: 25%;">
                                <div style="font-size: 22px; font-weight: 800; color: #0284c7;">${techScore}%</div>
                                <div style="font-size: 10px; font-weight: 700; color: #0369a1; text-transform: uppercase; margin-top: 3px;">Technical</div>
                            </td>
                            <td style="text-align: center; padding: 12px 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; width: 25%;">
                                <div style="font-size: 22px; font-weight: 800; color: #8b5cf6;">${commScore}%</div>
                                <div style="font-size: 10px; font-weight: 700; color: #6d28d9; text-transform: uppercase; margin-top: 3px;">Communication</div>
                            </td>
                            <td style="text-align: center; padding: 12px 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; width: 25%;">
                                <div style="font-size: 22px; font-weight: 800; color: #f59e0b;">${confScore}%</div>
                                <div style="font-size: 10px; font-weight: 700; color: #b45309; text-transform: uppercase; margin-top: 3px;">Confidence</div>
                            </td>
                        </tr>
                    </table>

                    <div style="margin-top: 14px;">
                        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                            💡 AI Performance Feedback:
                        </div>
                        <div class="feedback-box">
                            ${aiFeedback}
                        </div>
                    </div>
                </div>

                <a href="${dashboardUrl}" class="btn-cta">📊 Open Candidate in Recruiter Dashboard</a>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} HireAI Inc. • AI-Powered Recruitment Management<br>
                Automated applicant notification for ${companyName}.
            </div>
        </div>
    </body>
    </html>
    `;

    console.log(`\n========================================`);
    console.log(`⚡ RECRUITER APPLICANT & INTERVIEW ALERT EMAIL FOR: ${toEmail}`);
    console.log(`HR/Recruiter: ${hrName}`);
    console.log(`Candidate: ${candidateName} (${candidateEmail})`);
    console.log(`Job: ${jobTitle} | Overall: ${overallScore}/100 | Recommendation: ${recommendation}`);
    console.log(`========================================\n`);

    if (transporter) {
        try {
            const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
            const sender = process.env.EMAIL_FROM || (smtpUser ? `"HireAI Recruiter Alert" <${smtpUser}>` : `"HireAI Recruiter Alert" <no-reply@hireai.com>`);
            const info = await transporter.sendMail({
                from: sender,
                to: toEmail,
                subject: `⚡ New Applicant & AI Interview Result: ${candidateName} for ${jobTitle}`,
                html: htmlContent
            });
            console.log("✅ Recruiter applicant interview email sent via SMTP to:", toEmail, "| Message ID:", info.messageId);
            return { sent: true, mode: "smtp", messageId: info.messageId };
        } catch (err) {
            console.error("⚠️ SMTP recruiter applicant email failed to", toEmail, ":", err.message);
            return { sent: true, mode: "fallback", error: err.message };
        }
    } else {
        console.log("ℹ️ No SMTP configured in .env; Recruiter interview email logged to server console.");
        return { sent: true, mode: "dev_log" };
    }
};

/**
 * Send Shortlisted Notification Email to Jobseeker Candidate
 */
export const sendCandidateShortlistedEmail = async ({
    toEmail,
    candidateName = "Candidate",
    jobTitle = "Job Opening",
    companyName = "Hiring Company",
    hrName = "Hiring Manager",
    companyEmail = "",
    companyPhone = "",
    atsScore = null,
    interviewScore = null
}) => {
    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const statusUrl = `${clientUrl}/applied`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 25px auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                padding: 32px 30px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .header span {
                color: #bbf7d0;
            }
            .content {
                padding: 32px 30px;
                color: #334155;
            }
            .celebrate-banner {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px solid #86efac;
                border-radius: 14px;
                padding: 18px 20px;
                margin-bottom: 24px;
                text-align: center;
            }
            .celebrate-title {
                font-size: 20px;
                font-weight: 800;
                color: #15803d;
                margin-bottom: 4px;
            }
            .celebrate-subtitle {
                font-size: 14px;
                color: #166534;
                font-weight: 600;
            }
            .card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }
            .job-highlight {
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 6px;
            }
            .company-highlight {
                font-size: 15px;
                font-weight: 600;
                color: #2563eb;
                margin-bottom: 14px;
            }
            .next-steps-box {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 16px 18px;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
                color: #1e3a8a;
                margin: 22px 0;
            }
            .btn-cta {
                display: block;
                background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                color: #ffffff !important;
                text-align: center;
                padding: 14px 26px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 700;
                font-size: 15px;
                margin: 25px 0 10px;
                box-shadow: 0 4px 14px rgba(22,163,74,0.35);
            }
            .footer {
                background: #f8fafc;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Hire<span>AI</span> Notification</h1>
                <p style="margin: 6px 0 0; opacity: 0.95; font-size: 14px; letter-spacing: 0.3px;">Candidate Status Update</p>
            </div>
            <div class="content">
                <div class="celebrate-banner">
                    <div class="celebrate-title">🎉 You Have Been Shortlisted!</div>
                    <div class="celebrate-subtitle">Congratulations on reaching the next stage</div>
                </div>

                <p style="font-size: 15px; color: #1e293b; margin-top: 0;">
                    Hello <strong>${candidateName}</strong>,
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                    We are pleased to inform you that your application for the following position has been reviewed by the hiring team and you have been officially <strong>Shortlisted</strong>!
                </p>

                <!-- JOB & APPLICATION DETAILS -->
                <div class="card">
                    <div class="job-highlight">💼 ${jobTitle}</div>
                    <div class="company-highlight">🏢 ${companyName}</div>

                    <table style="width:100%; border-collapse: collapse; font-size: 14px; margin-top: 12px;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 40%;">Status:</td>
                            <td style="padding: 6px 0; color: #15803d; font-weight: 700;">✅ Shortlisted</td>
                        </tr>
                        ${hrName ? `
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Hiring Manager:</td>
                            <td style="padding: 6px 0; color: #1e293b; font-weight: 500;">${hrName}</td>
                        </tr>` : ""}
                        ${atsScore !== null && atsScore !== undefined ? `
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Resume ATS Match:</td>
                            <td style="padding: 6px 0; color: #2563eb; font-weight: 700;">${atsScore}%</td>
                        </tr>` : ""}
                        ${interviewScore !== null && interviewScore !== undefined ? `
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">AI Interview Score:</td>
                            <td style="padding: 6px 0; color: #059669; font-weight: 700;">${interviewScore}%</td>
                        </tr>` : ""}
                    </table>
                </div>

                <!-- NEXT STEPS -->
                <div class="next-steps-box">
                    <strong>📌 What Happens Next:</strong><br>
                    The recruitment team at <strong>${companyName}</strong> will reach out to you via your registered email or phone for further interview rounds or next steps. Keep an eye on your inbox!
                </div>

                <a href="${statusUrl}" class="btn-cta">🚀 View Your Application on HireAI</a>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} HireAI Inc. • AI-Powered Recruitment Platform<br>
                You received this notification because your job application status was updated.
            </div>
        </div>
    </body>
    </html>
    `;

    console.log(`\n========================================`);
    console.log(`🎉 CANDIDATE SHORTLISTED EMAIL NOTIFICATION FOR: ${toEmail}`);
    console.log(`Candidate: ${candidateName}`);
    console.log(`Job: ${jobTitle} at ${companyName}`);
    console.log(`========================================\n`);

    if (transporter) {
        try {
            const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
            const sender = process.env.EMAIL_FROM || (smtpUser ? `"HireAI" <${smtpUser}>` : `"HireAI Hiring" <no-reply@hireai.com>`);
            const info = await transporter.sendMail({
                from: sender,
                to: toEmail,
                subject: `🎉 Congratulations! You have been shortlisted for ${jobTitle} at ${companyName}`,
                html: htmlContent
            });
            console.log("✅ Candidate shortlisted email sent successfully via SMTP to:", toEmail, "| Message ID:", info.messageId);
            return { sent: true, mode: "smtp", messageId: info.messageId };
        } catch (err) {
            console.error("⚠️ SMTP candidate shortlisted email failed to", toEmail, ":", err.message);
            return { sent: true, mode: "fallback", error: err.message };
        }
    } else {
        console.log("ℹ️ No SMTP configured in .env; Candidate shortlisted email logged to server console.");
        return { sent: true, mode: "dev_log" };
    }
};



