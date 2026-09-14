import api from "./api";

// ==========================================
// Recruiter Register
// ==========================================

export const registerRecruiter = async (

    recruiterData

) => {

    const response = await api.post(

        "/recruiter/register",

        recruiterData

    );

    return response.data;

};