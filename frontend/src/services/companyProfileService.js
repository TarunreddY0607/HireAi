import api from "./api";

// ==========================================
// Get Company Profile
// ==========================================

export const getCompanyProfile = async () => {

    const response = await api.get(
        "/recruiter/company-profile"
    );

    return response.data;

};


// ==========================================
// Update Company Profile
// ==========================================

export const updateCompanyProfile = async (profileData) => {

    const response = await api.put(

        "/recruiter/company-profile",

        profileData

    );

    return response.data;

};