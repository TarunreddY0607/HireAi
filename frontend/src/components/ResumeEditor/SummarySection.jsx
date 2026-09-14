import "../../pages/ResumeEditor/ResumeEditor.css";

function SummarySection({

    summary,

    setSummary,

    aiSuggestions = [],

    atsScore = 0

}) {

    const summarySuggestions = aiSuggestions.filter(item =>
        item.toLowerCase().includes("summary")
    );

    return (

        <div className="resume-section">

            <h2>📝 Professional Summary</h2>

            <textarea

                className="resume-textarea"

                placeholder="Write your professional summary..."

                value={summary}

                onChange={(e) => setSummary(e.target.value)}

                rows={6}

            />

            <div className="summary-info">

                <span>

                    Characters : {summary.length}

                </span>

                <span>

                    Resume Score : {atsScore}%

                </span>

            </div>

            <p className="ai-tip">

                💡 Highlight your strengths, technologies, achievements and career goals in 3–5 lines.

            </p>

            {

                summarySuggestions.length > 0 && (

                    <div className="section-ai-box">

                        <h3>

                            🤖 AI Recommendation

                        </h3>

                        <ul>

                            {

                                summarySuggestions.map((item, index) => (

                                    <li key={index}>

                                        {item}

                                    </li>

                                ))

                            }

                        </ul>

                    </div>

                )

            }

            {

                summary.length < 80 && (

                    <div className="warning-box">

                        ⚠ Your summary is quite short. A stronger summary can improve your resume score.

                    </div>

                )

            }

            {

                summary.length >= 80 && (

                    <div className="success-box">

                        ✅ Good! Your summary has a reasonable length.

                    </div>

                )

            }

        </div>

    );

}

export default SummarySection;