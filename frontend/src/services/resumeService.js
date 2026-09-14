import api from "./api";

// ==========================================
// Get Current / Main Resume
// ==========================================

export const getResume = async () => {

    const response = await api.get(
        "/resume"
    );

    return response.data;
};


// ==========================================
// Update Current / Main Resume
// ==========================================

export const updateResume = async (
    resumeData
) => {

    const response = await api.put(
        "/resume",
        resumeData
    );

    return response.data;
};


// ==========================================
// Upload New Resume
// ==========================================
//
// The uploaded PDF becomes the MAIN resume.
//
// ==========================================

export const uploadNewResume = async (
    file
) => {

    const formData =
        new FormData();

    formData.append(
        "resume",
        file
    );


    const response = await api.post(
        "/resume/upload",
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data"
            }
        }
    );


    return response.data;
};