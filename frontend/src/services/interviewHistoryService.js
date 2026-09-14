import api from "./api";

// ==========================================
// Get Interview History
// ==========================================

export const getInterviewHistory = async () => {

    const token = localStorage.getItem("token");

    const response = await api.get(

        "/interview-history",

        {

            headers: {

                Authorization: `Bearer ${token}`

            }

        }

    );

    return response.data;

};

// ==========================================
// Save Interview
// ==========================================

export const saveInterviewHistory = async (

    interviewData

) => {

    const token = localStorage.getItem("token");

    const response = await api.post(

        "/interview-history",

        interviewData,

        {

            headers: {

                Authorization: `Bearer ${token}`

            }

        }

    );

    return response.data;

};

// ==========================================
// Get Single Interview
// ==========================================

export const getInterviewById = async (

    id

) => {

    const token = localStorage.getItem("token");

    const response = await api.get(

        `/interview-history/${id}`,

        {

            headers: {

                Authorization: `Bearer ${token}`

            }

        }

    );

    return response.data;

};

// ==========================================
// Delete Interview
// ==========================================

export const deleteInterview = async (

    id

) => {

    const token = localStorage.getItem("token");

    const response = await api.delete(

        `/interview-history/${id}`,

        {

            headers: {

                Authorization: `Bearer ${token}`

            }

        }

    );

    return response.data;

};