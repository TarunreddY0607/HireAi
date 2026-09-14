import "./Login.css";

import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    FaEnvelope,
    FaLock,
    FaRobot,
    FaChartLine,
    FaUserTie,
    FaArrowRight
} from "react-icons/fa";

import api from "../../services/api";


function Login() {

    const navigate = useNavigate();


    // ==========================================
    // FORM STATE
    // ==========================================

    const [formData, setFormData] = useState({

        email: "",

        password: ""

    });


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
                e.target.value

        });

    };


    // ==========================================
    // HANDLE LOGIN
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!formData.email) {

            return alert(
                "Email is required"
            );

        }


        if (!formData.password) {

            return alert(
                "Password is required"
            );

        }


        try {

            // ==========================================
            // LOGIN API
            // ==========================================

            const res = await api.post(

                "/auth/login",

                formData

            );


            // ==========================================
            // CHECK RESPONSE
            // ==========================================

            if (!res.data?.success) {

                return alert(

                    res.data?.message ||

                    "Login Failed"

                );

            }


            // ==========================================
            // AUTHENTICATION DATA
            // ==========================================

            localStorage.setItem(

                "token",

                res.data.token

            );


            localStorage.setItem(

                "role",

                res.data.role

            );


            localStorage.setItem(

                "userId",

                res.data.userId

            );


            // ==========================================
            // ACCOUNT NAME
            // ==========================================
            //
            // IMPORTANT:
            //
            // This MUST be the account/registration name.
            //
            // It must NOT come from the uploaded resume.
            //
            // ==========================================

           const accountName =
    res.data.full_name?.trim()
    ||
    res.data.fullName?.trim()
    ||
    res.data.name?.trim()
    ||
    res.data.user?.full_name?.trim()
    ||
    res.data.user?.name?.trim()
    ||
    "";
            localStorage.setItem(

                "loginName",

                accountName

            );


            // ==========================================
            // ACCOUNT EMAIL
            // ==========================================

            const accountEmail =

                res.data.email?.trim()

                ||

                formData.email.trim()

                ||

                "";


            localStorage.setItem(

                "loginEmail",

                accountEmail

            );


            // ==========================================
            // ACCOUNT PHONE
            // ==========================================

            localStorage.setItem(

                "loginPhone",

                res.data.phone || ""

            );


            // ==========================================
            // DEBUG LOGIN RESPONSE
            // ==========================================

            console.log(
                "===================================="
            );

            console.log(
                "LOGIN SUCCESS"
            );

            console.log(
                "User ID:",
                res.data.userId
            );

            console.log(
                "Role:",
                res.data.role
            );

            console.log(
                "Account Name:",
                accountName
            );

            console.log(
                "Email:",
                accountEmail
            );

            console.log(
                "===================================="
            );


            // ==========================================
            // IMPORTANT CHECK
            // ==========================================

            if (!accountName) {

                console.warn(

                    "WARNING: Backend did not return the account name."

                );

                console.warn(

                    "Check /auth/login backend response."

                );

            }


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            alert(
                "Login Successful"
            );


            // ==========================================
            // REDIRECT BASED ON ROLE
            // ==========================================

            if (

                res.data.role ===

                "admin"

            ) {

                navigate(
                    "/admin/companies"
                );

            }


            else if (

                res.data.role ===

                "recruiter"

            ) {

                navigate(
                    "/dashboard/recruiter"
                );

            }


            else if (

                res.data.role ===

                "job_seeker"

            ) {

                navigate(
                    "/dashboard/jobseeker"
                );

            }


            else {

                alert(

                    "Unknown user role: " +

                    res.data.role

                );

            }

        }


        catch (err) {

            // ==========================================
            // LOGIN ERROR
            // ==========================================

            console.log(
                "Login Error:",
                err
            );


            if (err.response) {

                alert(

                    err.response.data?.message ||

                    "Login Failed"

                );

            }

            else {

                alert(
                    "Unable to connect to server"
                );

            }

        }

    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="login-page">


            {/* ======================================
                LEFT SIDE
            ====================================== */}

            <div className="login-left">

                <div className="overlay"></div>


                <div className="brand-content">


                    {/* LOGO */}

                    <div className="brand-logo">

                        <FaRobot />

                    </div>


                    {/* BRAND */}

                    <h1>

                        Hire<span>AI</span>

                    </h1>


                    <h2>

                        Smarter Hiring.

                        <br />

                        Better Careers.

                    </h2>


                    <p>

                        AI-powered resume analysis,
                        ATS scoring, intelligent recruitment
                        and interview preparation
                        — all in one platform.

                    </p>


                    {/* FEATURES */}

                    <div className="brand-features">


                        <div className="feature">

                            <FaChartLine />

                            <span>
                                ATS Resume Analysis
                            </span>

                        </div>


                        <div className="feature">

                            <FaUserTie />

                            <span>
                                Recruiter Dashboard
                            </span>

                        </div>


                        <div className="feature">

                            <FaRobot />

                            <span>
                                AI Interview Assistant
                            </span>

                        </div>


                    </div>

                </div>

            </div>


            {/* ======================================
                RIGHT SIDE
            ====================================== */}

            <div className="login-right">


                <div className="login-card">


                    {/* WELCOME */}

                    <div className="welcome">

                        <h2>
                            Welcome Back 👋
                        </h2>

                        <p>
                            Sign in to continue using HireAI
                        </p>

                    </div>


                    {/* LOGIN FORM */}

                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* EMAIL */}

                        <div className="input-box">

                            <FaEnvelope
                                className="input-icon"
                            />

                            <input

                                type="email"

                                name="email"

                                placeholder="Email Address"

                                value={
                                    formData.email
                                }

                                onChange={
                                    handleChange
                                }

                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="input-box">

                            <FaLock
                                className="input-icon"
                            />

                            <input

                                type="password"

                                name="password"

                                placeholder="Password"

                                value={
                                    formData.password
                                }

                                onChange={
                                    handleChange
                                }

                            />

                        </div>


                        {/* OPTIONS */}

                        <div className="options">

                            <label>

                                <input
                                    type="checkbox"
                                />

                                Remember Me

                            </label>


                            <Link
                                to="/forgot-password"
                            >

                                Forgot Password?

                            </Link>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button

                            type="submit"

                            className="login-button"

                        >

                            Login

                            <FaArrowRight />

                        </button>


                    </form>


                    {/* DIVIDER */}

                    <div className="divider">

                        <span>
                            OR
                        </span>

                    </div>


                    {/* REGISTER */}

                    <div className="register-link">

                        New to HireAI?

                        <Link
                            to="/register"
                        >

                            Create Account

                        </Link>

                    </div>


                </div>

            </div>


        </div>

    );

}


export default Login;