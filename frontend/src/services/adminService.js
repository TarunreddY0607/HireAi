import api from "./api";

// ==========================================
// Get All Recruiter Companies
// ==========================================

export const getCompanies = async () => {

    const response = await api.get(
        "/admin/companies"
    );

    return response.data;

};


// ==========================================
// Verify Company
// ==========================================

export const verifyCompany = async (id) => {

    const response = await api.put(

        `/admin/companies/${id}/verify`

    );

    return response.data;

};


// ==========================================
// Reject Company
// ==========================================

export const rejectCompany = async (
    id,
    reason
) => {

    const response = await api.put(

        `/admin/companies/${id}/reject`,

        {
            reason
        }

    );

    return response.data;

};