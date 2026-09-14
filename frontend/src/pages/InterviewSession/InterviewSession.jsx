import { useEffect, useState } from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import useSpeechSynthesis from "../../hooks/useSpeechSynthesis";

import FaceCamera from "../../components/Interview/FaceCamera";
import AIAvatar from "../../components/Interview/AIAvatar";

import "./InterviewSession.css";

import {
    startInterview,
    evaluateAnswer,
    saveJobInterview
} from "../../services/interviewService";

import {
    saveInterviewHistory
} from "../../services/interviewHistoryService";


function InterviewSession() {

    const navigate = useNavigate();

    const location = useLocation();


    // ==========================================
    // INTERVIEW INFORMATION
    // ==========================================

    const {
        role,
        difficulty,
        questions,
        mode,
        jobId,
        job
    } = location.state || {};


    // ==========================================
    // STATES
    // ==========================================

    const [loading, setLoading] = useState(true);

    const [questionList, setQuestionList] = useState([]);

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [answer, setAnswer] = useState("");

    const [feedback, setFeedback] = useState(null);

    const [showNextButton, setShowNextButton] = useState(false);

    const [speaking, setSpeaking] = useState(false);

    const [evaluating, setEvaluating] = useState(false);

    /*
        Store every evaluated question.

        Example:

        [
            {
                question: "...",
                answer: "...",
                score: 80,
                technicalScore: 78,
                communicationScore: 82,
                confidenceScore: 80,
                feedback: "...",
                correctAnswer: "..."
            }
        ]
    */

    const [evaluatedAnswers, setEvaluatedAnswers] = useState([]);


    // ==========================================
    // SPEECH RECOGNITION
    // ==========================================

    const {
        transcript,
        listening,
        startListening,
        stopListening
    } = useSpeechRecognition();


    // ==========================================
    // SPEECH SYNTHESIS
    // ==========================================

    const {
        speak,
        stop
    } = useSpeechSynthesis();


    // ==========================================
    // SPEAK QUESTION
    // ==========================================

    const speakQuestion = (text) => {

        if (!text) {
            return;
        }

        setSpeaking(true);

        speak(text);

        const words =
            text.split(" ").length;

        const duration =
            Math.max(
                words * 450,
                3000
            );

        setTimeout(() => {

            setSpeaking(false);

            startListening();

        }, duration);

    };


    // ==========================================
    // LOAD INTERVIEW
    // ==========================================

    useEffect(() => {

        loadInterview();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);


    // ==========================================
    // VOICE → TEXT
    // ==========================================

    useEffect(() => {

        if (listening) {

            setAnswer(transcript);

        }

    }, [
        transcript,
        listening
    ]);


    // ==========================================
    // AI SPEAKS EVERY QUESTION
    // ==========================================

    useEffect(() => {

        if (
            questionList.length === 0
        ) {

            return;

        }

        if (
            evaluatedAnswers[currentQuestion]
        ) {

            return;

        }

        stopListening();

        speakQuestion(
            questionList[currentQuestion]?.question
        );


        return () => {

            stopListening();

            stop();

        };

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [
        currentQuestion,
        questionList
    ]);


    // ==========================================
    // LOAD INTERVIEW QUESTIONS
    // ==========================================

    const loadInterview = async () => {

        try {

            console.log(
                "\n========================================="
            );

            console.log(
                "🚀 STARTING INTERVIEW"
            );

            console.log(
                "Mode:",
                mode
            );

            console.log(
                "Role:",
                role
            );

            console.log(
                "Difficulty:",
                difficulty
            );

            console.log(
                "Questions:",
                questions
            );

            console.log(
                "Job ID:",
                jobId
            );

            console.log(
                "=========================================\n"
            );


            const data =
                await startInterview({

                    role,

                    difficulty,

                    questions,

                    mode,

                    jobId,

                    job

                });


            // ==========================================
            // VALIDATE QUESTIONS
            // ==========================================

            if (
                data &&
                Array.isArray(data.questions) &&
                data.questions.length > 0
            ) {

                setQuestionList(
                    data.questions
                );

            }

            else {

                throw new Error(
                    "No interview questions received"
                );

            }

        }

        catch (err) {

            console.log(
                "Interview Start Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to Start Interview"
            );

            navigate(
                "/ai-interview"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // GET CORRECT ANSWER
    // ==========================================

    const getCorrectAnswer = (result) => {

        if (!result) {

            return "";

        }

        return (

            result.correctAnswer ||

            result.correct_answer ||

            result.idealAnswer ||

            result.ideal_answer ||

            result.modelAnswer ||

            result.model_answer ||

            result.referenceAnswer ||

            result.reference_answer ||

            result.answer ||

            ""

        );

    };


    // ==========================================
    // GET SCORE
    // ==========================================

    const getScore = (result) => {

        const score = Number(
            result?.score ??
            result?.overallScore ??
            result?.overall_score ??
            0
        );

        if (Number.isNaN(score)) {

            return 0;

        }

        return Math.max(
            0,
            Math.min(
                100,
                score
            )
        );

    };


    // ==========================================
    // CALCULATE QUESTION SCORES
    // ==========================================

    const calculateQuestionScores = (
        result
    ) => {

        const score =
            getScore(result);


        const technical =
            Number(
                result?.technicalScore ??
                result?.technical_score ??
                Math.max(
                    score - 5,
                    0
                )
            );


        const communication =
            Number(
                result?.communicationScore ??
                result?.communication_score ??
                Math.min(
                    score + 3,
                    100
                )
            );


        const confidence =
            Number(
                result?.confidenceScore ??
                result?.confidence_score ??
                Math.min(
                    score + 1,
                    100
                )
            );


        return {

            score,

            technicalScore:
                Math.max(
                    0,
                    Math.min(
                        100,
                        technical
                    )
                ),

            communicationScore:
                Math.max(
                    0,
                    Math.min(
                        100,
                        communication
                    )
                ),

            confidenceScore:
                Math.max(
                    0,
                    Math.min(
                        100,
                        confidence
                    )
                )

        };

    };


    // ==========================================
    // SUBMIT CURRENT ANSWER
    // ==========================================

    const submitAnswer = async () => {

        if (evaluating) {

            return;

        }


        if (!answer.trim()) {

            alert(
                "Please answer the question."
            );

            return;

        }


        stopListening();

        stop();


        setEvaluating(true);


        try {

            const current =
                questionList[currentQuestion];


            const idealAnswer =
                current?.idealAnswer ||
                current?.ideal_answer ||
                current?.referenceAnswer ||
                current?.reference_answer ||
                "";

            const result =
                await evaluateAnswer(

                    current.question,

                    answer.trim(),

                    idealAnswer

                );


            console.log(
                "========== AI EVALUATION =========="
            );

            console.log(
                result
            );

            console.log(
                "==================================="
            );


            const evaluation =
                result?.result || result;


            if (!evaluation) {

                throw new Error(
                    "No evaluation received"
                );

            }


            // ==========================================
            // CALCULATE SCORES
            // ==========================================

            const scores =
                calculateQuestionScores(
                    evaluation
                );


            // ==========================================
            // GET CORRECT ANSWER
            // ==========================================

            const correctAnswer =
                getCorrectAnswer(
                    evaluation
                ) ||
                current?.idealAnswer ||
                current?.ideal_answer ||
                current?.referenceAnswer ||
                current?.reference_answer ||
                "";


            // ==========================================
            // STORE COMPLETE QUESTION RESULT
            // ==========================================

            const questionResult = {

                question:
                    current.question,

                answer:
                    answer.trim(),

                score:
                    scores.score,

                technicalScore:
                    scores.technicalScore,

                communicationScore:
                    scores.communicationScore,

                confidenceScore:
                    scores.confidenceScore,

                feedback:
                    evaluation.feedback || "",

                strengths:
                    evaluation.strengths || [],

                improvements:
                    evaluation.improvements || [],

                correctAnswer,

                idealAnswer:
                    current?.idealAnswer ||
                    current?.ideal_answer ||
                    current?.referenceAnswer ||
                    current?.reference_answer ||
                    ""

            };


            // ==========================================
            // SAVE QUESTION RESULT
            // ==========================================

            setEvaluatedAnswers(
                previous => {

                    const updated = [
                        ...previous
                    ];

                    updated[currentQuestion] =
                        questionResult;

                    return updated;

                }
            );


            // ==========================================
            // SHOW FEEDBACK IMMEDIATELY
            // ==========================================

            setFeedback(
                {
                    ...evaluation,

                    ...scores,

                    correctAnswer:
                        correctAnswer ||
                        current?.idealAnswer ||
                        current?.ideal_answer ||
                        current?.referenceAnswer ||
                        current?.reference_answer ||
                        ""

                }
            );


            setShowNextButton(
                true
            );

        }

        catch (err) {

            console.log(
                "Evaluation Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Evaluation Failed"
            );

        }

        finally {

            setEvaluating(false);

        }

    };


    // ==========================================
    // CALCULATE FINAL SCORES
    // ==========================================

    const calculateFinalScores = (
        allAnswers
    ) => {

        if (
            !allAnswers ||
            allAnswers.length === 0
        ) {

            return {

                overallScore: 0,

                technicalScore: 0,

                communicationScore: 0,

                confidenceScore: 0

            };

        }


        const validAnswers =
            allAnswers.filter(
                item => item
            );


        if (
            validAnswers.length === 0
        ) {

            return {

                overallScore: 0,

                technicalScore: 0,

                communicationScore: 0,

                confidenceScore: 0

            };

        }


        const totalOverall =
            validAnswers.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.score || 0
                    ),
                0
            );


        const totalTechnical =
            validAnswers.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.technicalScore || 0
                    ),
                0
            );


        const totalCommunication =
            validAnswers.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.communicationScore || 0
                    ),
                0
            );


        const totalConfidence =
            validAnswers.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.confidenceScore || 0
                    ),
                0
            );


        return {

            overallScore:
                Math.round(
                    totalOverall /
                    validAnswers.length
                ),

            technicalScore:
                Math.round(
                    totalTechnical /
                    validAnswers.length
                ),

            communicationScore:
                Math.round(
                    totalCommunication /
                    validAnswers.length
                ),

            confidenceScore:
                Math.round(
                    totalConfidence /
                    validAnswers.length
                )

        };

    };


    // ==========================================
    // GET RECOMMENDATION
    // ==========================================

    const getRecommendation = (
        score
    ) => {

        if (score >= 80) {

            return "Recommended";

        }

        if (score >= 60) {

            return "Needs Practice";

        }

        return "Not Recommended";

    };


    // ==========================================
    // FINISH INTERVIEW
    // ==========================================

    const finishInterview = async () => {

        /*
            IMPORTANT:

            The latest question was already saved
            into evaluatedAnswers when Submit Answer
            was clicked.

            Because React state updates asynchronously,
            feedback/current state may not contain the
            latest array immediately.

            So we explicitly build the final array.
        */

        const finalAnswers = [
            ...evaluatedAnswers
        ];


        if (
            !finalAnswers[currentQuestion]
            &&
            feedback
        ) {

            const current =
                questionList[currentQuestion];


            const scores =
                calculateQuestionScores(
                    feedback
                );


            finalAnswers[currentQuestion] = {

                question:
                    current?.question || "",

                answer:
                    answer || "",

                score:
                    scores.score,

                technicalScore:
                    scores.technicalScore,

                communicationScore:
                    scores.communicationScore,

                confidenceScore:
                    scores.confidenceScore,

                feedback:
                    feedback.feedback || "",

                strengths:
                    feedback.strengths || [],

                improvements:
                    feedback.improvements || [],

                correctAnswer:
                    getCorrectAnswer(
                        feedback
                    ) ||
                    current?.idealAnswer ||
                    current?.ideal_answer ||
                    current?.referenceAnswer ||
                    current?.reference_answer ||
                    "",

                idealAnswer:
                    current?.idealAnswer ||
                    current?.ideal_answer ||
                    current?.referenceAnswer ||
                    current?.reference_answer ||
                    ""

            };

        }


        // ==========================================
        // FINAL SCORE
        // ==========================================

        const finalScores =
            calculateFinalScores(
                finalAnswers
            );


        const recommendation =
            getRecommendation(
                finalScores.overallScore
            );


        console.log(
            "\n========================================="
        );

        console.log(
            "🎯 INTERVIEW COMPLETED"
        );

        console.log(
            "Overall:",
            finalScores.overallScore
        );

        console.log(
            "Technical:",
            finalScores.technicalScore
        );

        console.log(
            "Communication:",
            finalScores.communicationScore
        );

        console.log(
            "Confidence:",
            finalScores.confidenceScore
        );

        console.log(
            "Recommendation:",
            recommendation
        );

        console.log(
            "=========================================\n"
        );


        try {

            // ==========================================
            // SAVE PRACTICE HISTORY
            // ==========================================

            await saveInterviewHistory({

                role,

                difficulty,

                totalQuestions:
                    questionList.length,

                overallScore:
                    finalScores.overallScore,

                technicalScore:
                    finalScores.technicalScore,

                communicationScore:
                    finalScores.communicationScore,

                confidenceScore:
                    finalScores.confidenceScore,

                recommendation,

                feedback:
                    (() => {
                        const distinctStrengths = [
                            ...new Set(
                                finalAnswers.flatMap(item => item?.strengths || [])
                            )
                        ].filter(Boolean);

                        const distinctImprovements = [
                            ...new Set(
                                finalAnswers.flatMap(item => item?.improvements || [])
                            )
                        ].filter(Boolean);

                        const verdictText = finalScores.overallScore >= 70
                            ? "Candidate is Good & Recommended"
                            : finalScores.overallScore >= 45
                            ? "Candidate has Potential (Needs Improvement)"
                            : "Candidate is Not Recommended";

                        return [
                            `Verdict: ${verdictText}`,
                            distinctStrengths.length > 0
                                ? `Key Strengths: ${distinctStrengths.slice(0, 2).join(", ")}`
                                : `Evaluated technical knowledge at ${finalScores.technicalScore}%.`,
                            distinctImprovements.length > 0
                                ? `Areas to Improve: ${distinctImprovements.slice(0, 2).join(", ")}`
                                : `Enhance technical problem-solving depth and structured explanations.`,
                            `Interview Score Breakdown: Technical ${finalScores.technicalScore}%, Communication ${finalScores.communicationScore}%, Confidence ${finalScores.confidenceScore}%.`
                        ].join("\n• ");
                    })(),

                strengths:
                    [
                        ...new Set(
                            finalAnswers
                                .flatMap(
                                    item =>
                                        item?.strengths || []
                                )
                        )
                    ],

                improvements:
                    [
                        ...new Set(
                            finalAnswers
                                .flatMap(
                                    item =>
                                        item?.improvements || []
                                )
                        )
                    ]

            });


            // ==========================================
            // JOB INTERVIEW
            // ==========================================

            if (
                mode === "job" &&
                jobId
            ) {

                const distinctStrengths = [
                    ...new Set(
                        finalAnswers.flatMap(item => item?.strengths || [])
                    )
                ].filter(Boolean);

                const distinctImprovements = [
                    ...new Set(
                        finalAnswers.flatMap(item => item?.improvements || [])
                    )
                ].filter(Boolean);

                const verdictText = finalScores.overallScore >= 70
                    ? "Candidate is Good & Recommended"
                    : finalScores.overallScore >= 45
                    ? "Candidate has Potential (Needs Improvement)"
                    : "Candidate is Not Recommended";

                const conciseAiFeedback = [
                    `Verdict: ${verdictText}`,
                    distinctStrengths.length > 0
                        ? `Key Strengths: ${distinctStrengths.slice(0, 2).join(", ")}`
                        : `Evaluated technical knowledge at ${finalScores.technicalScore}%.`,
                    distinctImprovements.length > 0
                        ? `Areas to Improve: ${distinctImprovements.slice(0, 2).join(", ")}`
                        : `Enhance technical problem-solving depth and structured explanations.`,
                    `Interview Score Breakdown: Technical ${finalScores.technicalScore}%, Communication ${finalScores.communicationScore}%, Confidence ${finalScores.confidenceScore}%.`
                ].join("\n• ");

                await saveJobInterview({

                    jobId,

                    technicalScore:
                        finalScores.technicalScore,

                    communicationScore:
                        finalScores.communicationScore,

                    confidenceScore:
                        finalScores.confidenceScore,

                    overallScore:
                        finalScores.overallScore,

                    aiFeedback:
                        conciseAiFeedback,

                    recommendation

                });


                console.log(
                    "✅ Job interview saved successfully"
                );

            }


            // ==========================================
            // GO TO REPORT
            // ==========================================

            navigate(
                "/interview-report",
                {

                    state: {

                        feedback: {

                            ...feedback,

                            score:
                                finalScores.overallScore,

                            technicalScore:
                                finalScores.technicalScore,

                            communicationScore:
                                finalScores.communicationScore,

                            confidenceScore:
                                finalScores.confidenceScore,

                            recommendation,

                            allAnswers:
                                finalAnswers

                        },

                        mode,

                        jobId,

                        job,

                        role,

                        difficulty,

                        totalQuestions:
                            questionList.length,

                        overallScore:
                            finalScores.overallScore,

                        technicalScore:
                            finalScores.technicalScore,

                        communicationScore:
                            finalScores.communicationScore,

                        confidenceScore:
                            finalScores.confidenceScore,

                        recommendation,

                        allAnswers:
                            finalAnswers

                    }

                }
            );

        }

        catch (err) {

            console.log(
                "Failed to save interview:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Interview completed, but failed to save the result."
            );

        }

    };


    // ==========================================
    // NEXT QUESTION
    // ==========================================

    const goToNextQuestion = async () => {

        if (!feedback) {

            return;

        }


        // ==========================================
        // LAST QUESTION
        // ==========================================

        if (
            currentQuestion + 1 >=
            questionList.length
        ) {

            await finishInterview();

            return;

        }


        // ==========================================
        // NEXT QUESTION
        // ==========================================

        setCurrentQuestion(
            previous =>
                previous + 1
        );


        setAnswer("");

        setFeedback(null);

        setShowNextButton(false);

    };


    // ==========================================
    // FACE LOOK-AWAY TIMEOUT (5+ SECONDS)
    // ==========================================

    const handleLookAwayNewQuestion = () => {

        if (evaluating || showNextButton || feedback) {
            return;
        }

        console.log("⚠️ Look-away detected for 5+ seconds! Replacing current question...");

        stopListening();
        stop();

        const replacementBank = [
            "Can you explain the core architecture and request lifecycle of a modern web application?",
            "How do you approach error handling, exception logging, and debugging in production environments?",
            "Describe a complex technical challenge you recently solved and the trade-offs you considered.",
            "What are the main differences between synchronous and asynchronous operations, and when would you use each?",
            "Explain how REST APIs handle authentication, security, and rate limiting effectively.",
            "How does database indexing work, and what are its pros and cons in high-traffic applications?",
            "What strategies do you follow to ensure code maintainability and test coverage across a team?",
            "Can you explain the principles of object-oriented design and design patterns you frequently use?"
        ];

        const existingQuestions = new Set(questionList.map(q => q?.question?.trim()));
        const availablePool = replacementBank.filter(q => !existingQuestions.has(q.trim()));

        const newQuestionText = availablePool.length > 0
            ? availablePool[Math.floor(Math.random() * availablePool.length)]
            : `Explain your technical workflow and problem-solving methodology for ${role || "this role"}.`;

        const newQuestionObj = {
            id: Date.now(),
            question: newQuestionText,
            idealAnswer: "Provide a structured, comprehensive explanation highlighting technical concepts and practical examples."
        };

        setQuestionList(prev => {
            const updated = [...prev];
            updated[currentQuestion] = newQuestionObj;
            return updated;
        });

        setAnswer("");
        setFeedback(null);
        setShowNextButton(false);

        alert("⚠️ You turned your face away for more than 5 seconds! The question has been changed to a new one.");

        speakQuestion(newQuestionText);

    };


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {

        return (

            <div className="loading-screen">

                <h2>

                    🤖 Preparing Your AI Interview...

                </h2>

                {

                    mode === "job" &&
                    jobId &&

                    <p>

                        Preparing questions based on
                        the applied job...

                    </p>

                }

            </div>

        );

    }


    // ==========================================
    // NO QUESTIONS
    // ==========================================

    if (
        !questionList ||
        questionList.length === 0
    ) {

        return (

            <div className="loading-screen">

                <h2>

                    ❌ No Interview Questions Available

                </h2>

                <button

                    onClick={() =>
                        navigate("/ai-interview")
                    }

                >

                    Back to AI Interview

                </button>

            </div>

        );

    }


    const current =
        questionList[currentQuestion];


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="dashboard">

            <Sidebar />


            <div className="main-content">

                <Topbar />


                <div className="interview-session">


                    {/* ==================================
                        JOB INTERVIEW INDICATOR
                    ================================== */}

                    {

                        mode === "job" &&
                        job &&

                        <div className="job-interview-banner">

                            <strong>

                                🎯 Job Interview

                            </strong>

                            <span>

                                {job.title}

                            </span>

                            <span>

                                • {job.company}

                            </span>

                        </div>

                    }

                    {
                        !window.isSecureContext && (
                            <div className="secure-context-warning">
                                <strong>⚠️ Browser Security Block:</strong> Camera & Microphone access require a secure context (https://) or localhost. Please open <a href="http://localhost:5173/interview-session" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 'bold' }}>http://localhost:5173</a> to enable them!
                            </div>
                        )
                    }


                    {/* ==================================
                        AI AVATAR
                    ================================== */}

                    <AIAvatar

                        speaking={speaking}

                        recruiter="Sophia"

                    />


                    {/* ==================================
                        TITLE
                    ================================== */}

                    <h1>

                        🤖 AI Interview

                    </h1>


                    {/* ==================================
                        PROGRESS
                    ================================== */}

                    <div className="interview-progress">

                        <strong>

                            Question{" "}

                            {currentQuestion + 1}

                            {" / "}

                            {questionList.length}

                        </strong>

                    </div>


                    {/* ==================================
                        QUESTION
                    ================================== */}

                    <div className="question-card">

                        <h2>

                            Question{" "}

                            {currentQuestion + 1}

                            {" / "}

                            {questionList.length}

                        </h2>

                        <p>

                            {
                                current?.question
                            }

                        </p>

                    </div>


                    {/* ==================================
                        FACE DETECTION
                    ================================== */}

                    <FaceCamera onLookAwayTimeout={handleLookAwayNewQuestion} />


                    {/* ==================================
                        ANSWER
                    ================================== */}

                    <div className="answer-card">

                        <h2>

                            🎤 Your Answer

                        </h2>


                        <textarea

                            rows="8"

                            value={answer}

                            onChange={(e) => setAnswer(e.target.value)}

                            placeholder=
                                "Your voice will appear here (or you can type your answer)..."

                        />


                        {/* ==================================
                            VOICE BUTTONS
                        ================================== */}

                        <div className="voice-buttons">

                            {

                                !listening

                                ?

                                (

                                    <button

                                        className=
                                            "start-record-btn"

                                        onClick={
                                            startListening
                                        }

                                        disabled={
                                            evaluating ||
                                            showNextButton
                                        }

                                    >

                                        🎙 Start Recording

                                    </button>

                                )

                                :

                                (

                                    <button

                                        className=
                                            "stop-record-btn"

                                        onClick={
                                            stopListening
                                        }

                                        disabled={
                                            evaluating ||
                                            showNextButton
                                        }

                                    >

                                        ⏹ Stop Recording

                                    </button>

                                )

                            }


                            {

                                !showNextButton &&

                                (

                                    <button

                                        className=
                                            "submit-btn"

                                        onClick={
                                            submitAnswer
                                        }

                                        disabled={
                                            evaluating
                                        }

                                    >

                                        {

                                            evaluating

                                            ?

                                            "🤖 Evaluating..."

                                            :

                                            "➜ Submit Answer"

                                        }

                                    </button>

                                )

                            }

                        </div>

                    </div>


                    {/* ==================================
                        AI FEEDBACK
                    ================================== */}

                    {

                        feedback &&

                        (

                            <div className="feedback-card">

                                <h2>

                                    🤖 AI Evaluation

                                </h2>


                                {/* ==================================
                                    SCORE
                                ================================== */}

                                <div className="score-box">

                                    <h1>

                                        {
                                            getScore(
                                                feedback
                                            )
                                        }/100

                                    </h1>

                                </div>


                                {/* ==================================
                                    CORRECT ANSWER
                                ================================== */}

                                <div className="correct-answer-box">

                                    <h3>

                                        ✅ Correct / Ideal Answer

                                    </h3>


                                    {

                                        (
                                            feedback.correctAnswer ||
                                            current?.idealAnswer ||
                                            current?.ideal_answer ||
                                            current?.referenceAnswer ||
                                            current?.reference_answer
                                        )

                                        ?

                                        (

                                            <p>

                                                {
                                                    feedback.correctAnswer ||
                                                    current?.idealAnswer ||
                                                    current?.ideal_answer ||
                                                    current?.referenceAnswer ||
                                                    current?.reference_answer
                                                }

                                            </p>

                                        )

                                        :

                                        (

                                            <p>

                                                AI did not return
                                                a reference answer
                                                for this question.

                                            </p>

                                        )

                                    }

                                </div>


                                {/* ==================================
                                    YOUR ANSWER
                                ================================== */}

                                <div className="your-answer-box">

                                    <h3>

                                        🗣️ Your Answer

                                    </h3>

                                    <p>

                                        {
                                            answer ||
                                            "No answer"
                                        }

                                    </p>

                                </div>


                                {/* ==================================
                                    FEEDBACK
                                ================================== */}

                                {

                                    feedback.feedback &&

                                    (

                                        <>

                                            <h3>

                                                💬 Feedback

                                            </h3>

                                            <p>

                                                {
                                                    feedback.feedback
                                                }

                                            </p>

                                        </>

                                    )

                                }


                                {/* ==================================
                                    STRENGTHS
                                ================================== */}

                                {

                                    feedback.strengths &&
                                    feedback.strengths.length > 0 &&

                                    <>

                                        <h3>

                                            ✅ Strengths

                                        </h3>

                                        <ul>

                                            {

                                                feedback.strengths.map(

                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            {item}

                                                        </li>

                                                    )

                                                )

                                            }

                                        </ul>

                                    </>

                                }


                                {/* ==================================
                                    IMPROVEMENTS
                                ================================== */}

                                {

                                    feedback.improvements &&
                                    feedback.improvements.length > 0 &&

                                    <>

                                        <h3>

                                            📈 Improvements

                                        </h3>

                                        <ul>

                                            {

                                                feedback.improvements.map(

                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <li
                                                            key={
                                                                index
                                                            }
                                                        >

                                                            {item}

                                                        </li>

                                                    )

                                                )

                                            }

                                        </ul>

                                    </>

                                }


                                {/* ==================================
                                    QUESTION SCORE BREAKDOWN
                                ================================== */}

                                <div className="question-score-breakdown">

                                    <div>

                                        <span>

                                            Technical

                                        </span>

                                        <strong>

                                            {
                                                feedback.technicalScore ??
                                                0
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>

                                            Communication

                                        </span>

                                        <strong>

                                            {
                                                feedback.communicationScore ??
                                                0
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>

                                            Confidence

                                        </span>

                                        <strong>

                                            {
                                                feedback.confidenceScore ??
                                                0
                                            }

                                        </strong>

                                    </div>

                                </div>


                            </div>

                        )

                    }


                    {/* ==================================
                        NEXT QUESTION
                    ================================== */}

                    {

                        showNextButton &&

                        (

                            <div className="next-question-container">

                                <button

                                    className=
                                        "next-question-btn"

                                    onClick={
                                        goToNextQuestion
                                    }

                                >

                                    {

                                        currentQuestion + 1 >=
                                        questionList.length

                                        ?

                                        "📄 Finish Interview"

                                        :

                                        "➡ Next Question"

                                    }

                                </button>

                            </div>

                        )

                    }


                </div>

            </div>

        </div>

    );

}


export default InterviewSession;