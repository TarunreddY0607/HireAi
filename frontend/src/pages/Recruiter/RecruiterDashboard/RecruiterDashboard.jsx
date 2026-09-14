import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaGlobe,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaSyncAlt,
    FaExternalLinkAlt,
    FaRobot,
    FaCode,
    FaLightbulb,
    FaEdit,
    FaBuilding,
    FaShieldAlt,
    FaLayerGroup
} from "react-icons/fa";

import RecruiterSidebar from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";
import RecruiterTopbar from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";

import {
    getRecruiterDashboard,
    analyzeRecruiterWebsite
} from "../../../services/recruiterDashboardService";

import "./RecruiterDashboard.css";

function RecruiterDashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    // AI Website State
    const [analyzingWebsite, setAnalyzingWebsite] = useState(false);
    const [editWebsiteUrl, setEditWebsiteUrl] = useState("");
    const [showEditWebsite, setShowEditWebsite] = useState(false);
    const [websiteFeedback, setWebsiteFeedback] = useState(null);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const data = await getRecruiterDashboard();

            setDashboard(data);
            if (data?.recruiter?.website) {
                setEditWebsiteUrl(data.recruiter.website);
            }

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    const handleRunWebsiteAnalysis = async (customUrl = null) => {
        const urlToTest = customUrl !== null ? customUrl : editWebsiteUrl;

        try {
            setAnalyzingWebsite(true);
            setWebsiteFeedback(null);

            const res = await analyzeRecruiterWebsite(urlToTest);

            if (dashboard) {
                setDashboard({
                    ...dashboard,
                    recruiter: {
                        ...dashboard.recruiter,
                        website: res.website,
                        website_status: res.website_status,
                        website_analysis: res.website_analysis
                    }
                });
            }

            setWebsiteFeedback({
                type: res.website_analysis?.hasActivePage ? "success" : "warning",
                message: res.message || "Website analysis completed."
            });

            setShowEditWebsite(false);
        } catch (err) {
            console.error("Website analysis error:", err);
            setWebsiteFeedback({
                type: "error",
                message: err.response?.data?.message || "Failed to analyze website. Please check the URL and try again."
            });
        } finally {
            setAnalyzingWebsite(false);
        }
    };

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <h2>Loading Dashboard...</h2>

            </div>

        );

    }

    if (!dashboard) {

        return (

            <div className="dashboard-error">

                <h2>Unable to load dashboard</h2>

                <button onClick={loadDashboard}>

                    🔄 Try Again

                </button>

            </div>

        );

    }

    const recruiter = dashboard.recruiter || {};
    const stats = dashboard.stats || {};
    const recentJobs = dashboard.recentJobs || [];
    const recentApplicants = dashboard.recentApplicants || [];

    const websiteAnalysis = recruiter.website_analysis || null;
    const hasActivePage = websiteAnalysis?.hasActivePage === true;
    const isDummyOrUnreachable = recruiter.website && (!websiteAnalysis || websiteAnalysis?.hasActivePage === false);

    return (

        <div className="recruiter-dashboard">

            {/* ================================= */}
            {/* Sidebar */}
            {/* ================================= */}

            <RecruiterSidebar />

            {/* ================================= */}
            {/* Main Content */}
            {/* ================================= */}

            <div className="dashboard-content">

                <RecruiterTopbar />

                <div className="recruiter-dashboard-container">

                    {/* ================================= */}
                    {/* Header */}
                    {/* ================================= */}

                    <div className="dashboard-header">

                        <div>

                            <h1>

                                Welcome {recruiter.company_name || "Recruiter"} 👋

                            </h1>

                            <p>

                                HR : {recruiter.hr_name || "Recruiter"} | Official Email: {recruiter.official_email || "N/A"}

                            </p>

                        </div>

                    </div>

                    {/* ================================= */}
                    {/* Top Status & Verification Row */}
                    {/* ================================= */}

                    <div className="dashboard-status-row">

                        {/* Account Verification Card */}
                        <div className="status-badge-card">

                            <div className="status-badge-header">
                                <span className="status-badge-icon">
                                    <FaShieldAlt />
                                </span>
                                <div>
                                    <h3>Account Status</h3>
                                    <div className="verification-status">
                                        <span
                                            className={
                                                recruiter.verification_status === "VERIFIED"
                                                    ? "status-dot verified"
                                                    : recruiter.verification_status === "REJECTED"
                                                        ? "status-dot rejected"
                                                        : "status-dot pending"
                                            }
                                        ></span>
                                        <strong>
                                            {recruiter.verification_status === "VERIFIED"
                                                ? "VERIFIED"
                                                : recruiter.verification_status === "REJECTED"
                                                    ? "REJECTED"
                                                    : "PENDING"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Website Verification Status Pill Card */}
                        <div className={`status-badge-card ${hasActivePage ? "website-live-card" : isDummyOrUnreachable ? "website-dummy-card" : ""}`}>
                            <div className="status-badge-header">
                                <span className={`status-badge-icon ${hasActivePage ? "live" : isDummyOrUnreachable ? "dummy" : "neutral"}`}>
                                    <FaGlobe />
                                </span>
                                <div>
                                    <h3>Company Website</h3>
                                    <div className="verification-status">
                                        <span
                                            className={`status-dot ${
                                                hasActivePage
                                                    ? "verified"
                                                    : isDummyOrUnreachable
                                                        ? "rejected"
                                                        : "pending"
                                            }`}
                                        ></span>
                                        <strong>
                                            {hasActivePage
                                                ? "LIVE & AI-VERIFIED"
                                                : isDummyOrUnreachable
                                                    ? "DUMMY / NO ACTIVE PAGE"
                                                    : "NOT CONFIGURED"}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ================================= */}
                    {/* AI COMPANY WEBSITE INTELLIGENCE CARD */}
                    {/* ================================= */}

                    <div className={`ai-website-card ${hasActivePage ? "is-live" : isDummyOrUnreachable ? "is-dummy" : "is-empty"}`}>

                        {/* Card Header */}
                        <div className="ai-website-header">

                            <div className="ai-website-title-wrap">
                                <div className={`ai-website-icon-wrap ${hasActivePage ? "live" : isDummyOrUnreachable ? "dummy" : "neutral"}`}>
                                    {hasActivePage ? <FaRobot /> : isDummyOrUnreachable ? <FaExclamationTriangle /> : <FaGlobe />}
                                </div>

                                <div>
                                    <div className="ai-website-title-row">
                                        <h2>AI Company Website Intelligence</h2>
                                        {hasActivePage && (
                                            <span className="ai-verified-pill">
                                                <FaCheckCircle /> Live & AI Verified
                                            </span>
                                        )}
                                        {isDummyOrUnreachable && (
                                            <span className="ai-dummy-pill">
                                                <FaTimesCircle /> No Active Web Page
                                            </span>
                                        )}
                                    </div>

                                    <p className="ai-website-subtitle">
                                        {hasActivePage
                                            ? "Real-time AI analysis extracted from your official company website."
                                            : isDummyOrUnreachable
                                                ? "Our AI verified this link and detected that it does not have an active web page."
                                                : "Add your company website URL to generate automated AI intelligence and verification."}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="ai-website-actions">
                                {recruiter.website && (
                                    <a
                                        href={recruiter.website.startsWith("http") ? recruiter.website : `https://${recruiter.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ai-visit-link-btn"
                                    >
                                        <FaExternalLinkAlt /> Visit Site
                                    </a>
                                )}

                                <button
                                    className="ai-reanalyze-btn"
                                    onClick={() => handleRunWebsiteAnalysis(recruiter.website)}
                                    disabled={analyzingWebsite || !recruiter.website}
                                >
                                    <FaSyncAlt className={analyzingWebsite ? "spinning" : ""} />
                                    {analyzingWebsite ? "Analyzing with AI..." : "Re-Analyze with AI"}
                                </button>

                                <button
                                    className="ai-edit-website-btn"
                                    onClick={() => setShowEditWebsite(!showEditWebsite)}
                                >
                                    <FaEdit /> {showEditWebsite ? "Cancel" : "Change URL"}
                                </button>
                            </div>

                        </div>

                        {/* Inline Feedback Banner */}
                        {websiteFeedback && (
                            <div className={`ai-feedback-banner ${websiteFeedback.type}`}>
                                <span>
                                    {websiteFeedback.type === "success" && <FaCheckCircle />}
                                    {websiteFeedback.type === "warning" && <FaExclamationTriangle />}
                                    {websiteFeedback.type === "error" && <FaTimesCircle />}
                                </span>
                                <p>{websiteFeedback.message}</p>
                            </div>
                        )}

                        {/* Inline Edit URL Form */}
                        {showEditWebsite && (
                            <div className="ai-edit-url-box">
                                <div className="ai-edit-input-wrap">
                                    <FaGlobe className="input-icon" />
                                    <input
                                        type="url"
                                        placeholder="e.g. https://yourcompany.com"
                                        value={editWebsiteUrl}
                                        onChange={(e) => setEditWebsiteUrl(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="ai-save-url-btn"
                                    onClick={() => handleRunWebsiteAnalysis(editWebsiteUrl)}
                                    disabled={analyzingWebsite || !editWebsiteUrl.trim()}
                                >
                                    {analyzingWebsite ? "Verifying..." : "⚡ Verify & Analyze with AI"}
                                </button>
                            </div>
                        )}

                        {/* ================= CONDITION 1: DUMMY / UNREACHABLE LINK ================= */}
                        {isDummyOrUnreachable && (
                            <div className="ai-dummy-alert-body">
                                <div className="dummy-alert-banner">
                                    <div className="dummy-alert-icon">
                                        <FaExclamationTriangle />
                                    </div>
                                    <div className="dummy-alert-content">
                                        <h4>This Link Does Not Have Any Active Web Page</h4>
                                        <p className="dummy-url-display">
                                            Attempted URL: <code>{recruiter.website}</code>
                                        </p>
                                        <p className="dummy-explanation">
                                            {websiteAnalysis?.reason ||
                                                "The server at this address could not be reached, or returned an error status (404 / Connection Timed Out / Inactive Domain)."}
                                        </p>
                                    </div>
                                </div>

                                <div className="dummy-diagnostic-grid">
                                    <div className="diagnostic-item">
                                        <span className="diag-icon red">✕</span>
                                        <div>
                                            <strong>DNS & Server Connection:</strong>
                                            <p>Unable to establish live HTTP connection to host.</p>
                                        </div>
                                    </div>
                                    <div className="diagnostic-item">
                                        <span className="diag-icon red">✕</span>
                                        <div>
                                            <strong>Webpage Content:</strong>
                                            <p>No valid business HTML content or live page detected.</p>
                                        </div>
                                    </div>
                                    <div className="diagnostic-item">
                                        <span className="diag-icon warn">⚠</span>
                                        <div>
                                            <strong>Recommendation:</strong>
                                            <p>Click <strong>"Change URL"</strong> above to enter your active company website (e.g. https://company.com).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= CONDITION 2: LIVE & VALID COMPANY WEBSITE ================= */}
                        {hasActivePage && websiteAnalysis && (
                            <div className="ai-live-analysis-body">

                                {/* Summary & Industry Row */}
                                <div className="analysis-summary-section">
                                    <div className="summary-card-block">
                                        <div className="section-label">
                                            <FaRobot /> AI Company Overview
                                        </div>
                                        <p className="analysis-summary-text">
                                            {websiteAnalysis.companySummary ||
                                                `${recruiter.company_name} is an active enterprise verified on the web.`}
                                        </p>
                                        {websiteAnalysis.pageTitle && (
                                            <div className="page-title-badge">
                                                <span>Page Title:</span> {websiteAnalysis.pageTitle}
                                            </div>
                                        )}
                                    </div>

                                    <div className="meta-card-block">
                                        <div className="meta-item">
                                            <span className="meta-label">Detected Industry</span>
                                            <span className="meta-val industry-badge">
                                                <FaBuilding /> {websiteAnalysis.industry || recruiter.industry || "Software & Technology"}
                                            </span>
                                        </div>

                                        <div className="meta-item">
                                            <span className="meta-label">AI Trust & Credibility</span>
                                            <div className="trust-meter-wrap">
                                                <div className="trust-meter-bar">
                                                    <div
                                                        className="trust-fill"
                                                        style={{ width: `${websiteAnalysis.trustScore || 95}%` }}
                                                    ></div>
                                                </div>
                                                <span className="trust-score-num">
                                                    {websiteAnalysis.trustScore || 95}/100
                                                </span>
                                            </div>
                                        </div>

                                        <div className="meta-item">
                                            <span className="meta-label">Verification Note</span>
                                            <span className="meta-val green-text">
                                                <FaCheckCircle /> {websiteAnalysis.verificationNote || "Live active website verified."}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tech Stack & Highlights Row */}
                                <div className="analysis-details-grid">

                                    {/* Tech Stack */}
                                    {websiteAnalysis.techStack && websiteAnalysis.techStack.length > 0 && (
                                        <div className="analysis-subcard">
                                            <div className="subcard-title">
                                                <FaCode /> Detected Technologies & Tech Stack
                                            </div>
                                            <div className="tech-tags-wrap">
                                                {websiteAnalysis.techStack.map((tech, idx) => (
                                                    <span key={idx} className="tech-tag">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Key Highlights */}
                                    {websiteAnalysis.keyHighlights && websiteAnalysis.keyHighlights.length > 0 && (
                                        <div className="analysis-subcard">
                                            <div className="subcard-title">
                                                <FaLightbulb /> Key Highlights & Offerings
                                            </div>
                                            <ul className="highlights-list">
                                                {websiteAnalysis.keyHighlights.map((highlight, idx) => (
                                                    <li key={idx}>
                                                        <FaCheckCircle className="check-bullet" />
                                                        <span>{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>

                            </div>
                        )}

                        {/* ================= CONDITION 3: NO WEBSITE CONFIGURED ================= */}
                        {!recruiter.website && (
                            <div className="ai-empty-website-body">
                                <div className="empty-website-icon">
                                    <FaGlobe />
                                </div>
                                <h3>No Company Website Connected</h3>
                                <p>
                                    Add your official company website to let HireAI automatically verify your company domain,
                                    detect your tech stack, and boost candidate application trust.
                                </p>
                                <button
                                    className="ai-add-website-btn"
                                    onClick={() => setShowEditWebsite(true)}
                                >
                                    🔗 Connect Company Website
                                </button>
                            </div>
                        )}

                    </div>

                    {/* ================================= */}
                    {/* Statistics */}
                    {/* ================================= */}

                    <div className="stats-grid">

                        <div className="stat-card">

                            <div className="stat-icon">

                                💼

                            </div>

                            <div>

                                <h3>

                                    Total Jobs

                                </h3>

                                <h1>

                                    {stats.totalJobs || 0}

                                </h1>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon">

                                👥

                            </div>

                            <div>

                                <h3>

                                    Applications

                                </h3>

                                <h1>

                                    {stats.applications || 0}

                                </h1>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon">

                                🟢

                            </div>

                            <div>

                                <h3>

                                    Shortlisted

                                </h3>

                                <h1>

                                    {stats.shortlisted || 0}

                                </h1>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon">

                                🔴

                            </div>

                            <div>

                                <h3>

                                    Rejected

                                </h3>

                                <h1>

                                    {stats.rejected || 0}

                                </h1>

                            </div>

                        </div>

                    </div>

                    {/* ================================= */}
                    {/* Quick Actions */}
                    {/* ================================= */}

                    <div className="quick-actions">

                        <button
                            className="quick-btn"
                            onClick={() =>
                                navigate("/recruiter/post-job")
                            }
                        >

                            ➕ Post Job

                        </button>

                        <button
                            className="quick-btn"
                            onClick={() =>
                                navigate("/recruiter/my-jobs")
                            }
                        >

                            📄 My Jobs

                        </button>

                        <button
                            className="quick-btn"
                            onClick={() =>
                                navigate("/recruiter/applicants")
                            }
                        >

                            👥 Applicants

                        </button>

                        <button
                            className="quick-btn"
                            onClick={() =>
                                navigate("/recruiter/analytics")
                            }
                        >

                            📊 Analytics

                        </button>

                    </div>

                    {/* ================================= */}
                    {/* Recent Sections */}
                    {/* ================================= */}

                    <div className="recent-section">

                        {/* Recent Jobs */}

                        <div className="recent-card">

                            <div className="recent-card-header">

                                <h2>

                                    💼 Recent Jobs

                                </h2>

                                <button
                                    onClick={() =>
                                        navigate("/recruiter/my-jobs")
                                    }
                                >

                                    View All →

                                </button>

                            </div>

                            {

                                recentJobs.length === 0

                                    ?

                                    (

                                        <div className="empty-state">

                                            <div className="empty-icon">

                                                📭

                                            </div>

                                            <h3>

                                                No Jobs Posted Yet

                                            </h3>

                                            <p>

                                                Start by creating your first job posting.

                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate("/recruiter/post-job")
                                                }
                                            >

                                                ➕ Post Your First Job

                                            </button>

                                        </div>

                                    )

                                    :

                                    (

                                        <div className="recent-list">

                                            {

                                                recentJobs.map(job => (

                                                    <div
                                                        className="recent-job-item"
                                                        key={job.id}
                                                    >

                                                        <div>

                                                            <h3>

                                                                {job.title}

                                                            </h3>

                                                            <p>

                                                                📍 {job.location}

                                                            </p>

                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/recruiter/view-job/${job.id}`
                                                                )
                                                            }
                                                        >

                                                            View

                                                        </button>

                                                    </div>

                                                ))

                                            }

                                        </div>

                                    )

                            }

                        </div>

                        {/* Recent Applicants */}

                        <div className="recent-card">

                            <div className="recent-card-header">

                                <h2>

                                    👥 Recent Applicants

                                </h2>

                                <button
                                    onClick={() =>
                                        navigate("/recruiter/applicants")
                                    }
                                >

                                    View All →

                                </button>

                            </div>

                            {

                                recentApplicants.length === 0

                                    ?

                                    (

                                        <div className="empty-state">

                                            <div className="empty-icon">

                                                📭

                                            </div>

                                            <h3>

                                                No Applicants Yet

                                            </h3>

                                            <p>

                                                Applicants will appear here after submitting applications.

                                            </p>

                                        </div>

                                    )

                                    :

                                    (

                                        <div className="recent-list">

                                            {

                                                recentApplicants.map(applicant => (

                                                    <div
                                                        className="recent-applicant-item"
                                                        key={applicant.id}
                                                    >

                                                        <div className="applicant-avatar">

                                                            {applicant.profile_pic ? (
                                                                <img src={applicant.profile_pic} alt="Avatar" className="applicant-img" />
                                                            ) : (
                                                                applicant.name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() || "U"
                                                            )}

                                                        </div>

                                                        <div>

                                                            <h3>

                                                                {applicant.name || "Applicant"}

                                                            </h3>

                                                            <p>

                                                                {applicant.email || "Applicant"}

                                                            </p>

                                                        </div>

                                                    </div>

                                                ))

                                            }

                                        </div>

                                    )

                            }

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default RecruiterDashboard;