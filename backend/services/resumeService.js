import api from "./api";

// Get Resume
export const getResume = async () => {

    const response = await api.get("/resume");

    return response.data;

};

// Update Resume
export const updateResume = async (resumeData) => {

    const response = await api.put("/resume", resumeData);

    return response.data;

};