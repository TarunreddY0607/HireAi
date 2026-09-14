import api from "./api";

// ==========================================
// Get Recruiter Analytics
// ==========================================

export const getRecruiterAnalytics = async () => {

    const response = await api.get(
        "/analytics/recruiter"
    );

    return response.data;

};