import "./Register.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    FaUserGraduate,
    FaBuilding,
    FaRobot,
    FaArrowRight,
    FaCheckCircle,
    FaUsers,
    FaBriefcase
} from "react-icons/fa";
import api from "../../services/api";

function Register() {

    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalRegistered: 0,
        jobSeekers: 0,
        recruiters: 0,
        resumesAnalyzed: 0,
        avgScore: 95
    });

    useEffect(() => {
        api.get("/stats")
            .then((res) => {
                if (res.data && res.data.stats) {
                    setStats(res.data.stats);
                }
            })
            .catch(() => {});
    }, []);

    return (

        <div className="register-page">

            {/* LEFT SECTION */}

            <div className="left-section">

                <div className="logo">

                    <FaRobot />

                    <span>HireAI</span>

                </div>

                <span className="badge">

                    AI Powered Recruitment Platform

                </span>

                <h1>

                    Start your journey with
                    <span> HireAI</span>

                </h1>

                <p>

                    Whether you're searching for your dream job or hiring
                    the perfect candidate, HireAI gives you intelligent AI
                    tools to make recruitment faster, smarter and easier.

                </p>

                

            </div>

            {/* RIGHT SECTION */}

            <div className="right-section">

                <h2>

                    Choose Your Account

                </h2>

                <p>

                    Select how you want to use HireAI.

                </p>

                <div className="register-cards">
                                        {/* =======================
                        JOB SEEKER CARD
                    ======================= */}

                    <div
                        className="register-card"
                        onClick={() => navigate("/register/job-seeker")}
                    >

                        <div className="register-card-icon seeker-icon">

                            <FaUserGraduate />

                        </div>

                        <h3 className="register-card-title">

                            Job Seeker

                        </h3>

                        <p className="register-card-description">

                            Build your profile, analyze your resume and
                            prepare for interviews using AI-powered tools.

                        </p>

                            <div className="register-card-features">

                                <div className="register-feature-item">

                                    <FaUsers />

                                    <span>Resume Analysis</span>

                                </div>

                                <div className="register-feature-item">

                                    <FaUsers />

                                    <span>Resume Score Report</span>

                                </div>

                                <div className="register-feature-item">

                                    <FaUsers />

                                    <span>AI Interview Practice</span>

                                </div>

                                <div className="register-feature-item">

                                    <FaUsers />

                                    <span>Job Recommendations</span>

                                </div>

                            </div>

                        <button className="register-card-btn">

                            Continue

                            <FaArrowRight />

                        </button>

                    </div>

                    {/* =======================
                        RECRUITER CARD
                    ======================= */}

                    <div
                        className="register-card"
                        onClick={() => navigate("/register/recruiter")}
                    >

                        <div className="register-card-icon recruiter-icon">

                            <FaBuilding />

                        </div>

                        <h3 className="register-card-title">

                            Recruiter

                        </h3>

                        <p className="register-card-description">

                            Find talented candidates faster using AI-powered
                            hiring and recruitment solutions.

                        </p>

                        <div className="register-card-features">

                            <div className="register-feature-item">

                                <FaBriefcase />

                                <span>Post Jobs</span>

                            </div>

                            <div className="register-feature-item">

                                <FaBriefcase />

                                <span>Candidate Screening</span>

                            </div>

                            <div className="register-feature-item">

                                <FaBriefcase />

                                <span>Recruitment Dashboard</span>

                            </div>

                            <div className="register-feature-item">

                                <FaBriefcase />

                                <span>Hiring Analytics</span>

                            </div>

                        </div>

                        <button className="register-card-btn recruiter-btn">

                            Continue

                            <FaArrowRight />

                        </button>

                    </div>

                </div>
                                {/* =======================
                    STATS
                ======================= */}

                <div className="stats">

                    <div>

                        <h2>{stats.jobSeekers || stats.totalRegistered || 0}+</h2>

                        <p>Job Seekers</p>

                    </div>

                    <div>

                        <h2>{stats.recruiters || 0}+</h2>

                        <p>Recruiters</p>

                    </div>

                    <div>

                        <h2>{stats.avgScore || 95}%</h2>

                        <p>Resume Accuracy</p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Register;