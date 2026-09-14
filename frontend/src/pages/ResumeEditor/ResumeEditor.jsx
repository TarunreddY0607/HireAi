import {
    useEffect,
    useRef,
    useState
} from "react";

import "./ResumeEditor.css";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import ATSPreview from "../../components/ResumeEditor/ATSPreview";
import ATSHealth from "../../components/ResumeEditor/ATSHealth";

import SummarySection from "../../components/ResumeEditor/SummarySection";
import SkillsSection from "../../components/ResumeEditor/SkillsSection";
import EducationSection from "../../components/ResumeEditor/EducationSection";
import ExperienceSection from "../../components/ResumeEditor/ExperienceSection";
import ProjectsSection from "../../components/ResumeEditor/ProjectsSection";
import CertificationSection from "../../components/ResumeEditor/CertificationSection";
import SocialLinksSection from "../../components/ResumeEditor/SocialLinksSection";

import AIResumeCoach from "../../components/ResumeEditor/AIResumeCoach";
import ATSBreakdown from "../../components/ResumeEditor/ATSBreakdown";

import {
    getResume,
    updateResume,
    uploadNewResume
} from "../../services/resumeService";

import { getProfile } from "../../services/profileService";

import api from "../../services/api";

import calculateATS from "../../utils/calculateATS";


function ResumeEditor() {

    // ==========================================
    // Loading
    // ==========================================

    const [loading, setLoading] =
        useState(false);

    const [analyzing, setAnalyzing] =
        useState(false);

    const [uploading, setUploading] =
        useState(false);


    // ==========================================
    // File Input
    // ==========================================

    const fileInputRef =
        useRef(null);


    // ==========================================
    // Resume Data
    // ==========================================

    const [summary, setSummary] =
        useState("");

    const [skills, setSkills] =
        useState([]);

    const [education, setEducation] =
        useState([]);

    const [experience, setExperience] =
        useState([]);

    const [projects, setProjects] =
        useState([]);

    const [certifications, setCertifications] =
        useState([]);

    const [github, setGithub] =
        useState("");

    const [linkedin, setLinkedin] =
        useState("");


    // ==========================================
    // Profile / Personal Information
    // ==========================================

    const [profile, setProfile] =
        useState({});


    // ==========================================
    // AI Data
    // ==========================================

    const [hireProbability, setHireProbability] =
        useState(0);

    const [aiSuggestions, setAiSuggestions] =
        useState([]);

    const [recommendedRoles, setRecommendedRoles] =
        useState([]);


    // ==========================================
    // ATS
    // ==========================================

    const [atsScore, setAtsScore] =
        useState(0);

    const [isAnalyzed, setIsAnalyzed] =
        useState(false);


    // ==========================================
    // LOAD RESUME ON PAGE LOAD
    // ==========================================

    useEffect(() => {

        loadResume();

    }, []);


    // ==========================================
    // Safe JSON Parser
    // ==========================================

    const parseJSON = (
        value,
        fallback = []
    ) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return fallback;
        }


        if (Array.isArray(value)) {
            return value;
        }


        if (typeof value === "object") {
            return value;
        }


        if (typeof value === "string") {

            try {

                const parsed =
                    JSON.parse(value);

                return parsed;

            } catch (err) {

                console.log(
                    "JSON Parse Error:",
                    value
                );

                return fallback;
            }
        }


        return fallback;
    };


    // ==========================================
    // Get First Non-Empty Value
    // ==========================================

    const getValue = (
        resumeValue,
        profileValue,
        fallback = ""
    ) => {

        if (
            resumeValue !== undefined &&
            resumeValue !== null &&
            resumeValue !== ""
        ) {

            return resumeValue;
        }


        if (
            profileValue !== undefined &&
            profileValue !== null &&
            profileValue !== ""
        ) {

            return profileValue;
        }


        return fallback;
    };


    // ==========================================
    // Get Array Value
    // ==========================================

    const getArrayValue = (
        resumeValue,
        profileValue
    ) => {

        const resumeArray =
            parseJSON(
                resumeValue,
                []
            );


        if (
            Array.isArray(resumeArray) &&
            resumeArray.length > 0
        ) {

            return resumeArray;
        }


        const profileArray =
            parseJSON(
                profileValue,
                []
            );


        if (
            Array.isArray(profileArray) &&
            profileArray.length > 0
        ) {

            return profileArray;
        }


        return [];
    };


    // ==========================================
    // LOAD RESUME
    // ==========================================

    const loadResume = async () => {

        try {

            setLoading(true);


            // ==================================
            // Load Existing Resume
            // ==================================

            let resumeData = null;


            try {

                resumeData =
                    await getResume();

            } catch (resumeError) {

                console.log(
                    "Resume API Error:",
                    resumeError
                );
            }


            // ==================================
            // Extract Resume
            // ==================================

            const resume =
                resumeData?.resume || {};


            // ==================================
            // Load Existing Job Seeker Profile
            // ==================================

            let profileDataObject = {};


            try {

                const profileData =
                    await getProfile();

                profileDataObject =
                    profileData?.profile || {};

                setProfile(
                    profileDataObject
                );

            } catch (profileError) {

                console.log(
                    "Profile API Error:",
                    profileError
                );
            }


            // ==================================
            // DEBUG
            // ==================================

            console.log(
                "========== RESUME EDITOR =========="
            );

            console.log(
                "Resume Data:",
                resume
            );

            console.log(
                "Profile Data:",
                profileDataObject
            );

            console.log(
                "Resume ID:",
                resume.id
            );

            console.log(
                "Resume User ID:",
                resume.user_id
            );

            console.log(
                "Resume File:",
                resume.resume_path
            );

            console.log(
                "==================================="
            );


            // ==================================
            // SUMMARY
            // ==================================

            setSummary(

                getValue(
                    resume.summary,
                    profileDataObject.summary,
                    ""
                )

            );


            // ==================================
            // SKILLS
            // ==================================

            setSkills(

                getArrayValue(
                    resume.skills,
                    profileDataObject.skills
                )

            );


            // ==================================
            // EDUCATION
            // ==================================

            setEducation(

                getArrayValue(
                    resume.education,
                    profileDataObject.education
                )

            );


            // ==================================
            // EXPERIENCE
            // ==================================

            setExperience(

                getArrayValue(
                    resume.experience,
                    profileDataObject.experience
                )

            );


            // ==================================
            // PROJECTS
            // ==================================

            setProjects(

                getArrayValue(
                    resume.projects,
                    profileDataObject.projects
                )

            );


            // ==================================
            // CERTIFICATIONS
            // ==================================

            setCertifications(

                getArrayValue(
                    resume.certifications,
                    profileDataObject.certifications
                )

            );


            // ==================================
            // GITHUB
            // ==================================

            setGithub(

                getValue(
                    resume.github,
                    profileDataObject.github,
                    ""
                )

            );


            // ==================================
            // LINKEDIN
            // ==================================

            setLinkedin(

                getValue(
                    resume.linkedin,
                    profileDataObject.linkedin,
                    ""
                )

            );


            // ==================================
            // AI DATA
            // ==================================

            setHireProbability(

                Number(

                    getValue(
                        resume.hire_probability,
                        profileDataObject.hire_probability,
                        0
                    )

                ) || 0

            );


            setAiSuggestions(

                getArrayValue(
                    resume.ai_suggestions,
                    profileDataObject.ai_suggestions
                )

            );


            setRecommendedRoles(

                getArrayValue(
                    resume.recommended_roles,
                    profileDataObject.recommended_roles
                )

            );


            // ==================================
            // RESUME SCORE
            // ==================================

            setAtsScore(

                Number(

                    getValue(
                        resume.ats_score,
                        profileDataObject.ats_score,
                        0
                    )

                ) || 0

            );


            // ==================================
            // ANALYSIS STATUS
            // ==================================

            const analyzedValue =

                resume.is_analyzed !== undefined

                    ? resume.is_analyzed

                    : profileDataObject.is_analyzed;


            setIsAnalyzed(

                Boolean(

                    Number(analyzedValue) === 1 ||

                    analyzedValue === true ||

                    analyzedValue === "1"

                )

            );

        }

        catch (err) {

            console.error(
                "LOAD RESUME ERROR:",
                err
            );

            alert(

                err.response?.data?.message ||

                "Failed to load resume."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // UPLOAD NEW RESUME
    // ==========================================

    const handleUploadNewResume = async (
        event
    ) => {

        const file =
            event.target.files?.[0];


        // ==================================
        // No File
        // ==================================

        if (!file) {
            return;
        }


        // ==================================
        // PDF Validation
        // ==================================

        const isPDF =
            file.type ===
                "application/pdf" ||

            file.name
                .toLowerCase()
                .endsWith(".pdf");


        if (!isPDF) {

            alert(
                "Please select a PDF resume."
            );

            event.target.value = "";

            return;
        }


        // ==================================
        // File Size
        // ==================================
        //
        // Maximum 10 MB
        //

        const maxSize =
            10 * 1024 * 1024;


        if (file.size > maxSize) {

            alert(
                "Resume file must be less than 10 MB."
            );

            event.target.value = "";

            return;
        }


        // ==================================
        // Confirm
        // ==================================

        const confirmed =
            window.confirm(

                "Upload this resume as your new main resume?\n\n" +

                "Your previous resume will remain saved, " +

                "but this new resume will become the active resume " +

                "and the previous resume score analysis will be cleared."

            );


        if (!confirmed) {

            event.target.value = "";

            return;
        }


        try {

            setUploading(true);


            console.log(
                "\n========== UPLOADING NEW RESUME =========="
            );

            console.log(
                "File:",
                file.name
            );

            console.log(
                "Size:",
                file.size
            );

            console.log(
                "Type:",
                file.type
            );


            // ==================================
            // Upload
            // ==================================

            const response =
                await uploadNewResume(
                    file
                );


            console.log(
                "UPLOAD RESPONSE:",
                response
            );


            // ==================================
            // Reset Local ATS State
            // ==================================

            setAtsScore(0);

            setHireProbability(0);

            setAiSuggestions([]);

            setRecommendedRoles([]);

            setIsAnalyzed(false);


            // ==================================
            // Reload Main Resume
            // ==================================

            await loadResume();


            // ==================================
            // Success
            // ==================================

            alert(

                response?.message ||

                "New resume uploaded successfully."

            );


            console.log(
                "New Main Resume ID:",
                response?.resumeId
            );

            console.log(
                "========================================"
            );

        }

        catch (err) {

            console.error(
                "========== UPLOAD RESUME ERROR =========="
            );

            console.error(
                err
            );

            console.error(
                err.response?.data
            );

            alert(

                err.response?.data?.message ||

                err.message ||

                "Failed to upload new resume."

            );

        }

        finally {

            setUploading(false);

            // Clear input so the user can
            // select the same file again later.

            event.target.value = "";

        }

    };


    // ==========================================
    // Open File Picker
    // ==========================================

    const openResumePicker = () => {

        if (
            loading ||
            analyzing ||
            uploading
        ) {
            return;
        }


        fileInputRef
            .current
            ?.click();

    };


    // ==========================================
    // Resume Completion
    // ==========================================

    const calculateCompletion = () => {

        let completed = 0;

        const total = 8;


        if (
            summary &&
            summary.trim()
        ) {

            completed++;

        }


        if (skills.length) {

            completed++;

        }


        if (education.length) {

            completed++;

        }


        if (experience.length) {

            completed++;

        }


        if (projects.length) {

            completed++;

        }


        if (certifications.length) {

            completed++;

        }


        if (
            github &&
            github.trim()
        ) {

            completed++;

        }


        if (
            linkedin &&
            linkedin.trim()
        ) {

            completed++;

        }


        return Math.round(

            (completed / total) * 100

        );

    };


    const completion =
        calculateCompletion();


    // ==========================================
    // Potential Resume Score
    // ==========================================

    const potentialScore =

        Math.min(

            100,

            atsScore + 15

        );


    // ==========================================
    // SAVE RESUME
    // ==========================================

    const saveResume = async () => {

        try {

            setLoading(true);


            // ==================================
            // Personal information
            // ==================================

            const fullName =
                getValue(
                    profile?.full_name,
                    "",
                    ""
                );


            const email =
                getValue(
                    profile?.email,
                    "",
                    ""
                );


            const phone =
                getValue(
                    profile?.phone,
                    "",
                    ""
                );


            const resumeData = {

                full_name:
                    fullName,

                email:
                    email,

                phone:
                    phone,

                summary,

                skills,

                education,

                experience,

                projects,

                certifications,

                github,

                linkedin

            };


            console.log(
                "========== SAVING RESUME =========="
            );

            console.log(
                "Personal Information:",
                {
                    full_name:
                        fullName,

                    email,

                    phone
                }
            );

            console.log(
                "Resume Data:",
                resumeData
            );


            // ==================================
            // Save
            // ==================================

            const res =
                await updateResume(
                    resumeData
                );


            // ==================================
            // Calculate ATS
            // ==================================

            if (res && res.atsScore !== undefined) {

                setAtsScore(
                    Number(res.atsScore) || 0
                );

                if (res.hireProbability !== undefined) {
                    setHireProbability(
                        Number(res.hireProbability) || 0
                    );
                }

            } else {

                const estimatedATS =
                    calculateATS({

                        summary,

                        skills,

                        education,

                        experience,

                        projects,

                        certifications,

                        github,

                        linkedin

                    });

                setAtsScore(
                    estimatedATS
                );

            }


            console.log(
                "SAVE RESPONSE"
            );

            console.log(
                res
            );


            alert(
                "Resume saved successfully."
            );


            // ==================================
            // Reload
            // ==================================

            await loadResume();

        }

        catch (err) {

            console.log(
                "========== SAVE ERROR =========="
            );

            console.log(
                err
            );

            console.log(
                err.response
            );

            console.log(
                err.response?.data
            );

            console.log(
                "==============================="
            );


            alert(

                err.response?.data?.message ||

                err.message ||

                "Failed to save resume."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // AI Resume Analysis
    // ==========================================

    const reAnalyzeResume = async () => {

        try {

            // ==================================
            // Load Current MAIN Resume
            // ==================================

            console.log(
                "========== AI RESUME ANALYSIS =========="
            );


            const resumeResponse =
                await getResume();


            const currentResume =
                resumeResponse?.resume || {};


            console.log(
                "Current Main Resume:",
                currentResume
            );


            // ==================================
            // IMPORTANT
            // Use Resume ID
            // NOT User ID
            // ==================================

            const resumeId =
                currentResume.id ||
                currentResume.resume_id;


            const resumeUserId =
                currentResume.user_id;


            console.log(
                "Main Resume ID:",
                resumeId
            );


            console.log(
                "Resume User ID:",
                resumeUserId
            );


            // ==================================
            // Validate Resume
            // ==================================

            if (!resumeId) {

                alert(
                    "Resume not found. Please upload or save your resume first."
                );

                return;
            }


            // ==================================
            // Start Analysis
            // ==================================

            setAnalyzing(true);


            console.log(
                "Analyzing Main Resume ID:",
                resumeId
            );


            // ==================================
            // AI ANALYSIS REQUEST
            // ==================================
            //
            // POST /api/ai/analyze/:resumeId
            //
            // ==================================

            const res =
                await api.post(
                    `/ai/analyze/${resumeId}`
                );


            console.log(
                "AI ANALYSIS RESPONSE:"
            );

            console.log(
                res.data
            );


            // ==================================
            // Handle New Backend Response
            // ==================================

            if (
                res.data?.atsScore !== undefined
            ) {

                setAtsScore(
                    Number(
                        res.data.atsScore
                    ) || 0
                );

            }


            if (
                res.data?.hireProbability !==
                undefined
            ) {

                setHireProbability(
                    Number(
                        res.data.hireProbability
                    ) || 0
                );

            }


            if (
                Array.isArray(
                    res.data?.suggestions
                )
            ) {

                setAiSuggestions(
                    res.data.suggestions
                );

            }


            if (
                Array.isArray(
                    res.data?.recommendedRoles
                )
            ) {

                setRecommendedRoles(
                    res.data.recommendedRoles
                );

            }


            // ==================================
            // Backward Compatibility
            // ==================================

            if (
                res.data?.analysis
            ) {

                const analysis =
                    res.data.analysis;


                if (
                    analysis.atsScore !==
                    undefined
                ) {

                    setAtsScore(
                        Number(
                            analysis.atsScore
                        ) || 0
                    );

                }


                if (
                    analysis.hireProbability !==
                    undefined
                ) {

                    setHireProbability(
                        Number(
                            analysis.hireProbability
                        ) || 0
                    );

                }


                if (
                    Array.isArray(
                        analysis.suggestions
                    )
                ) {

                    setAiSuggestions(
                        analysis.suggestions
                    );

                }


                if (
                    Array.isArray(
                        analysis.recommendedRoles
                    )
                ) {

                    setRecommendedRoles(
                        analysis.recommendedRoles
                    );

                }

            }


            setIsAnalyzed(true);


            // ==================================
            // Success Message
            // ==================================

            alert(

                res.data?.message ||

                "Resume analyzed successfully."

            );


            // ==================================
            // Reload Updated Main Resume
            // ==================================

            await loadResume();

            window.dispatchEvent(new CustomEvent("resume_analyzed"));

        }

        catch (err) {

            console.error(
                "========== AI ANALYSIS ERROR =========="
            );

            console.error(
                err
            );

            console.error(
                "Status:",
                err.response?.status
            );

            console.error(
                "Response:",
                err.response?.data
            );


            alert(

                err.response?.data?.message ||

                err.message ||

                "AI Analysis Failed"

            );

        }

        finally {

            setAnalyzing(false);

        }

    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="dashboard">


            {/* ==================================
                Sidebar
            ================================== */}

            <Sidebar />


            {/* ==================================
                Main Content
            ================================== */}

            <div className="main-content">


                {/* ==================================
                    Topbar
                ================================== */}

                <Topbar />


                <div className="resume-editor-container">


                    {/* ==================================
                        Header
                    ================================== */}

                    <div className="editor-header">

                        <h1>

                            📄 Resume Editor

                        </h1>


                        <p>

                            Edit your existing resume,
                            improve your resume score,
                            and get AI recommendations.

                        </p>

                    </div>


                    {/* ==================================
                        Resume Score Preview
                    ================================== */}

                    <ATSPreview

                        completion={
                            completion
                        }

                        atsScore={
                            atsScore
                        }

                        potentialScore={
                            potentialScore
                        }

                    />


                    {/* ==================================
                        AI Resume Coach
                    ================================== */}

                    <AIResumeCoach

                        atsScore={
                            atsScore
                        }

                        hireProbability={
                            hireProbability
                        }

                        aiSuggestions={
                            aiSuggestions
                        }

                        recommendedRoles={
                            recommendedRoles
                        }

                    />


                    {/* ==================================
                        Resume Health
                    ================================== */}

                    <ATSHealth

                        summary={
                            summary
                        }

                        skills={
                            skills
                        }

                        education={
                            education
                        }

                        experience={
                            experience
                        }

                        projects={
                            projects
                        }

                        certifications={
                            certifications
                        }

                        github={
                            github
                        }

                        linkedin={
                            linkedin
                        }

                    />


                    {/* ==================================
                        Resume Score Breakdown
                    ================================== */}

                    <ATSBreakdown

                        summary={
                            summary
                        }

                        skills={
                            skills
                        }

                        education={
                            education
                        }

                        experience={
                            experience
                        }

                        projects={
                            projects
                        }

                        certifications={
                            certifications
                        }

                        github={
                            github
                        }

                        linkedin={
                            linkedin
                        }

                    />


                    {/* ==================================
                        Resume Tips
                    ================================== */}

                    <div className="resume-tip-card">

                        <h2>

                            💡 Score Improvement Tips

                        </h2>


                        <ul>

                            {!summary.trim() && (

                                <li>

                                    Add a professional
                                    summary.

                                </li>

                            )}


                            {skills.length < 6 && (

                                <li>

                                    Add more technical
                                    skills to improve score.

                                </li>

                            )}


                            {projects.length < 2 && (

                                <li>

                                    Add at least two
                                    strong projects.

                                </li>

                            )}


                            {experience.length === 0 && (

                                <li>

                                    Add internship or
                                    work experience.

                                </li>

                            )}


                            {!github.trim() && (

                                <li>

                                    Add your GitHub
                                    profile.

                                </li>

                            )}


                            {!linkedin.trim() && (

                                <li>

                                    Add your LinkedIn
                                    profile.

                                </li>

                            )}


                            {summary &&

                                skills.length >= 6 &&

                                education.length &&

                                experience.length &&

                                projects.length >= 2 &&

                                github &&

                                linkedin && (

                                    <li>

                                        🎉 Your resume
                                        is looking excellent.

                                    </li>

                                )}

                        </ul>

                    </div>


                    {/* ==================================
                        Summary
                    ================================== */}

                    <div className="editor-section">

                        <h2>

                            01. Professional Summary

                        </h2>


                        <SummarySection

                            summary={
                                summary
                            }

                            setSummary={
                                setSummary
                            }

                            aiSuggestions={
                                aiSuggestions
                            }

                            atsScore={
                                atsScore
                            }

                        />

                    </div>


                    {/* ==================================
                        Skills
                    ================================== */}

                    <div className="editor-section">

                        <h2>

                            02. Skills

                        </h2>


                        <SkillsSection

                            skills={
                                skills
                            }

                            setSkills={
                                setSkills
                            }

                            aiSuggestions={
                                aiSuggestions
                            }

                            atsScore={
                                atsScore
                            }

                        />

                    </div>


                    {/* ==================================
                        Education
                    ================================== */}

                    <div className="editor-section">

                        <h2>

                            03. Education

                        </h2>


                        <EducationSection

                            education={
                                education
                            }

                            setEducation={
                                setEducation
                            }

                            aiSuggestions={
                                aiSuggestions
                            }

                            atsScore={
                                atsScore
                            }

                        />

                    </div>


                    {/* ==================================
                        Experience
                    ================================== */}

                    <div className="editor-section">

                        <h2>

                            04. Experience

                        </h2>


                        <ExperienceSection

                            experience={
                                experience
                            }

                            setExperience={
                                setExperience
                            }

                            aiSuggestions={
                                aiSuggestions
                            }

                            atsScore={
                                atsScore
                            }

                        />

                    </div>


                    {/* ==================================
                        Projects
                    ================================== */}

                    <div className="editor-section">

                        <h2>

                            05. Projects

                        </h2>


                        <ProjectsSection

                            projects={
                                projects
                            }

                            setProjects={
                                setProjects
                            }

                            aiSuggestions={
                                aiSuggestions
                            }

                            atsScore={
                                atsScore
                            }

                        />

                    </div>


                    {/* ==================================
                        Certifications
                    ================================== */}

                    <div className="editor-section">

                        <h2>

                            06. Certifications

                        </h2>


                        <CertificationSection

                            certifications={
                                certifications
                            }

                            setCertifications={
                                setCertifications
                            }

                            aiSuggestions={
                                aiSuggestions
                            }

                            atsScore={
                                atsScore
                            }

                        />

                    </div>


                    {/* ==================================
                        Social Links
                    ================================== */}

                    <div className="editor-section">

                        <h2>

                            07. Social Links

                        </h2>


                        <SocialLinksSection

                            github={
                                github
                            }

                            setGithub={
                                setGithub
                            }

                            linkedin={
                                linkedin
                            }

                            setLinkedin={
                                setLinkedin
                            }

                            aiSuggestions={
                                aiSuggestions
                            }

                            atsScore={
                                atsScore
                            }

                        />

                    </div>


                    {/* ==================================
                        Bottom Tip
                    ================================== */}

                    <div className="resume-tip">

                        💡 Save your resume before
                        running AI analysis. Updating
                        your resume regularly helps
                        improve your ATS score.

                    </div>


                    {/* ==================================
                        ACTION BUTTONS
                    ================================== */}

                    <div className="resume-actions">


                        {/* ==================================
                            UPLOAD NEW RESUME
                        ================================== */}

                        <input

                            ref={
                                fileInputRef
                            }

                            type="file"

                            accept="application/pdf,.pdf"

                            style={{
                                display: "none"
                            }}

                            onChange={
                                handleUploadNewResume
                            }

                        />


                        <button

                            type="button"

                            className="upload-btn"

                            onClick={
                                openResumePicker
                            }

                            disabled={
                                loading ||
                                analyzing ||
                                uploading
                            }

                        >

                            {

                                uploading

                                    ? "Uploading..."

                                    : "📤 Upload New Resume"

                            }

                        </button>


                        {/* ==================================
                            SAVE
                        ================================== */}

                        <button

                            type="button"

                            className="save-btn"

                            onClick={
                                saveResume
                            }

                            disabled={
                                loading ||
                                analyzing ||
                                uploading
                            }

                        >

                            {

                                loading

                                    ? "Saving..."

                                    : "💾 Save Resume"

                            }

                        </button>


                        {/* ==================================
                            AI ANALYSIS
                        ================================== */}

                        <button

                            type="button"

                            className="reanalyze-btn"

                            onClick={
                                reAnalyzeResume
                            }

                            disabled={
                                loading ||
                                analyzing ||
                                uploading
                            }

                        >

                            {

                                analyzing

                                    ? "Analyzing..."

                                    : "🤖 Analyze with AI"

                            }

                        </button>


                    </div>


                </div>


            </div>


        </div>

    );

}


export default ResumeEditor;