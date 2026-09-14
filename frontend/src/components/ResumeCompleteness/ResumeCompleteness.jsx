function ResumeCompleteness({ profile }) {

    let score = 0;

    if (profile.summary) score += 15;
    if (profile.skills?.length) score += 20;
    if (profile.education?.length) score += 15;
    if (profile.experience?.length) score += 15;
    if (profile.projects?.length) score += 15;
    if (profile.certifications?.length) score += 10;
    if (profile.github) score += 5;
    if (profile.linkedin) score += 5;

    return (

        <div className="stat-card">

            <h3>Resume Completeness</h3>

            <h1>{score}%</h1>

        </div>

    );

}

export default ResumeCompleteness;