import { useEffect, useState, useMemo } from "react";
import RecruiterSidebar from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";
import RecruiterTopbar from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";
import { getRecruiterAnalytics } from "../../../services/analyticsService";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import {
    FaBriefcase,
    FaUsers,
    FaHourglassHalf,
    FaCheckCircle,
    FaTimesCircle,
    FaRobot,
    FaFileAlt,
    FaChartPie,
    FaChartBar,
    FaPercentage
} from "react-icons/fa";

import "./Analytics.css";

function Analytics() {
    const [statistics, setStatistics] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =========================================
       LOAD ANALYTICS
    ========================================= */
    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const data = await getRecruiterAnalytics();
            setStatistics(data.statistics);
            setJobs(data.jobs || []);
        } catch (err) {
            console.log("Analytics Error:", err);
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       LOADING
    ========================================= */
    if (loading) {
        return (
            <div className="recruiter-dashboard">
                <RecruiterSidebar />
                <div className="dashboard-content">
                    <RecruiterTopbar />
                    <div className="analytics-container">
                        <div className="analytics-loading-box">
                            <div className="loading-spinner"></div>
                            <h2>Loading Recruitment Analytics...</h2>
                            <p>Calculating pipeline statistics and candidate metrics.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================
       PIE CHART DATA
    ========================================= */
    const applicantStatusData = [
        {
            name: "Pending",
            value: Number(statistics?.pending_applicants || 0),
            color: "#f59e0b"
        },
        {
            name: "Shortlisted",
            value: Number(statistics?.shortlisted_applicants || 0),
            color: "#10b981"
        },
        {
            name: "Rejected",
            value: Number(statistics?.rejected_applicants || 0),
            color: "#ef4444"
        }
    ].filter((item) => item.value > 0);

    /* =========================================
       BAR CHART DATA
    ========================================= */
    const jobApplicantData = jobs.map((job) => ({
        name:
            job.title && job.title.length > 16
                ? `${job.title.substring(0, 16)}...`
                : job.title || "Job",
        fullTitle: job.title || "Job",
        applicants: Number(job.applicants || 0),
        shortlisted: Number(job.shortlisted || 0),
        rejected: Number(job.rejected || 0)
    }));

    // Conversion rate calculation
    const totalApps = Number(statistics?.total_applicants || 0);
    const shortlistedCount = Number(statistics?.shortlisted_applicants || 0);
    const conversionRate = totalApps > 0 ? Math.round((shortlistedCount / totalApps) * 100) : 0;

    return (
        <div className="recruiter-dashboard">
            <RecruiterSidebar />

            <div className="dashboard-content">
                <RecruiterTopbar />

                <div className="analytics-container">
                    {/* =================================
                        HEADER
                    ================================= */}
                    <div className="analytics-header">
                        <div>
                            <div className="analytics-title-row">
                                <h1>Recruitment Analytics</h1>
                                <div className="analytics-live-pill">
                                    <span className="live-pulse-dot"></span>
                                    <span>Live Data</span>
                                </div>
                            </div>
                            <p>
                                Track your job postings, applicant funnel conversion, ATS scores, and AI interview metrics.
                            </p>
                        </div>
                    </div>

                    {/* =================================
                        KEY METRICS (6 STAT CARDS)
                    ================================= */}
                    <div className="analytics-stats-grid">
                        <div className="metric-stat-card">
                            <div className="stat-icon-wrap blue">
                                <FaBriefcase />
                            </div>
                            <div className="stat-text-block">
                                <span className="stat-label">Total Jobs</span>
                                <h2 className="stat-number">{statistics?.total_jobs || 0}</h2>
                            </div>
                        </div>

                        <div className="metric-stat-card">
                            <div className="stat-icon-wrap indigo">
                                <FaUsers />
                            </div>
                            <div className="stat-text-block">
                                <span className="stat-label">Total Applicants</span>
                                <h2 className="stat-number">{statistics?.total_applicants || 0}</h2>
                            </div>
                        </div>

                        <div className="metric-stat-card">
                            <div className="stat-icon-wrap amber">
                                <FaHourglassHalf />
                            </div>
                            <div className="stat-text-block">
                                <span className="stat-label">Pending</span>
                                <h2 className="stat-number">{statistics?.pending_applicants || 0}</h2>
                            </div>
                        </div>

                        <div className="metric-stat-card">
                            <div className="stat-icon-wrap green">
                                <FaCheckCircle />
                            </div>
                            <div className="stat-text-block">
                                <span className="stat-label">Shortlisted</span>
                                <h2 className="stat-number">{statistics?.shortlisted_applicants || 0}</h2>
                            </div>
                        </div>

                        <div className="metric-stat-card">
                            <div className="stat-icon-wrap rose">
                                <FaTimesCircle />
                            </div>
                            <div className="stat-text-block">
                                <span className="stat-label">Rejected</span>
                                <h2 className="stat-number">{statistics?.rejected_applicants || 0}</h2>
                            </div>
                        </div>

                        <div className="metric-stat-card">
                            <div className="stat-icon-wrap purple">
                                <FaRobot />
                            </div>
                            <div className="stat-text-block">
                                <span className="stat-label">AI Interviews</span>
                                <h2 className="stat-number">{statistics?.completed_interviews || 0}</h2>
                            </div>
                        </div>
                    </div>

                    {/* =================================
                        CHARTS SECTION
                    ================================= */}
                    <div className="analytics-charts-grid">
                        {/* Status Donut Chart */}
                        <div className="chart-panel-card">
                            <div className="chart-panel-header">
                                <div>
                                    <h2>Applicant Status Distribution</h2>
                                    <p>Overall candidate application breakdown</p>
                                </div>
                                <div className="panel-badge">
                                    <FaChartPie className="badge-icon" />
                                </div>
                            </div>

                            {applicantStatusData.length > 0 ? (
                                <div className="donut-chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={applicantStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={72}
                                                outerRadius={105}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {applicantStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name) => [`${value} Candidates`, name]}
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    borderRadius: "8px",
                                                    color: "#fff",
                                                    border: "none",
                                                    fontSize: "12px",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                                }}
                                                itemStyle={{ color: "#fff" }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                formatter={(value) => (
                                                    <span style={{ color: "#475569", fontSize: "12.5px", fontWeight: 600 }}>
                                                        {value}
                                                    </span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="donut-center-stat">
                                        <strong>{statistics?.total_applicants || 0}</strong>
                                        <span>Total</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="chart-empty-state">
                                    <FaChartPie className="empty-chart-icon" />
                                    <p>No applicant data recorded yet</p>
                                </div>
                            )}
                        </div>

                        {/* Applicants By Job Bar Chart */}
                        <div className="chart-panel-card">
                            <div className="chart-panel-header">
                                <div>
                                    <h2>Applicants by Job Opening</h2>
                                    <p>Compare candidate flow & outcomes per job</p>
                                </div>
                                <div className="panel-badge">
                                    <FaChartBar className="badge-icon" />
                                </div>
                            </div>

                            {jobApplicantData.length > 0 ? (
                                <div className="bar-chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={jobApplicantData}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 35 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: "#64748b" }}
                                                angle={-25}
                                                textAnchor="end"
                                                interval={0}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 11, fill: "#64748b" }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    borderRadius: "8px",
                                                    color: "#fff",
                                                    border: "none",
                                                    fontSize: "12px",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                                }}
                                                itemStyle={{ color: "#fff" }}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                height={35}
                                                iconType="circle"
                                                formatter={(value) => (
                                                    <span style={{ color: "#475569", fontSize: "12px", fontWeight: 600 }}>
                                                        {value}
                                                    </span>
                                                )}
                                            />
                                            <Bar dataKey="applicants" name="Applicants" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="shortlisted" name="Shortlisted" fill="#10b981" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="chart-empty-state">
                                    <FaChartBar className="empty-chart-icon" />
                                    <p>No job postings recorded yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =================================
                        AI & CANDIDATE QUALITY SECTION
                    ================================= */}
                    <div className="analytics-insights-grid">
                        <div className="insight-card">
                            <div className="insight-icon-wrap blue">
                                <FaFileAlt />
                            </div>
                            <div className="insight-content">
                                <span className="insight-title">Average ATS Match Score</span>
                                <p className="insight-desc">Based on AI analysis across submitted candidate resumes</p>
                                <div className="insight-metric-row">
                                    <strong className="insight-score">{statistics?.average_ats_score || 0}%</strong>
                                    <div className="insight-progress-bar">
                                        <div
                                            className="insight-progress-fill blue"
                                            style={{ width: `${Math.min(Number(statistics?.average_ats_score) || 0, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="insight-card">
                            <div className="insight-icon-wrap purple">
                                <FaRobot />
                            </div>
                            <div className="insight-content">
                                <span className="insight-title">Average AI Interview Score</span>
                                <p className="insight-desc">Mean performance across completed AI technical evaluations</p>
                                <div className="insight-metric-row">
                                    <strong className="insight-score">{statistics?.average_interview_score || 0}%</strong>
                                    <div className="insight-progress-bar">
                                        <div
                                            className="insight-progress-fill purple"
                                            style={{ width: `${Math.min(Number(statistics?.average_interview_score) || 0, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="insight-card">
                            <div className="insight-icon-wrap green">
                                <FaPercentage />
                            </div>
                            <div className="insight-content">
                                <span className="insight-title">Shortlist Conversion Rate</span>
                                <p className="insight-desc">Percentage of total applicants moved to shortlisted stage</p>
                                <div className="insight-metric-row">
                                    <strong className="insight-score">{conversionRate}%</strong>
                                    <div className="insight-progress-bar">
                                        <div
                                            className="insight-progress-fill green"
                                            style={{ width: `${Math.min(conversionRate, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================
                        INDIVIDUAL JOB PERFORMANCE
                    ================================= */}
                    <div className="job-breakdown-section">
                        <div className="section-header-row">
                            <div>
                                <h2>Job-by-Job Performance</h2>
                                <p>Candidate metrics for each active and closed opening</p>
                            </div>
                            <span className="job-count-pill">{jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}</span>
                        </div>

                        {jobs.length === 0 ? (
                            <div className="chart-empty-state">
                                <FaBriefcase className="empty-chart-icon" />
                                <p>No jobs found. Post a job opening to see recruitment analytics.</p>
                            </div>
                        ) : (
                            <div className="job-breakdown-grid">
                                {jobs.map((job) => {
                                    const appCount = Number(job.applicants || 0);
                                    const shortCount = Number(job.shortlisted || 0);
                                    const rejCount = Number(job.rejected || 0);
                                    const interviewCount = Number(job.interviews_completed || 0);

                                    return (
                                        <div className="job-metric-tile" key={job.id}>
                                            <div className="job-tile-header">
                                                <h3 title={job.title}>{job.title}</h3>
                                                <span className="job-id-tag">#{job.id}</span>
                                            </div>

                                            <div className="job-tile-stats">
                                                <div className="tile-stat-item">
                                                    <span className="stat-tag">Applicants</span>
                                                    <strong className="stat-val blue">{appCount}</strong>
                                                </div>

                                                <div className="tile-stat-item">
                                                    <span className="stat-tag">Shortlisted</span>
                                                    <strong className="stat-val green">{shortCount}</strong>
                                                </div>

                                                <div className="tile-stat-item">
                                                    <span className="stat-tag">Rejected</span>
                                                    <strong className="stat-val red">{rejCount}</strong>
                                                </div>

                                                <div className="tile-stat-item">
                                                    <span className="stat-tag">AI Interviews</span>
                                                    <strong className="stat-val purple">{interviewCount}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;