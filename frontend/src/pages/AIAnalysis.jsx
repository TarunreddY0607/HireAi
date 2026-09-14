import { useEffect, useState } from "react";
import api from "../services/api";
import "./AIAnalysis.css";

function AIAnalysis() {

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // -----------------------------
    // Safe JSON Parser
    // -----------------------------
    const parseJSON = (value) => {

        if (!value) return [];

        if (Array.isArray(value)) return value;

        try {

            return JSON.parse(value);

        } catch {

            return [];

        }

    };

    // -----------------------------
    // Load Profile
    // -----------------------------
    useEffect(() => {

        const loadProfile = async () => {

            try {

                const token = localStorage.getItem("token");

                const res = await api.get("/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = res.data.profile;

                setProfile({

                    ...data,

                    skills: parseJSON(data.skills),

                    projects: parseJSON(data.projects),

                    education: parseJSON(data.education),

                    experience: parseJSON(data.experience),

                    certifications: parseJSON(data.certifications),

                    missing_skills: parseJSON(data.missing_skills),

                    ai_suggestions: parseJSON(data.ai_suggestions),

                    recommended_roles: parseJSON(data.recommended_roles)

                });

            } catch (err) {

                console.log(err);

            } finally {

                setLoading(false);

            }

        };

        loadProfile();

    }, []);

    if (loading) {

        return (

            <div className="analysis-loading">

                <h2>Loading AI Analysis...</h2>

            </div>

        );

    }

    if (!profile) {

        return (

            <div className="analysis-loading">

                <h2>No Resume Analysis Available</h2>

            </div>

        );

    }

    return (
        <div className="analysis-container">

    <div className="analysis-header">

        <h1>🤖 AI Resume Analysis Report</h1>

        <p>
            A complete AI analysis of your uploaded resume.
        </p>

    </div>

    <div className="score-wrapper">

        <div className="score-card">

            <h3>Resume Score</h3>

            <h1>{profile.ats_score}%</h1>

        </div>

        <div className="score-card">

            <h3>Hire Probability</h3>

            <h1>{profile.hire_probability}%</h1>

        </div>

    </div>

    <div className="analysis-grid">

        <div className="analysis-card">

            <h2>💻 Skills</h2>

            <ul>

                {profile.skills.length > 0 ? (

                    profile.skills.map((skill, index) => (

                        <li key={index}>{skill}</li>

                    ))

                ) : (

                    <li>No skills found.</li>

                )}

            </ul>

        </div>

        <div className="analysis-card">

            <h2>❌ Missing Skills</h2>

            <ul>

                {profile.missing_skills.length > 0 ? (

                    profile.missing_skills.map((skill, index) => (

                        <li key={index}>{skill}</li>

                    ))

                ) : (

                    <li>No missing skills.</li>

                )}

            </ul>

        </div>

        <div className="analysis-card">

            <h2>📂 Projects</h2>

            <ul>

                {profile.projects.length > 0 ? (

                    profile.projects.map((project, index) => (

                        <li key={index}>

                            <strong>

                                {project.title || "Project"}

                            </strong>

                            <br />

                            {project.description || project}

                        </li>

                    ))

                ) : (

                    <li>No projects found.</li>

                )}

            </ul>

        </div>

        <div className="analysis-card">

            <h2>🎓 Education</h2>

            <ul>

                {profile.education.length > 0 ? (

                    profile.education.map((edu, index) => (

                        <li key={index}>

                            <strong>

                                {edu.degree || edu}

                            </strong>

                            <br />

                            {edu.college}

                            <br />

                            {edu.year}

                        </li>

                    ))

                ) : (

                    <li>No education found.</li>

                )}

            </ul>

        </div>

        <div className="analysis-card">

            <h2>📜 Certifications</h2>

            <ul>

                {profile.certifications.length > 0 ? (

                    profile.certifications.map((cert, index) => (

                        <li key={index}>

                            {cert.title || cert}

                        </li>

                    ))

                ) : (

                    <li>No certifications found.</li>

                )}

            </ul>

        </div>

        <div className="analysis-card">

            <h2>💡 AI Suggestions</h2>

            <ul>

                {profile.ai_suggestions.length > 0 ? (

                    profile.ai_suggestions.map((item, index) => (

                        <li key={index}>{item}</li>

                    ))

                ) : (

                    <li>No suggestions.</li>

                )}

            </ul>

        </div>

        <div className="analysis-card">

            <h2>💼 Recommended Roles</h2>

            <ul>

                {profile.recommended_roles.length > 0 ? (

                    profile.recommended_roles.map((role, index) => (

                        <li key={index}>{role}</li>

                    ))

                ) : (

                    <li>No recommended roles.</li>

                )}

            </ul>

        </div>

    </div>

    <div className="download-section">

        <a
            href={`http://localhost:5000/api/profile/report/${profile.user_id}`}
            target="_blank"
            rel="noreferrer"
        >

            <button className="download-btn">

                📄 Download AI Report

            </button>

        </a>

    </div>
        </div>

);

}

export default AIAnalysis;