/**
 * Transforms raw or lengthy AI interview feedback into structured bullet points
 * with a clear verdict (Good / Needs Improvement / Poor).
 */
export function parseAIFeedback(feedbackText, overallScore = 0, recommendation = "") {
    const score = Number(overallScore) || 0;
    const rec = (recommendation || "").toLowerCase();

    // 1. Determine Verdict
    let verdictType = "neutral";
    let verdictLabel = "Candidate Under Evaluation";
    let verdictStatus = "Moderate Match";

    if (score >= 70 || rec.includes("strong") || rec.includes("hire") || (rec.includes("recommend") && !rec.includes("not"))) {
        verdictType = "good";
        verdictLabel = "Candidate is Good & Recommended";
        verdictStatus = "Strong Match";
    } else if (score < 45 || rec.includes("not recommended") || rec.includes("reject")) {
        verdictType = "poor";
        verdictLabel = "Candidate is Not Recommended";
        verdictStatus = "Needs Significant Improvement";
    } else {
        verdictType = "neutral";
        verdictLabel = "Candidate has Potential (Needs Improvement)";
        verdictStatus = "Average Match";
    }

    if (!feedbackText || typeof feedbackText !== "string" || !feedbackText.trim()) {
        return {
            verdictType,
            verdictLabel,
            verdictStatus,
            points: [
                `Overall performance evaluated at ${score}%.`,
                verdictType === "good"
                    ? "Demonstrated solid technical understanding and communication."
                    : "Review foundational concepts and practice interview delivery."
            ],
            rawFeedback: ""
        };
    }

    const text = feedbackText.trim();

    // 2. Extract bullet points if already formatted
    let rawPoints = [];
    if (text.includes("•") || text.includes("\n- ") || text.includes("\n* ") || text.includes("\n")) {
        rawPoints = text
            .split(/[\n•]|\n[-*]\s+/)
            .map(p => p.trim())
            .filter(p => p.length > 8 && !p.toLowerCase().startsWith("verdict:"));
    }

    // 3. If it's a continuous paragraph, break into sentences
    if (rawPoints.length < 2) {
        rawPoints = text
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }

    // 4. Collect full points cleanly
    const points = [];
    const seen = new Set();

    for (const raw of rawPoints) {
        let clean = raw
            .replace(/^(the candidate|the answer|candidate)\s+/i, "")
            .replace(/^(instead of|however,|furthermore,|in addition,)\s+/i, "")
            .trim();

        clean = clean.charAt(0).toUpperCase() + clean.slice(1);

        if (clean.length > 15 && !seen.has(clean.substring(0, 25).toLowerCase())) {
            seen.add(clean.substring(0, 25).toLowerCase());
            points.push(clean);
        }
    }

    if (points.length === 0) {
        points.push(text);
    }

    return {
        verdictType,
        verdictLabel,
        verdictStatus,
        points,
        rawFeedback: text
    };
}
