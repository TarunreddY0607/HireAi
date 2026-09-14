export const buildResumeText = (resume) => {

    let text = "";

    // ------------------------------
    // Personal Information
    // ------------------------------

    text += "=============================\n";
    text += "PERSONAL INFORMATION\n";
    text += "=============================\n";

    text += `Name : ${resume.name || ""}\n`;
    text += `Email : ${resume.email || ""}\n`;
    text += `Phone : ${resume.phone || ""}\n`;
    text += `GitHub : ${resume.github || ""}\n`;
    text += `LinkedIn : ${resume.linkedin || ""}\n\n`;

    // ------------------------------
    // Professional Summary
    // ------------------------------

    text += "=============================\n";
    text += "PROFESSIONAL SUMMARY\n";
    text += "=============================\n";

    text += `${resume.summary || "Not Provided"}\n\n`;

    // ------------------------------
    // Skills
    // ------------------------------

    text += "=============================\n";
    text += "SKILLS\n";
    text += "=============================\n";

    if (resume.skills?.length) {
        resume.skills.forEach(skill => {
            text += `• ${skill}\n`;
        });
    } else {
        text += "No skills mentioned.\n";
    }

    text += "\n";

    // ------------------------------
    // Education
    // ------------------------------

    text += "=============================\n";
    text += "EDUCATION\n";
    text += "=============================\n";

    if (resume.education?.length) {

        resume.education.forEach((edu, index) => {

            text += `Education ${index + 1}\n`;
            text += `Degree : ${edu.degree || ""}\n`;
            text += `College : ${edu.college || ""}\n`;
            text += `CGPA : ${edu.cgpa || ""}\n`;
            text += `Year : ${edu.year || ""}\n\n`;

        });

    } else {

        text += "No education details provided.\n\n";

    }

    // ------------------------------
    // Experience
    // ------------------------------

    text += "=============================\n";
    text += "EXPERIENCE\n";
    text += "=============================\n";

    if (resume.experience?.length) {

        resume.experience.forEach((exp, index) => {

            text += `Experience ${index + 1}\n`;
            text += `Role : ${exp.role || ""}\n`;
            text += `Company : ${exp.company || ""}\n`;
            text += `Duration : ${exp.duration || ""}\n`;
            text += `Description : ${exp.description || ""}\n\n`;

        });

    } else {

        text += "No experience available.\n\n";

    }

    // ------------------------------
    // Projects
    // ------------------------------

    text += "=============================\n";
    text += "PROJECTS\n";
    text += "=============================\n";

    if (resume.projects?.length) {

        resume.projects.forEach((project, index) => {

            text += `Project ${index + 1}\n`;
            text += `Title : ${project.title || ""}\n`;
            text += `Description : ${project.description || ""}\n`;

            if (project.technologies?.length) {
                text += `Technologies : ${project.technologies.join(", ")}\n`;
            }

            text += "\n";

        });

    } else {

        text += "No projects available.\n\n";

    }

    // ------------------------------
    // Certifications
    // ------------------------------

    text += "=============================\n";
    text += "CERTIFICATIONS\n";
    text += "=============================\n";

    if (resume.certifications?.length) {

        resume.certifications.forEach((cert, index) => {

            text += `Certificate ${index + 1}\n`;
            text += `Title : ${cert.title || cert}\n`;

            if (typeof cert === "object") {
                text += `Institution/Year : ${cert.institution || ""}\n`;
            }

            text += "\n";

        });

    } else {

        text += "No certifications available.\n\n";

    }

    return text;

};