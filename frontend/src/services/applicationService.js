import api from "./api";


// ==========================================
// Get Recruiter Applicants
// ==========================================

export const getRecruiterApplicants = async () => {

    const response = await api.get(
        "/applications/recruiter"
    );

    return response.data;

};


// ==========================================
// Update Application Status
// ==========================================

export const updateApplicationStatus = async (

    id,

    status

) => {

    const response = await api.put(

        `/applications/${id}/status`,

        {

            status

        }

    );

    return response.data;

};


// ==========================================
// Delete Application
// ONLY REJECTED APPLICANTS
// ==========================================

export const deleteApplication = async (

    id

) => {

    const response = await api.delete(

        `/applications/${id}`

    );

    return response.data;

};


// ==========================================
// Get My Applications
// Job Seeker
// ==========================================

export const getMyApplications = async () => {

    const response = await api.get(

        "/applications/my"

    );

    return response.data;

};


// ==========================================
// Submit Job Application
// ==========================================

export const submitApplication = async (

    jobId

) => {

    const response = await api.post(

        "/applications/submit",

        {

            jobId

        }

    );

    return response.data;

};