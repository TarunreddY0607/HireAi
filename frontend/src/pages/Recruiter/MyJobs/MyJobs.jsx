import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBriefcase,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaClock,
    FaUsers,
    FaCalendarAlt,
    FaEye,
    FaEdit,
    FaTrashAlt,
    FaBuilding,
    FaPlus,
    FaSearch,
    FaLayerGroup,
    FaCheckCircle,
    FaTimesCircle,
    FaChevronDown,
    FaChevronUp,
    FaHourglassHalf
} from "react-icons/fa";

import RecruiterSidebar from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";
import RecruiterTopbar from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";

import {
    getRecruiterJobs,
    deleteJob
} from "../../../services/jobService";

import "./MyJobs.css";

function MyJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, CLOSED
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    // ==================================================
    // LOAD RECRUITER JOBS
    // ==================================================
    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getRecruiterJobs();

            if (data && data.success) {
                setJobs(Array.isArray(data.jobs) ? data.jobs : []);
            } else {
                setJobs([]);
                setError(data?.message || "Unable to load your jobs.");
            }
        } catch (err) {
            console.log("MY JOBS ERROR:", err);
            setError(
                err.response?.data?.message ||
                "Failed to load your jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // DELETE JOB
    // ==================================================
    const handleDelete = async (id, title) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${title || "this job"}"? This will also remove associated applications.`
        );

        if (!confirmDelete) return;

        try {
            const data = await deleteJob(id);

            if (data.success) {
                alert("Job Deleted Successfully");
                setJobs((prev) => prev.filter((job) => job.id !== id));
            } else {
                alert(data.message || "Delete Failed");
            }
        } catch (err) {
            console.log("DELETE JOB ERROR:", err);
            alert(err.response?.data?.message || "Delete Failed");
        }
    };

    // ==================================================
    // HELPERS
    // ==================================================
    const isJobActive = (deadline) => {
        if (!deadline) return true;
        const deadlineDate = new Date(String(deadline).split("T")[0] + "T23:59:59");
        const now = new Date();
        return deadlineDate >= now;
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return "No Deadline";
        try {
            const clean = String(deadline).split("T")[0];
            const [year, month, day] = clean.split("-");
            if (!year || !month || !day) return clean;
            const date = new Date(Number(year), Number(month) - 1, Number(day));
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        } catch {
            return String(deadline).split("T")[0];
        }
    };

    const getSkills = (skills) => {
        if (Array.isArray(skills)) return skills;
        if (!skills) return [];
        try {
            const parsed = JSON.parse(skills);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const toggleDescription = (id) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // ==================================================
    // FILTERED JOBS & STATS
    // ==================================================
    const stats = useMemo(() => {
        const total = jobs.length;
        const active = jobs.filter((j) => isJobActive(j.deadline)).length;
        const closed = total - active;
        const totalVacancies = jobs.reduce((acc, j) => acc + (Number(j.vacancies) || 0), 0);
        return { total, active, closed, totalVacancies };
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch =
                (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase()));

            const active = isJobActive(job.deadline);
            let matchesStatus = true;
            if (statusFilter === "ACTIVE") matchesStatus = active;
            if (statusFilter === "CLOSED") matchesStatus = !active;

            return matchesSearch && matchesStatus;
        });
    }, [jobs, searchQuery, statusFilter]);

    return (
        <div className="recruiter-dashboard">
            <RecruiterSidebar />

            <div className="dashboard-content">
                <RecruiterTopbar />

                <div className="myjobs-container">
                    {/* ==========================================
                        HEADER
                    ========================================== */}
                    <div className="myjobs-header">
                        <div>
                            <div className="myjobs-title-row">
                                <h1>My Posted Jobs</h1>
                                <span className="total-jobs-badge">
                                    {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
                                </span>
                            </div>
                            <p>
                                Manage, track, and edit job openings posted by your company.
                            </p>
                        </div>

                        <button
                            className="post-new-job-btn"
                            onClick={() => navigate("/recruiter/post-job")}
                        >
                            <FaPlus className="btn-icon" />
                            <span>Post New Job</span>
                        </button>
                    </div>

                    {/* ==========================================
                        STATS BAR
                    ========================================== */}
                    {!loading && !error && jobs.length > 0 && (
                        <div className="jobs-summary-grid">
                            <div
                                className={`summary-card ${statusFilter === "ALL" ? "active-filter" : ""}`}
                                onClick={() => setStatusFilter("ALL")}
                            >
                                <div className="summary-icon blue">
                                    <FaLayerGroup />
                                </div>
                                <div className="summary-info">
                                    <span>Total Jobs</span>
                                    <strong>{stats.total}</strong>
                                </div>
                            </div>

                            <div
                                className={`summary-card ${statusFilter === "ACTIVE" ? "active-filter" : ""}`}
                                onClick={() => setStatusFilter("ACTIVE")}
                            >
                                <div className="summary-icon green">
                                    <FaCheckCircle />
                                </div>
                                <div className="summary-info">
                                    <span>Active Jobs</span>
                                    <strong>{stats.active}</strong>
                                </div>
                            </div>

                            <div
                                className={`summary-card ${statusFilter === "CLOSED" ? "active-filter" : ""}`}
                                onClick={() => setStatusFilter("CLOSED")}
                            >
                                <div className="summary-icon amber">
                                    <FaHourglassHalf />
                                </div>
                                <div className="summary-info">
                                    <span>Closed / Expired</span>
                                    <strong>{stats.closed}</strong>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-icon purple">
                                    <FaUsers />
                                </div>
                                <div className="summary-info">
                                    <span>Total Vacancies</span>
                                    <strong>{stats.totalVacancies}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                        FILTER & SEARCH BAR
                    ========================================== */}
                    {!loading && !error && jobs.length > 0 && (
                        <div className="myjobs-filter-bar">
                            <div className="search-input-wrapper">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by job title, location, or company..."
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

                            <div className="status-tabs">
                                <button
                                    className={`tab-btn ${statusFilter === "ALL" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("ALL")}
                                >
                                    All ({stats.total})
                                </button>
                                <button
                                    className={`tab-btn ${statusFilter === "ACTIVE" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("ACTIVE")}
                                >
                                    Active ({stats.active})
                                </button>
                                <button
                                    className={`tab-btn ${statusFilter === "CLOSED" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("CLOSED")}
                                >
                                    Closed ({stats.closed})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                        LOADING STATE
                    ========================================== */}
                    {loading && (
                        <div className="myjobs-status">
                            <div className="loading-spinner"></div>
                            <h2>Loading Your Jobs...</h2>
                            <p>Fetching active jobs from your recruiter account.</p>
                        </div>
                    )}

                    {/* ==========================================
                        ERROR STATE
                    ========================================== */}
                    {!loading && error && (
                        <div className="myjobs-status error-box">
                            <div className="status-icon">⚠️</div>
                            <h2>Unable to Load Jobs</h2>
                            <p>{error}</p>
                            <button className="retry-btn" onClick={loadJobs}>
                                🔄 Try Again
                            </button>
                        </div>
                    )}

                    {/* ==========================================
                        EMPTY STATE (NO JOBS POSTED)
                    ========================================== */}
                    {!loading && !error && jobs.length === 0 && (
                        <div className="myjobs-status empty-box">
                            <div className="status-icon">💼</div>
                            <h2>No Jobs Posted Yet</h2>
                            <p>Get started by creating your first job opening to attract qualified candidates.</p>
                            <button
                                className="post-new-job-btn"
                                onClick={() => navigate("/recruiter/post-job")}
                            >
                                <FaPlus className="btn-icon" />
                                <span>Post Your First Job</span>
                            </button>
                        </div>
                    )}

                    {/* ==========================================
                        NO MATCHES FOUND IN FILTER
                    ========================================== */}
                    {!loading && !error && jobs.length > 0 && filteredJobs.length === 0 && (
                        <div className="myjobs-status empty-box">
                            <div className="status-icon">🔍</div>
                            <h2>No Matching Jobs Found</h2>
                            <p>No job postings matched your current search and filter criteria.</p>
                            <button
                                className="reset-filter-btn"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("ALL");
                                }}
                            >
                                Reset Search Filters
                            </button>
                        </div>
                    )}

                    {/* ==========================================
                        JOB CARDS GRID
                    ========================================== */}
                    {!loading && !error && filteredJobs.length > 0 && (
                        <div className="jobs-grid">
                            {filteredJobs.map((job) => {
                                const skills = getSkills(job.required_skills);
                                const active = isJobActive(job.deadline);
                                const isVerified =
                                    Boolean(job.is_company_verified) ||
                                    String(job.company_verification_status || "").toUpperCase() === "VERIFIED" ||
                                    String(job.verification_status || "").toUpperCase() === "VERIFIED";

                                const isExpanded = !!expandedDescriptions[job.id];
                                const hasLongDesc = job.description && job.description.length > 140;

                                return (
                                    <div
                                        className={`job-card ${active ? "is-active" : "is-closed"}`}
                                        key={job.id}
                                    >
                                        {/* Card Top Row: Company & Status Badge */}
                                        <div className="card-top-row">
                                            <div
                                                className={`company-badge ${isVerified ? "verified" : "unverified"}`}
                                                title={isVerified ? "Verified Company" : "Unverified Company"}
                                            >
                                                <FaBuilding className="company-icon" />
                                                <span>{job.company || "Company"}</span>
                                            </div>

                                            <div className={`status-pill ${active ? "active" : "closed"}`}>
                                                <span className="status-dot"></span>
                                                <span>{active ? "Active" : "Closed"}</span>
                                            </div>
                                        </div>

                                        {/* Job Title & ID */}
                                        <div className="job-title-row">
                                            <h2 title={job.title}>{job.title}</h2>
                                            <span className="job-id-tag">#{job.id}</span>
                                        </div>

                                        {/* Clean Info Grid (6 key attributes) */}
                                        <div className="job-info-grid">
                                            <div className="info-chip">
                                                <FaMapMarkerAlt className="chip-icon loc" />
                                                <div className="chip-content">
                                                    <span className="chip-label">Location</span>
                                                    <span className="chip-value" title={job.location}>
                                                        {job.location || "Not specified"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="info-chip">
                                                <FaMoneyBillWave className="chip-icon sal" />
                                                <div className="chip-content">
                                                    <span className="chip-label">Salary</span>
                                                    <span className="chip-value" title={job.salary}>
                                                        {job.salary || "Not specified"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="info-chip">
                                                <FaBriefcase className="chip-icon exp" />
                                                <div className="chip-content">
                                                    <span className="chip-label">Experience</span>
                                                    <span className="chip-value">
                                                        {job.experience || "0 Years"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="info-chip">
                                                <FaClock className="chip-icon typ" />
                                                <div className="chip-content">
                                                    <span className="chip-label">Type</span>
                                                    <span className="chip-value">
                                                        {job.employment_type || "Full Time"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="info-chip">
                                                <FaUsers className="chip-icon vac" />
                                                <div className="chip-content">
                                                    <span className="chip-label">Vacancies</span>
                                                    <span className="chip-value">
                                                        {job.vacancies || 1} {Number(job.vacancies) === 1 ? "Opening" : "Openings"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="info-chip">
                                                <FaCalendarAlt className="chip-icon dln" />
                                                <div className="chip-content">
                                                    <span className="chip-label">Deadline</span>
                                                    <span className={`chip-value ${!active ? "expired-text" : ""}`}>
                                                        {formatDeadline(job.deadline)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Description */}
                                        {job.description && (
                                            <div className="job-desc-box">
                                                <span className="section-label">Job Description</span>
                                                <p className={`desc-text ${isExpanded ? "expanded" : "clamped"}`}>
                                                    {job.description}
                                                </p>
                                                {hasLongDesc && (
                                                    <button
                                                        type="button"
                                                        className="toggle-desc-btn"
                                                        onClick={() => toggleDescription(job.id)}
                                                    >
                                                        {isExpanded ? (
                                                            <>Show Less <FaChevronUp /></>
                                                        ) : (
                                                            <>Read More <FaChevronDown /></>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Required Skills */}
                                        <div className="job-skills-box">
                                            <span className="section-label">Required Skills</span>
                                            <div className="skills-pill-wrap">
                                                {skills.length > 0 ? (
                                                    skills.map((skill, index) => (
                                                        <span className="skill-pill" key={index}>
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="no-skills-tag">
                                                        No specific skills listed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="job-actions-row">
                                            <button
                                                className="action-btn view"
                                                onClick={() => navigate(`/recruiter/view-job/${job.id}`)}
                                                title="View Job & Applicants"
                                            >
                                                <FaEye />
                                                <span>View</span>
                                            </button>

                                            <button
                                                className="action-btn edit"
                                                onClick={() => navigate(`/recruiter/edit-job/${job.id}`)}
                                                title="Edit Job Details"
                                            >
                                                <FaEdit />
                                                <span>Edit</span>
                                            </button>

                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(job.id, job.title)}
                                                title="Delete Job Opening"
                                            >
                                                <FaTrashAlt />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyJobs;