import "./AIResumeCoach.css";

function AIResumeCoach({

    atsScore,

    hireProbability,

    aiSuggestions,

    recommendedRoles

}) {

    return (

        <div className="ai-coach-card">

            <div className="coach-header">

                <h2>🤖 AI Resume Coach</h2>

                <p>
                    Improve your resume using AI recommendations.
                </p>

            </div>

            <div className="coach-score-grid">

                <div className="coach-score-box">

                    <h3>Resume Score</h3>

                    <span>{atsScore}%</span>

                </div>

                <div className="coach-score-box">

                    <h3>Hire Probability</h3>

                    <span>{hireProbability}%</span>

                </div>

            </div>

            <div className="coach-section">

                <h3>💡 AI Suggestions</h3>

                {

                    aiSuggestions.length > 0 ? (

                        <ul>

                            {

                                aiSuggestions.map((item, index) => (

                                    <li key={index}>

                                        ✅ {item}

                                    </li>

                                ))

                            }

                        </ul>

                    ) : (

                        <p>No AI suggestions available.</p>

                    )

                }

            </div>

            <div className="coach-section">

                <h3>💼 Recommended Roles</h3>

                {

                    recommendedRoles.length > 0 ? (

                        <div className="role-container">

                            {

                                recommendedRoles.map((role, index) => (

                                    <span

                                        key={index}

                                        className="role-chip"

                                    >

                                        {role}

                                    </span>

                                ))

                            }

                        </div>

                    ) : (

                        <p>No recommended roles.</p>

                    )

                }

            </div>

        </div>

    );

}

export default AIResumeCoach;