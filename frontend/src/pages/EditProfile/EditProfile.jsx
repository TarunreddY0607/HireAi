import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import "./EditProfile.css";

import { getProfile } from "../../services/profileService";
import api from "../../services/api";

function EditProfile() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");

    const [phone, setPhone] = useState("");


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {

        loadProfile();

    }, []);


    const loadProfile = async () => {

        try {

            const data = await getProfile();

            if (
                data?.success &&
                data?.profile
            ) {

                /*
                 * IMPORTANT
                 *
                 * Edit Profile uses ACCOUNT NAME.
                 *
                 * account_name = login/account name
                 * resume_full_name = resume name
                 */

                setFullName(
                    data.profile.account_name ||
                    ""
                );

                setPhone(
                    data.profile.phone ||
                    ""
                );

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
    // SAVE PROFILE
    // ==========================================

    const saveProfile = async () => {

        const trimmedName =
            fullName.trim();

        const trimmedPhone =
            phone.trim();


        // ======================================
        // VALIDATION
        // ======================================

        if (!trimmedName) {

            alert(
                "Full Name is required"
            );

            return;

        }


        try {

            setLoading(true);


            // ==================================
            // UPDATE ACCOUNT PROFILE
            // ==================================

            await api.put(

                "/jobseeker/profile",

                {
                    full_name: trimmedName,
                    phone: trimmedPhone
                }

            );


            // ==================================
            // UPDATE LOCAL STORAGE
            // ==================================

            localStorage.setItem(
                "loginName",
                trimmedName
            );

            localStorage.setItem(
                "loginPhone",
                trimmedPhone
            );


            // ==================================
            // SUCCESS
            // ==================================

            window.dispatchEvent(new CustomEvent("profile_updated"));

            alert(
                "Profile Updated Successfully"
            );


            navigate("/profile");

        }

        catch (err) {

            console.log(
                "Profile Update Error:",
                err
            );

            console.log(
                "Server Response:",
                err.response?.data
            );


            alert(
                err.response?.data?.message ||
                "Failed to Update Profile"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="dashboard">


            {/* SIDEBAR */}

            <Sidebar />


            {/* MAIN CONTENT */}

            <div className="main-content">

                <Topbar />


                <div className="edit-profile-container">


                    <h1>
                        Edit Profile
                    </h1>


                    <div className="edit-card">


                        {/* ==========================
                            FULL NAME
                        ========================== */}

                        <label>
                            Full Name
                        </label>


                        <input

                            type="text"

                            value={fullName}

                            onChange={(e) =>
                                setFullName(
                                    e.target.value
                                )
                            }

                            placeholder="Enter your full name"

                            disabled={loading}

                        />


                        {/* ==========================
                            PHONE
                        ========================== */}

                        <label>
                            Phone Number
                        </label>


                        <input

                            type="text"

                            value={phone}

                            onChange={(e) =>
                                setPhone(
                                    e.target.value
                                )
                            }

                            placeholder="Enter your phone number"

                            disabled={loading}

                        />


                        {/* ==========================
                            SAVE
                        ========================== */}

                        <button

                            onClick={
                                saveProfile
                            }

                            disabled={
                                loading
                            }

                        >

                            {loading
                                ? "Saving..."
                                : "Save Changes"
                            }

                        </button>


                    </div>

                </div>

            </div>

        </div>

    );

}


export default EditProfile;