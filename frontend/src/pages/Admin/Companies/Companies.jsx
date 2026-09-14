import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaExternalLinkAlt,
    FaRobot,
    FaCheckCircle,
    FaShieldAlt,
    FaSignOutAlt,
    FaExclamationTriangle,
    FaTimesCircle
} from "react-icons/fa";

import {
    getCompanies,
    verifyCompany,
    rejectCompany
} from "../../../services/adminService";

import "./Companies.css";

// Exact Instagram / Meta style blue rosette verified badge with crisp white check
const InstaVerifiedBadge = ({ size = 20, className = "" }) => (
    <svg
        className={`insta-verified-svg ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle" }}
    >
        <path
            d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6s-2.95.875-3.6 2.148c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
            fill="#0095F6"
        />
        <path
            d="M10.2 16.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.6-5.6 1.4 1.4-7 7z"
            fill="#FFFFFF"
        />
    </svg>
);


function Companies() {

    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);

    const [loading, setLoading] = useState(true);

    const [processingId, setProcessingId] = useState(null);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out of Admin panel?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            localStorage.removeItem("loginName");
            localStorage.removeItem("loginEmail");
            localStorage.removeItem("loginPhone");
            navigate("/login");
        }
    };


    // ==========================================
    // Load Companies
    // ==========================================

    useEffect(() => {

        loadCompanies();

    }, []);


    const loadCompanies = async () => {

        try {

            const data = await getCompanies();

            setCompanies(
                data.companies || []
            );

        }

        catch (err) {

            console.log(err);

            alert(
                err.response?.data?.message ||
                "Failed to Load Companies"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // Verify Company
    // ==========================================

    const handleVerify = async (id) => {

        const confirmVerify = window.confirm(

            "Are you sure you want to verify this company?"

        );

        if (!confirmVerify) {

            return;

        }

        try {

            setProcessingId(id);

            const data = await verifyCompany(id);

            alert(data.message);

            await loadCompanies();

        }

        catch (err) {

            console.log(err);

            alert(

                err.response?.data?.message ||
                "Failed to Verify Company"

            );

        }

        finally {

            setProcessingId(null);

        }

    };


    // ==========================================
    // Reject Company
    // ==========================================

    const handleReject = async (id) => {

        const reason = window.prompt(

            "Enter the reason for rejecting this company:"

        );

        if (!reason || reason.trim() === "") {

            return;

        }

        try {

            setProcessingId(id);

            const data = await rejectCompany(

                id,

                reason.trim()

            );

            alert(data.message);

            await loadCompanies();

        }

        catch (err) {

            console.log(err);

            alert(

                err.response?.data?.message ||
                "Failed to Reject Company"

            );

        }

        finally {

            setProcessingId(null);

        }

    };


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (

            <div className="admin-page">

                <div className="admin-loading">

                    <h2>

                        Loading Companies...

                    </h2>

                </div>

            </div>

        );

    }


    // ==========================================
    // Page
    // ==========================================

    return (

        <div className="admin-page">

            <div className="admin-header">

                <div>

                    <h1>

                        🏢 Company Verification

                    </h1>

                    <p>

                        Review and verify recruiter companies
                        registered on HireAI.

                    </p>

                </div>

                <div className="admin-header-actions">

                    <div className="company-count">

                        {companies.length}

                        <span>

                            Companies

                        </span>

                    </div>

                    <button
                        className="admin-logout-btn"
                        onClick={handleLogout}
                        title="Log out and return to login"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>

                </div>

            </div>


            {/* ======================================
                No Companies
            ====================================== */}

            {companies.length === 0 ? (

                <div className="empty-company">

                    <div className="empty-icon">

                        🏢

                    </div>

                    <h2>

                        No Companies Found

                    </h2>

                    <p>

                        There are currently no recruiter
                        companies registered.

                    </p>

                </div>

            ) : (


                /* ======================================
                   Companies Grid
                ====================================== */

                <div className="companies-grid">

                    {companies.map((company) => {
                        const hasNoWebsite = !company.website || company.website.trim() === "";
                        const isPlaceholderWebsite =
                            !hasNoWebsite &&
                            (company.website.toLowerCase().includes("yourcompany.com") ||
                            company.website.toLowerCase().includes("example.com") ||
                            company.website.toLowerCase().includes("test.com") ||
                            company.website.toLowerCase().includes("mysite.com") ||
                            company.website.toLowerCase().includes("company.com"));

                        const isAiVerified =
                            !hasNoWebsite &&
                            !isPlaceholderWebsite &&
                            (company.website_status === "ACTIVE" ||
                            company.website_analysis?.hasActivePage === true ||
                            (company.website_analysis?.trustScore && company.website_analysis.trustScore >= 70));

                        const analysis = company.website_analysis;

                        return (
                        <div
                            className={`company-card ${company.verification_status === "VERIFIED" ? "is-verified" : "is-unverified"}`}
                            key={company.id}
                        >

                            {/* ==============================
                                Card Header
                            ============================== */}

                            <div className="company-card-header">

                                <div
                                    className={`company-logo ${
                                        company.verification_status === "VERIFIED"
                                            ? "verified"
                                            : "unverified"
                                    }`}
                                >

                                    {company.company_name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "C"}

                                </div>

                                <div className="company-title">

                                    <div className="company-name-row">
                                        <h2
                                            className={
                                                company.verification_status === "VERIFIED"
                                                    ? "company-name-verified"
                                                    : "company-name-unverified"
                                            }
                                        >
                                            {company.company_name}
                                        </h2>
                                        {isAiVerified && (
                                            <span
                                                className="insta-verified-badge"
                                                title={`AI-Verified Company Website${analysis?.trustScore ? ` (${analysis.trustScore}% Trust Score)` : ""}`}
                                            >
                                                <InstaVerifiedBadge size={22} />
                                            </span>
                                        )}
                                    </div>

                                    <span>

                                        {company.industry ||
                                            "Industry Not Provided"}

                                    </span>

                                </div>

                            </div>


                            {/* ==============================
                                Verification Status
                            ============================== */}

                            <div
                                className={`
                                    verification-badge
                                    ${
                                        company.verification_status ===
                                        "VERIFIED"
                                            ? "verified"
                                            : company.verification_status ===
                                              "REJECTED"
                                                ? "rejected"
                                                : "pending"
                                    }
                                `}
                            >

                                {company.verification_status ===
                                "VERIFIED"

                                    ? "🟢 VERIFIED"

                                    : company.verification_status ===
                                      "REJECTED"

                                        ? "🔴 REJECTED"

                                        : "🟡 PENDING"}

                            </div>


                            {/* ==============================
                                Company Information
                            ============================== */}

                            <div className="company-details">

                                <div className="detail-row">

                                    <span>

                                        👤 HR Name

                                    </span>

                                    <strong>

                                        {company.hr_name ||
                                            "Not Provided"}

                                    </strong>

                                </div>


                                <div className="detail-row">

                                    <span>

                                        📧 Official Email

                                    </span>

                                    <strong>

                                        {company.official_email ||
                                            "Not Provided"}

                                    </strong>

                                </div>


                                <div className="detail-row">

                                    <span>

                                        📱 Phone

                                    </span>

                                    <strong>

                                        {company.phone ||
                                            "Not Provided"}

                                    </strong>

                                </div>


                                <div className="detail-row">

                                    <span>

                                        🌐 Website

                                    </span>

                                    <div className="website-value-wrap">

                                        {hasNoWebsite ? (
                                            <span className="no-website-text-badge">
                                                <FaTimesCircle className="badge-icon-cross" /> Not Provided
                                            </span>
                                        ) : isPlaceholderWebsite ? (
                                            <div className="placeholder-website-wrap">
                                                <a
                                                    href={
                                                        company.website.startsWith("http")
                                                            ? company.website
                                                            : `https://${company.website}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="company-website-link placeholder-link"
                                                >
                                                    {company.website}
                                                    <FaExternalLinkAlt className="ext-icon" />
                                                </a>
                                                <span className="placeholder-pill">
                                                    ⚠️ Placeholder URL
                                                </span>
                                            </div>
                                        ) : (
                                            <a
                                                href={
                                                    company.website.startsWith("http")
                                                        ? company.website
                                                        : `https://${company.website}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="company-website-link"
                                            >
                                                {company.website}
                                                <FaExternalLinkAlt className="ext-icon" />
                                            </a>
                                        )}

                                        {isAiVerified && (
                                            <span
                                                className="ai-verified-pill"
                                                title="AI Crawled & Verified Live Website"
                                            >
                                                <InstaVerifiedBadge size={14} className="pill-check" /> AI Verified
                                                {analysis?.trustScore ? ` • ${analysis.trustScore}% Trust` : ""}
                                            </span>
                                        )}

                                    </div>

                                </div>


                                <div className="detail-row">

                                    <span>

                                        🏭 Industry

                                    </span>

                                    <strong>

                                        {company.industry ||
                                            "Not Provided"}

                                    </strong>

                                </div>


                                <div className="detail-row">

                                    <span>

                                        👥 Company Size

                                    </span>

                                    <strong>

                                        {company.company_size ||
                                            "Not Provided"}

                                    </strong>

                                </div>

                            </div>


                            {/* ==============================
                                AI Website Verification Card (When verified)
                            ============================== */}

                            {isAiVerified && analysis && (
                                <div className="ai-verification-box">
                                    <div className="ai-verification-header">
                                        <div className="ai-badge-left">
                                            <FaRobot className="ai-robot-icon" />
                                            <span>AI Website Verification</span>
                                        </div>
                                        {analysis.trustScore && (
                                            <span className="trust-score-badge">
                                                {analysis.trustScore}% Match
                                            </span>
                                        )}
                                    </div>
                                    <p className="ai-verification-note">
                                        <InstaVerifiedBadge size={15} className="ai-note-tick" />
                                        {analysis.verificationNote || "Live & Verified Company Website detected by AI."}
                                    </p>
                                    {analysis.companySummary && (
                                        <p className="ai-summary-text">
                                            {analysis.companySummary}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ==============================
                                Detailed Admin Warning (When No/Unverified Website)
                            ============================== */}

                            {!isAiVerified && (
                                <div className="admin-website-warning-box">
                                    <div className="warning-box-header">
                                        <div className="warning-badge-left">
                                            <FaExclamationTriangle className="warning-icon" />
                                            <span>Admin Verification Note</span>
                                        </div>
                                        <span className="unverified-tag">
                                            {hasNoWebsite
                                                ? "No Website"
                                                : isPlaceholderWebsite
                                                ? "Placeholder Domain"
                                                : "Unverified Domain"}
                                        </span>
                                    </div>

                                    <div className="warning-box-detail">
                                        {hasNoWebsite ? (
                                            <p>
                                                <strong>No official website provided for this company.</strong> This recruiter registered without linking a live corporate website URL. Before approving, please verify the recruiter manually using their official email or phone number.
                                            </p>
                                        ) : isPlaceholderWebsite ? (
                                            <p>
                                                <strong>Placeholder website detected:</strong> The URL <code>{company.website}</code> is a template placeholder and not a genuine verified website for <strong>{company.company_name}</strong>. The company has no authentic active web presence linked.
                                            </p>
                                        ) : (
                                            <p>
                                                <strong>Website is not verified:</strong> <code>{company.website}</code> could not be verified by AI as an active business website. {analysis?.verificationNote || "Domain authentication did not pass verification."}
                                            </p>
                                        )}
                                    </div>

                                    <div className="admin-verification-tips">
                                        <div className="tip-item">
                                            <span className="tip-dot">⚠️</span>
                                            <span><strong>Website Presence:</strong> {hasNoWebsite ? "None (No URL submitted)" : isPlaceholderWebsite ? "Template placeholder URL" : "Unverified domain"}</span>
                                        </div>
                                        <div className="tip-item">
                                            <span className="tip-dot">📧</span>
                                            <span><strong>Email Domain Check:</strong> {company.official_email || "Not Provided"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* ==============================
                                Description
                            ============================== */}

                            <div className="company-description">

                                <h3>

                                    About Company

                                </h3>

                                <p>

                                    {company.company_description ||
                                        "No company description provided."}

                                </p>

                            </div>


                            {/* ==============================
                                Rejection Reason
                            ============================== */}

                            {company.verification_status ===
                                "REJECTED" &&
                                company.verification_reason && (

                                    <div className="rejection-box">

                                        <strong>

                                            Rejection Reason

                                        </strong>

                                        <p>

                                            {company.verification_reason}

                                        </p>

                                    </div>

                                )}


                            {/* ==============================
                                Actions
                            ============================== */}

                            {company.verification_status !==
                                "VERIFIED" && (

                                <div className="company-actions">

                                    <button
                                        className="verify-btn"
                                        disabled={
                                            processingId ===
                                            company.id
                                        }
                                        onClick={() =>
                                            handleVerify(
                                                company.id
                                            )
                                        }
                                    >

                                        {processingId ===
                                        company.id

                                            ? "Processing..."

                                            : "🟢 Verify Company"}

                                    </button>


                                    {company.verification_status !==
                                        "REJECTED" && (

                                        <button
                                            className="reject-btn"
                                            disabled={
                                                processingId ===
                                                company.id
                                            }
                                            onClick={() =>
                                                handleReject(
                                                    company.id
                                                )
                                            }
                                        >

                                            🔴 Reject Company

                                        </button>

                                    )}

                                </div>

                            )}

                        </div>
                    );
                    })}

                </div>

            )}

        </div>

    );

}

export default Companies;