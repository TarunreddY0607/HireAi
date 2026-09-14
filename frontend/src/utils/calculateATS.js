const calculateATS = (resume) => {

    let score = 0;

    // Summary
    if (resume.summary.trim().length >= 80)
        score += 15;

    // Skills
    if (resume.skills.length >= 8)
        score += 20;
    else if (resume.skills.length >= 5)
        score += 15;
    else if (resume.skills.length >= 3)
        score += 8;

    // Education
    if (resume.education.length)
        score += 10;

    // Experience
    if (resume.experience.length)
        score += 15;

    // Projects
    if (resume.projects.length >= 2)
        score += 15;
    else if (resume.projects.length === 1)
        score += 8;

    // Certifications
    if (resume.certifications.length >= 2)
        score += 10;
    else if (resume.certifications.length === 1)
        score += 5;

    // GitHub
    if (resume.github.trim())
        score += 7;

    // LinkedIn
    if (resume.linkedin.trim())
        score += 8;

    return Math.min(score, 100);

};

export default calculateATS;