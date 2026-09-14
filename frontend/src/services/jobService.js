import api from "./api";

// ==========================================
// CREATE JOB
// ==========================================

export const createJob = async (jobData) => {

    const response = await api.post(
        "/jobs",
        jobData
    );

    return response.data;
};


// ==========================================
// GET ALL JOBS
// ==========================================

export const getJobs = async () => {

    const response = await api.get(
        "/jobs"
    );

    return response.data;
};


// ==========================================
// GET RECOMMENDED JOBS
// ==========================================
// Used by Job Seeker Dashboard
// Returns jobs matching the logged-in
// user's resume skills.
// ==========================================

export const getRecommendedJobs = async () => {

    const response = await api.get(
        "/jobs/recommended"
    );

    return response.data;
};


// ==========================================
// GET RECRUITER JOBS
// ==========================================
// Used only by Recruiter pages.
// ==========================================

export const getRecruiterJobs = async () => {

    const response = await api.get(
        "/jobs/recruiter"
    );

    return response.data;
};


// ==========================================
// GET SINGLE JOB
// ==========================================

export const getJobById = async (id) => {

    const response = await api.get(
        `/jobs/${id}`
    );

    return response.data;
};


// ==========================================
// UPDATE JOB
// ==========================================

export const updateJob = async (
    id,
    jobData
) => {

    const response = await api.put(
        `/jobs/${id}`,
        jobData
    );

    return response.data;
};


// ==========================================
// DELETE JOB
// ==========================================

export const deleteJob = async (id) => {

    const response = await api.delete(
        `/jobs/${id}`
    );

    return response.data;
};


// ==========================================
// APPLY FOR JOB
// ==========================================

export const applyJob = async (jobId) => {

    const response = await api.post(
        `/applications/apply/${jobId}`
    );

    return response.data;
};