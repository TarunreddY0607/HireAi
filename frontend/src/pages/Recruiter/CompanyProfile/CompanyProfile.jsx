import { useEffect, useState } from "react";
import {
    FaGlobe,
    FaCheckCircle,
    FaExclamationTriangle,
    FaSyncAlt,
    FaExternalLinkAlt,
    FaRobot,
    FaCode,
    FaLightbulb
} from "react-icons/fa";

import RecruiterSidebar
    from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";

import RecruiterTopbar
    from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";

import {
    getCompanyProfile,
    updateCompanyProfile
} from "../../../services/companyProfileService";

import {
    analyzeRecruiterWebsite
} from "../../../services/recruiterDashboardService";

import "./CompanyProfile.css";


function CompanyProfile() {

    const [profile, setProfile] = useState({

        hr_name: "",
        official_email: "",
        company_name: "",
        phone: "",
        website: "",
        industry: "",
        company_size: "",
        company_description: "",
        website_status: "",
        website_analysis: null

    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [analyzingWebsite, setAnalyzingWebsite] = useState(false);
    const [websiteNotice, setWebsiteNotice] = useState(null);


    // ==========================================
    // Load Profile
    // ==========================================

    useEffect(() => {

        loadProfile();

    }, []);


    const loadProfile = async () => {

        try {

            const data = await getCompanyProfile();

            setProfile({

                hr_name: data.profile.hr_name || "",

                official_email:
                    data.profile.official_email || "",

                company_name:
                    data.profile.company_name || "",

                phone:
                    data.profile.phone || "",

                website:
                    data.profile.website || "",

                industry:
                    data.profile.industry || "",

                company_size:
                    data.profile.company_size || "",

                company_description:
                    data.profile.company_description || "",

                website_status:
                    data.profile.website_status || "",

                website_analysis:
                    data.profile.website_analysis || null

            });

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // Input Change
    // ==========================================

    const handleChange = (e) => {

        const {

            name,
            value

        } = e.target;

        setProfile({

            ...profile,

            [name]: value

        });

    };


    // ==========================================
    // Quick Verify Website on Demand
    // ==========================================

    const handleQuickVerifyWebsite = async () => {

        if (!profile.website || !profile.website.trim()) {
            alert("Please enter a website URL first.");
            return;
        }

        try {
            setAnalyzingWebsite(true);
            setWebsiteNotice(null);

            const res = await analyzeRecruiterWebsite(profile.website);

            setProfile(prev => ({
                ...prev,
                website_status: res.website_status,
                website_analysis: res.website_analysis
            }));

            setWebsiteNotice({
                type: res.website_analysis?.hasActivePage ? "success" : "warning",
                text: res.website_analysis?.hasActivePage
                    ? "✓ Live Web Page Verified by AI!"
                    : "⚠️ This link does not have an active web page."
            });
        } catch (err) {
            console.error(err);
            setWebsiteNotice({
                type: "error",
                text: "Failed to verify website."
            });
        } finally {
            setAnalyzingWebsite(false);
        }

    };


    // ==========================================
    // Save Profile
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setWebsiteNotice(null);

            const data =
                await updateCompanyProfile(profile);

            alert(data.message || "Company Profile Updated Successfully!");

            if (data.website_status !== undefined) {
                setProfile(prev => ({
                    ...prev,
                    website: data.website || prev.website,
                    website_status: data.website_status,
                    website_analysis: data.website_analysis
                }));
            }

            if (data.website_analysis) {
                setWebsiteNotice({
                    type: data.website_analysis.hasActivePage ? "success" : "warning",
                    text: data.website_analysis.hasActivePage
                        ? "✓ Company Website Live & Verified by AI"
                        : "⚠️ Link saved, but no active web page was detected at this URL."
                });
            }

        }

        catch (err) {

            console.error("Save profile error:", err);

            alert(

                err.response?.data?.message ||

                "Failed To Update Profile. Please try again."

            );

        }

        finally {

            setSaving(false);

        }

    };


    if (loading) {

        return (

            <div className="recruiter-dashboard">

                <RecruiterSidebar />

                <div className="dashboard-content">

                    <RecruiterTopbar />

                    <div className="company-loading">

                        <h2>

                            🏢 Loading Company Profile...

                        </h2>

                    </div>

                </div>

            </div>

        );

    }


    return (

        <div className="recruiter-dashboard">

            <RecruiterSidebar />

            <div className="dashboard-content">

                <RecruiterTopbar />

                <div className="company-profile-container">


                    {/* ================================= */}
                    {/* Header */}
                    {/* ================================= */}

                    <div className="company-profile-header">

                        <h1>

                            🏢 Company Profile

                        </h1>

                        <p>

                            Manage your company information and recruiter details.

                        </p>

                    </div>


                    {/* ================================= */}
                    {/* Company Preview */}
                    {/* ================================= */}

                    <div className="company-preview">

                        <div className="company-logo">

                            {profile.company_name

                                ? profile.company_name
                                    .charAt(0)
                                    .toUpperCase()

                                : "C"

                            }

                        </div>

                        <div>

                            <h2>

                                {profile.company_name ||
                                    "Your Company"}

                            </h2>

                            <p>

                                {profile.industry ||
                                    "Industry not specified"}

                            </p>

                            <span>

                                🟢 Recruiter Account

                            </span>

                        </div>

                    </div>


                    {/* ================================= */}
                    {/* Form */}
                    {/* ================================= */}

                    <form

                        className="company-profile-card"

                        onSubmit={handleSubmit}

                    >

                        <h2>

                            🏢 Company Information

                        </h2>


                        <div className="form-grid">


                            {/* Company Name */}

                            <div className="form-group">

                                <label>

                                    Company Name

                                </label>

                                <input

                                    type="text"

                                    name="company_name"

                                    value={profile.company_name}

                                    onChange={handleChange}

                                    placeholder="Enter company name"

                                    required

                                />

                            </div>


                            {/* HR Name */}

                            <div className="form-group">

                                <label>

                                    HR / Recruiter Name

                                </label>

                                <input

                                    type="text"

                                    name="hr_name"

                                    value={profile.hr_name}

                                    onChange={handleChange}

                                    placeholder="Enter HR name"

                                    required

                                />

                            </div>


                            {/* Email */}

                            <div className="form-group">

                                <label>

                                    Official Email

                                </label>

                                <input

                                    type="email"

                                    name="official_email"

                                    value={profile.official_email}

                                    onChange={handleChange}

                                    placeholder="company@email.com"

                                    required

                                />

                            </div>


                            {/* Phone */}

                            <div className="form-group">

                                <label>

                                    Phone

                                </label>

                                <input

                                    type="text"

                                    name="phone"

                                    value={profile.phone}

                                    onChange={handleChange}

                                    placeholder="Enter phone number"

                                />

                            </div>


                            {/* Website */}

                            <div className="form-group full-width website-field-group">

                                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>Company Website</span>
                                    {profile.website_analysis?.hasActivePage === true && (
                                        <span style={{ color: "#16a34a", fontSize: "12.5px", fontWeight: "700" }}>
                                            <FaCheckCircle style={{ marginRight: "4px" }} /> Live & AI-Verified
                                        </span>
                                    )}
                                    {profile.website && profile.website_analysis && profile.website_analysis.hasActivePage === false && (
                                        <span style={{ color: "#dc2626", fontSize: "12.5px", fontWeight: "700" }}>
                                            <FaExclamationTriangle style={{ marginRight: "4px" }} /> Dummy / No Active Web Page
                                        </span>
                                    )}
                                </label>

                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <input
                                        type="url"
                                        name="website"
                                        value={profile.website}
                                        onChange={handleChange}
                                        placeholder="https://yourcompany.com"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleQuickVerifyWebsite}
                                        disabled={analyzingWebsite || !profile.website}
                                        style={{
                                            padding: "10px 18px",
                                            borderRadius: "8px",
                                            background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                                            color: "#ffffff",
                                            border: "none",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            cursor: (analyzingWebsite || !profile.website) ? "not-allowed" : "pointer",
                                            opacity: (analyzingWebsite || !profile.website) ? 0.6 : 1,
                                            whiteSpace: "nowrap",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <FaSyncAlt className={analyzingWebsite ? "spinning" : ""} />
                                        {analyzingWebsite ? "Verifying..." : "⚡ Verify Link with AI"}
                                    </button>
                                </div>

                                {/* Dynamic AI Website Notice */}
                                {websiteNotice && (
                                    <div
                                        style={{
                                            marginTop: "8px",
                                            padding: "8px 12px",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            background: websiteNotice.type === "success" ? "#f0fdf4" : websiteNotice.type === "warning" ? "#fff5f5" : "#fef2f2",
                                            color: websiteNotice.type === "success" ? "#166534" : "#991b1b",
                                            border: `1px solid ${websiteNotice.type === "success" ? "#bbf7d0" : "#fecaca"}`
                                        }}
                                    >
                                        {websiteNotice.text}
                                    </div>
                                )}

                                {/* Diagnostic details if dummy link */}
                                {profile.website && profile.website_analysis && profile.website_analysis.hasActivePage === false && (
                                    <div style={{
                                        marginTop: "10px",
                                        padding: "12px 14px",
                                        background: "#fff5f5",
                                        border: "1px solid #fed7d7",
                                        borderRadius: "10px",
                                        fontSize: "13px",
                                        color: "#742a2a"
                                    }}>
                                        <strong>⚠️ AI Website Scan Report:</strong>
                                        <p style={{ margin: "4px 0 0", color: "#4a5568" }}>
                                            {profile.website_analysis.reason || "This link does not have an active web page or domain cannot be reached."}
                                        </p>
                                    </div>
                                )}

                                {/* AI Intelligence Preview if live link */}
                                {profile.website_analysis?.hasActivePage === true && (
                                    <div style={{
                                        marginTop: "10px",
                                        padding: "14px",
                                        background: "#f0fdf4",
                                        border: "1px solid #bbf7d0",
                                        borderRadius: "10px"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534", fontWeight: "700", fontSize: "13px", marginBottom: "6px" }}>
                                            <FaRobot /> AI Company Summary ({profile.website_analysis.trustScore || 95}% Verified Authenticity)
                                        </div>
                                        <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#1e293b", lineHeight: "1.5" }}>
                                            {profile.website_analysis.companySummary}
                                        </p>
                                        {profile.website_analysis.techStack && profile.website_analysis.techStack.length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                {profile.website_analysis.techStack.map((tech, idx) => (
                                                    <span key={idx} style={{
                                                        background: "#ffffff",
                                                        border: "1px solid #cbd5e1",
                                                        padding: "3px 9px",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        color: "#334155"
                                                    }}>
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>


                            {/* Industry */}

                            <div className="form-group">

                                <label>

                                    Industry

                                </label>

                                <input

                                    type="text"

                                    name="industry"

                                    value={profile.industry}

                                    onChange={handleChange}

                                    placeholder="IT Services"

                                />

                            </div>


                            {/* Company Size */}

                            <div className="form-group">

                                <label>

                                    Company Size

                                </label>

                                <select

                                    name="company_size"

                                    value={profile.company_size}

                                    onChange={handleChange}

                                >

                                    <option value="">

                                        Select company size

                                    </option>

                                    <option>

                                        1-10 Employees

                                    </option>

                                    <option>

                                        11-50 Employees

                                    </option>

                                    <option>

                                        51-200 Employees

                                    </option>

                                    <option>

                                        201-500 Employees

                                    </option>

                                    <option>

                                        501-1000 Employees

                                    </option>

                                    <option>

                                        1000+ Employees

                                    </option>

                                </select>

                            </div>


                        </div>


                        {/* Description */}

                        <div className="form-group full-width">

                            <label>

                                Company Description

                            </label>

                            <textarea

                                name="company_description"

                                value={
                                    profile.company_description
                                }

                                onChange={handleChange}

                                placeholder="Tell candidates about your company..."

                                rows="6"

                            />

                        </div>


                        {/* Verification */}

                        <div className="verification-box">

                            <div>

                                <strong>

                                    Verification Status

                                </strong>

                                <p>

                                    Your recruiter account verification status.

                                </p>

                            </div>

                            <span>

                                🟡 Pending

                            </span>

                        </div>


                        {/* Save */}

                        <button

                            type="submit"

                            className="save-company-btn"

                            disabled={saving}

                        >

                            {saving

                                ? "⏳ Saving & Analyzing Website with AI..."

                                : "💾 Save Company Profile"

                            }

                        </button>


                    </form>

                </div>

            </div>

        </div>

    );

}

export default CompanyProfile;