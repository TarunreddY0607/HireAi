import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import { getProfile } from "../../services/profileService";

function Profile() {

    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const fileInputRef = useRef(null);
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        if (profile?.email) {
            const pic = localStorage.getItem(`profile_pic_${profile.email}`);
            setProfilePic(pic);
        }
    }, [profile]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                localStorage.setItem(`profile_pic_${profile.email}`, base64String);
                setProfilePic(base64String);
                window.dispatchEvent(new Event("profilePicChanged"));

                try {
                    await api.put("/profile/avatar", { profile_pic: base64String });
                } catch (apiErr) {
                    console.error("Failed to upload avatar to backend:", apiErr);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePic = async (e) => {
        e.stopPropagation();
        if (profile?.email) {
            localStorage.removeItem(`profile_pic_${profile.email}`);
            setProfilePic(null);
            window.dispatchEvent(new Event("profilePicChanged"));

            try {
                await api.put("/profile/avatar", { profile_pic: null });
            } catch (apiErr) {
                console.error("Failed to remove avatar from backend:", apiErr);
            }
        }
    };

    useEffect(() => {

        loadProfile();

    }, []);

    const loadProfile = async () => {

        try {

            const data = await getProfile();

            setProfile(data.profile);

            if (data.profile?.profile_pic) {
                localStorage.setItem(`profile_pic_${data.profile.email}`, data.profile.profile_pic);
                setProfilePic(data.profile.profile_pic);
            } else {
                localStorage.removeItem(`profile_pic_${data.profile.email}`);
                setProfilePic(null);
            }

        }

        catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Topbar />

                <div className="profile-container">

                    {/* Header */}

                    <div className="profile-header">

                        <div className="avatar-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>

                            <div className="profile-avatar" onClick={handleAvatarClick} title="Click to change profile picture">

                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="profile-img" />
                                ) : (
                                    profile?.account_name
                                        ? profile.account_name.charAt(0).toUpperCase()
                                        : "U"
                                )}

                                <div className="avatar-overlay">
                                    📷 Change Photo
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    style={{ display: "none" }}
                                />

                            </div>

                            {profilePic && (
                                <button
                                    onClick={handleRemovePic}
                                    className="remove-pic-btn"
                                >
                                    🗑️ Remove Photo
                                </button>
                            )}

                        </div>

                        <div>

                            <h1>{profile?.account_name}</h1>

                            <p>{profile?.email}</p>

                            <span className="role-badge">

                                Job Seeker

                            </span>

                        </div>

                    </div>

                    {/* Cards */}

                    <div className="profile-grid">

                        {/* Account */}

                        <div className="profile-card">

                            <h2>👤 Account Information</h2>

                            <div className="info-row">

                                <span>Full Name</span>

                                <strong>{profile?.account_name}</strong>

                            </div>

                            <div className="info-row">

                                <span>Email</span>

                                <strong>{profile?.email}</strong>

                            </div>

                            <div className="info-row">

                                <span>Phone</span>

                                <strong>{profile?.phone}</strong>

                            </div>

                            <div className="info-row">

                                <span>Role</span>

                                <strong>Job Seeker</strong>

                            </div>

                        </div>

                        {/* Resume */}

                        <div className="profile-card">

                            <h2>📄 Resume Information</h2>

                            <div className="info-row">

                                <span>Resume</span>

                                <strong>

                                    {profile?.resume_path || "Not Uploaded"}

                                </strong>

                            </div>

                            <div className="info-row">

                                <span>Resume Score</span>

                                <strong>

                                    {profile?.ats_score ?? "--"}%

                                </strong>

                            </div>

                            <div className="info-row">

                                <span>Hire Probability</span>

                                <strong>

                                    {profile?.hire_probability ?? "--"}%

                                </strong>

                            </div>

                            <div className="info-row">

                                <span>Status</span>

                                <strong>

                                    {profile?.is_analyzed
                                        ? "✅ Analyzed"
                                        : "⏳ Pending"}

                                </strong>

                            </div>

                            <div className="info-row">

                                <span>Last Analysis</span>

                                <strong>

                                    {profile?.last_analyzed
                                        ? new Date(
                                            profile.last_analyzed
                                        ).toLocaleString()
                                        : "Not Available"}

                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* Action Buttons */}

                    <div className="profile-actions">

                        <button
                            className="edit-profile-btn"
                            onClick={() => navigate("/profile/edit")}
                        >

                            ✏ Edit Profile

                        </button>

                        <button
                            className="change-password-btn"
onClick={() => navigate("/change-password")}                        >

                            🔒 Change Password

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Profile;