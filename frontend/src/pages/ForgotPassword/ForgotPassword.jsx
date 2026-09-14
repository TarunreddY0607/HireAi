import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaEnvelope,
    FaLock,
    FaRobot,
    FaShieldAlt,
    FaCheckCircle,
    FaArrowRight,
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
    FaKey,
    FaRedo,
    FaUserPlus
} from "react-icons/fa";
import api from "../../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const navigate = useNavigate();

    // Step state: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [notRegistered, setNotRegistered] = useState(false);

    // Form data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Show/hide passwords
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Resend countdown timer
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Refs for 6 digit OTP inputs
    const otpRefs = useRef([]);

    // Timer countdown effect
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Focus first OTP input when transitioning to Step 2
    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) {
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);
        }
    }, [step]);

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        const cleanVal = value.replace(/\D/g, ""); // numbers only

        const newOtp = [...otp];

        if (cleanVal.length > 1) {
            // User pasted multiple digits
            const digits = cleanVal.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newOtp[i] = digits[i] || "";
            }
            setOtp(newOtp);
            const nextIdx = Math.min(digits.length, 5);
            otpRefs.current[nextIdx]?.focus();
            return;
        }

        newOtp[index] = cleanVal ? cleanVal[0] : "";
        setOtp(newOtp);

        // Auto move to next input if digit entered
        if (cleanVal && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace navigation in OTP
    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Handle Paste event on OTP inputs
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasteData) return;
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pasteData[i] || "";
        }
        setOtp(newOtp);
        const nextIdx = Math.min(pasteData.length, 5);
        otpRefs.current[nextIdx]?.focus();
    };

    // STEP 1: Send OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setNotRegistered(false);

        if (!email || !email.trim()) {
            setErrorMsg("Please enter your registered email address.");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/auth/forgot-password/send-otp", {
                email: email.trim()
            });

            if (res.data?.success) {
                setSuccessMsg(res.data.message);
                setStep(2);
                setTimer(60);
                setCanResend(false);
            } else {
                if (res.data?.accountNotFound) {
                    setNotRegistered(true);
                }
                setErrorMsg(res.data?.message || "Failed to send reset code.");
            }
        } catch (err) {
            console.error("Send OTP error:", err);
            if (
                err.response?.status === 404 ||
                err.response?.data?.accountNotFound ||
                err.response?.data?.message?.toLowerCase().includes("no account")
            ) {
                setNotRegistered(true);
            }
            setErrorMsg(
                err.response?.data?.message ||
                "Failed to send reset code. Please check your email and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            setErrorMsg("Please enter all 6 digits of your verification code.");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/auth/forgot-password/verify-otp", {
                email: email.trim(),
                otp: enteredOtp
            });

            if (res.data?.success) {
                setSuccessMsg("Code verified! Please set your new password.");
                setStep(3);
            } else {
                setErrorMsg(res.data?.message || "Invalid verification code.");
            }
        } catch (err) {
            console.error("Verify OTP error:", err);
            setErrorMsg(
                err.response?.data?.message ||
                "Invalid or expired verification code. Please request a new code."
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 3: Reset Password
    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!newPassword) {
            setErrorMsg("Please enter your new password.");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg("Passwords do not match. Please re-enter.");
            return;
        }

        try {
            setLoading(true);
            const enteredOtp = otp.join("");
            const res = await api.post("/auth/forgot-password/reset-password", {
                email: email.trim(),
                otp: enteredOtp,
                newPassword: newPassword
            });

            if (res.data?.success) {
                setStep(4); // Success step
            } else {
                setErrorMsg(res.data?.message || "Failed to reset password.");
            }
        } catch (err) {
            console.error("Reset password error:", err);
            setErrorMsg(
                err.response?.data?.message ||
                "Failed to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Password strength score (0 to 3)
    const getPasswordStrength = () => {
        if (!newPassword) return { score: 0, text: "", color: "" };
        let score = 0;
        if (newPassword.length >= 6) score += 1;
        if (/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) score += 1;
        if (/[^A-Za-z0-9]/.test(newPassword) || newPassword.length >= 10) score += 1;

        if (score === 1) return { score: 1, text: "Weak", color: "#ef4444" };
        if (score === 2) return { score: 2, text: "Good", color: "#f59e0b" };
        if (score === 3) return { score: 3, text: "Strong", color: "#10b981" };
        return { score: 1, text: "Weak", color: "#ef4444" };
    };

    const strength = getPasswordStrength();

    return (
        <div className="forgot-password-page">
            {/* ================= LEFT BRAND PANEL ================= */}
            <div className="forgot-left-panel">
                <div className="forgot-brand-header">
                    <div className="brand-logo-circle">
                        <FaRobot />
                    </div>
                    <div className="brand-title-wrap">
                        <h2>Hire<span>AI</span></h2>
                        <span>Security & Recovery</span>
                    </div>
                </div>

                <span className="security-badge">
                    <FaShieldAlt /> 256-Bit Encrypted Security
                </span>

                <div className="forgot-hero-card">
                    <h3>Fast, Secure Account Recovery</h3>
                    <p>
                        Get back into your HireAI workspace in seconds with our secure OTP authentication.
                    </p>

                    <div className="security-points">
                        <div className="point-item">
                            <FaCheckCircle className="check-icon" />
                            <span>Instant 6-digit email verification code</span>
                        </div>
                        <div className="point-item">
                            <FaCheckCircle className="check-icon" />
                            <span>Bcrypt-encrypted password storage</span>
                        </div>
                        <div className="point-item">
                            <FaCheckCircle className="check-icon" />
                            <span>Automated session expiration & protection</span>
                        </div>
                    </div>
                </div>

                <div className="forgot-footer-tag">
                    🔒 HireAI Security Protocol v2.4
                </div>
            </div>

            {/* ================= RIGHT FORM PANEL ================= */}
            <div className="forgot-right-panel">
                <div className="forgot-card">

                    {/* Progress indicator */}
                    {step < 4 && (
                        <div className="step-progress-bar">
                            <div className={`progress-step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                                <span className="step-num">{step > 1 ? "✓" : "1"}</span>
                                <span className="step-lbl">Email</span>
                            </div>
                            <div className="step-line">
                                <div className="step-line-fill" style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}></div>
                            </div>
                            <div className={`progress-step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                                <span className="step-num">{step > 2 ? "✓" : "2"}</span>
                                <span className="step-lbl">Verify OTP</span>
                            </div>
                            <div className="step-line">
                                <div className="step-line-fill" style={{ width: step <= 2 ? "0%" : "100%" }}></div>
                            </div>
                            <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
                                <span className="step-num">3</span>
                                <span className="step-lbl">New Password</span>
                            </div>
                        </div>
                    )}

                    {/* Alert messages */}
                    {errorMsg && !notRegistered && (
                        <div className="forgot-alert error">
                            <span>⚠️ {errorMsg}</span>
                        </div>
                    )}

                    {successMsg && step !== 4 && (
                        <div className="forgot-alert success">
                            <span>✅ {successMsg}</span>
                        </div>
                    )}

                    {/* Account Not Registered Card Suggestion */}
                    {step === 1 && notRegistered && (
                        <div className="forgot-account-not-found-card">
                            <div className="anf-icon-wrap">
                                <FaUserPlus />
                            </div>
                            <div className="anf-body">
                                <h4>No Account Found</h4>
                                <p>
                                    No HireAI account exists for <strong>{email}</strong>. Please check for typos or create a new account to get started.
                                </p>
                                <div className="anf-suggestion-box">
                                    <span className="anf-prompt">Don't have an account yet?</span>
                                    <Link to="/register" className="anf-register-btn">
                                        <FaUserPlus />
                                        <span>Create an Account</span>
                                        <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================
                        STEP 1: ENTER EMAIL
                    ==================================================== */}
                    {step === 1 && (
                        <div className="step-box">
                            <div className="step-header">
                                <div className="step-icon-circle">
                                    <FaKey />
                                </div>
                                <h2>Forgot Password?</h2>
                                <p>
                                    Enter your registered email address and we'll send you a 6-digit verification code.
                                </p>
                            </div>

                            <form onSubmit={handleSendOtp}>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-field">
                                        <FaEnvelope className="field-icon" />
                                        <input
                                            type="email"
                                            placeholder="e.g. yourname@gmail.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (notRegistered) setNotRegistered(false);
                                                if (errorMsg) setErrorMsg("");
                                            }}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="forgot-primary-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        "Sending Code..."
                                    ) : (
                                        <>
                                            <span>Send Verification Code</span>
                                            <FaArrowRight />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="back-to-login">
                                <Link to="/login">
                                    <FaArrowLeft /> Back to Sign In
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* ====================================================
                        STEP 2: ENTER OTP
                    ==================================================== */}
                    {step === 2 && (
                        <div className="step-box">
                            <div className="step-header">
                                <div className="step-icon-circle">
                                    <FaShieldAlt />
                                </div>
                                <h2>Enter Verification Code</h2>
                                <p>
                                    We sent a 6-digit code to <strong>{email}</strong>. Please enter it below:
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp}>
                                <div className="otp-inputs-row" onPaste={handleOtpPaste}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (otpRefs.current[idx] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className={`otp-digit-input ${digit ? "filled" : ""}`}
                                        />
                                    ))}
                                </div>

                                <div className="otp-resend-row">
                                    {canResend ? (
                                        <button
                                            type="button"
                                            className="resend-active-btn"
                                            onClick={() => handleSendOtp()}
                                            disabled={loading}
                                        >
                                            <FaRedo /> Resend Code
                                        </button>
                                    ) : (
                                        <span className="resend-timer-text">
                                            Resend code in <strong>0:{timer < 10 ? `0${timer}` : timer}</strong>
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="forgot-primary-btn"
                                    disabled={loading || otp.join("").length !== 6}
                                >
                                    {loading ? (
                                        "Verifying..."
                                    ) : (
                                        <>
                                            <span>Verify & Continue</span>
                                            <FaArrowRight />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="back-to-login">
                                <button
                                    type="button"
                                    className="text-btn"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp(["", "", "", "", "", ""]);
                                        setErrorMsg("");
                                    }}
                                >
                                    <FaArrowLeft /> Change Email Address
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ====================================================
                        STEP 3: NEW PASSWORD
                    ==================================================== */}
                    {step === 3 && (
                        <div className="step-box">
                            <div className="step-header">
                                <div className="step-icon-circle">
                                    <FaLock />
                                </div>
                                <h2>Set New Password</h2>
                                <p>
                                    Create a strong new password for <strong>{email}</strong>.
                                </p>
                            </div>

                            <form onSubmit={handleResetPassword}>
                                <div className="input-group">
                                    <label>New Password</label>
                                    <div className="input-field">
                                        <FaLock className="field-icon" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter at least 6 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>

                                    {/* Password strength indicator */}
                                    {newPassword && (
                                        <div className="strength-meter">
                                            <div className="strength-bars">
                                                <div className={`bar ${strength.score >= 1 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 1 ? strength.color : "" }}></div>
                                                <div className={`bar ${strength.score >= 2 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 2 ? strength.color : "" }}></div>
                                                <div className={`bar ${strength.score >= 3 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 3 ? strength.color : "" }}></div>
                                            </div>
                                            <span style={{ color: strength.color }}>{strength.text}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Confirm New Password</label>
                                    <div className="input-field">
                                        <FaLock className="field-icon" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="forgot-primary-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        "Updating Password..."
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
                                            <FaCheckCircle />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ====================================================
                        STEP 4: SUCCESS
                    ==================================================== */}
                    {step === 4 && (
                        <div className="step-box success-step">
                            <div className="success-icon-wrap">
                                <FaCheckCircle />
                            </div>
                            <h2>Password Reset Complete!</h2>
                            <p>
                                Your password has been successfully updated. You can now sign in with your new credentials.
                            </p>

                            <button
                                type="button"
                                className="forgot-primary-btn"
                                onClick={() => navigate("/login")}
                            >
                                <span>Proceed to Sign In</span>
                                <FaArrowRight />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
