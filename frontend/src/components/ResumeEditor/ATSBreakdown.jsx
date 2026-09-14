import "./ATSBreakdown.css";

function ATSBreakdown({

    summary,
    skills,
    education,
    experience,
    projects,
    certifications,
    github,
    linkedin

}) {

    const sections = [

        {
            title: "Professional Summary",
            score: summary.trim().length >= 80 ? 15 : 0,
            max: 15
        },

        {
            title: "Skills",
            score:
                skills.length >= 8
                    ? 20
                    : skills.length >= 5
                    ? 15
                    : skills.length >= 3
                    ? 8
                    : 0,
            max: 20
        },

        {
            title: "Education",
            score: education.length ? 10 : 0,
            max: 10
        },

        {
            title: "Experience",
            score: experience.length ? 15 : 0,
            max: 15
        },

        {
            title: "Projects",
            score:
                projects.length >= 2
                    ? 15
                    : projects.length === 1
                    ? 8
                    : 0,
            max: 15
        },

        {
            title: "Certifications",
            score:
                certifications.length >= 2
                    ? 10
                    : certifications.length === 1
                    ? 5
                    : 0,
            max: 10
        },

        {
            title: "GitHub",
            score: github.trim() ? 7 : 0,
            max: 7
        },

        {
            title: "LinkedIn",
            score: linkedin.trim() ? 8 : 0,
            max: 8
        }

    ];

    return (

        <div className="ats-breakdown-card">

            <h2>📊 Resume Score Breakdown</h2>

            {

                sections.map((section, index) => (

                    <div

                        className="breakdown-row"

                        key={index}

                    >

                        <div>

                            {

                                section.score === section.max

                                    ? "✅"

                                    : section.score > 0

                                    ? "🟡"

                                    : "❌"

                            }

                            {" "}

                            {section.title}

                        </div>

                        <strong>

                            +{section.score}/{section.max}

                        </strong>

                    </div>

                ))

            }

        </div>

    );

}

export default ATSBreakdown;