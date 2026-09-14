import "./Sidebar.css";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import {
    FaHome,
    FaFileAlt,
    FaBriefcase,
    FaRobot,
    FaUser,
    FaSignOutAlt,
    FaBrain,
    FaHistory,
    FaClipboardList
} from "react-icons/fa";

import { getProfile } from "../../services/profileService";


function Sidebar() {

    const navigate = useNavigate();

    const location = useLocation();

    const [profile, setProfile] = useState(null);

    const [loginName, setLoginName] = useState("User");

    const [profilePic, setProfilePic] = useState(null);


    useEffect(() => {

        const loadPic = () => {

            const email = profile?.email || localStorage.getItem("loginEmail");

            if (email) {

                const pic = localStorage.getItem(`profile_pic_${email}`);

                setProfilePic(pic);

            }

        };


        loadPic();


        window.addEventListener("profilePicChanged", loadPic);

        return () => {

            window.removeEventListener("profilePicChanged", loadPic);

        };

    }, [profile]);


    // ==========================================
    // LOAD ACCOUNT PROFILE
    // ==========================================

    useEffect(() => {

        loadProfile();

        // Get the name saved during login

        const savedLoginName =

            localStorage.getItem("loginName");

        if (savedLoginName) {

            setLoginName(

                savedLoginName.trim()

            );

        }

        const handleUpdate = () => {
            loadProfile();
        };

        window.addEventListener("resume_analyzed", handleUpdate);
        window.addEventListener("profile_updated", handleUpdate);

        return () => {
            window.removeEventListener("resume_analyzed", handleUpdate);
            window.removeEventListener("profile_updated", handleUpdate);
        };

    }, []);


    const loadProfile = async () => {

        try {

            const data =
                await getProfile();

            console.log(
                "========== SIDEBAR PROFILE =========="
            );

            console.log(
                data?.profile
            );

            console.log(
                "====================================="
            );


            if (
                data?.success &&
                data?.profile
            ) {

                setProfile(
                    data.profile
                );

                if (data.profile?.profile_pic) {
                    localStorage.setItem(`profile_pic_${data.profile.email}`, data.profile.profile_pic);
                    setProfilePic(data.profile.profile_pic);
                }

            }

            else if (
                data?.profile
            ) {

                setProfile(
                    data.profile
                );

                if (data.profile?.profile_pic) {
                    localStorage.setItem(`profile_pic_${data.profile.email}`, data.profile.profile_pic);
                    setProfilePic(data.profile.profile_pic);
                }

            }

        }

        catch (err) {

            console.log(
                "Profile Load Error:",
                err
            );

        }

    };


    // ==========================================
    // ACCOUNT NAME
    // ==========================================

    const displayName =

        loginName !== "User"

            ?

            loginName

            :

            profile?.full_name?.trim()

            ?

            profile.full_name.trim()

            :

            "User";


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("userId");

        localStorage.removeItem("role");

        localStorage.removeItem("loginName");

        localStorage.removeItem("loginEmail");

        localStorage.removeItem("loginPhone");

        navigate("/login");

    };


    return (

        <aside className="sidebar">


            {/* ======================================
                LOGO
            ====================================== */}

            <div className="sidebar-logo">

                <div className="logo-circle">

                    <FaBrain />

                </div>


                <div className="logo-text">

                    <h2>
                        HireAI
                    </h2>

                    <span>
                        AI Recruitment Platform
                    </span>

                </div>

            </div>


            {/* ======================================
                MENU
            ====================================== */}

            <nav className="sidebar-menu">


                {/* ==================================
                    DASHBOARD
                ================================== */}

                <div

                    className={`sidebar-item ${
                        location.pathname ===
                        "/dashboard/jobseeker"
                            ? "active"
                            : ""
                    }`}

                    onClick={() =>
                        navigate(
                            "/dashboard/jobseeker"
                        )
                    }

                >

                    <FaHome />

                    <span>
                        Dashboard
                    </span>

                </div>


                {/* ==================================
                    RESUME EDITOR
                ================================== */}

                <div

                    className={`sidebar-item ${
                        location.pathname ===
                        "/resume-editor"
                            ? "active"
                            : ""
                    }`}

                    onClick={() =>
                        navigate(
                            "/resume-editor"
                        )
                    }

                >

                    <FaFileAlt />

                    <span>
                        Resume Editor
                    </span>

                </div>


                {/* ==================================
                    JOBS
                ================================== */}

                <div

                    className={`sidebar-item ${
                        location.pathname ===
                        "/jobs"
                            ? "active"
                            : ""
                    }`}

                    onClick={() =>
                        navigate(
                            "/jobs"
                        )
                    }

                >

                    <FaBriefcase />

                    <span>
                        Jobs
                    </span>

                </div>


                {/* ==================================
                    AI INTERVIEW
                ================================== */}

                <div

                    className={`sidebar-item ${
                        location.pathname ===
                        "/ai-interview"
                            ? "active"
                            : ""
                    }`}

                    onClick={() =>
                        navigate(
                            "/ai-interview"
                        )
                    }

                >

                    <FaRobot />

                    <span>
                        AI Interview
                    </span>

                </div>


                {/* ==================================
                    INTERVIEW HISTORY
                ================================== */}

                <div

                    className={`sidebar-item ${
                        location.pathname ===
                        "/interview-history"
                            ? "active"
                            : ""
                    }`}

                    onClick={() =>
                        navigate(
                            "/interview-history"
                        )
                    }

                >

                    <FaHistory />

                    <span>
                        Interview History
                    </span>

                </div>


                {/* ==================================
                    MY APPLICATIONS
                ================================== */}

                <div

                    className={`sidebar-item ${
                        location.pathname ===
                        "/my-applications"
                            ? "active"
                            : ""
                    }`}

                    onClick={() =>
                        navigate(
                            "/my-applications"
                        )
                    }

                >

                    <FaClipboardList />

                    <span>
                        My Applications
                    </span>

                </div>


                {/* ==================================
                    PROFILE
                ================================== */}

                <div

                    className={`sidebar-item ${
                        location.pathname ===
                        "/profile"
                            ? "active"
                            : ""
                    }`}

                    onClick={() =>
                        navigate(
                            "/profile"
                        )
                    }

                >

                    <FaUser />

                    <span>
                        Profile
                    </span>

                </div>


            </nav>


            {/* ======================================
                BOTTOM SECTION
            ====================================== */}

            <div className="sidebar-bottom">


                {/* ==================================
                    ACCOUNT
                ================================== */}

                <div className="user-box">


                    <div className="user-avatar">

                        {profilePic ? (
                            <img src={profilePic} alt="Avatar" />
                        ) : (
                            displayName
                                ?
                                displayName
                                    .charAt(0)
                                    .toUpperCase()
                                :
                                "U"
                        )}

                    </div>


                    <div className="user-details">

                        <h4>

                            {
                                displayName
                            }

                        </h4>


                        <span>
                            Job Seeker
                        </span>

                    </div>


                </div>


                {/* ==================================
                    LOGOUT
                ================================== */}

                <button

                    className="logout-btn"

                    onClick={
                        logout
                    }

                >

                    <FaSignOutAlt />

                    <span>
                        Logout
                    </span>

                </button>


            </div>


        </aside>

    );

}


export default Sidebar;