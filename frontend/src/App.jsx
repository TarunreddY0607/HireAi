import { Routes, Route } from "react-router-dom";

// ================= Home =================

import Home from "./pages/Home/Home";

// ================= Authentication =================

import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

import Companies from "./pages/Admin/Companies/Companies";

// ================= Job Seeker =================

import JobSeekerRegister
    from "./pages/JobSeeker/JobSeekerRegister";

import Dashboard
    from "./pages/Dashboard/Dashboard";

import ResumeEditor
    from "./pages/ResumeEditor/ResumeEditor";

import Jobs
    from "./pages/Jobs/Jobs";

import AIAnalysis
    from "./pages/AIAnalysis";

import Profile
    from "./pages/Profile/Profile";

import EditProfile
    from "./pages/EditProfile/EditProfile";

import ChangePassword
    from "./pages/ChangePassword/ChangePassword";

// ================= My Applications =================

import MyApplications
    from "./pages/MyApplications/MyApplications";

// ================= AI Interview =================

import AIInterview
    from "./pages/AIInterview/AIInterview";

import InterviewSession
    from "./pages/InterviewSession/InterviewSession";

import InterviewReport
    from "./pages/InterviewReport/InterviewReport";

import InterviewHistory
    from "./pages/InterviewHistory/InterviewHistory";

// ================= Recruiter =================

import RecruiterRegister
    from "./pages/Recruiter/RecruiterRegister/RecruiterRegister";

import RecruiterDashboard
    from "./pages/Recruiter/RecruiterDashboard/RecruiterDashboard";

import PostJob
    from "./pages/Recruiter/PostJob/PostJob";

import MyJobs
    from "./pages/Recruiter/MyJobs/MyJobs";

import Applicants
    from "./pages/Recruiter/Applicants/Applicants";

import Analytics
    from "./pages/Recruiter/Analytics/Analytics";

import CompanyProfile
    from "./pages/Recruiter/CompanyProfile/CompanyProfile";

import ViewJob
    from "./pages/Recruiter/ViewJob/ViewJob";

import EditJob
    from "./pages/Recruiter/EditJob/EditJob";

// ================= Application =================

import Application
    from "./pages/Application/Application";

// ================= Protected Route =================

import ProtectedRoute
    from "./utils/ProtectedRoute";


function App() {

    return (

        <Routes>


            {/* ==========================================
                HOME
            ========================================== */}

            <Route
                path="/"
                element={<Home />}
            />


            {/* ==========================================
                AUTHENTICATION
            ========================================== */}

            <Route
                path="/register"
                element={<Register />}
            />


            <Route
                path="/register/job-seeker"
                element={<JobSeekerRegister />}
            />


            <Route
                path="/register/recruiter"
                element={<RecruiterRegister />}
            />


            <Route
                path="/login"
                element={<Login />}
            />


            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />


            {/* ==========================================
                JOB SEEKER
            ========================================== */}

            <Route
                path="/dashboard/jobseeker"
                element={

                    <ProtectedRoute>

                        <Dashboard />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                RESUME EDITOR
            ========================================== */}

            <Route
                path="/resume-editor"
                element={

                    <ProtectedRoute>

                        <ResumeEditor />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                JOBS
            ========================================== */}

            <Route
                path="/jobs"
                element={

                    <ProtectedRoute>

                        <Jobs />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                AI RESUME ANALYSIS
            ========================================== */}

            <Route
                path="/analysis"
                element={

                    <ProtectedRoute>

                        <AIAnalysis />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                PROFILE
            ========================================== */}

            <Route
                path="/profile"
                element={

                    <ProtectedRoute>

                        <Profile />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                EDIT PROFILE
            ========================================== */}

            <Route
                path="/profile/edit"
                element={

                    <ProtectedRoute>

                        <EditProfile />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                CHANGE PASSWORD
            ========================================== */}

            <Route
                path="/change-password"
                element={

                    <ProtectedRoute>

                        <ChangePassword />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                MY APPLICATIONS
            ========================================== */}

            <Route
                path="/my-applications"
                element={

                    <ProtectedRoute>

                        <MyApplications />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                AI INTERVIEW
            ========================================== */}

            <Route
                path="/ai-interview"
                element={

                    <ProtectedRoute>

                        <AIInterview />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                INTERVIEW SESSION
            ========================================== */}

            <Route
                path="/interview-session"
                element={

                    <ProtectedRoute>

                        <InterviewSession />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                INTERVIEW REPORT
            ========================================== */}

            <Route
                path="/interview-report"
                element={

                    <ProtectedRoute>

                        <InterviewReport />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                INTERVIEW HISTORY
            ========================================== */}

            <Route
                path="/interview-history"
                element={

                    <ProtectedRoute>

                        <InterviewHistory />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                JOB APPLICATION
            ========================================== */}

            <Route
                path="/apply/:jobId"
                element={

                    <ProtectedRoute>

                        <Application />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                RECRUITER
            ========================================== */}


            {/* Recruiter Dashboard */}

            <Route
                path="/dashboard/recruiter"
                element={

                    <ProtectedRoute>

                        <RecruiterDashboard />

                    </ProtectedRoute>

                }
            />


            {/* Company Profile */}

            <Route
                path="/recruiter/company-profile"
                element={

                    <ProtectedRoute>

                        <CompanyProfile />

                    </ProtectedRoute>

                }
            />


            {/* Post Job */}

            <Route
                path="/recruiter/post-job"
                element={

                    <ProtectedRoute>

                        <PostJob />

                    </ProtectedRoute>

                }
            />


            {/* My Jobs */}

            <Route
                path="/recruiter/my-jobs"
                element={

                    <ProtectedRoute>

                        <MyJobs />

                    </ProtectedRoute>

                }
            />


            {/* Applicants */}

            <Route
                path="/recruiter/applicants"
                element={

                    <ProtectedRoute>

                        <Applicants />

                    </ProtectedRoute>

                }
            />


            {/* View Job */}

            <Route
                path="/recruiter/view-job/:id"
                element={

                    <ProtectedRoute>

                        <ViewJob />

                    </ProtectedRoute>

                }
            />


            {/* Edit Job */}

            <Route
                path="/recruiter/edit-job/:id"
                element={

                    <ProtectedRoute>

                        <EditJob />

                    </ProtectedRoute>

                }
            />


            {/* Analytics */}

            <Route
                path="/recruiter/analytics"
                element={

                    <ProtectedRoute>

                        <Analytics />

                    </ProtectedRoute>

                }
            />


            {/* ==========================================
                ADMIN
            ========================================== */}

            <Route
                path="/admin/companies"
                element={

                    <ProtectedRoute
                        allowedRole="admin"
                    >

                        <Companies />

                    </ProtectedRoute>

                }
            />


        </Routes>

    );

}


export default App;