import {
    useEffect,
    useState
} from "react";

import "./Dashboard.css";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import StatCard from "../../components/StatCard/StatCard";
import ResumeCard from "../../components/ResumeCard/ResumeCard";
import AISuggestions from "../../components/AISuggestions/AISuggestions";
import RecommendedJobs from "../../components/RecommendedJobs/RecommendedJobs";
import RecentApplications from "../../components/RecentApplications/RecentApplications";

import { downloadReport } from "../../utils/downloadReport";
import { getProfile } from "../../services/profileService";
import { getResume } from "../../services/resumeService";
import api from "../../services/api";


function Dashboard() {

    // ==========================================
    // STATE
    // ==========================================

    const [profile, setProfile] =
        useState(null);

    const [currentResume, setCurrentResume] =
        useState(null);

    const [aiResult, setAiResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    // ==========================================
    // REAL APPLICATION COUNT
    // ==========================================

    const [applicationCount, setApplicationCount] =
        useState(0);

    const [refreshKey, setRefreshKey] =
        useState(0);


    // ==========================================
    // SAFE JSON PARSER
    // ==========================================

    const parseJSON = (value) => {

        if (!value) {
            return [];
        }

        if (Array.isArray(value)) {
            return value;
        }

        if (typeof value === "object") {
            return value;
        }

        try {

            const parsed =
                JSON.parse(value);

            return parsed;

        }

        catch (err) {

            console.log(
                "JSON Parse Error:",
                err
            );

            return [];

        }

    };


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        await Promise.all([

            loadProfile(),

            loadCurrentResume(),

            loadApplicationCount()

        ]);

    };


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    const loadProfile = async () => {

        try {

            const data =
                await getProfile();

            if (
                data?.success &&
                data?.profile
            ) {

                setProfile(
                    data.profile
                );

            }

            else if (
                data?.profile
            ) {

                setProfile(
                    data.profile
                );

            }

            else {

                setProfile(null);

            }

        }

        catch (err) {

            console.log(
                "Profile Load Error:",
                err
            );

        }

    };


    // ==========================================
    // LOAD APPLICATION COUNT
    // ==========================================

    const loadApplicationCount = async () => {

        try {

            const response =
                await api.get(
                    "/applications/count"
                );

            if (
                response.data?.success
            ) {

                setApplicationCount(

                    Number(
                        response.data.count
                    ) || 0

                );

            }

            else {

                setApplicationCount(0);

            }

        }

        catch (err) {

            console.log(
                "Application Count Error:",
                err
            );

            setApplicationCount(0);

        }

    };


    // ==========================================
    // CREATE AI RESULT FROM RESUME
    // ==========================================

    const buildAIResult = (resume) => {

        if (!resume) {
            return null;
        }

        const analyzed =

            resume.is_analyzed === 1 ||

            resume.is_analyzed === true ||

            resume.is_analyzed === "1";


        if (!analyzed) {
            return null;
        }


        return {

            atsScore:
                resume.ats_score ?? 0,

            hireProbability:
                resume.hire_probability ?? 0,

            skills:
                parseJSON(
                    resume.skills
                ),

            education:
                parseJSON(
                    resume.education
                ),

            experience:
                parseJSON(
                    resume.experience
                ),

            projects:
                parseJSON(
                    resume.projects
                ),

            certifications:
                parseJSON(
                    resume.certifications
                ),

            suggestions:
                parseJSON(
                    resume.ai_suggestions
                ),

            recommendedRoles:
                parseJSON(
                    resume.recommended_roles
                ),

            missingSkills:
                parseJSON(
                    resume.missing_skills
                ),

            interviewQuestions:
                parseJSON(
                    resume.interview_questions
                )

        };

    };


    // ==========================================
    // LOAD CURRENT RESUME
    // ==========================================

    const loadCurrentResume = async () => {

        try {

            const data =
                await getResume();

            if (
                !data ||
                !data.success ||
                !data.resume
            ) {

                console.log(
                    "No resume found."
                );

                setCurrentResume(null);

                setAiResult(null);

                return;

            }


            const resume =
                data.resume;


            // ==================================
            // SAVE RESUME
            // ==================================

            setCurrentResume(
                resume
            );


            // ==================================
            // CREATE AI RESULT
            // ==================================

            const result =
                buildAIResult(
                    resume
                );


            setAiResult(
                result
            );


            // ==================================
            // DEBUG
            // ==================================

            console.log(
                "\n========== DASHBOARD RESUME =========="
            );

            console.log(
                "User ID:",
                resume.user_id
            );

            console.log(
                "Resume ID:",
                resume.id
            );

            console.log(
                "Resume Full Name:",
                resume.full_name
            );

            console.log(
                "Resume Name:",
                resume.resume_name
            );

            console.log(
                "Resume Email:",
                resume.resume_email
            );

            console.log(
                "Resume Phone:",
                resume.resume_phone
            );

            console.log(
                "ATS Score:",
                resume.ats_score
            );

            console.log(
                "Hire Probability:",
                resume.hire_probability
            );

            console.log(
                "Is Analyzed:",
                resume.is_analyzed
            );

            console.log(
                "======================================\n"
            );

        }

        catch (err) {

            console.log(
                "Resume Load Error:",
                err
            );

            setCurrentResume(null);

            setAiResult(null);

        }

    };


    // ==========================================
    // ANALYZE RESUME
    // ==========================================

    const analyzeResume = async () => {

        try {

            setLoading(true);


            // ==================================
            // GET RESUME
            // ==================================

            let resume =
                currentResume;


            if (!resume) {

                const data =
                    await getResume();

                if (
                    !data ||
                    !data.success ||
                    !data.resume
                ) {

                    alert(
                        "No resume found. Please create your resume first."
                    );

                    return;

                }


                resume =
                    data.resume;


                setCurrentResume(
                    resume
                );

            }


            // ==================================
            // RESUME ID
            // ==================================

            const resumeId =

                resume?.id ||

                resume?.resume_id ||

                resume?.resumeId;


            if (!resumeId) {

                console.error(
                    "Resume ID is missing:",
                    resume
                );

                alert(
                    "Resume ID not found. Please reload your resume and try again."
                );

                return;

            }


            console.log(
                "Current Resume:",
                resume
            );


            console.log(
                "Analyzing Resume ID:",
                resumeId
            );


            // ==================================
            // AI ANALYSIS
            // ==================================

            await api.post(
                `/ai/analyze/${resumeId}`
            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "Resume analyzed successfully."
            );


            // ==================================
            // RELOAD EVERYTHING
            // ==================================

            await loadDashboard();

            setRefreshKey((prev) => prev + 1);

            window.dispatchEvent(new CustomEvent("resume_analyzed"));

        }

        catch (err) {

            console.log(
                "AI Analysis Error:",
                err
            );


            if (err.response) {

                console.log(
                    "AI Error Response:",
                    err.response.data
                );


                alert(

                    err.response.data?.message ||

                    "AI Analysis Failed"

                );

            }

            else {

                alert(
                    "AI Analysis Failed"
                );

            }

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOGIN / ACCOUNT INFORMATION
    // ==========================================

    /*
        IMPORTANT:

        loginName = ACCOUNT NAME

        It comes from:
        1. localStorage loginName
        2. profile.account_name
        3. "User"

        DO NOT use:
        profile.full_name

        because profile.full_name is the
        resume name.
    */

    const loginName =
        localStorage.getItem("loginName")?.trim() ||
        profile?.account_name?.trim() ||
        "User";


    const loginEmail =
        localStorage.getItem(
            "loginEmail"
        ) ||

        profile?.email?.trim() ||

        "";


    const loginPhone =
        localStorage.getItem(
            "loginPhone"
        ) ||

        profile?.phone?.trim() ||

        "";


    // ==========================================
    // RESUME INFORMATION
    // ==========================================

    /*
        Resume information is kept separate
        from account information.
    */

    const resumeName =
        currentResume?.full_name?.trim() ||

        currentResume?.resume_name?.trim() ||

        "Not Available";


    const resumeEmail =
        currentResume?.resume_email?.trim() ||

        currentResume?.email?.trim() ||

        "Not Available";


    const resumePhone =
        currentResume?.resume_phone?.trim() ||

        currentResume?.phone?.trim() ||

        "Not Available";


    const resumeFileName =
        currentResume?.resume_path ||

        "Not Available";


    // ==========================================
    // ANALYSIS STATUS
    // ==========================================

    const displayAnalyzed =

        currentResume?.is_analyzed === 1 ||

        currentResume?.is_analyzed === true ||

        currentResume?.is_analyzed === "1" ||

        profile?.is_analyzed === 1 ||

        profile?.is_analyzed === true ||

        profile?.is_analyzed === "1";


    const displayLastAnalyzed =

        currentResume?.last_analyzed ||

        profile?.last_analyzed ||

        null;


    // ==========================================
    // ATS SCORE
    // ==========================================

    const displayATSScore =

        currentResume?.ats_score ??

        profile?.ats_score ??

        aiResult?.atsScore ??

        0;


    // ==========================================
    // HIRE PROBABILITY
    // ==========================================

    const displayHireProbability =

        currentResume?.hire_probability ??

        profile?.hire_probability ??

        aiResult?.hireProbability ??

        0;


    // ==========================================
    // RESUME CARD DATA
    // ==========================================

    const resumeCardData = {

        ...(currentResume || {}),

        full_name:
            resumeName,

        email:
            resumeEmail,

        phone:
            resumePhone,

        resume_path:
            resumeFileName,

        ats_score:
            displayATSScore,

        hire_probability:
            displayHireProbability

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="dashboard">


            {/* ======================================
                SIDEBAR
            ====================================== */}

            <Sidebar />


            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <div className="main-content">


                {/* ==================================
                    TOPBAR
                ================================== */}

                <Topbar />


                {/* ==================================
                    PAGE TITLE
                ================================== */}

                <div className="dashboard-header">

                    <h1>
                        Job Seeker Dashboard
                    </h1>

                </div>


                {/* ==================================
                    WELCOME CARD
                ================================== */}

                <div className="welcome-card">


                    <div className="welcome-info">


                        <h1>

                            👋 Welcome Back,{" "}

                            {loginName}

                        </h1>


                        {/* LOGIN EMAIL */}

                        {loginEmail && (

                            <p>

                                {loginEmail}

                            </p>

                        )}


                        {/* LOGIN PHONE */}

                        {loginPhone && (

                            <p>

                                {loginPhone}

                            </p>

                        )}


                        <p>

                            Resume Status :

                            {" "}

                            <strong>

                                {displayAnalyzed

                                    ? "✅ Analyzed"

                                    : "⏳ Pending"}

                            </strong>

                        </p>


                        {displayLastAnalyzed && (

                            <small>

                                Last Analysis :

                                {" "}

                                {new Date(
                                    displayLastAnalyzed
                                ).toLocaleString()}

                            </small>

                        )}

                    </div>


                    {/* ==================================
                        DASHBOARD BUTTONS
                    ================================== */}

                    <div className="dashboard-buttons">


                        {/* ==================================
                            ANALYZE / RE-ANALYZE
                        ================================== */}

                        <button

                            className="analyze-btn"

                            onClick={
                                analyzeResume
                            }

                            disabled={
                                loading
                            }

                        >

                            {loading

                                ? "Analyzing..."

                                : displayAnalyzed

                                    ? "🔄 Re-analyze Resume"

                                    : "🤖 Analyze Resume"

                            }

                        </button>


                        {/* ==================================
                            DOWNLOAD REPORT
                        ================================== */}

                        {displayAnalyzed && (

                            <button

                                className="download-btn"

                                onClick={() =>

                                    downloadReport({

                                        ...(currentResume || {}),

                                        full_name:
                                            resumeName,

                                        email:
                                            resumeEmail,

                                        phone:
                                            resumePhone,

                                        ats_score:
                                            displayATSScore,

                                        hire_probability:
                                            displayHireProbability

                                    })

                                }

                            >

                                📄 Download Report

                            </button>

                        )}

                    </div>

                </div>


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="stats-row">


                    <StatCard

                        title="Resume Score"

                        value={

                            displayAnalyzed

                                ? `${displayATSScore}%`

                                : "--"

                        }

                    />


                    <StatCard

                        title="Hire Probability"

                        value={

                            displayAnalyzed

                                ? `${displayHireProbability}%`

                                : "--"

                        }

                    />


                    <StatCard

                        title="Resume"

                        value={

                            displayAnalyzed

                                ? "Analyzed"

                                : "Pending"

                        }

                    />


                    {/* ==================================
                        REAL APPLICATION COUNT
                    ================================== */}

                    <StatCard

                        title="Applications"

                        value={
                            applicationCount
                        }

                    />

                </div>


                {/* ==================================
                    RESUME + AI SUGGESTIONS
                ================================== */}

                <div className="middle-row">


                    <ResumeCard

                        profile={
                            resumeCardData
                        }

                    />


                    <AISuggestions

                        suggestions={

                            aiResult?.suggestions ||

                            []

                        }

                    />

                </div>


                {/* ==================================
                    AI ANALYSIS RESULT
                ================================== */}

                {displayAnalyzed &&

                    aiResult && (

                        <div className="ai-result-card">


                            <h2>
                                🤖 AI Resume Analysis
                            </h2>


                            <hr />


                            <div className="analysis-grid">


                                {/* ==============================
                                    SKILLS
                                ============================== */}

                                <div className="analysis-section">

                                    <h3>
                                        💻 Skills
                                    </h3>


                                    <ul>

                                        {aiResult.skills?.length > 0

                                            ? (

                                                aiResult.skills.map(

                                                    (
                                                        skill,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            {

                                                                typeof skill === "string"

                                                                    ? skill

                                                                    : skill?.name ||

                                                                    skill?.skill ||

                                                                    JSON.stringify(
                                                                        skill
                                                                    )

                                                            }

                                                        </li>

                                                    )

                                                )

                                            )

                                            : (

                                                <li>
                                                    No skills found.
                                                </li>

                                            )

                                        }

                                    </ul>

                                </div>


                                {/* ==============================
                                    PROJECTS
                                ============================== */}

                                <div className="analysis-section">

                                    <h3>
                                        📂 Projects
                                    </h3>


                                    <ul>

                                        {aiResult.projects?.length > 0

                                            ? (

                                                aiResult.projects.map(

                                                    (
                                                        project,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            <strong>

                                                                {
                                                                    project?.title ||

                                                                    project?.name ||

                                                                    "Project"
                                                                }

                                                            </strong>


                                                            <br />


                                                            {

                                                                project?.description ||

                                                                ""

                                                            }

                                                        </li>

                                                    )

                                                )

                                            )

                                            : (

                                                <li>
                                                    No projects found.
                                                </li>

                                            )

                                        }

                                    </ul>

                                </div>


                                {/* ==============================
                                    EDUCATION
                                ============================== */}

                                <div className="analysis-section">

                                    <h3>
                                        🎓 Education
                                    </h3>


                                    <ul>

                                        {aiResult.education?.length > 0

                                            ? (

                                                aiResult.education.map(

                                                    (
                                                        edu,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            <strong>

                                                                {
                                                                    edu?.degree ||

                                                                    "Degree"
                                                                }

                                                            </strong>


                                                            <br />


                                                            {

                                                                edu?.college ||

                                                                edu?.university ||

                                                                ""

                                                            }


                                                            <br />


                                                            {

                                                                edu?.year ||

                                                                edu?.graduationYear ||

                                                                ""

                                                            }


                                                            {edu?.cgpa && (

                                                                <>

                                                                    <br />

                                                                    CGPA:{" "}

                                                                    {
                                                                        edu.cgpa
                                                                    }

                                                                </>

                                                            )}

                                                        </li>

                                                    )

                                                )

                                            )

                                            : (

                                                <li>
                                                    No education found.
                                                </li>

                                            )

                                        }

                                    </ul>

                                </div>


                                {/* ==============================
                                    EXPERIENCE
                                ============================== */}

                                <div className="analysis-section">

                                    <h3>
                                        💼 Experience
                                    </h3>


                                    <ul>

                                        {aiResult.experience?.length > 0

                                            ? (

                                                aiResult.experience.map(

                                                    (
                                                        exp,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            <strong>

                                                                {
                                                                    exp?.title ||

                                                                    exp?.role ||

                                                                    exp?.position ||

                                                                    "Experience"
                                                                }

                                                            </strong>


                                                            <br />


                                                            {

                                                                exp?.company ||

                                                                ""

                                                            }


                                                            {exp?.description && (

                                                                <>

                                                                    <br />

                                                                    {
                                                                        exp.description
                                                                    }

                                                                </>

                                                            )}

                                                        </li>

                                                    )

                                                )

                                            )

                                            : (

                                                <li>
                                                    No experience found.
                                                </li>

                                            )

                                        }

                                    </ul>

                                </div>


                                {/* ==============================
                                    CERTIFICATIONS
                                ============================== */}

                                <div className="analysis-section">

                                    <h3>
                                        📜 Certifications
                                    </h3>


                                    <ul>

                                        {aiResult.certifications?.length > 0

                                            ? (

                                                aiResult.certifications.map(

                                                    (
                                                        cert,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            {

                                                                typeof cert === "string"

                                                                    ? cert

                                                                    : cert?.title ||

                                                                    cert?.name ||

                                                                    JSON.stringify(
                                                                        cert
                                                                    )

                                                            }

                                                        </li>

                                                    )

                                                )

                                            )

                                            : (

                                                <li>
                                                    No certifications found.
                                                </li>

                                            )

                                        }

                                    </ul>

                                </div>


                                {/* ==============================
                                    AI SUGGESTIONS
                                ============================== */}

                                <div className="analysis-section">

                                    <h3>
                                        💡 AI Suggestions
                                    </h3>


                                    <ul>

                                        {aiResult.suggestions?.length > 0

                                            ? (

                                                aiResult.suggestions.map(

                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            {

                                                                typeof item === "string"

                                                                    ? item

                                                                    : item?.suggestion ||

                                                                    item?.text ||

                                                                    JSON.stringify(
                                                                        item
                                                                    )

                                                            }

                                                        </li>

                                                    )

                                                )

                                            )

                                            : (

                                                <li>
                                                    No suggestions.
                                                </li>

                                            )

                                        }

                                    </ul>

                                </div>


                                {/* ==============================
                                    RECOMMENDED ROLES
                                ============================== */}

                                <div className="analysis-section">

                                    <h3>
                                        💼 Recommended Roles
                                    </h3>


                                    <ul>

                                        {aiResult.recommendedRoles?.length > 0

                                            ? (

                                                aiResult.recommendedRoles.map(

                                                    (
                                                        role,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            {

                                                                typeof role === "string"

                                                                    ? role

                                                                    : role?.role ||

                                                                    role?.title ||

                                                                    JSON.stringify(
                                                                        role
                                                                    )

                                                            }

                                                        </li>

                                                    )

                                                )

                                            )

                                            : (

                                                <li>
                                                    No recommended roles.
                                                </li>

                                            )

                                        }

                                    </ul>

                                </div>


                                {/* ==============================
                                    MISSING SKILLS
                                ============================== */}

                                {aiResult.missingSkills?.length > 0 && (

                                    <div className="analysis-section">

                                        <h3>
                                            ⚠️ Missing Skills
                                        </h3>


                                        <ul>

                                            {aiResult.missingSkills.map(

                                                (
                                                    skill,
                                                    index
                                                ) => (

                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >

                                                        {

                                                            typeof skill === "string"

                                                                ? skill

                                                                : skill?.name ||

                                                                skill?.skill ||

                                                                JSON.stringify(
                                                                    skill
                                                                )

                                                        }

                                                    </li>

                                                )

                                            )}

                                        </ul>

                                    </div>

                                )}


                            </div>

                        </div>

                    )}


                {/* ==================================
                    RECOMMENDED JOBS
                ================================== */}

                <div className="bottom-row">

                    <RecommendedJobs
                        key={`recommended-jobs-${refreshKey}`}
                        refreshTrigger={refreshKey}
                    />

                </div>


                {/* ==================================
                    RECENT APPLICATIONS
                ================================== */}

                <div className="bottom-row">

                    <RecentApplications
                        key={`recent-apps-${refreshKey}`}
                        refreshTrigger={refreshKey}
                    />

                </div>


            </div>

        </div>

    );

}


export default Dashboard;