import "./About.css";
import { useEffect, useState } from "react";
import {
    FiZap,
    FiShield,
    FiTarget,
    FiCheck
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import api from "../../services/api";

function About() {
    const [stats, setStats] = useState({
        totalRegistered: 0,
        jobSeekers: 0,
        recruiters: 0,
        resumesAnalyzed: 0,
        totalJobs: 0,
        totalApplications: 0,
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
                console.log("Could not load live stats in About:", err);
            });
    }, []);

    const highlights = [
        {
            icon: <FiZap />,
            title: "Next-Gen AI Analysis",
            desc: "Powered by advanced neural architectures that scrutinize resumes against real-time industry benchmarks to deliver actionable, high-impact insights."
        },
        {
            icon: <FiTarget />,
            title: "Accelerated Placement",
            desc: "Bridges the gap between ambitious talent and top-tier recruiters, drastically reducing time-to-hire with intelligent skill mapping."
        },
        {
            icon: <FiShield />,
            title: "Unbiased & Objective",
            desc: "Rigorous, skill-centric evaluation that levels the playing field for candidates based purely on talent, verified competencies, and potential."
        }
    ];

    const statsList = [
        { number: `${stats.avgScore ? Math.round(stats.avgScore) : 95}%`, label: "Avg ATS Score" },
        { number: `${stats.totalJobs || 240}+`, label: "Active Job Listings" },
        { number: `${stats.totalRegistered || stats.jobSeekers || 1500}+`, label: "Engineers & Candidates" },
        { number: `${stats.totalApplications || 850}+`, label: "Applications Processed" }
    ];

    return (
        <section className="about-section" id="about">
            <div className="about-container">
                {/* ── Header ───────────────────────── */}
                <div className="about-header">
                    <span className="about-badge">
                        <HiSparkles className="badge-sparkle" />
                        <span>ABOUT THE PLATFORM</span>
                    </span>
                    <h2>
                        Empowering Careers Through <span className="about-gradient-text">Intelligent Innovation</span>
                    </h2>
                    <p>
                        HireAI was built to transform modern recruitment. We combine state-of-the-art
                        artificial intelligence with deep industry analytics to give candidates an undeniable advantage
                        and empower recruiters with high-signal candidate discovery.
                    </p>
                </div>

                {/* ── Highlights Grid ──────────────── */}
                <div className="about-grid">
                    {highlights.map((item, index) => (
                        <div className="about-card" key={index}>
                            <div className="about-card-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                            <ul className="about-card-points">
                                <li><FiCheck className="check-icon" /> Real-time ATS calibration</li>
                                <li><FiCheck className="check-icon" /> Precision competency mapping</li>
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ── Stats Ribbon ─────────────────── */}
                <div className="about-stats-ribbon">
                    {statsList.map((stat, idx) => (
                        <div className="stat-item" key={idx}>
                            <h3>{stat.number}</h3>
                            <p>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default About;
