import "./RecommendedJobs.css";

import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    FaBuilding,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaBriefcase,
    FaCheckCircle,
    FaClock,
    FaExclamationCircle
} from "react-icons/fa";

import {
    getRecommendedJobs,
    applyJob
} from "../../services/jobService";

import {
    getProfile
} from "../../services/profileService";

import api from "../../services/api";


function RecommendedJobs({ refreshTrigger } = {}) {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);

    const [applications, setApplications] =
        useState([]);

    const [profile, setProfile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [applyingJobId, setApplyingJobId] =
        useState(null);

    const [eligibilityErrors, setEligibilityErrors] =
        useState({});


    // ==========================================
    // LOAD RECOMMENDED JOBS
    // ==========================================

    useEffect(() => {

        loadRecommendedJobs();

    }, [refreshTrigger]);

    useEffect(() => {

        const handleRefresh = () => {
            loadRecommendedJobs();
        };

        window.addEventListener("resume_analyzed", handleRefresh);
        window.addEventListener("profile_updated", handleRefresh);

        return () => {
            window.removeEventListener("resume_analyzed", handleRefresh);
            window.removeEventListener("profile_updated", handleRefresh);
        };

    }, []);


    const loadRecommendedJobs = async () => {

        try {

            setLoading(true);


            // ==================================
            // GET JOB SEEKER PROFILE
            // ==================================

            try {

                const profileResponse =
                    await getProfile();

                console.log(
                    "Profile Response:",
                    profileResponse
                );


                if (
                    profileResponse?.success
                ) {

                    setProfile(
                        profileResponse.profile
                    );

                }

                else if (
                    profileResponse?.profile
                ) {

                    setProfile(
                        profileResponse.profile
                    );

                }

            }

            catch (profileError) {

                console.log(
                    "Profile Load Error:",
                    profileError
                );

                setProfile(null);

            }


            // ==================================
            // GET RECOMMENDED JOBS
            // ==================================

            const jobsResponse =
                await getRecommendedJobs();

            console.log(
                "Recommended Jobs Response:",
                jobsResponse
            );


            if (
                jobsResponse?.success &&
                Array.isArray(
                    jobsResponse.jobs
                )
            ) {

                setJobs(
                    jobsResponse.jobs
                );

            }

            else {

                setJobs([]);

            }


            // ==================================
            // GET MY APPLICATIONS
            // ==================================

            try {

                const applicationResponse =
                    await api.get(
                        "/applications/my"
                    );

                console.log(
                    "User Applications:",
                    applicationResponse.data
                );


                if (
                    applicationResponse.data?.success &&
                    Array.isArray(
                        applicationResponse
                            .data
                            .applications
                    )
                ) {

                    setApplications(
                        applicationResponse
                            .data
                            .applications
                    );

                }

                else {

                    setApplications([]);

                }

            }

            catch (applicationError) {

                console.log(
                    "Applications Load Error:",
                    applicationError
                );

                setApplications([]);

            }

        }

        catch (err) {

            console.log(
                "Recommended Jobs Error:",
                err
            );

            setJobs([]);

        }

        finally {

            setLoading(false);

        }

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
                        "Skills JSON Parse Error:",
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

            return {

                score:
                    Number(
                        job.match_score
                    ) || 0,

                matchedSkills: []

            };

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


        return {

            score,

            matchedSkills

        };

    };


    // ==========================================
    // MATCH LEVEL
    // ==========================================

    const getMatchLevel = (score) => {

        if (score < 40) {

            return {

                level: "poor",

                label: "Not Eligible",

                message:
                    "Skill match is below 40%. You cannot apply for this job."

            };

        }


        if (score >= 70) {

            return {

                level: "excellent",

                label: "Highly Recommended",

                message:
                    "Excellent skill match. This job is highly recommended for you."

            };

        }


        return {

            level: "good",

            label: "Good Match",

            message:
                "You meet enough of the required skills to apply."

        };

    };


    // ==========================================
    // CHECK ALREADY APPLIED
    // ==========================================

    const hasApplied = (jobId) => {

        return applications.some(
            application =>

                Number(
                    application.job_id
                ) ===
                Number(jobId)
        );

    };


    // ==========================================
    // APPLY FOR JOB
    // ==========================================

    const handleApply = async (
        jobId,
        matchScore
    ) => {

        if (!jobId) {

            return;

        }


        const resumeScore = profile?.ats_score ?? 0;

        if (resumeScore < 70 && matchScore < 60) {

            setEligibilityErrors(prev => ({
                ...prev,
                [jobId]: `Improve both: Resume Score is ${resumeScore}% (Required: 70%) and Skills Match is ${matchScore}% (Required: 60%)`
            }));

            return;

        } else if (matchScore < 60) {

            setEligibilityErrors(prev => ({
                ...prev,
                [jobId]: `Improve skills: Current Skills Match is ${matchScore}% (Required: 60%)`
            }));

            return;

        } else if (resumeScore < 70) {

            setEligibilityErrors(prev => ({
                ...prev,
                [jobId]: `Resume score is low: Current score is ${resumeScore}% (Required: 70%)`
            }));

            return;

        }


        // Clear error on success
        setEligibilityErrors(prev => {
            const copy = { ...prev };
            delete copy[jobId];
            return copy;
        });


        if (
            hasApplied(jobId)
        ) {

            alert(
                "You have already applied for this job."
            );

            return;

        }


        try {

            setApplyingJobId(
                jobId
            );


            const response =
                await applyJob(
                    jobId
                );


            if (
                response?.success
            ) {

                alert(
                    response.message ||
                    "Application submitted successfully."
                );


                await loadRecommendedJobs();

                navigate("/jobs");

            }

            else {

                alert(
                    response?.message ||
                    "Failed to apply for this job."
                );

            }

        }

        catch (err) {

            console.log(
                "Apply Job Error:",
                err
            );


            alert(
                err.response?.data?.message ||
                "Failed to apply for this job."
            );

        }

        finally {

            setApplyingJobId(
                null
            );

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="recommended">

                <div className="recommended-header">

                    <div>

                        <h2>
                            Recommended Jobs
                        </h2>

                        <p>
                            Jobs matched to your skills
                        </p>

                    </div>

                </div>


                <div className="job-grid">

                    <div className="recommended-job-card loading-card">

                        <div className="loading-job">

                            <FaClock />

                            <span>
                                Finding jobs that match your skills...
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // NO JOBS
    // ==========================================

    if (
        jobs.length === 0
    ) {

        return (

            <div className="recommended">

                <div className="recommended-header">

                    <div>

                        <h2>
                            Recommended Jobs
                        </h2>

                        <p>
                            Jobs matched to your resume
                        </p>

                    </div>

                </div>


                <div className="no-recommended-jobs">

                    <div className="no-jobs-icon">

                        <FaBriefcase />

                    </div>


                    <h3>
                        No matching jobs yet
                    </h3>


                    <p>
                        There are currently no recruiter-posted
                        jobs matching your resume skills.
                    </p>


                    <span>
                        Try adding more skills to your resume
                        or check again later.
                    </span>

                </div>

            </div>

        );

    }


    // ==========================================
    // SORT JOBS
    // ==========================================

    const sortedJobs =
        [...jobs].sort(
            (a, b) => {

                const scoreA =
                    calculateJobMatch(a).score;

                const scoreB =
                    calculateJobMatch(b).score;

                return scoreB - scoreA;

            }
        );


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="recommended">

            <div className="recommended-header">

                <div>

                    <h2>
                        Recommended Jobs
                    </h2>

                    <p>
                        Recruiter jobs matched to your resume
                    </p>

                </div>


                <span className="recommended-count">

                    {jobs.length}

                    {" "}

                    {
                        jobs.length === 1
                            ? "Job"
                            : "Jobs"
                    }

                </span>

            </div>


            <div className="job-grid">

                {
                    sortedJobs.map(
                        (job) => {

                            const alreadyApplied =
                                hasApplied(
                                    job.id
                                );


                            const isApplying =
                                applyingJobId ===
                                job.id;


                            const matchData =
                                calculateJobMatch(
                                    job
                                );


                            const matchScore =
                                matchData.score;


                            const matchedSkills =
                                matchData.matchedSkills;


                            const matchLevel =
                                getMatchLevel(
                                    matchScore
                                );


                            const cannotApply =
                                false;


                            const highlyRecommended =
                                matchScore >= 70;


                            const requiredSkills =
                                Array.isArray(
                                    job.required_skills
                                )

                                    ? job.required_skills
                                        .map(
                                            getSkillName
                                        )
                                        .filter(Boolean)

                                    : [];


                            return (

                                <div
                                    className="recommended-job-card"
                                    key={job.id}
                                >

                                    <div className="job-card-top">

                                        {(() => {
                                            const isVerified =
                                                Boolean(job.is_company_verified) ||
                                                String(job.company_verification_status || "").toUpperCase() === "VERIFIED" ||
                                                String(job.verification_status || "").toUpperCase() === "VERIFIED";

                                            return (
                                                <>
                                                    <div
                                                        className={`company-logo ${isVerified ? "verified" : "unverified"}`}
                                                    >
                                                        <FaBuilding />
                                                    </div>

                                                    <div
                                                        className={`match-badge ${matchLevel.level}`}
                                                    >
                                                        {matchScore}% Match
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {highlyRecommended && (
                                        <div className="priority-badge">
                                            ⭐ Highly Recommended
                                        </div>
                                    )}

                                    <h3>
                                        {job.title || "Job Position"}
                                    </h3>

                                    <p className="job-detail">
                                        <FaBuilding
                                            style={{
                                                color:
                                                    Boolean(job.is_company_verified) ||
                                                    String(job.company_verification_status || "").toUpperCase() === "VERIFIED" ||
                                                    String(job.verification_status || "").toUpperCase() === "VERIFIED"
                                                        ? "#2563eb"
                                                        : "#dc2626"
                                            }}
                                        />
                                        <strong
                                            className={
                                                Boolean(job.is_company_verified) ||
                                                String(job.company_verification_status || "").toUpperCase() === "VERIFIED" ||
                                                String(job.verification_status || "").toUpperCase() === "VERIFIED"
                                                    ? "company-name-verified"
                                                    : "company-name-unverified"
                                            }
                                        >
                                            {job.company || "Company"}
                                        </strong>
                                    </p>



                                    {
                                        job.location && (

                                            <p className="job-detail">

                                                <FaMapMarkerAlt />

                                                {
                                                    job.location
                                                }

                                            </p>

                                        )
                                    }


                                    {
                                        job.salary && (

                                            <p className="job-detail">

                                                <FaMoneyBillWave />

                                                {
                                                    job.salary
                                                }

                                            </p>

                                        )
                                    }


                                    {
                                        job.experience && (

                                            <p className="job-detail">

                                                <FaBriefcase />

                                                {
                                                    job.experience
                                                }

                                            </p>

                                        )
                                    }


                                    {
                                        job.employment_type && (

                                            <span className="employment-type">

                                                {
                                                    job.employment_type
                                                }

                                            </span>

                                        )
                                    }


                                    <div className="skill-match">

                                        <div className="skill-match-header">

                                            <span>
                                                Skill Match
                                            </span>

                                            <strong>
                                                {matchScore}%
                                            </strong>

                                        </div>


                                        <div className="match-progress">

                                            <div
                                                className="match-progress-fill"
                                                style={{
                                                    width:
                                                        `${matchScore}%`
                                                }}
                                            />

                                        </div>


                                        <div
                                            className={
                                                `match-status ${matchLevel.level}`
                                            }
                                        >

                                            {
                                                matchLevel.level ===
                                                "excellent"

                                                    ? (
                                                        <>
                                                            ⭐ Excellent match — prioritize this job!
                                                        </>
                                                    )

                                                    : matchLevel.level ===
                                                      "good"

                                                        ? (
                                                            <>
                                                                ✅ Good match — you can apply.
                                                            </>
                                                        )

                                                        : (
                                                            <>
                                                                ❌ Skill match below 40% — application not allowed.
                                                            </>
                                                        )
                                            }

                                        </div>


                                        {
                                            matchedSkills.length > 0 && (

                                                <div className="matched-skills">

                                                    <span>
                                                        Matching:
                                                    </span>


                                                    <div className="skill-tags">

                                                        {
                                                            matchedSkills
                                                                .slice(0, 10)
                                                                .map(
                                                                    (
                                                                        skill,
                                                                        index
                                                                    ) => (

                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="skill-tag matched"
                                                                        >
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>

                                                                    )
                                                                )
                                                        }

                                                    </div>

                                                </div>

                                            )
                                        }

                                    </div>


                                    {
                                        requiredSkills.length > 0 && (

                                            <div className="required-skills">

                                                <span>
                                                    Required Skills:
                                                </span>


                                                <div className="skill-tags">

                                                    {
                                                        requiredSkills
                                                            .slice(0, 10)
                                                            .map(
                                                                (
                                                                    skill,
                                                                    index
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={
                                                                            matchedSkills.some(
                                                                                matched =>
                                                                                    normalizeSkill(
                                                                                        matched
                                                                                    ) ===
                                                                                    normalizeSkill(
                                                                                        skill
                                                                                    )
                                                                            )
                                                                                ? "skill-tag matched"
                                                                                : "skill-tag"
                                                                        }
                                                                    >

                                                                        {
                                                                            skill
                                                                        }

                                                                    </span>

                                                                )
                                                            )
                                                    }

                                                </div>

                                            </div>

                                        )
                                    }


                                    {
                                        job.deadline && (

                                            <p className="job-deadline">

                                                Deadline:

                                                {" "}

                                                {
                                                    new Date(
                                                        job.deadline
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                }

                                            </p>

                                        )
                                    }


                                    {
                                        alreadyApplied ? (

                                            <button
                                                className="apply-job-btn applied"
                                                disabled
                                            >

                                                <FaCheckCircle />

                                                Applied

                                            </button>

                                        )

                                        : cannotApply ? (

                                            <button
                                                className="apply-job-btn not-eligible"
                                                disabled
                                            >

                                                <FaExclamationCircle />

                                                Not Eligible — Skill Match Below 40%

                                            </button>

                                        )

                                        : (

                                            <button

                                                className={
                                                    `apply-job-btn ${
                                                        highlyRecommended
                                                            ? "highly-recommended"
                                                            : ""
                                                    }`
                                                }

                                                onClick={() =>
                                                    handleApply(
                                                        job.id,
                                                        matchScore
                                                    )
                                                }

                                                disabled={
                                                    isApplying
                                                }

                                            >

                                                {
                                                    isApplying

                                                        ? (

                                                            <>
                                                                <FaClock />

                                                                Applying...
                                                            </>

                                                        )

                                                        : highlyRecommended

                                                            ? (

                                                                <>
                                                                    ⭐ Apply Now — Highly Recommended
                                                                </>

                                                            )

                                                            : (

                                                                <>
                                                                    🚀 Apply Now
                                                                </>

                                                            )
                                                }

                                            </button>

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

                            );

                        }
                    )
                }

            </div>


            <div className="recommendation-note">

                <FaExclamationCircle />

                <span>

                    Jobs with 70% or higher skill matches
                    are prioritized because they closely
                    match your resume.

                </span>

            </div>

        </div>

    );

}


export default RecommendedJobs;