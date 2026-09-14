import { useEffect, useState } from "react";

import {
    useNavigate
} from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import {
    getMyApplications
} from "../../services/applicationService";

import AIFeedbackCard from "../../components/AIFeedbackCard/AIFeedbackCard";
import "./MyApplications.css";


function MyApplications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [expandedFeedbacks, setExpandedFeedbacks] = useState({});

    const toggleFeedback = (id) => {
        setExpandedFeedbacks(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };


    // ==========================================
    // Load My Applications
    // ==========================================

    useEffect(() => {

        loadApplications();

    }, []);


    const loadApplications = async () => {

        try {

            setLoading(true);

            setError("");


            const data =
                await getMyApplications();


            setApplications(
                data.applications || []
            );

        }

        catch (err) {

            console.log(err);

            setError(

                err.response?.data?.message ||

                "Failed to load your applications."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // Start AI Interview
    // ==========================================

    const handleStartInterview = (application) => {

        if (!application?.job_id) {

            alert(
                "Job information is missing for this application."
            );

            return;

        }


        navigate(

            "/ai-interview",

            {

                state: {

                    mode: "job",

                    jobId: application.job_id,

                    role:
                        application.title ||

                        "Software Developer"

                }

            }

        );

    };


    // ==========================================
    // Format Date
    // ==========================================

    const formatDate = (date) => {

        if (!date) {

            return "N/A";

        }


        return new Date(date).toLocaleDateString(

            "en-IN",

            {

                day: "2-digit",

                month: "short",

                year: "numeric"

            }

        );

    };


    // ==========================================
    // Get Status
    // ==========================================

    const getStatusInfo = (status) => {

        switch (status) {

            case "SHORTLISTED":

                return {

                    className:
                        "status-shortlisted",

                    icon: "🟢",

                    text: "Shortlisted"

                };


            case "REJECTED":

                return {

                    className:
                        "status-rejected",

                    icon: "🔴",

                    text: "Rejected"

                };


            case "PENDING":

            default:

                return {

                    className:
                        "status-pending",

                    icon: "🟡",

                    text: "Pending"

                };

        }

    };


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (

            <div className="dashboard">

                <Sidebar />


                <div className="main-content">

                    <Topbar />


                    <div className="my-applications-container">

                        <div className="applications-loading">

                            <div className="loading-spinner"></div>

                            <h2>

                                Loading Your Applications...

                            </h2>

                            <p>

                                Please wait.

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // Main UI
    // ==========================================

    return (

        <div className="dashboard">

            <Sidebar />


            <div className="main-content">

                <Topbar />


                <div className="my-applications-container">


                    {/* ======================================
                        Header
                    ====================================== */}

                    <div className="my-applications-header">

                        <div>

                            <h1>

                                📋 My Applications

                            </h1>

                            <p>

                                Track your job applications,
                                interview results and recruiter decisions.

                            </p>

                        </div>


                        <div className="total-applications">

                            <strong>

                                {applications.length}

                            </strong>

                            <span>

                                Applications

                            </span>

                        </div>

                    </div>


                    {/* ======================================
                        Error
                    ====================================== */}

                    {

                        error &&

                        (

                            <div className="applications-error">

                                <strong>

                                    ⚠️ Something went wrong

                                </strong>

                                <p>

                                    {error}

                                </p>


                                <button

                                    onClick={loadApplications}

                                >

                                    🔄 Try Again

                                </button>

                            </div>

                        )

                    }


                    {/* ======================================
                        Empty
                    ====================================== */}

                    {

                        !error &&

                        applications.length === 0 &&

                        (

                            <div className="no-applications">

                                <div className="empty-icon">

                                    📭

                                </div>


                                <h2>

                                    No Applications Yet

                                </h2>


                                <p>

                                    You haven't submitted any job
                                    applications yet.

                                </p>


                                <button

                                    onClick={() =>

                                        navigate("/jobs")

                                    }

                                >

                                    💼 Browse Jobs

                                </button>

                            </div>

                        )

                    }


                    {/* ======================================
                        Applications
                    ====================================== */}

                    {

                        !error &&

                        applications.length > 0 &&

                        (

                            <div className="applications-list">

                                {

                                    applications.map(

                                        (application) => {


                                            const status =

                                                getStatusInfo(

                                                    application.status

                                                );


                                            return (

                                                <div

                                                    className="my-application-card"

                                                    key={
                                                        application.application_id
                                                    }

                                                >


                                                    {/* ==================================
                                                        Application Header
                                                    ================================== */}

                                                    <div className="application-top">


                                                        <div className="job-heading">

                                                            <div className="company-icon">

                                                                {

                                                                    application.company

                                                                        ?.charAt(0)

                                                                        ?.toUpperCase()

                                                                        || "C"

                                                                }

                                                            </div>


                                                            <div>

                                                                <h2>

                                                                    {
                                                                        application.title
                                                                    }

                                                                </h2>


                                                                <p>

                                                                    🏢

                                                                    {" "}

                                                                    {
                                                                        application.company
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>


                                                        <div

                                                            className={
                                                                `application-status ${status.className}`
                                                            }

                                                        >

                                                            {status.icon}

                                                            {" "}

                                                            {status.text}

                                                        </div>


                                                    </div>


                                                    {/* ==================================
                                                        Job Information
                                                    ================================== */}

                                                    <div className="job-information">


                                                        <div className="job-info-item">

                                                            <span>

                                                                📍 Location

                                                            </span>

                                                            <strong>

                                                                {

                                                                    application.location ||

                                                                    "Not Provided"

                                                                }

                                                            </strong>

                                                        </div>


                                                        <div className="job-info-item">

                                                            <span>

                                                                💰 Salary

                                                            </span>

                                                            <strong>

                                                                {

                                                                    application.salary ||

                                                                    "Not Provided"

                                                                }

                                                            </strong>

                                                        </div>


                                                        <div className="job-info-item">

                                                            <span>

                                                                💼 Employment

                                                            </span>

                                                            <strong>

                                                                {

                                                                    application.employment_type ||

                                                                    "Not Provided"

                                                                }

                                                            </strong>

                                                        </div>


                                                        <div className="job-info-item">

                                                            <span>

                                                                📅 Applied

                                                            </span>

                                                            <strong>

                                                                {

                                                                    formatDate(

                                                                        application.applied_at

                                                                    )

                                                                }

                                                            </strong>

                                                        </div>


                                                    </div>


                                                    {/* ==================================
                                                        AI INTERVIEW
                                                    ================================== */}

                                                    <div className="interview-section">


                                                        <div className="section-heading">

                                                            <h3>

                                                                🤖 AI Interview

                                                            </h3>


                                                            {

                                                                application.interview_completed

                                                                    ?

                                                                    (

                                                                        <span className="interview-completed">

                                                                            ✅ Completed

                                                                        </span>

                                                                    )

                                                                    :

                                                                    (

                                                                        <span className="interview-not-completed">

                                                                            ⏳ Not Completed

                                                                        </span>

                                                                    )

                                                            }

                                                        </div>


                                                        {/* ==================================
                                                            INTERVIEW CONTENT (COMPLETED VS PENDING)
                                                        ================================== */}
                                                        {Boolean(application.interview_completed) ? (
                                                            <>
                                                                <div className="interview-scores">
                                                                    <div className="interview-score-item">
                                                                        <span>Technical</span>
                                                                        <strong>{application.technical_score ?? 0}</strong>
                                                                    </div>

                                                                    <div className="interview-score-item">
                                                                        <span>Communication</span>
                                                                        <strong>{application.communication_score ?? 0}</strong>
                                                                    </div>

                                                                    <div className="interview-score-item">
                                                                        <span>Confidence</span>
                                                                        <strong>{application.confidence_score ?? 0}</strong>
                                                                    </div>

                                                                    <div className="interview-score-item overall">
                                                                        <span>Overall</span>
                                                                        <strong>{application.overall_score ?? 0}</strong>
                                                                    </div>
                                                                </div>

                                                                <div className="recommendation-row">
                                                                    <span>🧠 AI Recommendation</span>
                                                                    <strong>{application.recommendation || "Not Available"}</strong>
                                                                </div>

                                                                {Boolean(application.ai_feedback) && (
                                                                    <AIFeedbackCard
                                                                        feedback={application.ai_feedback}
                                                                        score={application.overall_score}
                                                                        recommendation={application.recommendation}
                                                                    />
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="interview-waiting">
                                                                <div>
                                                                    <p>Your AI interview is still pending.</p>
                                                                    <span>You can complete it whenever you're ready.</span>
                                                                </div>

                                                                <button
                                                                    className="start-interview-btn"
                                                                    onClick={() => handleStartInterview(application)}
                                                                >
                                                                    🎤 Start AI Interview
                                                                </button>
                                                            </div>
                                                        )}


                                                    </div>


                                                    {/* ==================================
                                                        Application Result
                                                    ================================== */}

                                                    {

                                                        application.status === "SHORTLISTED"

                                                        &&

                                                        (

                                                            <div className="decision-box shortlisted-box">

                                                                <div className="decision-icon">

                                                                    🎉

                                                                </div>


                                                                <div>

                                                                    <h3>

                                                                        Congratulations!

                                                                    </h3>


                                                                    <p>

                                                                        You have been shortlisted
                                                                        for the next round.

                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )

                                                    }


                                                    {

                                                        application.status === "REJECTED"

                                                        &&

                                                        (

                                                            <div className="decision-box rejected-box">

                                                                <div className="decision-icon">

                                                                    💙

                                                                </div>


                                                                <div>

                                                                    <h3>

                                                                        Application Update

                                                                    </h3>


                                                                    <p>

                                                                        Unfortunately, your
                                                                        application was not selected
                                                                        for the next round.

                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )

                                                    }


                                                    {

                                                        application.status === "PENDING"

                                                        &&

                                                        (

                                                            <div className="decision-box pending-box">

                                                                <div className="decision-icon">

                                                                    ⏳

                                                                </div>


                                                                <div>

                                                                    <h3>

                                                                        Application Under Review

                                                                    </h3>


                                                                    <p>

                                                                        The recruiter is currently
                                                                        reviewing your application.

                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )

                                                    }


                                                </div>

                                            );

                                        }

                                    )

                                }

                            </div>

                        )

                    }


                </div>

            </div>

        </div>

    );

}


export default MyApplications;