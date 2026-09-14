import api from "./api";


// ==========================================
// START INTERVIEW
// ==========================================

export const startInterview = async (

    interviewData

) => {

    const token =
        localStorage.getItem("token");


    // ==========================================
    // Send Interview Data
    // ==========================================

    const response = await api.post(

        "/interview/start",

        {

            role:
                interviewData.role,

            difficulty:
                interviewData.difficulty,

            questions:
                interviewData.questions,

            // ==========================================
            // IMPORTANT FOR JOB INTERVIEW
            // ==========================================

            mode:
                interviewData.mode || "practice",

            jobId:
                interviewData.jobId || null,

            job:
                interviewData.job || null

        },

        {

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );


    return response.data;

};


// ==========================================
// EVALUATE ANSWER
// ==========================================

export const evaluateAnswer = async (

    question,

    answer

) => {

    const token =
        localStorage.getItem("token");


    const response = await api.post(

        "/interview/evaluate",

        {

            question,

            answer

        },

        {

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );


    return response.data;

};


// ==========================================
// SAVE JOB APPLICATION INTERVIEW
// ==========================================

export const saveJobInterview = async (

    interviewData

) => {

    const token =
        localStorage.getItem("token");


    const response = await api.post(

        "/interview/job",

        {

            jobId:
                interviewData.jobId,

            technicalScore:
                interviewData.technicalScore,

            communicationScore:
                interviewData.communicationScore,

            confidenceScore:
                interviewData.confidenceScore,

            overallScore:
                interviewData.overallScore,

            aiFeedback:
                interviewData.aiFeedback,

            recommendation:
                interviewData.recommendation

        },

        {

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        }

    );


    return response.data;

};