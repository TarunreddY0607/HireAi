import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaBell,
    FaSearch,
    FaTimes,
    FaBriefcase,
    FaMapMarkerAlt,
    FaBuilding
} from "react-icons/fa";


import {
    getRecruiterDashboard
} from "../../../services/recruiterDashboardService";

import {
    getRecruiterJobs
} from "../../../services/jobService";

import "./RecruiterTopbar.css";


function RecruiterTopbar() {

    const navigate = useNavigate();

    const notificationRef = useRef(null);


    // =====================================================
    // RECRUITER
    // =====================================================

    const [recruiter, setRecruiter] =
        useState(null);


    // =====================================================
    // JOBS
    // =====================================================

    const [jobs, setJobs] =
        useState([]);


    // =====================================================
    // SEARCH
    // =====================================================

    const [searchText, setSearchText] =
        useState("");

    const [showSearchResults, setShowSearchResults] =
        useState(false);


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const [applicants, setApplicants] =
        useState([]);

    const [showNotifications, setShowNotifications] =
        useState(false);


    const [lastSeenId, setLastSeenId] =
        useState(() => {

            const saved =
                localStorage.getItem(
                    "hire_ai_recruiter_last_notification_id"
                );

            return saved
                ? Number(saved)
                : 0;

        });


    const [notificationInitialized, setNotificationInitialized] =
        useState(() => {

            return Boolean(
                localStorage.getItem(
                    "hire_ai_recruiter_notifications_initialized"
                )
            );

        });


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        loadTopbarData();


        // Check for new applicants every 15 seconds

        const interval = setInterval(() => {

            loadTopbarData();

        }, 15000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    // =====================================================
    // CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setShowNotifications(false);

            }

        };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    // =====================================================
    // LOAD TOPBAR DATA
    // =====================================================

    const loadTopbarData = async () => {

        try {

            const [
                dashboardResponse,
                jobsResponse
            ] = await Promise.all([

                getRecruiterDashboard(),

                getRecruiterJobs()

            ]);


            // ---------------------------------------------
            // Recruiter
            // ---------------------------------------------

            setRecruiter(
                dashboardResponse?.recruiter || {}
            );


            // ---------------------------------------------
            // Applicants
            // ---------------------------------------------

            const loadedApplicants =
                Array.isArray(
                    dashboardResponse?.recentApplicants
                )
                    ? dashboardResponse.recentApplicants
                    : [];


            setApplicants(
                loadedApplicants
            );


            // ---------------------------------------------
            // Jobs
            // ---------------------------------------------

            const loadedJobs =
                Array.isArray(
                    jobsResponse?.jobs
                )
                    ? jobsResponse.jobs
                    : [];


            setJobs(
                loadedJobs
            );


            // =================================================
            // INITIAL NOTIFICATION SETUP
            //
            // Don't show old applications as "new"
            // the first time recruiter opens dashboard.
            // =================================================

            if (
                !notificationInitialized &&
                loadedApplicants.length > 0
            ) {

                const highestId =
                    Math.max(
                        ...loadedApplicants.map(
                            applicant =>
                                Number(
                                    applicant.id
                                ) || 0
                        )
                    );


                if (highestId > 0) {

                    localStorage.setItem(
                        "hire_ai_recruiter_last_notification_id",
                        String(highestId)
                    );


                    localStorage.setItem(
                        "hire_ai_recruiter_notifications_initialized",
                        "true"
                    );


                    setLastSeenId(
                        highestId
                    );


                    setNotificationInitialized(
                        true
                    );

                }

            }

        }

        catch (error) {

            console.log(
                "Recruiter Topbar Error:",
                error
            );

        }

    };


    // =====================================================
    // SEARCH RESULTS
    // =====================================================

    const searchResults =
        searchText.trim().length > 0

            ?

            jobs
                .filter(job => {

                    const search =
                        searchText
                            .trim()
                            .toLowerCase();


                    const title =
                        String(
                            job.title || ""
                        ).toLowerCase();


                    const company =
                        String(
                            job.company || ""
                        ).toLowerCase();


                    const location =
                        String(
                            job.location || ""
                        ).toLowerCase();


                    const description =
                        String(
                            job.description || ""
                        ).toLowerCase();


                    return (

                        title.includes(search)

                        ||

                        company.includes(search)

                        ||

                        location.includes(search)

                        ||

                        description.includes(search)

                    );

                })
                .slice(0, 7)

            :

            [];


    // =====================================================
    // SEARCH CHANGE
    // =====================================================

    const handleSearchChange = (event) => {

        const value =
            event.target.value;


        setSearchText(
            value
        );


        setShowSearchResults(
            value.trim().length > 0
        );

    };


    // =====================================================
    // SEARCH FOCUS
    // =====================================================

    const handleSearchFocus = () => {

        if (
            searchText.trim().length > 0
        ) {

            setShowSearchResults(
                true
            );

        }

    };


    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    const clearSearch = () => {

        setSearchText("");

        setShowSearchResults(
            false
        );

    };


    // =====================================================
    // OPEN JOB
    // =====================================================

    const openJob = (jobId) => {

        setShowSearchResults(
            false
        );

        setSearchText("");

        navigate(
            `/recruiter/view-job/${jobId}`
        );

    };


    // =====================================================
    // NEW APPLICANTS
    // =====================================================

    const newApplicants =
        notificationInitialized

            ?

            applicants.filter(
                applicant =>
                    Number(
                        applicant.id
                    ) > lastSeenId
            )

            :

            [];


    // =====================================================
    // NOTIFICATION CLICK
    // =====================================================

    const handleNotificationClick = () => {

        setShowNotifications(
            previous =>
                !previous
        );


        // ---------------------------------------------
        // Mark all currently loaded applicants as seen
        // ---------------------------------------------

        if (
            applicants.length > 0
        ) {

            const highestId =
                Math.max(
                    ...applicants.map(
                        applicant =>
                            Number(
                                applicant.id
                            ) || 0
                    )
                );


            if (
                highestId > lastSeenId
            ) {

                localStorage.setItem(
                    "hire_ai_recruiter_last_notification_id",
                    String(highestId)
                );


                localStorage.setItem(
                    "hire_ai_recruiter_notifications_initialized",
                    "true"
                );


                setLastSeenId(
                    highestId
                );


                setNotificationInitialized(
                    true
                );

            }

        }

    };


    // =====================================================
    // RECRUITER INITIAL
    // =====================================================

    const recruiterInitial =

        recruiter?.company_name

            ?

            recruiter.company_name
                .charAt(0)
                .toUpperCase()

            :

            "H";


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <header className="recruiter-topbar">


            {/* =================================================
                SEARCH SECTION
            ================================================= */}

            <div className="topbar-search-wrapper">


                <div
                    className={
                        `topbar-search ${
                            searchText
                                ? "search-active"
                                : ""
                        }`
                    }
                >

                    <FaSearch
                        className="search-icon"
                    />


                    <input

                        type="text"

                        value={searchText}

                        onChange={
                            handleSearchChange
                        }

                        onFocus={
                            handleSearchFocus
                        }

                        placeholder="Search jobs, companies or locations..."

                    />


                    {searchText && (

                        <button
                            type="button"
                            className="clear-search"
                            onClick={
                                clearSearch
                            }
                            aria-label="Clear search"
                        >

                            <FaTimes />

                        </button>

                    )}

                </div>


                {/* =================================================
                    SEARCH DROPDOWN
                ================================================= */}

                {showSearchResults && (

                    <div className="search-results-dropdown">


                        <div className="search-dropdown-header">

                            <div>

                                <span className="search-dropdown-icon">

                                    <FaSearch />

                                </span>

                                <span>

                                    Search Results

                                </span>

                            </div>


                            <span className="result-count">

                                {searchResults.length}

                            </span>

                        </div>


                        {searchResults.length > 0 ? (

                            <div className="search-results-list">

                                {searchResults.map(
                                    job => (

                                        <button
                                            type="button"
                                            className="search-result-item"
                                            key={job.id}
                                            onClick={() =>
                                                openJob(
                                                    job.id
                                                )
                                            }
                                        >

                                            <div className="search-result-icon">

                                                <FaBriefcase />

                                            </div>


                                            <div className="search-result-content">

                                                <h4>

                                                    {job.title ||
                                                        "Untitled Job"}

                                                </h4>


                                                <div className="search-result-meta">

                                                    <span>

                                                        <FaBuilding />

                                                        {
                                                            job.company ||
                                                            "Company"
                                                        }

                                                    </span>


                                                    <span>

                                                        <FaMapMarkerAlt />

                                                        {
                                                            job.location ||
                                                            "Location not specified"
                                                        }

                                                    </span>

                                                </div>

                                            </div>


                                            <span className="search-arrow">

                                                →

                                            </span>

                                        </button>

                                    )
                                )}

                            </div>

                        ) : (

                            <div className="search-empty">

                                <div className="search-empty-icon">

                                    <FaSearch />

                                </div>


                                <h4>

                                    No jobs found

                                </h4>


                                <p>

                                    Try a different job title,
                                    company or location.

                                </p>

                            </div>

                        )}

                    </div>

                )}

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="topbar-right">


                {/* =================================================
                    NOTIFICATION
                ================================================= */}

                <div
                    className="notification-wrapper"
                    ref={notificationRef}
                >

                    <button
                        type="button"
                        className={
                            `notification-button ${
                                showNotifications
                                    ? "notification-open"
                                    : ""
                            }`
                        }
                        onClick={
                            handleNotificationClick
                        }
                        aria-label="Notifications"
                    >

                        <FaBell />


                        {newApplicants.length > 0 && (

                            <span className="notification-dot">

                                <span></span>

                            </span>

                        )}

                    </button>


                    {/* =================================================
                        NOTIFICATION PANEL
                    ================================================= */}

                    {showNotifications && (

                        <div className="notification-panel">


                            <div className="notification-panel-header">

                                <div>

                                    <span className="notification-header-icon">

                                        <FaBell />

                                    </span>


                                    <div>

                                        <h3>

                                            Notifications

                                        </h3>

                                        <p>

                                            New applications

                                        </p>

                                    </div>

                                </div>


                                {newApplicants.length > 0 && (

                                    <span className="notification-count">

                                        {newApplicants.length}

                                    </span>

                                )}

                            </div>


                            <div className="notification-list">


                                {newApplicants.length > 0 ? (

                                    newApplicants.map(
                                        applicant => (

                                            <div
                                                className="notification-item"
                                                key={applicant.id}
                                            >

                                                <div className="notification-avatar">

                                                    {(
                                                        applicant.full_name ||
                                                        applicant.name ||
                                                        "A"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>


                                                <div className="notification-content">

                                                    <h4>

                                                        {
                                                            applicant.full_name ||
                                                            applicant.name ||
                                                            "Applicant"
                                                        }

                                                    </h4>


                                                    <p>

                                                        Applied for

                                                    </p>


                                                    <strong>

                                                        {
                                                            applicant.title ||
                                                            "Job"
                                                        }

                                                    </strong>

                                                </div>


                                                <span className="notification-new">

                                                    NEW

                                                </span>

                                            </div>

                                        )
                                    )

                                ) : (

                                    <div className="notification-empty">

                                        <div className="notification-empty-icon">

                                            ✓

                                        </div>


                                        <h4>

                                            You're all caught up

                                        </h4>


                                        <p>

                                            No new applications.

                                        </p>

                                    </div>

                                )}

                            </div>


                        </div>

                    )}

                </div>


                {/* =================================================
                    RECRUITER PROFILE
                ================================================= */}

                <div className="recruiter-profile">


                    <div className="recruiter-avatar">

                        {recruiterInitial}

                    </div>


                    <div className="recruiter-profile-text">

                        <h4>

                            {
                                recruiter?.hr_name ||
                                "Recruiter"
                            }

                        </h4>


                        <span>

                            {
                                recruiter?.company_name ||
                                "Company"
                            }

                        </span>

                    </div>

                </div>


            </div>


        </header>

    );

}


export default RecruiterTopbar;