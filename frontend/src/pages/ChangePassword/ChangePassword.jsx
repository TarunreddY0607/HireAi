import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import "./ChangePassword.css";

import { changePassword } from "../../services/profileService";

function ChangePassword() {

    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {

        if (!currentPassword || !newPassword || !confirmPassword) {

            return alert("Please fill all fields.");

        }

        if (newPassword.length < 6) {

            return alert("New password must be at least 6 characters.");

        }

        if (newPassword !== confirmPassword) {

            return alert("Passwords do not match.");

        }

        try {

            setLoading(true);

            const res = await changePassword({

                currentPassword,

                newPassword

            });

            alert(res.message);

            navigate("/profile");

        }

        catch (err) {

            alert(

                err.response?.data?.message ||

                "Failed to Change Password"

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Topbar />

                <div className="change-password-container">

                    <h1>

                        🔒 Change Password

                    </h1>

                    <div className="change-password-card">

                        <label>

                            Current Password

                        </label>

                        <input

                            type="password"

                            placeholder="Enter Current Password"

                            value={currentPassword}

                            onChange={(e)=>setCurrentPassword(e.target.value)}

                        />

                        <label>

                            New Password

                        </label>

                        <input

                            type="password"

                            placeholder="Enter New Password"

                            value={newPassword}

                            onChange={(e)=>setNewPassword(e.target.value)}

                        />

                        <label>

                            Confirm Password

                        </label>

                        <input

                            type="password"

                            placeholder="Confirm New Password"

                            value={confirmPassword}

                            onChange={(e)=>setConfirmPassword(e.target.value)}

                        />

                        <button

                            onClick={handleSubmit}

                            disabled={loading}

                        >

                            {

                                loading

                                ?

                                "Updating..."

                                :

                                "Change Password"

                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ChangePassword;