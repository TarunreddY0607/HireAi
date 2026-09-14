import "./RecruiterSidebar.css";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    FaHome,
    FaBuilding,
    FaPlusCircle,
    FaBriefcase,
    FaUsers,
    FaChartBar,
    FaSignOutAlt,
    FaRobot
} from "react-icons/fa";


function RecruiterSidebar() {

    const navigate = useNavigate();

    const location = useLocation();


    /* =========================================
       LOGOUT
       ========================================= */

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("role");

        localStorage.removeItem("userId");

        navigate("/login");

    };


    return (

        <aside className="recruiter-sidebar">


            {/* =====================================
                LOGO
               ===================================== */}

            <div className="sidebar-logo">

                <FaRobot />

                <h2>
                    HireAI
                </h2>

            </div>


            {/* =====================================
                NAVIGATION
               ===================================== */}

            <nav className="sidebar-nav">


                {/* =================================
                    DASHBOARD
                   ================================= */}

                <div
                    className={`sidebar-item ${
                        location.pathname === "/dashboard/recruiter"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/dashboard/recruiter")
                    }
                >

                    <FaHome />

                    <span>
                        Dashboard
                    </span>

                </div>


                {/* =================================
                    COMPANY PROFILE
                   ================================= */}

                <div
                    className={`sidebar-item ${
                        location.pathname === "/recruiter/company-profile"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/recruiter/company-profile")
                    }
                >

                    <FaBuilding />

                    <span>
                        Company Profile
                    </span>

                </div>


                {/* =================================
                    POST JOB
                   ================================= */}

                <div
                    className={`sidebar-item ${
                        location.pathname === "/recruiter/post-job"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/recruiter/post-job")
                    }
                >

                    <FaPlusCircle />

                    <span>
                        Post Job
                    </span>

                </div>


                {/* =================================
                    MY JOBS
                   ================================= */}

                <div
                    className={`sidebar-item ${
                        location.pathname === "/recruiter/my-jobs"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/recruiter/my-jobs")
                    }
                >

                    <FaBriefcase />

                    <span>
                        My Jobs
                    </span>

                </div>


                {/* =================================
                    APPLICANTS
                   ================================= */}

                <div
                    className={`sidebar-item ${
                        location.pathname === "/recruiter/applicants"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/recruiter/applicants")
                    }
                >

                    <FaUsers />

                    <span>
                        Applicants
                    </span>

                </div>


                {/* =================================
                    ANALYTICS
                   ================================= */}

                <div
                    className={`sidebar-item ${
                        location.pathname === "/recruiter/analytics"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        navigate("/recruiter/analytics")
                    }
                >

                    <FaChartBar />

                    <span>
                        Analytics
                    </span>

                </div>


            </nav>


            {/* =====================================
                LOGOUT
               ===================================== */}

            <button
                className="logout-btn"
                onClick={logout}
            >

                <FaSignOutAlt />

                <span>
                    Logout
                </span>

            </button>


        </aside>

    );

}


export default RecruiterSidebar;