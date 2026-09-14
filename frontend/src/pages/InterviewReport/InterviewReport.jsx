import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import AIFeedbackCard from "../../components/AIFeedbackCard/AIFeedbackCard";
import "./InterviewReport.css";

function InterviewReport() {

    const navigate = useNavigate();

    const location = useLocation();

    const feedback = location.state?.feedback;
    const mode = location.state?.mode || "practice";

const jobId = location.state?.jobId;

    if (!feedback) {

        return (

            <div className="report-empty">

                <h2>

                    No Interview Report Found

                </h2>

                <button

                    onClick={() => navigate("/ai-interview")}

                >

                    Start New Interview

                </button>

            </div>

        );

    }

    const overallScore = feedback.score;

    const technicalScore = Math.max(

        overallScore - 5,

        0

    );

    const communicationScore = Math.min(

        overallScore + 3,

        100

    );

    const confidenceScore = Math.min(

        overallScore + 1,

        100

    );

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Topbar />

                <div className="report-container">

                    <h1>

                        🎯 AI Interview Report

                    </h1>

                    <div className="score-grid">

                        <div className="score-card">

                            <h3>

                                Overall

                            </h3>

                            <h1>

                                {overallScore}

                            </h1>

                        </div>

                        <div className="score-card">

                            <h3>

                                Technical

                            </h3>

                            <h1>

                                {technicalScore}

                            </h1>

                        </div>

                        <div className="score-card">

                            <h3>

                                Communication

                            </h3>

                            <h1>

                                {communicationScore}

                            </h1>

                        </div>

                        <div className="score-card">

                            <h3>

                                Confidence

                            </h3>

                            <h1>

                                {confidenceScore}

                            </h1>

                        </div>

                    </div>

                    <AIFeedbackCard
                        feedback={feedback.feedback}
                        score={overallScore}
                        recommendation={feedback.recommendation}
                    />

                    <div className="report-grid">

                        <div className="report-card">

                            <h2>

                                ✅ Strengths

                            </h2>

                            <ul>

                                {

                                    feedback.strengths?.map(

                                        (item,index)=>(

                                            <li key={index}>

                                                {item}

                                            </li>

                                        )

                                    )

                                }

                            </ul>

                        </div>

                        <div className="report-card">

                            <h2>

                                📈 Improvements

                            </h2>

                            <ul>

                                {

                                    feedback.improvements?.map(

                                        (item,index)=>(

                                            <li key={index}>

                                                {item}

                                            </li>

                                        )

                                    )

                                }

                            </ul>

                        </div>

                    </div>

                    <div className="recommendation">

                        <h2>

                            AI Recommendation

                        </h2>

                        {

                            overallScore >= 80

                            ?

                            <h1>

                                ✅ Recommended for Next Round

                            </h1>

                            :

                            overallScore >= 60

                            ?

                            <h1>

                                ⚠ Needs More Practice

                            </h1>

                            :

                            <h1>

                                ❌ Improve Technical Skills

                            </h1>

                        }

                    </div>
<button

    className="back-btn"

    onClick={() => {

        if(mode === "job"){

            navigate(

                `/apply/${jobId}`,

                {

                    state:{

                        interviewCompleted:true,

                        feedback

                    }

                }

            );

        }

        else{

            navigate("/dashboard/jobseeker");

        }

    }}

>

    {

        mode === "job"

        ?

        "✅ Continue Application"

        :

        "🏠 Back to Dashboard"

    }

</button>

                </div>

            </div>

        </div>

    );

}

export default InterviewReport; 