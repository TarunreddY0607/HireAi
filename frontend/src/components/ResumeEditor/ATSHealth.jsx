function ATSHealth({

    summary,

    skills,

    education,

    experience,

    projects,

    certifications,

    github,

    linkedin

}) {

    const getStatus = (value) => {

        if (Array.isArray(value)) {

            return value.length > 0;

        }

        return value && value.toString().trim() !== "";

    };

    const Item = ({ label, status }) => (

        <div className="health-item">

            <span>{status ? "✅" : "⚠️"}</span>

            <p>{label}</p>

        </div>

    );

    return (

        <div className="ats-health-card">

            <h2>📋 Resume Health</h2>

            <div className="health-grid">

                <Item
                    label="Professional Summary"
                    status={getStatus(summary)}
                />

                <Item
                    label="Skills"
                    status={getStatus(skills)}
                />

                <Item
                    label="Education"
                    status={getStatus(education)}
                />

                <Item
                    label="Experience"
                    status={getStatus(experience)}
                />

                <Item
                    label="Projects"
                    status={getStatus(projects)}
                />

                <Item
                    label="Certifications"
                    status={getStatus(certifications)}
                />

                <Item
                    label="GitHub"
                    status={getStatus(github)}
                />

                <Item
                    label="LinkedIn"
                    status={getStatus(linkedin)}
                />

            </div>

        </div>

    );

}

export default ATSHealth;