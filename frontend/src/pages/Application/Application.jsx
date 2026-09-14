import { useEffect, useState } from "react";

import {
    useParams,
    useNavigate,
    useLocation
} from "react-router-dom";

import api from "../../services/api";

import Sidebar from "../../components/Sidebar/Sidebar";

import Topbar from "../../components/Topbar/Topbar";

import { getJobById } from "../../services/jobService";

import { submitApplication } from "../../services/applicationService";

import "./Application.css";


function Application() {

    const { jobId } = useParams();

    const navigate = useNavigate();

    const location = useLocation();


    // ==========================================
    // Interview Data
    // ==========================================

    const interviewCompleted =
        location.state?.interviewCompleted || false;

    const interviewFeedback =
        location.state?.feedback || null;


    // ==========================================
    // State
    // ==========================================

    const [job, setJob] = useState(null);

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);


    // ==========================================
    // Load Application Page
    // ==========================================

    useEffect(() => {

        loadPage();

    }, [jobId]);


    const loadPage = async () => {

        try {

            const jobRes = await getJobById(jobId);

            setJob(jobRes.job);


            const profileRes = await api.get("/profile");

            setProfile(profileRes.data.profile);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // Submit Application
    // ==========================================

    const handleSubmitApplication = async () => {

        if (!interviewCompleted) {

            alert(
                "Please complete the AI interview first."
            );

            return;

        }


        try {

            setSubmitting(true);


            const data = await submitApplication(jobId);


            alert(
                data.message ||
                "Application Submitted Successfully"
            );


            // Go back to available jobs

            navigate("/jobs");

        }

        catch (err) {

            console.log(err);


            alert(

                err.response?.data?.message ||

                "Failed to submit application"

            );

        }

        finally {

            setSubmitting(false);

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

                    <div className="application-container">

                        <h2>

                            Loading Application...

                        </h2>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // Job Not Found
    // ==========================================

    if (!job) {

        return (

            <div className="dashboard">

                <Sidebar />

                <div className="main-content">

                    <Topbar />

                    <div className="application-container">

                        <h2>

                            Job Not Found

                        </h2>

                        <button

                            onClick={() => navigate("/jobs")}

                        >

                            Back To Jobs

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="dashboard">

            <Sidebar />


            <div className="main-content">

                <Topbar />


                <div className="application-container">


                    {/* ======================================
                        Header
                    ====================================== */}

                    <div className="application-header">

                        <h1>

                            🚀 Job Application

                        </h1>

                        <p>

                            Complete the AI interview before
                            submitting your application.

                        </p>

                    </div>


                    {/* ======================================
                        Job Details
                    ====================================== */}

                    <div className="application-card">

                        <h2>

                            💼 Job Details

                        </h2>


                        <div className="job-details">


                            <div>

                                <strong>

                                    Job Title

                                </strong>

                                <span>

                                    {job.title}

                                </span>

                            </div>


                            <div>

                                <strong>

                                    Company

                                </strong>

                                <span>

                                    {job.company}

                                </span>

                            </div>


                            <div>

                                <strong>

                                    Location

                                </strong>

                                <span>

                                    {job.location}

                                </span>

                            </div>


                            <div>

                                <strong>

                                    Salary

                                </strong>

                                <span>

                                    {job.salary}

                                </span>

                            </div>


                            <div>

                                <strong>

                                    Experience

                                </strong>

                                <span>

                                    {job.experience}

                                </span>

                            </div>


                            <div>

                                <strong>

                                    Employment

                                </strong>

                                <span>

                                    {job.employment_type}

                                </span>

                            </div>


                        </div>

                    </div>





                    {/* ======================================
                        AI Resume Analysis
                    ====================================== */}

                    {profile?.is_analyzed === 1 && (

                        <div className="application-card">

                            <h2>

                                🤖 AI Resume Analysis

                            </h2>


                            <div className="analysis-grid">


                                <div className="analysis-item">

                                    <h3>

                                        Resume Score

                                    </h3>

                                    <span>

                                        {profile?.ats_score ?? 0}%

                                    </span>

                                </div>


                                <div className="analysis-item">

                                    <h3>

                                        Hire Probability

                                    </h3>

                                    <span>

                                        {profile?.hire_probability ?? 0}%

                                    </span>

                                </div>


                            </div>


                            {/* Skills */}

                            <div className="skills-section">

                                <h3>

                                    Skills

                                </h3>


                                <div className="skills">

                                    {

                                        profile?.skills?.length > 0

                                        ?

                                        profile.skills.map(

                                            (skill, index) => (

                                                <span

                                                    className="skill"

                                                    key={index}

                                                >

                                                    {skill}

                                                </span>

                                            )

                                        )

                                        :

                                        <span>

                                            No skills found

                                        </span>

                                    }

                                </div>

                            </div>


                            {/* Missing Skills */}

                            <div className="skills-section">

                                <h3>

                                    Missing Skills

                                </h3>


                                <div className="skills">

                                    {

                                        profile?.missing_skills?.length > 0

                                        ?

                                        profile.missing_skills.map(

                                            (skill, index) => (

                                                <span

                                                    className="skill"

                                                    key={index}

                                                >

                                                    {skill}

                                                </span>

                                            )

                                        )

                                        :

                                        <span>

                                            No missing skills

                                        </span>

                                    }

                                </div>

                            </div>

                        </div>

                    )}


                    {/* ======================================
                        AI Interview
                    ====================================== */}

                    <div className="application-card">

                        <h2>

                            🎤 AI Interview

                        </h2>


                        <p>

                            Complete the AI interview before
                            submitting your application.

                        </p>


                        <div className="interview-status">

                            <strong>

                                Interview Status

                            </strong>


                            <span>

                                {

                                    interviewCompleted

                                    ?

                                    "✅ Completed"

                                    :

                                    "❌ Not Started"

                                }

                            </span>

                        </div>


                        {/* Interview Feedback */}

                        {

                            interviewFeedback && (

                                <div className="feedback-summary">

                                    <p>

                                        <strong>

                                            Score:

                                        </strong>

                                        {" "}

                                        {interviewFeedback.score}

                                    </p>


                                    <p>

                                        {interviewFeedback.feedback}

                                    </p>

                                </div>

                            )

                        }


                        {/* Interview Button */}

                        {
                            !interviewCompleted && (
                                <button

                                    className="interview-btn"

                                    onClick={() =>

                                        navigate(

                                            "/ai-interview",

                                            {

                                                state: {

                                                    mode: "job",

                                                    jobId: job.id

                                                }

                                            }

                                        )

                                    }

                                >

                                    🚀 Start AI Interview

                                </button>
                            )
                        }

                    </div>


                    {/* ======================================
                        Application Status
                    ====================================== */}

                    <div className="application-card">

                        <h2>

                            📋 Application Status

                        </h2>


                        <div className={`status-box ${interviewCompleted ? "status-success" : "status-error"}`}>

                            {

                                interviewCompleted

                                ?

                                "✅ Ready To Submit"

                                :

                                "❌ Complete Interview First"

                            }

                        </div>


                        <button

                            className="submit-btn"

                            disabled={

                                !interviewCompleted ||

                                submitting

                            }

                            onClick={handleSubmitApplication}

                        >

                            {

                                submitting

                                ?

                                "⏳ Submitting..."

                                :

                                "✅ Submit Application"

                            }

                        </button>

                    </div>


                </div>

            </div>

        </div>

    );

}


export default Application;