function ATSPreview({

    completion,

    atsScore,

    potentialScore

}) {

    return (

        <div className="ats-preview-card">

            <h2>📊 Resume Score Preview</h2>

            <div className="ats-grid">

                <div className="ats-item">

                    <span>Resume Completion</span>

                    <h3>{completion}%</h3>

                </div>

                <div className="ats-item">

                    <span>Estimated Score</span>

                    <h3>{atsScore}%</h3>

                </div>

                <div className="ats-item">

                    <span>Potential Score</span>

                    <h3>{potentialScore}%</h3>

                </div>

            </div>

            <div className="progress">

                <div

                    className="progress-fill"

                    style={{

                        width: `${completion}%`

                    }}

                />

            </div>

        </div>

    );

}

export default ATSPreview;