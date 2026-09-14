import { useEffect, useState } from "react";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import "./AIInterview.css";

import { getProfile } from "../../services/profileService";
import { getJobById } from "../../services/jobService";


function AIInterview() {

    const navigate = useNavigate();

    const location = useLocation();


    // ==========================================
    // INTERVIEW MODE
    // ==========================================

    const mode =
        location.state?.mode || "practice";

    const jobId =
        location.state?.jobId || null;


    // ==========================================
    // STATE
    // ==========================================

    const [profile, setProfile] =
        useState(null);

    const [job, setJob] =
        useState(null);

    const [loadingProfile, setLoadingProfile] =
        useState(true);

    const [loadingJob, setLoadingJob] =
        useState(false);

    const [role, setRole] =
        useState("");


    // ==========================================
    // PRACTICE MODE SETTINGS
    // ==========================================

    const [difficulty, setDifficulty] =
        useState("Easy");

    const [questions, setQuestions] =
        useState(5);


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {

        loadProfile();

    }, []);


    // ==========================================
    // LOAD JOB INTERVIEW
    // ==========================================

    useEffect(() => {

        if (
            mode === "job" &&
            jobId
        ) {

            loadJob();

        }

    }, [mode, jobId]);


    // ==========================================
    // LOAD PROFILE FUNCTION
    // ==========================================

    const loadProfile = async () => {

        try {

            setLoadingProfile(true);


            const data =
                await getProfile();


            setProfile(
                data.profile
            );


            // ==========================================
            // PRACTICE MODE
            // ==========================================

            if (
                mode === "practice"
            ) {

                if (
                    data.profile?.recommended_roles &&
                    data.profile.recommended_roles.length > 0
                ) {

                    setRole(
                        data.profile.recommended_roles[0]
                    );

                }

                else {

                    setRole(
                        "Software Developer"
                    );

                }

            }

        }

        catch (err) {

            console.log(
                "Profile Load Error:",
                err
            );

        }

        finally {

            setLoadingProfile(false);

        }

    };


    // ==========================================
    // LOAD JOB
    // ==========================================

    const loadJob = async () => {

        try {

            setLoadingJob(true);


            const data =
                await getJobById(jobId);


            if (
                data.success &&
                data.job
            ) {

                setJob(
                    data.job
                );


                // ==========================================
                // JOB TITLE = INTERVIEW ROLE
                // ==========================================

                setRole(
                    data.job.title ||
                    "Software Developer"
                );

            }

            else {

                alert(
                    "Unable to load job details."
                );

                navigate("/jobs");

            }

        }

        catch (err) {

            console.log(
                "Job Load Error:",
                err
            );


            alert(
                "Unable to load this job interview."
            );


            navigate("/jobs");

        }

        finally {

            setLoadingJob(false);

        }

    };


    // ==========================================
    // START INTERVIEW
    // ==========================================

    const startInterview = () => {

        // ==========================================
        // JOB INTERVIEW
        // ==========================================

        if (
            mode === "job"
        ) {

            if (!jobId) {

                alert(
                    "Job information is missing."
                );

                return;

            }


            if (!job) {

                alert(
                    "Job information is still loading."
                );

                return;

            }


            if (!role) {

                alert(
                    "Interview role is not available."
                );

                return;

            }


            // ==========================================
            // JOB INTERVIEW
            // NO MANUAL DIFFICULTY
            // NO MANUAL QUESTION COUNT
            // ==========================================

            navigate(
                "/interview-session",
                {
                    state: {

                        mode: "job",

                        jobId,

                        job,

                        role,

                        // AI decides these
                        difficulty: "AI",

                        questions: 10

                    }

                }
            );

            return;

        }


        // ==========================================
        // PRACTICE INTERVIEW
        // ==========================================

        if (!role) {

            alert(
                "Please select an interview role."
            );

            return;

        }


        navigate(
            "/interview-session",
            {
                state: {

                    mode: "practice",

                    role,

                    difficulty,

                    questions,

                    jobId: null,

                    job: null

                }

            }
        );

    };


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (
        loadingProfile ||
        (
            mode === "job" &&
            jobId &&
            loadingJob
        )
    ) {

        return (

            <div className="dashboard">

                <Sidebar />

                <div className="main-content">

                    <Topbar />

                    <div className="interview-container">

                        <div className="setup-card">

                            <div className="loading-interview">

                                <h2>
                                    🤖 Preparing AI Interview...
                                </h2>

                                <p>

                                    {
                                        mode === "job"

                                            ?

                                            "Loading the job details and preparing your interview."

                                            :

                                            "Loading your profile and preparing your practice interview."

                                    }

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Topbar />

                <div className="interview-container">


                    {/* ==========================================
                        PAGE TITLE
                    ========================================== */}

                    <h1>

                        🤖 AI Interview

                    </h1>


                    {/* ==========================================
                        RESUME INFORMATION
                    ========================================== */}

                    <div className="resume-card">

                        <h2>

                            Resume Loaded ✅

                        </h2>


                        <div className="resume-grid">


                            {/* NAME */}

                            <div>

                                <span>
                                    Name
                                </span>

                                <strong>

                                    {
                                        profile?.resume_full_name?.trim() ||
                                        profile?.resume_name?.trim() ||
                                        profile?.account_name?.trim() ||
                                        "Not Available"
                                    }

                                </strong>

                            </div>


                            {/* ATS SCORE */}

                            <div>

                                <span>
                                    Resume Score
                                </span>

                                <strong>

                                    {
                                        profile?.ats_score != null

                                            ?

                                            `${profile.ats_score}%`

                                            :

                                            "--"
                                    }

                                </strong>

                            </div>


                            {/* HIRE PROBABILITY */}

                            <div>

                                <span>
                                    Hire Probability
                                </span>

                                <strong>

                                    {
                                        profile?.hire_probability != null

                                            ?

                                            `${profile.hire_probability}%`

                                            :

                                            "--"
                                    }

                                </strong>

                            </div>


                        </div>

                    </div>


                    {/* ==========================================
                        JOB INTERVIEW INFORMATION
                    ========================================== */}

                    {
                        mode === "job" &&
                        job && (

                            <div className="job-interview-card">


                                {/* HEADER */}

                                <div className="job-interview-header">

                                    <span className="job-badge">

                                        🎯 JOB INTERVIEW

                                    </span>


                                    <h2>

                                        {job.title}

                                    </h2>


                                    <p className="job-company">

                                        🏢 {job.company}

                                    </p>

                                </div>


                                {/* JOB DETAILS */}

                                <div className="job-details">


                                    <div>

                                        <span>
                                            📍 Location
                                        </span>

                                        <strong>

                                            {
                                                job.location ||
                                                "Not Specified"
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            💼 Employment Type
                                        </span>

                                        <strong>

                                            {
                                                job.employment_type ||
                                                "Not Specified"
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            💰 Salary
                                        </span>

                                        <strong>

                                            {
                                                job.salary ||
                                                "Not Specified"
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            🧑‍💻 Experience
                                        </span>

                                        <strong>

                                            {
                                                job.experience ||
                                                "Not Specified"
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* ==========================================
                                    REQUIRED SKILLS
                                ========================================== */}

                                <div className="job-skills">

                                    <h3>

                                        Interview will focus on

                                    </h3>


                                    <div className="skills-list">

                                        {

                                            Array.isArray(
                                                job.required_skills
                                            )

                                                ?

                                                job.required_skills.map(

                                                    (
                                                        skill,
                                                        index
                                                    ) => (

                                                        <span
                                                            key={index}
                                                        >

                                                            {skill}

                                                        </span>

                                                    )

                                                )

                                                :

                                                null

                                        }

                                    </div>

                                </div>


                                {/* ==========================================
                                    AI INFORMATION
                                ========================================== */}

                                <p className="job-interview-info">

                                    🤖 The AI will prepare questions based
                                    on this job, its required skills, and
                                    your resume.

                                </p>

                            </div>

                        )
                    }


                    {/* ==========================================
                        INTERVIEW SETUP
                    ========================================== */}

                    <div className="setup-card">


                        <h2>

                            {
                                mode === "job"

                                    ?

                                    "Interview Ready"

                                    :

                                    "Practice Interview Setup"

                            }

                        </h2>


                        {/* ==========================================
                            JOB INTERVIEW MODE
                        ========================================== */}

                        {
                            mode === "job"

                                ?

                                (

                                    <div className="job-ready-section">


                                        {/* ROLE */}

                                        <label>

                                            Interview Role

                                        </label>


                                        <div className="locked-role">

                                            💼 {
                                                role ||
                                                "Loading..."
                                            }

                                        </div>


                                        <small className="field-note">

                                            This role comes automatically
                                            from the job you applied for.

                                        </small>


                                        {/* ==========================================
                                            AI AUTOMATIC CONFIGURATION
                                        ========================================== */}

                                        <div className="ai-auto-config">

                                            <div className="auto-config-icon">

                                                🤖

                                            </div>


                                            <div>

                                                <h3>

                                                    AI Interview Configuration

                                                </h3>


                                                <p>

                                                    You don't need to choose
                                                    difficulty or number of
                                                    questions.

                                                    <br />

                                                    The AI will automatically
                                                    determine the interview
                                                    based on the job,
                                                    required skills, and your
                                                    resume.

                                                </p>

                                            </div>

                                        </div>


                                        {/* ==========================================
                                            WHAT AI WILL CHECK
                                        ========================================== */}

                                        <div className="interview-focus">

                                            <h3>

                                                🎯 What will be evaluated?

                                            </h3>


                                            <div className="focus-items">

                                                <span>
                                                    💻 Technical Knowledge
                                                </span>

                                                <span>
                                                    🗣️ Communication
                                                </span>

                                                <span>
                                                    🧠 Problem Solving
                                                </span>

                                                <span>
                                                    💪 Confidence
                                                </span>

                                            </div>

                                        </div>


                                    </div>

                                )


                                :

                                (

                                    /* ==========================================
                                       PRACTICE MODE
                                    ========================================== */

                                    <div className="setup-fields-grid">

                                        {/* ROLE */}
                                        <div className="setup-field">
                                            <label>
                                                Interview Role
                                            </label>
                                            <select
                                                value={role}
                                                onChange={(e) =>
                                                    setRole(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option>
                                                    Based on Resume
                                                </option>
                                                <option>
                                                    Software Developer
                                                </option>
                                                <option>
                                                    Java Developer
                                                </option>
                                                <option>
                                                    Python Developer
                                                </option>
                                                <option>
                                                    Frontend Developer
                                                </option>
                                                <option>
                                                    Backend Developer
                                                </option>
                                                <option>
                                                    Full Stack Developer
                                                </option>
                                                <option>
                                                    AI Engineer
                                                </option>
                                                <option>
                                                    Data Analyst
                                                </option>
                                            </select>
                                        </div>

                                        {/* DIFFICULTY */}
                                        <div className="setup-field">
                                            <label>
                                                Difficulty
                                            </label>
                                            <select
                                                value={difficulty}
                                                onChange={(e) =>
                                                    setDifficulty(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option>
                                                    Easy
                                                </option>
                                                <option>
                                                    Medium
                                                </option>
                                                <option>
                                                    Hard
                                                </option>
                                            </select>
                                        </div>

                                        {/* NUMBER OF QUESTIONS */}
                                        <div className="setup-field">
                                            <label>
                                                Number of Questions
                                            </label>
                                            <select
                                                value={questions}
                                                onChange={(e) =>
                                                    setQuestions(
                                                        Number(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                            >
                                                <option value={5}>
                                                    5 Questions
                                                </option>
                                                <option value={10}>
                                                    10 Questions
                                                </option>
                                                <option value={15}>
                                                    15 Questions
                                                </option>
                                            </select>
                                        </div>

                                    </div>

                                )
                        }


                        {/* ==========================================
                            START BUTTON
                        ========================================== */}

                        <button

                            className="start-btn"

                            onClick={startInterview}

                            disabled={
                                mode === "job" &&
                                (
                                    !job ||
                                    !role
                                )
                            }

                        >

                            {
                                mode === "job"

                                    ?

                                    "🎤 Start Job Interview"

                                    :

                                    "🎤 Start Practice Interview"

                            }

                        </button>


                    </div>


                    {/* ==========================================
                        BACK BUTTON
                    ========================================== */}

                    <button

                        className="back-to-jobs-btn"

                        onClick={() => navigate("/jobs")}

                    >

                        ← Back to Jobs

                    </button>


                </div>

            </div>

        </div>

    );

}


export default AIInterview;