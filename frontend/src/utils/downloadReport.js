import jsPDF from "jspdf";

export const downloadReport = (profile) => {
    const doc = new jsPDF("p", "mm", "a4");

    // ==========================================
    // BRAND BANNER (HEADER LOGO)
    // ==========================================
    // Draw solid indigo banner at the top
    doc.setFillColor(79, 109, 245);
    doc.rect(0, 0, 210, 30, "F");

    // Title text inside banner
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("HireAI", 15, 20);

    // Subtitle text inside banner
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Resume Evaluation Report", 145, 20);

    // ==========================================
    // CANDIDATE PROFILE DETAILS
    // ==========================================
    doc.setTextColor(100, 116, 139); // Slate-gray label color
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CANDIDATE PROFILE", 15, 45);

    doc.setTextColor(15, 23, 42); // Dark text color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const candidateName = profile.resume_full_name || profile.full_name || profile.account_name || "N/A";
    const candidateEmail = profile.resume_email || profile.email || "N/A";
    const candidatePhone = profile.resume_phone || profile.phone || "N/A";

    doc.text(`Name:  ${candidateName}`, 15, 52);
    doc.text(`Email: ${candidateEmail}`, 15, 59);
    doc.text(`Phone: ${candidatePhone}`, 15, 66);

    // ==========================================
    // RESUME SCORE BLOCK (TOP RIGHT CARD)
    // ==========================================
    doc.setFillColor(248, 250, 252); // Light-gray background
    doc.setDrawColor(226, 232, 240); // Soft border
    doc.rect(130, 38, 65, 32, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(79, 109, 245);
    doc.text("RESUME SCORE", 162.5, 47, { align: "center" });

    const score = profile.ats_score || 0;
    doc.setFontSize(22);
    doc.text(`${score} / 100`, 162.5, 60, { align: "center" });

    // ==========================================
    // DIVIDER LINE
    // ==========================================
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 76, 195, 76);

    // ==========================================
    // RESUME SKILLS
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("TECHNICAL SKILLS", 15, 87);

    // Parse skills robustly
    let skills = [];
    if (Array.isArray(profile.skills)) {
        skills = profile.skills;
    } else if (typeof profile.skills === "string") {
        try {
            const parsed = JSON.parse(profile.skills);
            skills = Array.isArray(parsed) ? parsed : [profile.skills];
        } catch {
            skills = profile.skills.split(",").map(s => s.trim()).filter(s => s);
        }
    }
    const skillsText = skills.length > 0 ? skills.join(", ") : "No skills extracted";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    // Auto-wrap skills text
    const wrappedSkills = doc.splitTextToSize(skillsText, 180);
    doc.text(wrappedSkills, 15, 94);

    // Calculate dynamic offset based on skills length
    const skillsLines = wrappedSkills.length;
    const skillsHeight = skillsLines * 5;
    const missingSkillsStartY = Math.max(105, 94 + skillsHeight + 10);

    // ==========================================
    // MISSING SKILLS (MAX 3)
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("MISSING SKILLS (TOP 3)", 15, missingSkillsStartY);

    // Parse missing skills robustly
    let missing = [];
    if (Array.isArray(profile.missing_skills)) {
        missing = profile.missing_skills;
    } else if (typeof profile.missing_skills === "string") {
        try {
            const parsed = JSON.parse(profile.missing_skills);
            missing = Array.isArray(parsed) ? parsed : [profile.missing_skills];
        } catch {
            missing = profile.missing_skills.split(",").map(s => s.trim()).filter(s => s);
        }
    }
    
    // Limit to max 3
    const topMissing = missing.slice(0, 3);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    let missingOffset = missingSkillsStartY + 7;
    if (topMissing.length === 0) {
        doc.text("No missing skills identified.", 15, missingOffset);
        missingOffset += 6;
    } else {
        topMissing.forEach((skill) => {
            doc.text(`•  ${skill}`, 15, missingOffset);
            missingOffset += 6;
        });
    }

    const suggestionsStartY = missingOffset + 8;

    // ==========================================
    // AI SUGGESTIONS
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("AI IMPROVEMENT SUGGESTIONS", 15, suggestionsStartY);

    // Parse suggestions robustly
    let suggestions = [];
    if (Array.isArray(profile.ai_suggestions)) {
        suggestions = profile.ai_suggestions;
    } else if (typeof profile.ai_suggestions === "string") {
        try {
            const parsed = JSON.parse(profile.ai_suggestions);
            suggestions = Array.isArray(parsed) ? parsed : [profile.ai_suggestions];
        } catch {
            suggestions = profile.ai_suggestions.split("\n").map(s => s.trim()).filter(s => s);
        }
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    let suggestionsOffset = suggestionsStartY + 7;
    if (suggestions.length === 0) {
        doc.text("No recommendations available at this time.", 15, suggestionsOffset);
    } else {
        // Limit suggestions to fit in the page (max 5)
        suggestions.slice(0, 5).forEach((item) => {
            const cleanItem = item.replace(/^[•\-\*\d\.\s]+/, ""); // strip bullet markdown
            const wrappedItem = doc.splitTextToSize(`•  ${cleanItem}`, 180);
            doc.text(wrappedItem, 15, suggestionsOffset);
            suggestionsOffset += (wrappedItem.length * 4.5) + 2;
        });
    }

    // ==========================================
    // BRAND FOOTER (BOTTOM LOGO/TAGLINE)
    // ==========================================
    doc.setDrawColor(241, 245, 249);
    doc.line(15, 280, 195, 280);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("HireAI Evaluator", 15, 287);

    doc.setFont("helvetica", "normal");
    doc.text("Professional Career Assessment • Secure PDF Report", 195, 287, { align: "right" });

    // Save the PDF
    doc.save("HireAI_Resume_Report.pdf");
};