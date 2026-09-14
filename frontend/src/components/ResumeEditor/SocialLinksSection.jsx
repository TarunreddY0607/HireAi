import "../../pages/ResumeEditor/ResumeEditor.css";

function SocialLinksSection({

    github,

    setGithub,

    linkedin,

    setLinkedin,

    aiSuggestions = [],

    atsScore = 0

}) {

    const socialSuggestions = aiSuggestions.filter(item =>

        item.toLowerCase().includes("github") ||

        item.toLowerCase().includes("linkedin") ||

        item.toLowerCase().includes("portfolio") ||

        item.toLowerCase().includes("profile")

    );

    const githubValid =
        github.trim() === "" ||
        github.toLowerCase().includes("github.com");

    const linkedinValid =
        linkedin.trim() === "" ||
        linkedin.toLowerCase().includes("linkedin.com");

    return (

        <div className="resume-section">

            <h2>🌐 Social Links</h2>

            <div className="summary-info">

                <span>

                    Resume Score : {atsScore}%

                </span>

                <span>

                    {github || linkedin
                        ? "Profiles Added"
                        : "No Profiles"}

                </span>

            </div>

            <label>

                <strong>GitHub</strong>

            </label>

            <input

                className="resume-input"

                type="text"

                placeholder="https://github.com/username"

                value={github}

                onChange={(e) =>
                    setGithub(e.target.value)
                }

            />

            {

                github && (

                    githubValid ? (

                        <div className="success-box">

                            ✅ Valid GitHub profile.

                        </div>

                    ) : (

                        <div className="warning-box">

                            ⚠ Please enter a valid GitHub URL.

                        </div>

                    )

                )

            }

            <br />

            <label>

                <strong>LinkedIn</strong>

            </label>

            <input

                className="resume-input"

                type="text"

                placeholder="https://linkedin.com/in/username"

                value={linkedin}

                onChange={(e) =>
                    setLinkedin(e.target.value)
                }

            />

            {

                linkedin && (

                    linkedinValid ? (

                        <div className="success-box">

                            ✅ Valid LinkedIn profile.

                        </div>

                    ) : (

                        <div className="warning-box">

                            ⚠ Please enter a valid LinkedIn URL.

                        </div>

                    )

                )

            }

            <p className="ai-tip">

                💡 Recruiters often check GitHub and LinkedIn before scheduling interviews.

            </p>

            {

                socialSuggestions.length > 0 && (

                    <div className="section-ai-box">

                        <h3>

                            🤖 AI Recommendation

                        </h3>

                        <ul>

                            {

                                socialSuggestions.map((item, index) => (

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

                !github && !linkedin && (

                    <div className="warning-box">

                        ⚠ Adding GitHub and LinkedIn profiles can improve your resume score and recruiter visibility.

                    </div>

                )

            }

            {

                githubValid &&
                linkedinValid &&
                github &&
                linkedin && (

                    <div className="success-box">

                        ✅ Great! Your professional profiles are complete.

                    </div>

                )

            }

        </div>

    );

}

export default SocialLinksSection;