import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { FiArrowRight, FiPlay, FiCheck, FiTrendingUp, FiFileText } from "react-icons/fi";
import api from "../../services/api";

function Hero() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalRegistered: 0,
        jobSeekers: 0,
        recruiters: 0,
        resumesAnalyzed: 0,
        totalJobs: 0,
        avgScore: 94.5
    });

    useEffect(() => {
        api.get("/stats")
            .then((res) => {
                if (res.data && res.data.stats) {
                    setStats(res.data.stats);
                }
            })
            .catch((err) => {
                console.log("Could not load live stats:", err);
            });
    }, []);

    const displayScore = stats.avgScore ? Math.min(Math.max(Math.round(stats.avgScore), 75), 98) : 94;

    return (
        <section className="hero" id="home">
            {/* Ambient Background Glows */}
            <div className="hero-glow-1"></div>
            <div className="hero-glow-2"></div>
            <div className="hero-grid-pattern"></div>

            <div className="hero-container">
                {/* ── LEFT HERO COLUMN ─────────── */}
                <div className="hero-left">
                    {/* Top Pill Badge */}
                    <div className="hero-badge">
                        <span className="badge-glow-dot"></span>
                        <HiSparkles className="badge-sparkle" />
                        <span>Next-Gen AI Talent Engine</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="hero-title">
                        Hire <span className="text-gradient">Smarter.</span>
                        <br />
                        Recruit <span className="text-gradient-alt">Faster.</span>
                    </h1>

                    <p className="hero-description">
                        Supercharge your career and hiring with instant ATS resume intelligence, 
                        deep skill gap analysis, and automated interview simulations — built for high-growth tech teams.
                    </p>

                    {/* Action Buttons */}
                    <div className="hero-buttons">
                        <button
                            className="hero-primary-btn"
                            onClick={() => navigate("/register")}
                        >
                            <span>Get Started Free</span>
                            <FiArrowRight className="btn-arrow-icon" />
                        </button>

                        <button
                            className="hero-secondary-btn"
                            onClick={() => navigate("/login")}
                        >
                            <FiPlay className="btn-play-icon" />
                            <span>Sign In</span>
                        </button>
                    </div>

                    {/* Social Proof Rating */}
                    <div className="hero-social-proof">
                        <div className="star-rating-group">
                            <FaStar className="star-icon" />
                            <FaStar className="star-icon" />
                            <FaStar className="star-icon" />
                            <FaStar className="star-icon" />
                            <FaStar className="star-icon" />
                        </div>
                        <span className="rating-text">
                            <strong>4.9/5 Rating</strong> • Trusted by 10,000+ candidates & top recruiters
                        </span>
                    </div>

                    {/* Performance Stats */}
                    <div className="hero-stats-row">
                        <div className="stat-card-mini">
                            <h3>{stats.resumesAnalyzed || stats.jobSeekers || 1420}+</h3>
                            <p>Resumes Analyzed</p>
                        </div>

                        <div className="stat-card-mini">
                            <h3>{displayScore}%</h3>
                            <p>ATS Match Accuracy</p>
                        </div>

                        <div className="stat-card-mini">
                            <h3>{stats.recruiters || 120}+</h3>
                            <p>Active Recruiters</p>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Interactive AI Dashboard Mockup ─────────── */}
                <div className="hero-right">
                    <div className="dashboard-mockup-wrapper">
                        <div className="dashboard-glass-panel">
                            
                            {/* Top Bar of Card */}
                            <div className="panel-header">
                                <div className="panel-file-info">
                                    <div className="file-icon-box">
                                        <FiFileText />
                                    </div>
                                    <div>
                                        <div className="file-name">Senior_Engineer_Resume.pdf</div>
                                        <div className="file-sub">AI Analysis • Ready</div>
                                    </div>
                                </div>
                                <div className="status-indicator-pill">
                                    <span className="pulse-dot"></span>
                                    <span>Verified</span>
                                </div>
                            </div>

                            {/* Score Metric Card */}
                            <div className="panel-metric-section">
                                <div className="metric-header">
                                    <span className="metric-label">OVERALL ATS COMPATIBILITY</span>
                                    <span className="metric-badge">
                                        <FiTrendingUp /> Top 5% Match
                                    </span>
                                </div>
                                <div className="metric-score-display">
                                    <span className="score-number">{displayScore}%</span>
                                    <span className="score-scale">/ 100</span>
                                </div>

                                {/* Progress bar */}
                                <div className="score-bar-track">
                                    <div 
                                        className="score-bar-fill"
                                        style={{ width: `${displayScore}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Probability Pill */}
                            <div className="hire-probability-box">
                                <div className="prob-text-group">
                                    <span className="prob-label">HIRE PROBABILITY</span>
                                    <span className="prob-value">94.8% High Likelihood</span>
                                </div>
                                <div className="prob-tag">Optimal Match</div>
                            </div>

                            {/* Detected Skills Grid */}
                            <div className="skills-detected-box">
                                <div className="skills-heading">DETECTED CORE SKILLS</div>
                                <div className="skills-chip-list">
                                    <span className="skill-chip"><FiCheck className="chip-check" /> React.js</span>
                                    <span className="skill-chip"><FiCheck className="chip-check" /> TypeScript</span>
                                    <span className="skill-chip"><FiCheck className="chip-check" /> Node.js</span>
                                    <span className="skill-chip"><FiCheck className="chip-check" /> Python</span>
                                    <span className="skill-chip"><FiCheck className="chip-check" /> PostgreSQL</span>
                                    <span className="skill-chip"><FiCheck className="chip-check" /> REST APIs</span>
                                </div>
                            </div>

                            {/* AI Recommendation Box */}
                            <div className="ai-recommendation-box">
                                <div className="ai-rec-header">
                                    <HiSparkles className="rec-sparkle" />
                                    <span>AI RECOMMENDATION</span>
                                </div>
                                <p className="rec-description">
                                    Add <strong>Docker</strong> &amp; <strong>AWS CI/CD</strong> to increase recruiter shortlisting by <strong>+18%</strong>.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;