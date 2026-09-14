import "./JobSeekerRegister.css";

import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaCloudUploadAlt,
    FaEye,
    FaEyeSlash,
    FaRobot,
    FaCheckCircle
} from "react-icons/fa";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function JobSeekerRegister() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);

    // OTP Modal & State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [otpError, setOtpError] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        let interval;
        if (showOtpModal && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, resendTimer]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleResume = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please upload PDF only.");
            return;
        }

        setResume(file);
    };

    const handleInitiateRegister = async (e) => {
        e.preventDefault();

        if (!formData.fullName.trim())
            return alert("Full Name is required");

        if (!formData.email.trim())
            return alert("Email is required");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            return alert("Please enter a valid email address");
        }

        if (!formData.phone.trim())
            return alert("Phone Number is required");

        if (!formData.password)
            return alert("Password is required");

        if (formData.password.length < 6)
            return alert("Password must be at least 6 characters");

        if (formData.password !== formData.confirmPassword)
            return alert("Passwords do not match");

        if (!resume)
            return alert("Please upload your Resume");

        try {
            setLoading(true);
            setOtpError("");
            const res = await api.post("/auth/send-register-otp", {
                email: formData.email.trim(),
                fullName: formData.fullName.trim()
            });

            if (res.data.success) {
                setShowOtpModal(true);
                setOtp("");
                setResendTimer(30);
                setCanResend(false);
            }
        } catch (error) {
            console.error("Send OTP Error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert("Failed to send verification code. Please check your email address and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        try {
            setOtpLoading(true);
            setOtpError("");
            const res = await api.post("/auth/send-register-otp", {
                email: formData.email.trim(),
                fullName: formData.fullName.trim()
            });
            if (res.data.success) {
                setResendTimer(30);
                setCanResend(false);
                setOtpError("");
            }
        } catch (error) {
            setOtpError(error.response?.data?.message || "Failed to resend code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyAndSubmit = async (e) => {
        e.preventDefault();

        if (!otp || otp.trim().length !== 6) {
            setOtpError("Please enter the complete 6-digit verification code");
            return;
        }

        try {
            setOtpLoading(true);
            setOtpError("");

            const data = new FormData();
            data.append("fullName", formData.fullName.trim());
            data.append("email", formData.email.trim());
            data.append("phone", formData.phone.trim());
            data.append("password", formData.password);
            data.append("otp", otp.trim());
            data.append("resume", resume);

            const response = await api.post(
                "/auth/jobseeker/register",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setShowOtpModal(false);
            alert("🎉 " + response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error("Registration Error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setOtpError(error.response.data.message);
            } else {
                setOtpError("Registration failed. Please try again.");
            }
        } finally {
            setOtpLoading(false);
        }
    };

    return (

        <div className="job-register-page">

            <div className="left-panel">

                <div className="brand">

                    <FaRobot className="robot" />

                    <h1>

                        Hire<span>AI</span>

                    </h1>

                </div>

                <span className="badge">

                    AI Powered Career Platform

                </span>

                <h2>

                    Build Your Career

                    <br />

                    With Artificial Intelligence

                </h2>

                <p>

                    Upload your resume once and let HireAI analyze your
                    profile, calculate resume score, recommend jobs,
                    improve your resume and prepare you for interviews.

                </p>

                <div className="benefits">

                    <div>

                        <FaCheckCircle />

                        <span>AI Resume Analysis</span>

                    </div>

                    <div>

                        <FaCheckCircle />

                        <span>Resume Score</span>

                    </div>

                    <div>

                        <FaCheckCircle />

                        <span>Resume Suggestions</span>

                    </div>

                    <div>

                        <FaCheckCircle />

                        <span>Smart Job Matching</span>

                    </div>

                </div>

            </div>

            <div className="right-panel">

                <div className="register-card">

                    <h2>Create Account</h2>

                    <p>
                        Join thousands of students getting hired with AI.
                    </p>

                    <form onSubmit={handleInitiateRegister}>

                        <div className="input-box">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-box">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-box">
                            <FaPhone className="input-icon" />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-box">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create Password (min 6 chars)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="eye"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="input-box">
                            <FaLock className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="eye"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <label className="upload-box">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleResume}
                                hidden
                            />
                            <FaCloudUploadAlt className="upload-icon" />
                            <h3>Upload Your Resume</h3>
                            <p>Drag & Drop your PDF here</p>
                            <span>or Click to Browse</span>
                        </label>

                        {resume && (
                            <div className="resume-file">
                                ✅ {resume.name}
                            </div>
                        )}

                        <button
                            className="create-btn"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Sending Verification Code..." : "Continue with Email Verification →"}
                        </button>
                    </form>

                    <div className="bottom-text">
                        Already have an account?
                        <Link to="/login">
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* ================= OTP VERIFICATION MODAL ================= */}
            {showOtpModal && (
                <div className="otp-modal-backdrop">
                    <div className="otp-modal-card">
                        <div className="otp-modal-header">
                            <div className="otp-icon-wrap">
                                <FaEnvelope className="otp-mail-icon" />
                            </div>
                            <h3>Verify Your Email</h3>
                            <p>
                                We have sent a 6-digit verification code to:
                                <br />
                                <strong>{formData.email}</strong>
                            </p>
                        </div>

                        {otpError && (
                            <div className="otp-error-banner">
                                ⚠️ {otpError}
                            </div>
                        )}

                        <form onSubmit={handleVerifyAndSubmit} className="otp-modal-form">
                            <div className="otp-input-wrap">
                                <input
                                    type="text"
                                    maxLength="6"
                                    autoFocus
                                    placeholder="• • • • • •"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setOtp(val);
                                        if (otpError) setOtpError("");
                                    }}
                                    className="otp-digit-input"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="otp-verify-submit-btn"
                                disabled={otpLoading || otp.length !== 6}
                            >
                                {otpLoading ? "Verifying & Creating..." : "Verify & Create Account"}
                            </button>
                        </form>

                        <div className="otp-modal-footer">
                            <div className="resend-section">
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={otpLoading}
                                        className="resend-btn"
                                    >
                                        Resend Code
                                    </button>
                                ) : (
                                    <span className="resend-countdown">
                                        Resend code in <strong>{resendTimer}s</strong>
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                className="change-email-btn"
                                onClick={() => setShowOtpModal(false)}
                                disabled={otpLoading}
                            >
                                ← Edit Email or Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobSeekerRegister;