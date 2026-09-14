import { useEffect, useState, useMemo } from "react";
import {
    FaUsers,
    FaEnvelope,
    FaPhoneAlt,
    FaFileAlt,
    FaRobot,
    FaSearch,
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaLock,
    FaTrashAlt,
    FaBriefcase,
    FaCalendarAlt,
    FaShieldAlt,
    FaGithub,
    FaLinkedin,
    FaExternalLinkAlt,
    FaGraduationCap,
    FaAward,
    FaCode,
    FaTimes,
    FaUserAlt,
    FaChartLine,
    FaCheck
} from "react-icons/fa";

import RecruiterSidebar from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";
import RecruiterTopbar from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";

import {
    getRecruiterApplicants,
    updateApplicationStatus,
    deleteApplication
} from "../../../services/applicationService";

import AIFeedbackCard from "../../../components/AIFeedbackCard/AIFeedbackCard";
import "./Applicants.css";

function Applicants() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, SHORTLISTED, PENDING, REJECTED
    const [jobFilter, setJobFilter] = useState("ALL");

    // Selected Applicant for Side Drawer
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // ==========================================
    // LOAD APPLICANTS
    // ==========================================
    useEffect(() => {
        loadApplicants();
    }, []);

    const loadApplicants = async () => {
        try {
            setLoading(true);
            const data = await getRecruiterApplicants();
            const list = data.applicants || [];
            setApplicants(list);

            // Update selected applicant if drawer is open
            if (selectedApplicant) {
                const refreshed = list.find((a) => a.id === selectedApplicant.id);
                if (refreshed) {
                    setSelectedApplicant(refreshed);
                }
            }
        } catch (err) {
            console.log("Load Applicants Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // OPEN DRAWER FOR APPLICANT
    // ==========================================
    const openApplicantDetails = (applicant) => {
        setSelectedApplicant(applicant);
        setIsDrawerOpen(true);
    };

    const closeApplicantDetails = () => {
        setIsDrawerOpen(false);
    };

    // ==========================================
    // UPDATE APPLICATION STATUS
    // ==========================================
    const handleStatus = async (id, status, openDrawerOnShortlist = false) => {
        try {
            await updateApplicationStatus(id, status);

            // Optimistic update locally
            setApplicants((prev) =>
                prev.map((app) =>
                    app.id === id ? { ...app, status } : app
                )
            );

            // Update selected applicant if currently in drawer or if opened
            const targetApp = applicants.find((a) => a.id === id);
            if (targetApp) {
                const updated = { ...targetApp, status };
                if (openDrawerOnShortlist || (selectedApplicant && selectedApplicant.id === id)) {
                    setSelectedApplicant(updated);
                    setIsDrawerOpen(true);
                }
            }

            alert(
                status === "SHORTLISTED"
                    ? "Candidate Shortlisted Successfully! A notification email has been sent to the candidate."
                    : "Candidate Rejected Successfully"
            );

            await loadApplicants();
        } catch (err) {
            console.log("Status Update Error:", err);
            alert(err.response?.data?.message || "Failed To Update Status");
        }
    };

    // ==========================================
    // DELETE APPLICANT
    // ==========================================
    const handleDelete = async (applicant) => {
        if (applicant.status !== "REJECTED") {
            alert("Only rejected candidates can be deleted.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${
                applicant.full_name || "this candidate"
            } from the applications list?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(applicant.id);
            await deleteApplication(applicant.id);
            alert("Rejected applicant deleted successfully.");

            setApplicants((prev) =>
                prev.filter((item) => item.id !== applicant.id)
            );

            if (selectedApplicant && selectedApplicant.id === applicant.id) {
                closeApplicantDetails();
            }
        } catch (err) {
            console.log("Delete Applicant Error:", err);
            alert(err.response?.data?.message || "Failed to delete applicant");
        } finally {
            setDeletingId(null);
        }
    };

    // ==========================================
    // HELPERS
    // ==========================================
    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        } catch {
            return String(dateString).split("T")[0];
        }
    };

    const getScoreColorClass = (score) => {
        const num = Number(score) || 0;
        if (num >= 75) return "score-high";
        if (num >= 50) return "score-mid";
        return "score-low";
    };

    // Helper to safely format skills array
    const parseSkillsList = (val) => {
        if (!val) return [];
        let list = val;
        if (typeof val === "string") {
            try {
                list = JSON.parse(val);
            } catch {
                return val.split(",").map((s) => s.trim()).filter(Boolean);
            }
        }
        if (Array.isArray(list)) {
            return list.map((item) => {
                if (typeof item === "string") return item;
                if (typeof item === "object" && item !== null) {
                    return item.name || item.skill || item.title || Object.values(item).filter(v => typeof v === 'string').join(" - ");
                }
                return String(item);
            }).filter(Boolean);
        }
        if (typeof list === "object" && list !== null) {
            return Object.values(list).map(String).filter(Boolean);
        }
        return [];
    };

    // Helper to safely parse and normalize Education entries
    const parseEducationList = (val) => {
        if (!val) return [];
        let data = val;
        if (typeof val === "string") {
            try {
                data = JSON.parse(val);
            } catch {
                return [{ text: val }];
            }
        }
        if (!Array.isArray(data)) {
            if (typeof data === "object" && data !== null) {
                data = [data];
            } else if (typeof data === "string") {
                return [{ text: data }];
            } else {
                return [];
            }
        }
        return data.map((item) => {
            if (typeof item === "string") return { text: item };
            if (typeof item === "object" && item !== null) {
                return {
                    degree: item.degree || item.qualification || item.title || item.course || "",
                    college: item.college || item.institute || item.institution || item.school || item.university || "",
                    year: item.year || item.passing_year || item.duration || "",
                    score: item.score || item.cgpa || item.gpa || item.percentage || ""
                };
            }
            return { text: String(item) };
        });
    };

    // Helper to safely parse and normalize Experience entries
    const parseExperienceList = (val) => {
        if (!val) return [];
        let data = val;
        if (typeof val === "string") {
            try {
                data = JSON.parse(val);
            } catch {
                return [{ text: val }];
            }
        }
        if (!Array.isArray(data)) {
            if (typeof data === "object" && data !== null) {
                data = [data];
            } else if (typeof data === "string") {
                return [{ text: data }];
            } else {
                return [];
            }
        }
        return data.map((item) => {
            if (typeof item === "string") return { text: item };
            if (typeof item === "object" && item !== null) {
                return {
                    role: item.role || item.position || item.title || item.jobTitle || "",
                    company: item.company || item.organization || item.employer || "",
                    duration: item.duration || item.years || item.period || "",
                    description: item.description || item.responsibilities || ""
                };
            }
            return { text: String(item) };
        });
    };

    // Helper to safely format summary
    const formatSummaryText = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") {
            if (val.summary) return String(val.summary);
            return Object.values(val).filter(v => typeof v === 'string').join(" ");
        }
        return String(val);
    };


    // ==========================================
    // UNIQUE JOBS LIST FOR FILTER
    // ==========================================
    const uniqueJobTitles = useMemo(() => {
        const jobs = applicants
            .map((a) => a.title)
            .filter(Boolean);
        return Array.from(new Set(jobs));
    }, [applicants]);

    // ==========================================
    // STATS SUMMARY
    // ==========================================
    const stats = useMemo(() => {
        const total = applicants.length;
        const shortlisted = applicants.filter((a) => a.status === "SHORTLISTED").length;
        const rejected = applicants.filter((a) => a.status === "REJECTED").length;
        const pending = total - shortlisted - rejected;
        return { total, shortlisted, pending, rejected };
    }, [applicants]);

    // ==========================================
    // FILTERED APPLICANTS
    // ==========================================
    const filteredApplicants = useMemo(() => {
        return applicants.filter((applicant) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (applicant.full_name && applicant.full_name.toLowerCase().includes(query)) ||
                (applicant.email && applicant.email.toLowerCase().includes(query)) ||
                (applicant.phone && String(applicant.phone).includes(query)) ||
                (applicant.title && applicant.title.toLowerCase().includes(query));

            let matchesStatus = true;
            if (statusFilter === "SHORTLISTED") matchesStatus = applicant.status === "SHORTLISTED";
            if (statusFilter === "REJECTED") matchesStatus = applicant.status === "REJECTED";
            if (statusFilter === "PENDING")
                matchesStatus = applicant.status !== "SHORTLISTED" && applicant.status !== "REJECTED";

            let matchesJob = true;
            if (jobFilter !== "ALL") matchesJob = applicant.title === jobFilter;

            return matchesSearch && matchesStatus && matchesJob;
        });
    }, [applicants, searchQuery, statusFilter, jobFilter]);

    return (
        <div className="recruiter-dashboard">
            <RecruiterSidebar />

            <div className="dashboard-content">
                <RecruiterTopbar />

                <div className="applicants-container">
                    {/* ======================================
                        HEADER
                    ====================================== */}
                    <div className="applicants-header">
                        <div>
                            <div className="applicants-title-row">
                                <h1>Candidate Pipeline</h1>
                                <span className="pipeline-badge">
                                    {applicants.length} {applicants.length === 1 ? "Applicant" : "Applicants"}
                                </span>
                            </div>
                            <p>
                                Review candidate profiles, ATS resume match scores, and AI interview performances. Shortlisting a candidate will open their full details drawer and send an automated email alert.
                            </p>
                        </div>
                    </div>

                    {/* ======================================
                        SUMMARY STATS BAR
                    ====================================== */}
                    {!loading && applicants.length > 0 && (
                        <div className="applicants-stats-grid">
                            <div
                                className={`app-stat-card ${statusFilter === "ALL" ? "active" : ""}`}
                                onClick={() => setStatusFilter("ALL")}
                            >
                                <div className="stat-icon blue">
                                    <FaUsers />
                                </div>
                                <div className="stat-info">
                                    <span>Total Applicants</span>
                                    <strong>{stats.total}</strong>
                                </div>
                            </div>

                            <div
                                className={`app-stat-card ${statusFilter === "SHORTLISTED" ? "active" : ""}`}
                                onClick={() => setStatusFilter("SHORTLISTED")}
                            >
                                <div className="stat-icon green">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-info">
                                    <span>Shortlisted</span>
                                    <strong>{stats.shortlisted}</strong>
                                </div>
                            </div>

                            <div
                                className={`app-stat-card ${statusFilter === "PENDING" ? "active" : ""}`}
                                onClick={() => setStatusFilter("PENDING")}
                            >
                                <div className="stat-icon amber">
                                    <FaHourglassHalf />
                                </div>
                                <div className="stat-info">
                                    <span>Pending Review</span>
                                    <strong>{stats.pending}</strong>
                                </div>
                            </div>

                            <div
                                className={`app-stat-card ${statusFilter === "REJECTED" ? "active" : ""}`}
                                onClick={() => setStatusFilter("REJECTED")}
                            >
                                <div className="stat-icon rose">
                                    <FaTimesCircle />
                                </div>
                                <div className="stat-info">
                                    <span>Rejected</span>
                                    <strong>{stats.rejected}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================
                        SEARCH & FILTERS BAR
                    ====================================== */}
                    {!loading && applicants.length > 0 && (
                        <div className="applicants-filter-bar">
                            <div className="app-search-input">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by candidate name, job title, email, phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {uniqueJobTitles.length > 1 && (
                                <div className="job-select-wrapper">
                                    <FaBriefcase className="select-icon" />
                                    <select
                                        value={jobFilter}
                                        onChange={(e) => setJobFilter(e.target.value)}
                                    >
                                        <option value="ALL">All Jobs ({applicants.length})</option>
                                        {uniqueJobTitles.map((title, idx) => (
                                            <option key={idx} value={title}>
                                                {title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="status-filter-tabs">
                                <button
                                    className={`filter-tab ${statusFilter === "ALL" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("ALL")}
                                >
                                    All ({stats.total})
                                </button>
                                <button
                                    className={`filter-tab ${statusFilter === "SHORTLISTED" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("SHORTLISTED")}
                                >
                                    Shortlisted ({stats.shortlisted})
                                </button>
                                <button
                                    className={`filter-tab ${statusFilter === "PENDING" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("PENDING")}
                                >
                                    Pending ({stats.pending})
                                </button>
                                <button
                                    className={`filter-tab ${statusFilter === "REJECTED" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("REJECTED")}
                                >
                                    Rejected ({stats.rejected})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ======================================
                        LOADING STATE
                    ====================================== */}
                    {loading && (
                        <div className="applicants-status-box">
                            <div className="loading-spinner"></div>
                            <h2>Loading Applicants...</h2>
                            <p>Fetching candidate applications and AI interview scores.</p>
                        </div>
                    )}

                    {/* ======================================
                        EMPTY STATE (NO APPLICANTS)
                    ====================================== */}
                    {!loading && applicants.length === 0 && (
                        <div className="applicants-status-box">
                            <div className="status-emoji-icon">📭</div>
                            <h2>No Applicants Yet</h2>
                            <p>
                                Candidates who apply to your posted jobs will appear here with automated ATS and AI interview analytics.
                            </p>
                        </div>
                    )}

                    {/* ======================================
                        NO FILTER MATCHES
                    ====================================== */}
                    {!loading && applicants.length > 0 && filteredApplicants.length === 0 && (
                        <div className="applicants-status-box">
                            <div className="status-emoji-icon">🔍</div>
                            <h2>No Candidates Found</h2>
                            <p>No applications matched your current search filters.</p>
                            <button
                                className="reset-filter-btn"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("ALL");
                                    setJobFilter("ALL");
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {/* ======================================
                        APPLICANTS GRID
                    ====================================== */}
                    {!loading && filteredApplicants.length > 0 && (
                        <div className="applicants-grid">
                            {filteredApplicants.map((applicant) => {
                                const isRejected = applicant.status === "REJECTED";
                                const isShortlisted = applicant.status === "SHORTLISTED";
                                const isPending = !isRejected && !isShortlisted;
                                const isDeleting = deletingId === applicant.id;
                                const atsScore = applicant.ats_score != null ? Number(applicant.ats_score) : null;

                                return (
                                    <div
                                        className={`applicant-card ${
                                            isShortlisted
                                                ? "is-shortlisted"
                                                : isRejected
                                                ? "is-rejected"
                                                : "is-pending"
                                        }`}
                                        key={applicant.id}
                                    >
                                        {/* Top Candidate Row */}
                                        <div
                                            className="card-candidate-header clickable-header"
                                            onClick={() => openApplicantDetails(applicant)}
                                            title="Click to view full candidate profile details"
                                        >
                                            <div className="candidate-avatar-wrap">
                                                {applicant.profile_pic ? (
                                                    <img
                                                        src={applicant.profile_pic}
                                                        alt={applicant.full_name}
                                                        className="candidate-avatar-img"
                                                    />
                                                ) : (
                                                    <div className="candidate-avatar-initial">
                                                        {applicant.full_name?.charAt(0)?.toUpperCase() || "A"}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="candidate-name-block">
                                                <h2>{applicant.full_name || "Applicant"}</h2>
                                                <div className="candidate-job-badge">
                                                    <FaBriefcase className="badge-icon" />
                                                    <span>{applicant.title || "Job Application"}</span>
                                                </div>
                                            </div>

                                            <div
                                                className={`applicant-status-pill ${
                                                    isShortlisted
                                                        ? "shortlisted"
                                                        : isRejected
                                                        ? "rejected"
                                                        : "pending"
                                                }`}
                                            >
                                                <span className="status-dot"></span>
                                                <span>
                                                    {isShortlisted
                                                        ? "Shortlisted"
                                                        : isRejected
                                                        ? "Rejected"
                                                        : "Pending"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contact Chips Row */}
                                        <div className="candidate-contact-row">
                                            <div className="contact-chip" title={applicant.email}>
                                                <FaEnvelope className="contact-icon" />
                                                <span>{applicant.email || "Not Provided"}</span>
                                            </div>

                                            <div className="contact-chip" title={applicant.phone}>
                                                <FaPhoneAlt className="contact-icon" />
                                                <span>{applicant.phone || "Not Provided"}</span>
                                            </div>
                                        </div>

                                        {/* Resume ATS Score Section */}
                                        <div className="resume-ats-box">
                                            <div className="ats-box-header">
                                                <div className="ats-title-left">
                                                    <FaFileAlt className="ats-icon" />
                                                    <span>Resume Analysis</span>
                                                </div>
                                                <div className={`ats-score-tag ${atsScore != null ? getScoreColorClass(atsScore) : ""}`}>
                                                    {atsScore != null ? `${atsScore}% Match` : "Not Scored"}
                                                </div>
                                            </div>

                                            {atsScore != null && (
                                                <div className="ats-progress-track">
                                                    <div
                                                        className={`ats-progress-fill ${getScoreColorClass(atsScore)}`}
                                                        style={{ width: `${Math.min(atsScore, 100)}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Interview Result Section */}
                                        <div className="ai-interview-box">
                                            <div className="ai-box-header">
                                                <div className="ai-title-left">
                                                    <FaRobot className="ai-robot-icon" />
                                                    <span>AI Interview Performance</span>
                                                </div>
                                                <span
                                                    className={`interview-badge ${
                                                        applicant.interview_completed ? "completed" : "pending"
                                                    }`}
                                                >
                                                    {applicant.interview_completed ? "✅ Completed" : "⏳ Pending"}
                                                </span>
                                            </div>

                                            {applicant.interview_completed ? (
                                                <>
                                                    <div className="interview-metrics-grid">
                                                        <div className="metric-cell">
                                                            <span className="metric-label">Technical</span>
                                                            <strong className="metric-val">
                                                                {applicant.technical_score ?? 0}%
                                                            </strong>
                                                        </div>

                                                        <div className="metric-cell">
                                                            <span className="metric-label">Communication</span>
                                                            <strong className="metric-val">
                                                                {applicant.communication_score ?? 0}%
                                                            </strong>
                                                        </div>

                                                        <div className="metric-cell">
                                                            <span className="metric-label">Confidence</span>
                                                            <strong className="metric-val">
                                                                {applicant.confidence_score ?? 0}%
                                                            </strong>
                                                        </div>

                                                        <div className="metric-cell overall">
                                                            <span className="metric-label">Overall</span>
                                                            <strong className="metric-val">
                                                                {applicant.overall_score ?? 0}%
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    {applicant.recommendation && (
                                                        <div className="ai-rec-tag">
                                                            <strong>AI Recommendation:</strong>{" "}
                                                            <span>{applicant.recommendation}</span>
                                                        </div>
                                                    )}

                                                    {applicant.ai_feedback && (
                                                        <div className="ai-feedback-wrapper">
                                                            <AIFeedbackCard
                                                                feedback={applicant.ai_feedback}
                                                                score={applicant.overall_score}
                                                                recommendation={applicant.recommendation}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="interview-pending-note">
                                                    <span>Candidate has not taken the AI technical interview yet.</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Applied Date & Meta */}
                                        <div className="card-meta-row">
                                            <div className="applied-date">
                                                <FaCalendarAlt className="date-icon" />
                                                <span>Applied on {formatDate(applicant.applied_at)}</span>
                                            </div>

                                            {isShortlisted && (
                                                <span className="protected-tag" title="Candidate is shortlisted">
                                                    <FaShieldAlt /> Shortlisted
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Toolbar */}
                                        <div className="applicant-actions-toolbar">
                                            <button
                                                className="btn-view-details"
                                                onClick={() => openApplicantDetails(applicant)}
                                                title="View all details of candidate in sidebar"
                                            >
                                                <FaUserAlt />
                                                <span>Full Details</span>
                                            </button>

                                            <button
                                                className="btn-resume"
                                                onClick={() => {
                                                    if (applicant.resume_path) {
                                                        window.open(
                                                            `http://localhost:5000/uploads/${applicant.resume_path}`,
                                                            "_blank"
                                                        );
                                                    } else {
                                                        alert("Resume file not uploaded or unavailable.");
                                                    }
                                                }}
                                                title="View candidate's resume PDF"
                                            >
                                                <FaFileAlt />
                                                <span>Resume</span>
                                            </button>

                                            <button
                                                className={`btn-shortlist ${isShortlisted ? "selected" : ""}`}
                                                onClick={() => handleStatus(applicant.id, "SHORTLISTED", true)}
                                                disabled={isShortlisted || isRejected}
                                                title={isShortlisted ? "Already Shortlisted" : "Shortlist candidate and notify via email"}
                                            >
                                                <FaCheckCircle />
                                                <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
                                            </button>

                                            <button
                                                className={`btn-reject ${isRejected ? "selected" : ""}`}
                                                onClick={() => handleStatus(applicant.id, "REJECTED")}
                                                disabled={isRejected}
                                                title={isRejected ? "Already Rejected" : "Reject candidate"}
                                            >
                                                <FaTimesCircle />
                                                <span>{isRejected ? "Rejected" : "Reject"}</span>
                                            </button>

                                            {isRejected && (
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(applicant)}
                                                    disabled={isDeleting}
                                                    title="Permanently remove rejected candidate"
                                                >
                                                    <FaTrashAlt />
                                                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================================
                SLIDE-OVER SIDEBAR DRAWER: CANDIDATE FULL DETAILS
               ========================================================= */}
            {isDrawerOpen && selectedApplicant && (
                <>
                    <div
                        className="applicant-drawer-overlay"
                        onClick={closeApplicantDetails}
                    ></div>

                    <div className="applicant-drawer">
                        {/* Drawer Header */}
                        <div className="drawer-header">
                            <div className="drawer-header-top">
                                <span className="drawer-eyebrow">
                                    Candidate Profile Details
                                </span>
                                <button
                                    className="drawer-close-btn"
                                    onClick={closeApplicantDetails}
                                    title="Close Sidebar"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="drawer-candidate-card">
                                <div className="drawer-avatar-wrap">
                                    {selectedApplicant.profile_pic ? (
                                        <img
                                            src={selectedApplicant.profile_pic}
                                            alt={selectedApplicant.full_name}
                                            className="drawer-avatar-img"
                                        />
                                    ) : (
                                        <div className="drawer-avatar-initial">
                                            {selectedApplicant.full_name?.charAt(0)?.toUpperCase() || "A"}
                                        </div>
                                    )}
                                </div>

                                <div className="drawer-candidate-main-info">
                                    <h2>{selectedApplicant.full_name || "Applicant Name"}</h2>
                                    <div className="drawer-job-title">
                                        <FaBriefcase className="job-icon" />
                                        <span>{selectedApplicant.title || "Applied Role"}</span>
                                        {selectedApplicant.company && (
                                            <span className="drawer-company-tag">• {selectedApplicant.company}</span>
                                        )}
                                    </div>

                                    <div className="drawer-status-meta">
                                        <span
                                            className={`drawer-status-badge ${
                                                selectedApplicant.status === "SHORTLISTED"
                                                    ? "shortlisted"
                                                    : selectedApplicant.status === "REJECTED"
                                                    ? "rejected"
                                                    : "pending"
                                            }`}
                                        >
                                            <span className="status-dot"></span>
                                            {selectedApplicant.status === "SHORTLISTED"
                                                ? "Shortlisted"
                                                : selectedApplicant.status === "REJECTED"
                                                ? "Rejected"
                                                : "Pending Review"}
                                        </span>

                                        <span className="drawer-applied-date">
                                            <FaCalendarAlt /> Applied {formatDate(selectedApplicant.applied_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Action Bar */}
                            <div className="drawer-actions-bar">
                                <button
                                    className={`drawer-action-btn shortlist ${
                                        selectedApplicant.status === "SHORTLISTED" ? "active" : ""
                                    }`}
                                    onClick={() => handleStatus(selectedApplicant.id, "SHORTLISTED", true)}
                                    disabled={selectedApplicant.status === "SHORTLISTED" || selectedApplicant.status === "REJECTED"}
                                >
                                    <FaCheckCircle />
                                    <span>
                                        {selectedApplicant.status === "SHORTLISTED" ? "Shortlisted" : "Shortlist & Notify Candidate"}
                                    </span>
                                </button>

                                <button
                                    className={`drawer-action-btn reject ${
                                        selectedApplicant.status === "REJECTED" ? "active" : ""
                                    }`}
                                    onClick={() => handleStatus(selectedApplicant.id, "REJECTED")}
                                    disabled={selectedApplicant.status === "REJECTED"}
                                >
                                    <FaTimesCircle />
                                    <span>{selectedApplicant.status === "REJECTED" ? "Rejected" : "Reject"}</span>
                                </button>

                                {selectedApplicant.resume_path && (
                                    <button
                                        className="drawer-action-btn resume"
                                        onClick={() => {
                                            window.open(
                                                `http://localhost:5000/uploads/${selectedApplicant.resume_path}`,
                                                "_blank"
                                            );
                                        }}
                                    >
                                        <FaFileAlt />
                                        <span>View Resume PDF</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Drawer Scrollable Body */}
                        <div className="drawer-body">
                            {/* 1. CONTACT & SOCIAL DETAILS */}
                            <div className="drawer-section">
                                <h3 className="drawer-section-title">
                                    <FaUserAlt className="sec-icon" />
                                    <span>Contact & Social Links</span>
                                </h3>

                                <div className="drawer-contact-grid">
                                    <div className="drawer-contact-item">
                                        <FaEnvelope className="item-icon blue" />
                                        <div className="item-content">
                                            <label>Email Address</label>
                                            <a href={`mailto:${selectedApplicant.email || ""}`}>
                                                {selectedApplicant.email || "Not Provided"}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="drawer-contact-item">
                                        <FaPhoneAlt className="item-icon green" />
                                        <div className="item-content">
                                            <label>Phone Number</label>
                                            <a href={`tel:${selectedApplicant.phone || ""}`}>
                                                {selectedApplicant.phone || "Not Provided"}
                                            </a>
                                        </div>
                                    </div>

                                    {selectedApplicant.github && (
                                        <div className="drawer-contact-item">
                                            <FaGithub className="item-icon dark" />
                                            <div className="item-content">
                                                <label>GitHub Profile</label>
                                                <a
                                                    href={
                                                        selectedApplicant.github.startsWith("http")
                                                            ? selectedApplicant.github
                                                            : `https://${selectedApplicant.github}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {selectedApplicant.github} <FaExternalLinkAlt className="ext-icon" />
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {selectedApplicant.linkedin && (
                                        <div className="drawer-contact-item">
                                            <FaLinkedin className="item-icon blue" />
                                            <div className="item-content">
                                                <label>LinkedIn Profile</label>
                                                <a
                                                    href={
                                                        selectedApplicant.linkedin.startsWith("http")
                                                            ? selectedApplicant.linkedin
                                                            : `https://${selectedApplicant.linkedin}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {selectedApplicant.linkedin} <FaExternalLinkAlt className="ext-icon" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. CANDIDATE BIO / SUMMARY */}
                            {Boolean(formatSummaryText(selectedApplicant.summary)) && (
                                <div className="drawer-section">
                                    <h3 className="drawer-section-title">
                                        <FaFileAlt className="sec-icon" />
                                        <span>Candidate Summary</span>
                                    </h3>
                                    <div className="drawer-summary-box">
                                        {formatSummaryText(selectedApplicant.summary)}
                                    </div>
                                </div>
                            )}

                            {/* 3. RESUME ATS & SKILLS BREAKDOWN */}
                            <div className="drawer-section">
                                <h3 className="drawer-section-title">
                                    <FaChartLine className="sec-icon" />
                                    <span>ATS Resume Match & Skills Profile</span>
                                </h3>

                                <div className="drawer-ats-card">
                                    <div className="drawer-ats-top">
                                        <div className="ats-circle-stat">
                                            <span className="ats-big-num">
                                                {selectedApplicant.ats_score != null
                                                    ? `${selectedApplicant.ats_score}%`
                                                    : "N/A"}
                                            </span>
                                            <span className="ats-stat-label">ATS Score</span>
                                        </div>

                                        <div className="ats-meta-desc">
                                            <strong>Resume Match Analysis</strong>
                                            <p>
                                                {selectedApplicant.ats_score >= 70
                                                    ? "Strong match with the job description requirements and technical stack."
                                                    : selectedApplicant.ats_score >= 50
                                                    ? "Moderate alignment with job requirements."
                                                    : "Basic alignment; candidate has some relevant competencies."}
                                            </p>
                                            {selectedApplicant.hire_probability && (
                                                <div className="hire-prob-badge">
                                                    Hire Probability: <strong>{selectedApplicant.hire_probability}%</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills Pills */}
                                    {parseSkillsList(selectedApplicant.skills).length > 0 && (
                                        <div className="drawer-skills-block">
                                            <div className="skills-block-heading">
                                                <FaCode className="sub-icon" /> Candidate Skills
                                            </div>
                                            <div className="drawer-skills-pills">
                                                {parseSkillsList(selectedApplicant.skills).map((skill, sIdx) => (
                                                    <span key={sIdx} className="skill-pill">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4. AI INTERVIEW EVALUATION SCORECARD */}
                            <div className="drawer-section">
                                <h3 className="drawer-section-title">
                                    <FaRobot className="sec-icon" />
                                    <span>AI Interview Performance Evaluation</span>
                                </h3>

                                {selectedApplicant.interview_completed ? (
                                    <div className="drawer-interview-card">
                                        <div className="interview-overall-banner">
                                            <div className="interview-rec-badge">
                                                <span>AI Recommendation:</span>
                                                <strong>{selectedApplicant.recommendation || "Hire"}</strong>
                                            </div>
                                            <div className="interview-timestamp">
                                                Completed: {formatDate(selectedApplicant.completed_at || selectedApplicant.applied_at)}
                                            </div>
                                        </div>

                                        <div className="drawer-metrics-4grid">
                                            <div className="drawer-metric-item highlight">
                                                <span className="label">Overall Score</span>
                                                <span className="val">{selectedApplicant.overall_score ?? 0}%</span>
                                            </div>

                                            <div className="drawer-metric-item">
                                                <span className="label">Technical</span>
                                                <span className="val">{selectedApplicant.technical_score ?? 0}%</span>
                                            </div>

                                            <div className="drawer-metric-item">
                                                <span className="label">Communication</span>
                                                <span className="val">{selectedApplicant.communication_score ?? 0}%</span>
                                            </div>

                                            <div className="drawer-metric-item">
                                                <span className="label">Confidence</span>
                                                <span className="val">{selectedApplicant.confidence_score ?? 0}%</span>
                                            </div>
                                        </div>

                                        {selectedApplicant.ai_feedback && (
                                            <div className="drawer-feedback-wrap">
                                                <div className="feedback-heading">
                                                    💡 Qualitative AI Analysis:
                                                </div>
                                                <AIFeedbackCard
                                                    feedback={selectedApplicant.ai_feedback}
                                                    score={selectedApplicant.overall_score}
                                                    recommendation={selectedApplicant.recommendation}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="drawer-pending-interview">
                                        <FaHourglassHalf className="pending-icon" />
                                        <div>
                                            <strong>AI Interview Not Taken</strong>
                                            <p>Candidate has not completed their technical AI evaluation yet.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 5. EDUCATION & EXPERIENCE (if available) */}
                            {(parseEducationList(selectedApplicant.education).length > 0 ||
                                parseExperienceList(selectedApplicant.experience).length > 0) && (
                                <div className="drawer-section">
                                    <h3 className="drawer-section-title">
                                        <FaGraduationCap className="sec-icon" />
                                        <span>Background & Experience</span>
                                    </h3>

                                    {parseEducationList(selectedApplicant.education).length > 0 && (
                                        <div className="drawer-info-block">
                                            <label>🎓 Education</label>
                                            <div className="drawer-detail-cards">
                                                {parseEducationList(selectedApplicant.education).map((edu, idx) => (
                                                    <div key={idx} className="drawer-subcard">
                                                        {edu.text ? (
                                                            <div className="subcard-title">{edu.text}</div>
                                                        ) : (
                                                            <>
                                                                <div className="subcard-title">
                                                                    {edu.degree || "Degree"}
                                                                </div>
                                                                {edu.college && (
                                                                    <div className="subcard-subtitle">{edu.college}</div>
                                                                )}
                                                                <div className="subcard-meta">
                                                                    {edu.year && <span>📅 {edu.year}</span>}
                                                                    {edu.score && <span>📊 Score: {edu.score}</span>}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {parseExperienceList(selectedApplicant.experience).length > 0 && (
                                        <div className="drawer-info-block" style={{ marginTop: "14px" }}>
                                            <label>💼 Work Experience</label>
                                            <div className="drawer-detail-cards">
                                                {parseExperienceList(selectedApplicant.experience).map((exp, idx) => (
                                                    <div key={idx} className="drawer-subcard">
                                                        {exp.text ? (
                                                            <div className="subcard-title">{exp.text}</div>
                                                        ) : (
                                                            <>
                                                                <div className="subcard-title">
                                                                    {exp.role || exp.company || "Experience"}
                                                                </div>
                                                                {exp.company && exp.role && (
                                                                    <div className="subcard-subtitle">{exp.company}</div>
                                                                )}
                                                                {exp.duration && (
                                                                    <div className="subcard-meta">
                                                                        <span>⏳ {exp.duration}</span>
                                                                    </div>
                                                                )}
                                                                {exp.description && (
                                                                    <div className="subcard-desc">{exp.description}</div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Applicants;