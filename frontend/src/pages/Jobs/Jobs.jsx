import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import {
    getJobs,
    applyJob
} from "../../services/jobService";

import {
    getMyApplications
} from "../../services/applicationService";

import {
    getProfile
} from "../../services/profileService";

import "./Jobs.css";


function Jobs() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);

    const [applications, setApplications] = useState([]);

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [applyingJobId, setApplyingJobId] = useState(null);

    const [eligibilityErrors, setEligibilityErrors] = useState({});

    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    const toggleDescription = (jobId) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [jobId]: !prev[jobId]
        }));
    };

    const formatDescriptionToPoints = (description) => {
        if (!description || typeof description !== "string") {
            return ["No description provided."];
        }

        let cleaned = description.replace(/Responsibilities:\s*/gi, "\n• ");
        cleaned = cleaned.replace(/Requirements:\s*/gi, "\n• ");
        cleaned = cleaned.replace(/Qualifications:\s*/gi, "\n• ");

        if (cleaned.includes("•") || cleaned.includes("\n") || cleaned.includes(" - ")) {
            const parts = cleaned
                .split(/[\n•]|\s+-\s+/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && !s.toLowerCase().startsWith("responsibilities"));
            if (parts.length > 0) return parts;
        }

        const sentences = cleaned
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        return sentences.length > 0 ? sentences : [cleaned];
    };


    // ==========================================
    // Load Jobs + Applications
    // ==========================================

    useEffect(() => {

        loadData();

        const handleRefresh = () => {
            loadData();
        };

        window.addEventListener("resume_analyzed", handleRefresh);
        window.addEventListener("job_applied", handleRefresh);

        return () => {
            window.removeEventListener("resume_analyzed", handleRefresh);
            window.removeEventListener("job_applied", handleRefresh);
        };

    }, []);


    const loadData = async () => {

        try {

            setLoading(true);


            // ==========================================
            // Load Profile
            // ==========================================

            try {

                const profileResponse = await getProfile();

                if (profileResponse?.success) {

                    setProfile(profileResponse.profile);

                } else if (profileResponse?.profile) {

                    setProfile(profileResponse.profile);

                }

            } catch (profileError) {

                console.log("Profile Load Error in Jobs:", profileError);

            }


            // ==========================================
            // Load Available Jobs
            // ==========================================

            const jobsData = await getJobs();

            setJobs(
                jobsData.jobs || []
            );


            // ==========================================
            // Load User Applications
            // ==========================================

            const applicationData =
                await getMyApplications();

            setApplications(
                applicationData.applications || []
            );

        }

        catch (err) {

            console.log(
                "Failed to load jobs/applications:",
                err
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // Find Application For Job
    // ==========================================

    const getApplicationForJob = (jobId) => {

        return applications.find(

            (application) =>
                Number(application.job_id) === Number(jobId)

        );

    };


    // ==========================================
    // NORMALIZE SKILL
    // ==========================================

    const normalizeSkill = (skill) => {

        if (!skill) {

            return "";

        }


        let value =

            String(skill)

                .toLowerCase()

                .trim();


        value = value

            .replace(

                /^programming\s*:\s*/i,

                ""

            )

            .replace(

                /^database\s*:\s*/i,

                ""

            )

            .replace(

                /^web development\s*:\s*/i,

                ""

            )

            .replace(

                /^dev tools\s*:\s*/i,

                ""

            )

            .replace(

                /^technologies\s*:\s*/i,

                ""

            )

            .replace(

                /^concepts\s*:\s*/i,

                ""

            );


        value = value

            .replace(

                /react\.js/g,

                "react"

            )

            .replace(

                /reactjs/g,

                "react"

            )

            .replace(

                /react js/g,

                "react"

            )

            .replace(

                /node\.js/g,

                "node"

            )

            .replace(

                /nodejs/g,

                "node"

            )

            .replace(

                /node js/g,

                "node"

            )

            .replace(

                /java script/g,

                "javascript"

            )

            .replace(

                /type script/g,

                "typescript"

            )

            .replace(

                /my sql/g,

                "mysql"

            )

            .replace(

                /postgres sql/g,

                "postgresql"

            )

            .replace(

                /mongo db/g,

                "mongodb"

            )

            .replace(

                /spring boot/g,

                "springboot"

            )

            .replace(

                /spring framework/g,

                "spring"

            )

            .replace(

                /rest apis/g,

                "restapi"

            )

            .replace(

                /rest api/g,

                "restapi"

            )

            .replace(

                /restful api/g,

                "restapi"

            )

            .replace(

                /restful apis/g,

                "restapi"

            )

            .replace(

                /html5/g,

                "html"

            )

            .replace(

                /css3/g,

                "css"

            )

            .replace(

                /git hub/g,

                "github"

            )

            .replace(

                /data structures/g,

                "datastructures"

            )

            .replace(

                /data structure/g,

                "datastructures"

            )

            .replace(

                /full stack development/g,

                "fullstack"

            )

            .replace(

                /full stack developer/g,

                "fullstack"

            )

            .replace(

                /full stack/g,

                "fullstack"

            );


        value = value

            .replace(

                /[.,/#!$%^&*;:{}=\-_`~()[\]]/g,

                " "

            )

            .replace(

                /\s+/g,

                " "

            )

            .trim();


        return value;

    };


    // ==========================================
    // EXTRACT PROFILE SKILLS
    // ==========================================

    const extractProfileSkills = () => {

        if (!profile) {

            return [];

        }


        let skills =

            profile.skills;


        if (!skills) {

            return [];

        }


        if (Array.isArray(skills)) {

            return skills

                .flatMap(skill => {

                    if (

                        typeof skill === "string"

                    ) {

                        return skill

                            .split(/[,|]/)

                            .map(

                                item =>

                                    item.trim()

                            );

                    }


                    if (

                        typeof skill === "object"

                    ) {

                        return [

                            skill.name ||

                            skill.skill ||

                            skill.title ||

                            ""

                        ];

                    }


                    return [];

                })

                .filter(Boolean);

        }


        if (

            typeof skills === "string"

        ) {

            const trimmed =

                skills.trim();


            if (

                trimmed.startsWith("[") ||

                trimmed.startsWith("{")

            ) {

                try {

                    const parsed =

                        JSON.parse(

                            trimmed

                        );


                    if (

                        Array.isArray(parsed)

                    ) {

                        return parsed

                            .flatMap(skill => {

                                if (

                                    typeof skill === "string"

                                ) {

                                    return skill

                                        .split(/[,|]/)

                                        .map(

                                            item =>

                                                item.trim()

                                        );

                                }


                                if (

                                    typeof skill === "object"

                                ) {

                                    return [

                                        skill.name ||

                                        skill.skill ||

                                        skill.title ||

                                        ""

                                    ];

                                }


                                return [];

                            })

                            .filter(Boolean);

                    }

                }

                catch (error) {

                    console.log(

                        "Skills JSON Parse Error in Jobs:",

                        error

                    );

                }

            }


            return trimmed

                .split(/[,|\n]/)

                .map(

                    skill =>

                        skill.trim()

                )

                .filter(Boolean);

        }


        return [];

    };


    // ==========================================
    // GET REQUIRED SKILL NAME
    // ==========================================

    const getSkillName = (skill) => {

        if (

            typeof skill === "string"

        ) {

            return skill;

        }


        if (

            typeof skill === "object" &&

            skill !== null

        ) {

            return (

                skill.name ||

                skill.skill ||

                skill.title ||

                ""

            );

        }


        return "";

    };


    // ==========================================
    // CALCULATE JOB MATCH
    // ==========================================

    const calculateJobMatch = (job) => {

        const profileSkills =

            extractProfileSkills();


        const requiredSkills =

            Array.isArray(

                job.required_skills

            )

                ? job.required_skills

                    .map(getSkillName)

                    .filter(Boolean)

                : [];


        if (

            requiredSkills.length === 0

        ) {

            return 0;

        }


        const normalizedResumeSkills =

            profileSkills

                .map(

                    normalizeSkill

                )

                .filter(Boolean);


        const matchedSkills =

            requiredSkills.filter(

                requiredSkill => {

                    const normalizedRequired =

                        normalizeSkill(

                            requiredSkill

                        );


                    if (

                        !normalizedRequired

                    ) {

                        return false;

                    }


                    return normalizedResumeSkills

                        .some(

                            resumeSkill => {

                                if (

                                    resumeSkill ===

                                    normalizedRequired

                                ) {

                                    return true;

                                }


                                if (

                                    resumeSkill.includes(

                                        normalizedRequired

                                    )

                                ) {

                                    return true;

                                }


                                if (

                                    normalizedRequired.includes(

                                        resumeSkill

                                    )

                                ) {

                                    return true;

                                }


                                return false;

                            }

                        );

                }

            );


        const score =

            Math.round(

                (

                    matchedSkills.length /

                    requiredSkills.length

                ) * 100

            );


        return score;

    };


    // ==========================================
    // Apply Job
    // ==========================================

    const handleApply = async (job) => {

        if (!job) {

            return;

        }


        const resumeScore = profile?.ats_score ?? 0;

        const matchScore = calculateJobMatch(job);


        if (resumeScore < 70 && matchScore < 60) {

            setEligibilityErrors(prev => ({
                ...prev,
                [job.id]: `Improve both: Resume Score is ${resumeScore}% (Required: 70%) and Skills Match is ${matchScore}% (Required: 60%)`
            }));

            return;

        } else if (matchScore < 60) {

            setEligibilityErrors(prev => ({
                ...prev,
                [job.id]: `Improve skills: Current Skills Match is ${matchScore}% (Required: 60%)`
            }));

            return;

        } else if (resumeScore < 70) {

            setEligibilityErrors(prev => ({
                ...prev,
                [job.id]: `Resume score is low: Current score is ${resumeScore}% (Required: 70%)`
            }));

            return;

        }


        // Clear error on success
        setEligibilityErrors(prev => {
            const copy = { ...prev };
            delete copy[job.id];
            return copy;
        });


        try {

            setApplyingJobId(job.id);


            const data =
                await applyJob(job.id);


            alert(
                data.message
            );


            // ==========================================
            // Reload Applications
            // ==========================================

            const applicationData =
                await getMyApplications();


            setApplications(
                applicationData.applications || []
            );

        }

        catch (err) {

            console.log(
                "Apply Job Error:",
                err
            );


            alert(

                err.response?.data?.message ||

                "Failed To Apply For Job"

            );

        }

        finally {

            setApplyingJobId(null);

        }

    };


    // ==========================================
    // Start AI Interview
    // ==========================================

    const handleStartInterview = (job) => {

        const application =
            getApplicationForJob(job.id);


        if (!application) {

            alert(
                "Please apply for this job first."
            );

            return;

        }


        // ==========================================
        // Already Completed
        // ==========================================

        if (
            Number(application.interview_completed) === 1
        ) {

            return;

        }


        // ==========================================
        // Open Job-Specific AI Interview
        // ==========================================

        navigate(

            "/ai-interview",

            {

                state: {

                    mode: "job",

                    jobId: job.id,

                    role:
                        job.title ||

                        "Software Developer"

                }

            }

        );

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

                    <div className="jobs-container">

                        <div className="loading-box">

                            <h2>
                                Loading Jobs...
                            </h2>

                            <p>
                                Finding available opportunities for you.
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


                <div className="jobs-container">


                    {/* ==========================================
                        HEADER
                    ========================================== */}

                    <div className="jobs-header">

                        <h1>

                            💼 Available Jobs

                        </h1>

                        <p>

                            Discover opportunities that match
                            your skills and start your AI interview
                            when you're ready.

                        </p>

                    </div>


                    {/* ==========================================
                        NO JOBS
                    ========================================== */}

                    {

                        jobs.length === 0

                            ?

                            (

                                <div className="empty-box">

                                    <h2>

                                        No Jobs Available

                                    </h2>

                                    <p>

                                        New opportunities will
                                        appear here when recruiters
                                        post them.

                                    </p>

                                </div>

                            )

                            :

                            (

                                <div className="jobs-grid">


                                    {

                                        jobs.map(

                                            (job) => {


                                                // ==========================================
                                                // Application For This Job
                                                // ==========================================

                                                const application =
                                                    getApplicationForJob(
                                                        job.id
                                                    );


                                                const isApplied =
                                                    !!application;


                                                const interviewCompleted =
                                                    application &&

                                                    Number(
                                                        application.interview_completed
                                                    ) === 1;


                                                return (

                                                    <div

                                                        className="job-card"

                                                        key={job.id}

                                                    >


                                                        {/* ==========================================
                                                            JOB HEADER
                                                        ========================================== */}

                                                        <div className="job-top">

                                                            <h2>

                                                                {job.title}

                                                            </h2>


                                                            <span
                                                                className={`company-tag ${
                                                                    Boolean(job.is_company_verified) ||
                                                                    String(job.company_verification_status || "").toUpperCase() === "VERIFIED" ||
                                                                    String(job.verification_status || "").toUpperCase() === "VERIFIED"
                                                                        ? "verified"
                                                                        : "unverified"
                                                                }`}
                                                                title={
                                                                    Boolean(job.is_company_verified) ||
                                                                    String(job.company_verification_status || "").toUpperCase() === "VERIFIED" ||
                                                                    String(job.verification_status || "").toUpperCase() === "VERIFIED"
                                                                        ? "Verified Company"
                                                                        : "Unverified Company"
                                                                }
                                                            >
                                                                {job.company}
                                                            </span>


                                                        </div>


                                                        {/* ==========================================
                                                            JOB INFORMATION
                                                        ========================================== */}

                                                        <div className="job-info">


                                                            <p>

                                                                📍

                                                                <strong>
                                                                    Location
                                                                </strong>

                                                                {job.location ||
                                                                    "Not Provided"}

                                                            </p>


                                                            <p>

                                                                💰

                                                                <strong>
                                                                    Salary
                                                                </strong>

                                                                {job.salary ||
                                                                    "Not Provided"}

                                                            </p>


                                                            <p>

                                                                🧑‍💻

                                                                <strong>
                                                                    Experience
                                                                </strong>

                                                                {job.experience ||
                                                                    "Not Provided"}

                                                            </p>


                                                            <p>

                                                                💼

                                                                <strong>
                                                                    Type
                                                                </strong>

                                                                {job.employment_type ||
                                                                    "Not Provided"}

                                                            </p>


                                                            <p>

                                                                👥

                                                                <strong>
                                                                    Vacancies
                                                                </strong>

                                                                {job.vacancies}

                                                            </p>


                                                            <p>

                                                                📅

                                                                <strong>
                                                                    Deadline
                                                                </strong>

                                                                {
                                                                    job.deadline
                                                                        ?.split("T")[0]
                                                                }

                                                            </p>


                                                        </div>


                                                        {/* ==========================================
                                                            JOB DESCRIPTION (POINT BY POINT)
                                                        ========================================== */}
                                                        {(() => {
                                                            const points = formatDescriptionToPoints(job.description);
                                                            const isExpanded = expandedDescriptions[job.id];
                                                            const displayPoints = isExpanded ? points : points.slice(0, 2);

                                                            return (
                                                                <div className="job-description">
                                                                    <div className="job-description-header">
                                                                        <h4>Job Description</h4>
                                                                        {points.length > 2 && (
                                                                            <button
                                                                                type="button"
                                                                                className="show-more-btn"
                                                                                onClick={() => toggleDescription(job.id)}
                                                                            >
                                                                                {isExpanded ? "Show Less ↑" : `Show More (${points.length}) ↓`}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    <ul className={`job-description-points ${isExpanded ? "points-expanded" : "points-clamped"}`}>
                                                                        {displayPoints.map((point, pIndex) => (
                                                                            <li key={pIndex}>
                                                                                <span className="point-bullet">•</span>
                                                                                <span className="point-text">{point}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            );
                                                        })()}


                                                        {/* ==========================================
                                                            REQUIRED SKILLS
                                                        ========================================== */}

                                                        <div className="skills-section">

                                                            <h4>

                                                                Required Skills

                                                            </h4>


                                                            <div className="skills">

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

                                                                                    key={
                                                                                        index
                                                                                    }

                                                                                    className="skill"

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
                                                            APPLICATION / INTERVIEW BUTTONS
                                                        ========================================== */}

                                                        <div className="job-footer">


                                                            {/* ==========================================
                                                                NOT APPLIED
                                                            ========================================== */}

                                                            {

                                                                !isApplied

                                                                    ?

                                                                    (

                                                                        <button

                                                                            className="apply-btn"

                                                                             onClick={() =>
                                                                                 handleApply(
                                                                                     job
                                                                                 )
                                                                             }

                                                                            disabled={
                                                                                applyingJobId ===
                                                                                job.id
                                                                            }

                                                                        >

                                                                            {

                                                                                applyingJobId ===
                                                                                job.id

                                                                                    ?

                                                                                    "⏳ Applying..."

                                                                                    :

                                                                                    "🚀 Apply Now"

                                                                            }

                                                                        </button>

                                                                    )

                                                                    :

                                                                    (

                                                                        <>


                                                                            {/* ==========================================
                                                                                APPLIED BUTTON
                                                                            ========================================== */}

                                                                            <button

                                                                                className="applied-btn"

                                                                                disabled

                                                                            >

                                                                                ✅ Applied

                                                                            </button>


                                                                            {/* ==========================================
                                                                                INTERVIEW NOT COMPLETED
                                                                            ========================================== */}

                                                                            {

                                                                                !interviewCompleted

                                                                                    ?

                                                                                    (

                                                                                        <button

                                                                                            className="interview-btn"

                                                                                            onClick={() =>
                                                                                                handleStartInterview(
                                                                                                    job
                                                                                                )
                                                                                            }

                                                                                        >

                                                                                            🎤 Start AI Interview

                                                                                        </button>

                                                                                    )

                                                                                    :

                                                                                    (

                                                                                        /* ==========================================
                                                                                            INTERVIEW COMPLETED
                                                                                        ========================================== */

                                                                                        <button

                                                                                            className="interview-completed-btn"

                                                                                            disabled

                                                                                        >

                                                                                            ✅ Interview Completed

                                                                                        </button>

                                                                                    )

                                                                            }


                                                                        </>

                                                                    )

                                                            }

                                                            {eligibilityErrors[job.id] && (
                                                                <p style={{
                                                                    color: '#d93025',
                                                                    fontSize: '0.85rem',
                                                                    marginTop: '12px',
                                                                    fontWeight: '500',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    background: '#fce8e6',
                                                                    padding: '8px 12px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #fad2cf',
                                                                    width: '100%',
                                                                    boxSizing: 'border-box'
                                                                }}>
                                                                    ⚠️ {eligibilityErrors[job.id]}
                                                                </p>
                                                            )}


                                                        </div>


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


export default Jobs;