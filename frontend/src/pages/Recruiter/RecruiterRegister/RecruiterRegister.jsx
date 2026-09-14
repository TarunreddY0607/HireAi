import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FaBuilding,
    FaUserTie,
    FaEnvelope,
    FaPhone,
    FaGlobe,
    FaIndustry,
    FaUsers,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaRobot,
    FaCheckCircle,
    FaBolt,
    FaChartLine,
    FaShieldAlt
} from "react-icons/fa";

import { registerRecruiter } from "../../../services/recruiterService";
import api from "../../../services/api";
import "./RecruiterRegister.css";

function RecruiterRegister() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP Modal & State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [otpError, setOtpError] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        hrName: "",
        officialEmail: "",
        phone: "",
        website: "",
        industry: "",
        companySize: "",
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

    const handleInitiateRegister = async (e) => {
        e.preventDefault();

        if (
            !formData.companyName.trim() ||
            !formData.hrName.trim() ||
            !formData.officialEmail.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            return alert("Please fill all required fields.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.officialEmail.trim())) {
            return alert("Please enter a valid official company email address.");
        }

        if (formData.password.length < 6) {
            return alert("Password must be at least 6 characters long.");
        }

        if (formData.password !== formData.confirmPassword) {
            return alert("Passwords do not match.");
        }

        try {
            setLoading(true);
            setOtpError("");
            const res = await api.post("/auth/send-register-otp", {
                email: formData.officialEmail.trim(),
                fullName: formData.hrName.trim()
            });

            if (res.data.success) {
                setShowOtpModal(true);
                setOtp("");
                setResendTimer(30);
                setCanResend(false);
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to send verification code. Please check the email and try again."
            );
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
                email: formData.officialEmail.trim(),
                fullName: formData.hrName.trim()
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
            const { confirmPassword, ...data } = formData;
            const response = await registerRecruiter({
                ...data,
                officialEmail: data.officialEmail.trim(),
                otp: otp.trim()
            });
            setShowOtpModal(false);
            alert("🎉 " + (response.message || "Recruiter Account Created Successfully!"));
            navigate("/login");
        } catch (err) {
            setOtpError(
                err.response?.data?.message ||
                "Registration Failed. Please try again."
            );
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="recruiter-register-page">
            {/* ================= LEFT BRAND PANEL ================= */}
            <div className="recruiter-left-panel">
                <div className="recruiter-brand-header">
                    <div className="brand-logo-circle">
                        <FaRobot />
                    </div>
                    <div className="brand-title-wrap">
                        <h2>Hire<span>AI</span></h2>
                        <span>for Employers</span>
                    </div>
                </div>

                <span className="recruiter-badge">
                    💼 Enterprise Recruitment Platform
                </span>

                <h1>
                    Hire Top Talent <span>10x Faster</span> with AI Intelligence
                </h1>

                <p className="recruiter-hero-desc">
                    Screen applicants automatically with AI resume parsing, rank candidates by ATS compatibility,
                    and conduct AI-assisted interview evaluations all in one place.
                </p>

                <div className="recruiter-value-points">
                    <div className="value-point-item">
                        <div className="value-point-icon">
                            <FaBolt />
                        </div>
                        <div>
                            <h4>Automated Resume Screening</h4>
                            <p>Instant candidate scoring, skill extraction, and experience mapping.</p>
                        </div>
                    </div>

                    <div className="value-point-item">
                        <div className="value-point-icon">
                            <FaChartLine />
                        </div>
                        <div>
                            <h4>AI Candidate Shortlisting</h4>
                            <p>Match applicants to exact job requirements with 95%+ precision.</p>
                        </div>
                    </div>

                    <div className="value-point-item">
                        <div className="value-point-icon">
                            <FaShieldAlt />
                        </div>
                        <div>
                            <h4>Verified Talent Pool</h4>
                            <p>Access qualified, active candidates ready for interviews.</p>
                        </div>
                    </div>
                </div>

                <div className="recruiter-stats-footer">
                    <div>
                        <h3>500+</h3>
                        <p>Hiring Partners</p>
                    </div>
                    <div>
                        <h3>95%</h3>
                        <p>Shortlist Accuracy</p>
                    </div>
                    <div>
                        <h3>60%</h3>
                        <p>Time Saved</p>
                    </div>
                </div>
            </div>

            {/* ================= RIGHT FORM PANEL ================= */}
            <div className="recruiter-right-panel">
                <div className="recruiter-form-card">
                    <div className="form-header">
                        <div className="form-header-badge">
                            <FaBuilding /> Recruiter Portal
                        </div>
                        <h2>Create Recruiter Account</h2>
                        <p>Start sourcing, evaluating, and hiring the best candidates today.</p>
                    </div>

                    <form className="recruiter-form-grid" onSubmit={handleInitiateRegister}>
                        {/* Company Name */}
                        <div className="form-field">
                            <label>Company Name <span className="req">*</span></label>
                            <div className="field-input-box">
                                <FaBuilding className="field-icon" />
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="e.g. Acme Corporation"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* HR Name */}
                        <div className="form-field">
                            <label>HR / Recruiter Name <span className="req">*</span></label>
                            <div className="field-input-box">
                                <FaUserTie className="field-icon" />
                                <input
                                    type="text"
                                    name="hrName"
                                    placeholder="e.g. Sarah Jenkins"
                                    value={formData.hrName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Official Email */}
                        <div className="form-field">
                            <label>Official Company Email <span className="req">*</span></label>
                            <div className="field-input-box">
                                <FaEnvelope className="field-icon" />
                                <input
                                    type="email"
                                    name="officialEmail"
                                    placeholder="e.g. hr@company.com"
                                    value={formData.officialEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="form-field">
                            <label>Phone Number</label>
                            <div className="field-input-box">
                                <FaPhone className="field-icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Company Website */}
                        <div className="form-field">
                            <label>Company Website</label>
                            <div className="field-input-box">
                                <FaGlobe className="field-icon" />
                                <input
                                    type="url"
                                    name="website"
                                    placeholder="https://company.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Industry */}
                        <div className="form-field">
                            <label>Industry</label>
                            <div className="field-input-box">
                                <FaIndustry className="field-icon" />
                                <select
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Industry</option>
                                    <option>Software & Technology</option>
                                    <option>IT Services & Consulting</option>
                                    <option>Banking & Financial Services</option>
                                    <option>Healthcare & Biotech</option>
                                    <option>Education & EdTech</option>
                                    <option>E-Commerce & Retail</option>
                                    <option>Manufacturing & Automotive</option>
                                    <option>Telecommunications</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Company Size */}
                        <div className="form-field full-width">
                            <label>Company Size</label>
                            <div className="field-input-box">
                                <FaUsers className="field-icon" />
                                <select
                                    name="companySize"
                                    value={formData.companySize}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Company Size</option>
                                    <option>1-10 Employees (Startup)</option>
                                    <option>11-50 Employees (Early Stage)</option>
                                    <option>51-200 Employees (Growth)</option>
                                    <option>201-500 Employees (Mid-Market)</option>
                                    <option>500+ Employees (Enterprise)</option>
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-field">
                            <label>Password <span className="req">*</span></label>
                            <div className="field-input-box">
                                <FaLock className="field-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create password (min 6 chars)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="form-field">
                            <label>Confirm Password <span className="req">*</span></label>
                            <div className="field-input-box">
                                <FaLock className="field-icon" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Repeat password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-field full-width">
                            <button
                                type="submit"
                                className="recruiter-submit-btn"
                                disabled={loading}
                            >
                                {loading ? "Sending Verification Code..." : "Continue with Email Verification →"}
                            </button>
                        </div>
                    </form>

                    <div className="form-footer-links">
                        <p>
                            Already registered?{" "}
                            <Link to="/login" className="link-highlight">
                                Sign In here
                            </Link>
                        </p>
                        <p className="sub-switch">
                            Looking for a job?{" "}
                            <Link to="/register/job-seeker" className="link-secondary">
                                Register as Job Seeker →
                            </Link>
                        </p>
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
                            <h3>Verify Company Email</h3>
                            <p>
                                We have sent a 6-digit verification code to:
                                <br />
                                <strong>{formData.officialEmail}</strong>
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
                                {otpLoading ? "Verifying & Creating..." : "Verify & Create Recruiter Account"}
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

export default RecruiterRegister;