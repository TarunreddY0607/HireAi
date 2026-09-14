import "./Features.css";
import {
    FiCpu,
    FiFileText,
    FiTrendingUp,
    FiBriefcase,
    FiUsers,
    FiVideo
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

function Features() {
    const features = [
        {
            icon: <FiCpu />,
            title: "AI Resume Intelligence",
            description:
                "Deep neural parsing evaluates ATS compatibility, keyword distribution, and industry benchmark alignment in milliseconds."
        },
        {
            icon: <FiTrendingUp />,
            title: "Dynamic ATS Score",
            description:
                "Receive granular scoring across formatting, impact metrics, and role-specific competencies with real-time feedback."
        },
        {
            icon: <FiFileText />,
            title: "Smart Resume Builder",
            description:
                "Craft recruiter-ready, ATS-compliant resumes with smart phrasing suggestions and precision formatting tools."
        },
        {
            icon: <FiBriefcase />,
            title: "Intelligent Job Matching",
            description:
                "Discover curated job opportunities weighted by skill alignment and candidate probability models."
        },
        {
            icon: <FiUsers />,
            title: "Enterprise Recruiter Hub",
            description:
                "Empower talent acquisition teams with automated shortlisting, skill verification, and deep talent pipeline metrics."
        },
        {
            icon: <FiVideo />,
            title: "AI Mock Interviews",
            description:
                "Simulate technical and behavioral interview sessions with automated AI feedback on responses and speech delivery."
        }
    ];

    return (
        <section className="features" id="features">
            <div className="features-container">
                {/* ── Center Header ────────────────── */}
                <div className="features-header">
                    <span className="features-badge">
                        <HiSparkles className="badge-sparkle" />
                        <span>PLATFORM CAPABILITIES</span>
                    </span>
                    <h2>
                        Everything You Need to <span className="features-gradient-text">Accelerate Hiring</span>
                    </h2>
                    <p>
                        Engineered with state-of-the-art AI to streamline resume parsing, ATS qualification, 
                        and talent acquisition into a unified executive workspace.
                    </p>
                </div>

                {/* ── 3 and 3 Grid ─────────────────── */}
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div className="feature-card" key={index}>
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon">
                                    {feature.icon}
                                </div>
                            </div>
                            <h3>
                                {feature.title}
                            </h3>
                            <p>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;