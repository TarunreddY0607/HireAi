import React, { useState } from "react";
import { parseAIFeedback } from "../../utils/feedbackFormatter";
import "./AIFeedbackCard.css";

function AIFeedbackCard({ feedback, score = 0, recommendation = "" }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { verdictType, verdictLabel, points } = parseAIFeedback(
        feedback,
        score,
        recommendation
    );

    // Determine whether to show the toggle button
    const hasMoreContent = points.length > 2 || points.some(p => p.length > 130);
    const visiblePoints = isExpanded ? points : points.slice(0, 2);

    return (
        <div className="ai-feedback-container">
            {/* Verdict Badge */}
            <div className={`feedback-verdict-badge verdict-${verdictType}`}>
                <span className="verdict-icon">
                    {verdictType === "good" ? "🏆" : verdictType === "poor" ? "❌" : "⚠️"}
                </span>
                <span className="verdict-text">{verdictLabel}</span>
            </div>

            {/* Structured Points */}
            <div className="feedback-points-box">
                <div className="feedback-points-header">
                    <h4>📌 Key Highlights & Assessment:</h4>
                    {hasMoreContent && (
                        <button
                            type="button"
                            className="feedback-toggle-btn"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "Show Less ↑" : "Show More ↓"}
                        </button>
                    )}
                </div>

                <ul className={`feedback-points-list ${isExpanded ? "list-expanded" : "list-collapsed"}`}>
                    {visiblePoints.map((point, idx) => (
                        <li key={idx}>
                            <span className="point-dot">•</span>
                            <span className={`point-desc ${!isExpanded ? "point-clamped" : ""}`}>
                                {point}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AIFeedbackCard;
