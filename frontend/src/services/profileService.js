import api from "./api";

// ==========================================
// GET PROFILE
// ==========================================

export const getProfile = async () => {

    const token = localStorage.getItem("token");

    const response = await api.get(

        "/jobseeker/profile",

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};

// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = async (profileData) => {

    const token = localStorage.getItem("token");

    const response = await api.put(

        "/jobseeker/profile",

        profileData,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};

// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changePassword = async (passwordData) => {

    const token = localStorage.getItem("token");

    const response = await api.put(

        "/jobseeker/change-password",

        passwordData,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};