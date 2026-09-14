export const calculateATS = (resume) => {

    let score = 0;

    // Summary (5)
    if (resume.summary && resume.summary.trim().length > 30) {
        score += 5;
    }

    // Skills (25)
    const skills = resume.skills || [];

    if (skills.length >= 10) score += 25;
    else if (skills.length >= 8) score += 22;
    else if (skills.length >= 6) score += 18;
    else if (skills.length >= 4) score += 15;
    else if (skills.length >= 2) score += 10;

    // Education (15)
    if ((resume.education || []).length > 0) {
        score += 15;
    }

    // Experience (15)
    const experience = (resume.experience || []).filter(
        e =>
            e.company?.trim() ||
            e.role?.trim() ||
            e.description?.trim()
    );

    if (experience.length >= 2) score += 15;
    else if (experience.length === 1) score += 10;

    // Projects (20)
    const projects = resume.projects || [];

    if (projects.length >= 4) score += 20;
    else if (projects.length === 3) score += 18;
    else if (projects.length === 2) score += 15;
    else if (projects.length === 1) score += 10;

    // Certifications (10)
    const certifications = (resume.certifications || []).filter(
        c => c.title?.trim()
    );

    if (certifications.length >= 3) score += 10;
    else if (certifications.length === 2) score += 8;
    else if (certifications.length === 1) score += 5;

    // GitHub (5)
    if (

    typeof resume.github === "string" &&

    resume.github.trim().length > 0

) {

    score += 5;

}

if (

    typeof resume.linkedin === "string" &&

    resume.linkedin.trim().length > 0

) {

    score += 5;

}

    // Maximum 100
    if (score > 100) score = 100;

    // Hire Probability
    let hireProbability = 50;

    if (score >= 95) hireProbability = 98;
    else if (score >= 90) hireProbability = 95;
    else if (score >= 85) hireProbability = 90;
    else if (score >= 80) hireProbability = 85;
    else if (score >= 75) hireProbability = 80;
    else if (score >= 70) hireProbability = 75;
    else if (score >= 65) hireProbability = 70;
    else if (score >= 60) hireProbability = 65;

    return {

        atsScore: score,

        hireProbability

    };

};