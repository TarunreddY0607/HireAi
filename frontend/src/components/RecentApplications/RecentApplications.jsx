import "./RecentApplications.css";

import {
    useEffect,
    useState
} from "react";

import {
    FaBuilding,
    FaBriefcase,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaUserCheck
} from "react-icons/fa";

import api from "../../services/api";


function RecentApplications({ refreshTrigger } = {}) {

    // ==========================================
    // STATE
    // ==========================================

    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // LOAD APPLICATIONS
    // ==========================================

    useEffect(() => {

        loadApplications();

    }, [refreshTrigger]);

    useEffect(() => {

        const handleApplicationsUpdate = () => {
            loadApplications();
        };

        window.addEventListener("resume_analyzed", handleApplicationsUpdate);
        window.addEventListener("job_applied", handleApplicationsUpdate);

        return () => {
            window.removeEventListener("resume_analyzed", handleApplicationsUpdate);
            window.removeEventListener("job_applied", handleApplicationsUpdate);
        };

    }, []);


    const loadApplications = async () => {

        try {

            setLoading(true);


            const response =
                await api.get(
                    "/applications/my"
                );


            console.log(
                "Recent Applications:",
                response.data
            );


            if (
                response.data?.success &&
                Array.isArray(
                    response.data.applications
                )
            ) {

                setApplications(

                    response.data.applications

                );

            }

            else {

                setApplications([]);

            }

        }

        catch (err) {

            console.log(
                "Recent Applications Error:",
                err
            );

            setApplications([]);

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // STATUS ICON
    // ==========================================

    const getStatusIcon = (
        status
    ) => {

        const normalizedStatus =

            String(
                status || ""
            )
                .toUpperCase();


        switch (normalizedStatus) {


            case "PENDING":

                return <FaClock />;


            case "SHORTLISTED":

                return <FaCheckCircle />;


            case "REJECTED":

                return <FaTimesCircle />;


            case "INTERVIEW":

                return <FaUserCheck />;


            default:

                return <FaClock />;

        }

    };


    // ==========================================
    // STATUS DISPLAY
    // ==========================================

    const getStatusText = (
        status
    ) => {

        const normalizedStatus =

            String(
                status || ""
            )
                .toUpperCase();


        switch (normalizedStatus) {


            case "PENDING":

                return "Applied";


            case "SHORTLISTED":

                return "Shortlisted";


            case "REJECTED":

                return "Rejected";


            case "INTERVIEW":

                return "Interview";


            default:

                return status || "Applied";

        }

    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "";

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ==========================================
    // GET JOB TITLE
    // ==========================================

    const getJobTitle = (
        application
    ) => {

        return (

            application?.job_title ||

            application?.title ||

            application?.job?.title ||

            "Job Application"

        );

    };


    // ==========================================
    // GET COMPANY
    // ==========================================

    const getCompany = (
        application
    ) => {

        return (

            application?.company ||

            application?.company_name ||

            application?.job?.company ||

            "Company"

        );

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="recent-applications">

                <h2>
                    Recent Applications
                </h2>


                <div className="applications-list">

                    <div className="application-card">

                        <div className="application-info">

                            <h3>
                                Loading applications...
                            </h3>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="recent-applications">


            <div className="recent-applications-header">

                <div>

                    <h2>
                        Recent Applications
                    </h2>

                    <p>
                        Your latest job applications
                    </p>

                </div>


                <span className="application-count">

                    {applications.length}

                    {" "}

                    {applications.length === 1
                        ? "Application"
                        : "Applications"
                    }

                </span>

            </div>


            <div className="applications-list">


                {/* ==================================
                    NO APPLICATIONS
                ================================== */}

                {applications.length === 0 && (

                    <div className="no-applications">

                        <div className="no-applications-icon">

                            <FaBriefcase />

                        </div>


                        <h3>
                            No applications yet
                        </h3>


                        <p>

                            Apply for a job and
                            your latest applications
                            will appear here.

                        </p>

                    </div>

                )}


                {/* ==================================
                    APPLICATION LIST
                ================================== */}

                {applications
                    .slice(0, 5)
                    .map(
                        (
                            app,
                            index
                        ) => {

                            const status =
                                getStatusText(
                                    app.status
                                );


                            const statusClass =

                                String(
                                    app.status || "pending"
                                )
                                    .toLowerCase();


                            return (

                                <div

                                    className="application-card"

                                    key={

                                        app.id ||

                                        `${app.job_id}-${index}`

                                    }

                                >


                                    {/* ==================================
                                        COMPANY ICON
                                    ================================== */}

                                    <div className="company-icon">

                                        <FaBuilding />

                                    </div>


                                    {/* ==================================
                                        APPLICATION INFO
                                    ================================== */}

                                    <div className="application-info">


                                        <h3>

                                            {getCompany(
                                                app
                                            )}

                                        </h3>


                                        <p>

                                            <FaBriefcase />

                                            {getJobTitle(
                                                app
                                            )}

                                        </p>


                                        {app.applied_at && (

                                            <small>

                                                Applied on{" "}

                                                {formatDate(
                                                    app.applied_at
                                                )}

                                            </small>

                                        )}

                                    </div>


                                    {/* ==================================
                                        STATUS
                                    ================================== */}

                                    <span

                                        className={

                                            `application-status ${statusClass}`

                                        }

                                    >

                                        {getStatusIcon(
                                            app.status
                                        )}

                                        {status}

                                    </span>


                                </div>

                            );

                        }

                    )}

            </div>

        </div>

    );

}


export default RecentApplications;