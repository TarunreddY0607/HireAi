import api from "./api";

// ==========================================
// Get Recruiter Dashboard
// ==========================================

export const getRecruiterDashboard = async () => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        "/recruiter/dashboard",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// ==========================================
// Analyze Company Website (AI Intelligence)
// ==========================================

export const analyzeRecruiterWebsite = async (websiteUrl) => {

    const token = localStorage.getItem("token");

    const response = await api.post(
        "/recruiter/analyze-website",
        { website: websiteUrl },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};