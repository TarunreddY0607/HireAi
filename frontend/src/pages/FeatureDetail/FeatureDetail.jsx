import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./FeatureDetail.css";

const FEATURE_DATA = {
    "resume-analysis": {
        title: "AI Resume Analysis",
        icon: "🤖",
        subtitle: "Instant AI-powered feedback to optimize your resume value.",
        description: "Our state-of-the-art AI scanner reads your resume details, parses technical skills, and matches them against top industry baselines. Get actionable insights into how to phrase your experience and improve your layout structure.",
        highlights: [
            "Real-time parsing and extraction using high-performance Qwen-27B.",
            "Actionable improvement suggestions tailored to your career path.",
            "Personalized summary suggestions to highlight your unique value.",
            "Clean technical skills list grouping to align with industry expectations."
        ]
    },
    "ats-score": {
        title: "Resume Score Compatibility",
        icon: "📈",
        subtitle: "Understand how recruitment systems evaluate your profile.",
        description: "Nearly 99% of top companies use automated resume scoring systems to filter resumes before a human recruiter sees them. HireAI evaluates your resume to calculate your score and tells you exactly what keywords and skills are missing.",
        highlights: [
            "Accurate resume score simulation out of 100.",
            "Visual warning highlights for short or incomplete skills sections.",
            "Detailed breakdown of keyword matching against target roles.",
            "Formatting scanner to prevent parser layout bugs."
        ]
    },
    "resume-builder": {
        title: "AI Resume Builder",
        icon: "📝",
        subtitle: "Craft a professional resume with guided sections and templates.",
        description: "Building a resume from scratch is tedious. Our Resume Builder simplifies the process by giving you quick-select dropdown lists for popular technical skills, auto-formatting, and customizable sections.",
        highlights: [
            "Quick-select dropdown for 38+ popular languages, frameworks and databases.",
            "Clean interactive chips to manage your skills with a single click.",
            "Fully structured fields for Education, Projects, and Certifications.",
            "Seamless live sync between the editor and your database profile."
        ]
    },
    "job-matching": {
        title: "Smart Job Matching",
        icon: "💼",
        subtitle: "Find career opportunities tailored precisely to your skillset.",
        description: "No more scrolling through hundreds of irrelevant job postings. HireAI matches your parsed skills, experience levels, and career interests against open job postings to recommend the best fit for your path.",
        highlights: [
            "AI-powered skills match matching your profile to active job requirements.",
            "Direct application link requiring AI practice interview completion.",
            "Filter options for salary, location, and employment type.",
            "Automatic notifications for highly compatible roles."
        ]
    },
    "recruiter-dashboard": {
        title: "Recruiter Dashboard",
        icon: "👤",
        subtitle: "Review, compare, and shortlist top-tier candidates efficiently.",
        description: "For employers, HireAI offers a central portal to post job descriptions, track applicants, compare automated resume scores, and review candidate profiles along with their practice interview evaluations.",
        highlights: [
            "Centralized job posting and vacancy management system.",
            "Ranked applicant listings based on computed compatibility scores.",
            "Review candidate practice interview transcript and communication metrics.",
            "One-click shortlisting and profile status updates."
        ]
    },
    "interview-prep": {
        title: "AI Interview Preparation",
        icon: "💻",
        subtitle: "Practice personalized, interactive interview simulations.",
        description: "Improve your confidence before real technical and behavioral interviews. Our AI recruiter generates job-specific questions, records your responses (voice or text), and evaluates communication and technical depth.",
        highlights: [
            "Voice-to-text integration or convenient text-based fallback typing.",
            "Personalized questions matching your resume details and applied roles.",
            "Comprehensive grading (Technical depth, Communication, and Confidence scores).",
            "Detailed AI recommendations and STAR-method ideal answers."
        ]
    }
};

function FeatureDetail() {
    const { featureKey } = useParams();
    const navigate = useNavigate();

    const feature = FEATURE_DATA[featureKey];

    if (!feature) {
        return (
            <div className="home">
                <Navbar />
                <div className="feature-not-found">
                    <h2>Feature Not Found</h2>
                    <button onClick={() => navigate("/")}>Back to Homepage</button>
                </div>
                <Footer />
            </div>
        );
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // job_seeker or recruiter

    // Direct user to appropriate dashboard if logged in
    let ctaPath = "/register";
    if (token) {
        ctaPath = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/jobseeker";
    }

    return (
        <div className="home">
            <Navbar />
            
            <div className="feature-detail-container">
                <div className="feature-detail-header">
                    <div className="feature-detail-icon-badge">
                        {feature.icon}
                    </div>
                    <h1>{feature.title}</h1>
                    <p className="feature-detail-subtitle">{feature.subtitle}</p>
                </div>

                <div className="feature-detail-content-card">
                    <div className="feature-detail-grid">
                        <div className="feature-detail-desc">
                            <h2>Detailed Description</h2>
                            <p>{feature.description}</p>
                            <button className="feature-detail-cta" onClick={() => navigate(ctaPath)}>
                                {token ? "Go to Dashboard" : "Get Started Now"}
                            </button>
                        </div>

                        <div className="feature-detail-highlights">
                            <h2>Key Features & Highlights</h2>
                            <ul>
                                {feature.highlights.map((highlight, index) => (
                                    <li key={index}>
                                        <span className="check-icon">✓</span>
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="back-home-button-container">
                    <button className="back-home-btn" onClick={() => navigate("/")}>
                        ← Back to Homepage
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default FeatureDetail;
