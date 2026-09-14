import { useEffect, useState } from "react";

import RecruiterSidebar
    from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";

import RecruiterTopbar
    from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";

import { createJob } from "../../../services/jobService";

import { getCompanyProfile }
    from "../../../services/companyProfileService";

import "./PostJob.css";


// =====================================================
// JOB DESCRIPTION TEMPLATES
// =====================================================

const JOB_DESCRIPTIONS = {

    "Java Full Stack Developer":
        `We are looking for a Java Full Stack Developer to design, develop, test, and maintain scalable web applications.

The candidate will work on frontend and backend development using Java, Spring Boot, REST APIs, React, HTML, CSS, JavaScript, and MySQL.

Responsibilities:
• Develop and maintain full stack applications.
• Build RESTful APIs using Java and Spring Boot.
• Develop responsive frontend interfaces.
• Work with MySQL databases.
• Debug and optimize application performance.
• Collaborate with developers and other teams.

Required Skills:
Java, Spring Boot, REST API, React, JavaScript, HTML, CSS, MySQL, Git.`,

    "Java Backend Developer":
        `We are looking for a Java Backend Developer to build reliable and scalable backend applications.

Responsibilities:
• Develop backend services using Java.
• Build REST APIs using Spring Boot.
• Design and optimize database queries.
• Work with MySQL and relational databases.
• Implement authentication and authorization.
• Debug and maintain backend services.

Required Skills:
Java, Spring Boot, REST API, MySQL, SQL, Git.`,

    "Python Developer":
        `We are looking for a Python Developer to develop and maintain efficient software applications.

Responsibilities:
• Develop applications using Python.
• Build REST APIs and backend services.
• Work with databases and external APIs.
• Write clean and maintainable code.
• Debug and optimize applications.
• Collaborate with the development team.

Required Skills:
Python, REST API, SQL, Git, APIs.`,

    "Frontend Developer":
        `We are looking for a Frontend Developer to create modern, responsive, and user-friendly web applications.

Responsibilities:
• Develop responsive web interfaces.
• Build reusable UI components.
• Work with React and JavaScript.
• Integrate frontend applications with REST APIs.
• Optimize application performance.
• Ensure cross-browser compatibility.

Required Skills:
HTML, CSS, JavaScript, React, Git, REST APIs.`,

    "Backend Developer":
        `We are looking for a Backend Developer to develop secure and scalable server-side applications.

Responsibilities:
• Design and develop backend services.
• Build REST APIs.
• Work with relational databases.
• Implement authentication and authorization.
• Debug and optimize backend systems.
• Collaborate with frontend developers.

Required Skills:
Node.js, Express, REST API, SQL, MySQL, Git.`,

    "Full Stack Developer":
        `We are looking for a Full Stack Developer to develop complete web applications from frontend to backend.

Responsibilities:
• Develop responsive frontend applications.
• Build backend APIs and services.
• Work with databases.
• Integrate frontend and backend systems.
• Debug and optimize applications.
• Participate in application design and development.

Required Skills:
JavaScript, React, Node.js, Express, REST API, SQL, Git.`,

    "React Developer":
        `We are looking for a React Developer to build modern and responsive web applications.

Responsibilities:
• Develop reusable React components.
• Build responsive user interfaces.
• Manage application state.
• Integrate REST APIs.
• Optimize frontend performance.
• Work with modern JavaScript.

Required Skills:
React, JavaScript, HTML, CSS, REST API, Git.`,

    "Python Full Stack Developer":
        `We are looking for a Python Full Stack Developer to build complete web applications.

Responsibilities:
• Develop frontend interfaces.
• Build backend services using Python.
• Develop REST APIs.
• Work with databases.
• Integrate frontend and backend systems.
• Debug and optimize applications.

Required Skills:
Python, Django or Flask, React, JavaScript, REST API, SQL, Git.`,

    "AI/ML Engineer":
        `We are looking for an AI/ML Engineer to design and develop intelligent software solutions.

Responsibilities:
• Develop machine learning models.
• Prepare and analyze datasets.
• Build AI-powered applications.
• Evaluate and improve model performance.
• Integrate AI models into applications.
• Work with APIs and data processing pipelines.

Required Skills:
Python, Machine Learning, Deep Learning, SQL, Data Processing, APIs.`,

    "Data Analyst":
        `We are looking for a Data Analyst to analyze business data and generate meaningful insights.

Responsibilities:
• Collect and clean data.
• Analyze datasets.
• Create reports and dashboards.
• Identify trends and patterns.
• Work with SQL databases.
• Present data-driven insights.

Required Skills:
SQL, Excel, Python, Pandas, Data Analysis, Visualization.`,

    "Software Engineer":
        `We are looking for a Software Engineer to design, develop, test, and maintain software applications.

Responsibilities:
• Develop high-quality software.
• Write clean and maintainable code.
• Debug and fix application issues.
• Develop APIs and application features.
• Work with databases.
• Collaborate with engineering teams.

Required Skills:
Programming, Data Structures, SQL, REST API, Git, Software Development.`,

    "DevOps Engineer":
        `We are looking for a DevOps Engineer to automate deployment and maintain reliable application infrastructure.

Responsibilities:
• Automate CI/CD pipelines.
• Manage application deployments.
• Work with cloud and infrastructure tools.
• Monitor application performance.
• Manage containers and deployment environments.
• Improve system reliability.

Required Skills:
Linux, Git, Docker, CI/CD, Cloud, Kubernetes.`
};


// =====================================================
// LOCATIONS
// =====================================================

const LOCATIONS = [

    "Hyderabad",
    "Bangalore",
    "Chennai",
    "Mumbai",
    "Delhi",
    "Pune",
    "Kolkata",
    "Ahmedabad",
    "Gurugram",
    "Noida",
    "Others"

];


// =====================================================
// JOB TITLES
// =====================================================

const JOB_TITLES = [

    "Java Full Stack Developer",
    "Java Backend Developer",
    "Python Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "React Developer",
    "Python Full Stack Developer",
    "AI/ML Engineer",
    "Data Analyst",
    "Software Engineer",
    "DevOps Engineer",
    "Others"

];


// =====================================================
// INITIAL FORM
// =====================================================

const INITIAL_FORM = {

    title: "",
    company: "",
    location: "",
    salary: "",
    experience: "",
    employmentType: "Full Time",
    vacancies: 1,
    deadline: "",
    description: ""

};


// =====================================================
// COMPONENT
// =====================================================

function PostJob() {

    const [loading, setLoading] = useState(false);

    const [companyLoading, setCompanyLoading] = useState(true);

    const [companyName, setCompanyName] = useState("");

    const [selectedTitle, setSelectedTitle] = useState("");

    const [customTitle, setCustomTitle] = useState("");

    const [selectedLocation, setSelectedLocation] = useState("");

    const [formData, setFormData] = useState(INITIAL_FORM);


    // =====================================================
    // DEADLINE LIMIT
    // =====================================================

    const today = new Date();

    const todayString =
        today.toISOString().split("T")[0];

    const maxDateObject = new Date();

    maxDateObject.setDate(
        maxDateObject.getDate() + 40
    );

    const maxDeadline =
        maxDateObject
            .toISOString()
            .split("T")[0];


    // =====================================================
    // LOAD COMPANY
    // =====================================================

    useEffect(() => {

        loadCompany();

    }, []);


    const loadCompany = async () => {

        try {

            setCompanyLoading(true);

            const data =
                await getCompanyProfile();

            const name =
                data?.profile?.company_name || "";

            setCompanyName(name);

            setFormData(prev => ({

                ...prev,

                company: name

            }));

        }

        catch (err) {

            console.log(
                "Company Profile Error:",
                err
            );

        }

        finally {

            setCompanyLoading(false);

        }

    };


    // =====================================================
    // TITLE CHANGE
    // =====================================================

    const handleTitleChange = (e) => {

        const value = e.target.value;

        setSelectedTitle(value);

        if (value === "Others") {

            setFormData(prev => ({

                ...prev,

                title: "",

                description: ""

            }));

            return;

        }

        setFormData(prev => ({

            ...prev,

            title: value,

            description:
                JOB_DESCRIPTIONS[value] || ""

        }));

    };


    // =====================================================
    // CUSTOM TITLE
    // =====================================================

    const handleCustomTitleChange = (e) => {

        const value =
            e.target.value.slice(0, 100);

        setCustomTitle(value);

        setFormData(prev => ({

            ...prev,

            title: value

        }));

    };


    // =====================================================
    // LOCATION CHANGE
    // =====================================================

    const handleLocationChange = (e) => {

        const value = e.target.value;

        setSelectedLocation(value);

        setFormData(prev => ({

            ...prev,

            location:
                value === "Others"
                    ? ""
                    : value

        }));

    };


    // =====================================================
    // GENERAL FORM CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData(prev => ({

            ...prev,

            [name]: value

        }));

    };


    // =====================================================
    // CUSTOM LOCATION
    // =====================================================

    const handleCustomLocation = (e) => {

        const value =
            e.target.value.slice(0, 80);

        setFormData(prev => ({

            ...prev,

            location: value

        }));

    };


    // =====================================================
    // SALARY CHANGE
    // Maximum: 100 LPA
    // =====================================================

    const handleSalaryChange = (e) => {

        const value = e.target.value;

        if (value === "") {

            setFormData(prev => ({

                ...prev,

                salary: ""

            }));

            return;

        }

        const salary = Number(value);

        if (!Number.isFinite(salary)) {
            return;
        }

        if (salary < 0) {
            return;
        }

        if (salary > 100) {
            return;
        }

        setFormData(prev => ({

            ...prev,

            salary: value

        }));

    };


    // =====================================================
    // EXPERIENCE CHANGE
    // Maximum: 30 Years
    // =====================================================

    const handleExperienceChange = (e) => {

        const value = e.target.value;

        if (value === "") {

            setFormData(prev => ({

                ...prev,

                experience: ""

            }));

            return;

        }

        const experience = Number(value);

        if (!Number.isFinite(experience)) {
            return;
        }

        if (experience < 0) {
            return;
        }

        if (experience > 30) {
            return;
        }

        setFormData(prev => ({

            ...prev,

            experience: value

        }));

    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // =================================================
        // COMPANY VALIDATION
        // =================================================

        if (!companyName) {

            alert(
                "Please complete your Company Profile first."
            );

            return;

        }


        // =================================================
        // TITLE VALIDATION
        // =================================================

        if (!formData.title.trim()) {

            alert(
                "Please select or enter a Job Title."
            );

            return;

        }


        // =================================================
        // LOCATION VALIDATION
        // =================================================

        if (!formData.location.trim()) {

            alert(
                "Please select or enter a Location."
            );

            return;

        }


        // =================================================
        // SALARY VALIDATION
        // =================================================

        const salary =
            Number(formData.salary);

        if (
            formData.salary === "" ||
            !Number.isFinite(salary) ||
            salary <= 0 ||
            salary > 100
        ) {

            alert(
                "Salary must be between 0.1 and 100 LPA."
            );

            return;

        }


        // =================================================
        // EXPERIENCE VALIDATION
        // =================================================

        const experience =
            Number(formData.experience);

        if (
            formData.experience === "" ||
            !Number.isFinite(experience) ||
            experience < 0 ||
            experience > 30
        ) {

            alert(
                "Experience must be between 0 and 30 years."
            );

            return;

        }


        // =================================================
        // VACANCIES VALIDATION
        // =================================================

        const vacancies =
            Number(formData.vacancies);

        if (
            !Number.isInteger(vacancies) ||
            vacancies < 1 ||
            vacancies > 50
        ) {

            alert(
                "Vacancies must be between 1 and 50."
            );

            return;

        }


        // =================================================
        // DEADLINE VALIDATION
        // =================================================

        if (
            !formData.deadline ||
            formData.deadline < todayString ||
            formData.deadline > maxDeadline
        ) {

            alert(
                "Application deadline must be within the next 40 days."
            );

            return;

        }


        // =================================================
        // DESCRIPTION VALIDATION
        // =================================================

        if (
            formData.description.trim().length < 30
        ) {

            alert(
                "Job Description must contain at least 30 characters."
            );

            return;

        }


        // =================================================
        // CREATE JOB
        // =================================================

        try {

            setLoading(true);


            const finalData = {

                ...formData,

                company: companyName,

                // Store readable values
                salary:
                    `${Number(formData.salary)} LPA`,

                experience:
                    `${Number(formData.experience)} Years`,

                vacancies

            };


            const data =
                await createJob(finalData);


            alert(
                data.message ||
                "Job Posted Successfully"
            );


            console.log(
                "AI Extracted Skills:",
                data.skills
            );


            // =================================================
            // RESET FORM
            // =================================================

            setSelectedTitle("");

            setCustomTitle("");

            setSelectedLocation("");

            setFormData({

                ...INITIAL_FORM,

                company: companyName

            });

        }

        catch (err) {

            console.log(err);

            alert(

                err.response?.data?.message ||

                "Failed to create job."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="recruiter-dashboard">

            <RecruiterSidebar />


            <div className="dashboard-content">

                <RecruiterTopbar />


                <div className="post-job-container">

                    {/* =====================================
                        HEADER
                    ===================================== */}

                    <div className="post-job-header">

                        <div>

                            <h1>
                                🏢 Post New Job
                            </h1>

                            <p>
                                Create a job opportunity and
                                let AI automatically identify
                                the required technical skills.
                            </p>

                        </div>

                        <div className="header-badge">
                            🤖 AI Powered
                        </div>

                    </div>


                    {/* =====================================
                        FORM
                    ===================================== */}

                    <form
                        className="post-job-form"
                        onSubmit={handleSubmit}
                    >


                        {/* ==================================
                            COMPANY
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Company
                            </label>

                            <input
                                type="text"
                                value={
                                    companyLoading
                                        ? "Loading company..."
                                        : companyName
                                }
                                disabled
                            />

                            <small>
                                🏢 Company name comes from
                                your Company Profile.
                            </small>

                        </div>


                        {/* ==================================
                            JOB TITLE
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Job Title
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <select
                                value={selectedTitle}
                                onChange={handleTitleChange}
                                required
                            >

                                <option value="">
                                    Select Job Title
                                </option>

                                {JOB_TITLES.map(title => (

                                    <option
                                        key={title}
                                        value={title}
                                    >
                                        {title}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* ==================================
                            CUSTOM TITLE
                        ================================== */}

                        {selectedTitle === "Others" && (

                            <div className="form-group">

                                <label>
                                    Custom Job Title
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={customTitle}
                                    onChange={
                                        handleCustomTitleChange
                                    }
                                    maxLength={100}
                                    placeholder="Enter your job title"
                                    required
                                />

                            </div>

                        )}


                        {/* ==================================
                            LOCATION
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Location
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <select
                                value={selectedLocation}
                                onChange={handleLocationChange}
                                required
                            >

                                <option value="">
                                    Select Location
                                </option>

                                {LOCATIONS.map(city => (

                                    <option
                                        key={city}
                                        value={city}
                                    >
                                        {city}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* ==================================
                            CUSTOM LOCATION
                        ================================== */}

                        {selectedLocation === "Others" && (

                            <div className="form-group">

                                <label>
                                    Custom Location
                                    <span className="required-star">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={
                                        handleCustomLocation
                                    }
                                    maxLength={80}
                                    placeholder="Enter city or location"
                                    required
                                />

                            </div>

                        )}


                        {/* ==================================
                            SALARY
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Salary
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <div className="input-with-unit">

                                <input
                                    type="number"
                                    name="salary"
                                    min="0.1"
                                    max="100"
                                    step="0.1"
                                    placeholder="10"
                                    value={formData.salary}
                                    onChange={handleSalaryChange}
                                    required
                                />

                                <span className="input-unit">
                                    LPA
                                </span>

                            </div>

                            <small>
                                💰 Salary range: 0.1 - 100 LPA
                            </small>

                        </div>


                        {/* ==================================
                            EXPERIENCE
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Experience
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <div className="input-with-unit">

                                <input
                                    type="number"
                                    name="experience"
                                    min="0"
                                    max="30"
                                    step="0.5"
                                    placeholder="2"
                                    value={formData.experience}
                                    onChange={
                                        handleExperienceChange
                                    }
                                    required
                                />

                                <span className="input-unit">
                                    Years
                                </span>

                            </div>

                            <small>
                                👨‍💻 Experience range: 0 - 30 years
                            </small>

                        </div>


                        {/* ==================================
                            EMPLOYMENT TYPE
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Employment Type
                            </label>

                            <select
                                name="employmentType"
                                value={
                                    formData.employmentType
                                }
                                onChange={handleChange}
                            >

                                <option value="Full Time">
                                    Full Time
                                </option>

                                <option value="Part Time">
                                    Part Time
                                </option>

                                <option value="Internship">
                                    Internship
                                </option>

                                <option value="Contract">
                                    Contract
                                </option>

                                <option value="Remote">
                                    Remote
                                </option>

                            </select>

                        </div>


                        {/* ==================================
                            VACANCIES
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Vacancies
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                name="vacancies"
                                min="1"
                                max="50"
                                value={formData.vacancies}
                                onChange={handleChange}
                                required
                            />

                            <small>
                                👥 Maximum 50 vacancies.
                            </small>

                        </div>


                        {/* ==================================
                            DEADLINE
                        ================================== */}

                        <div className="form-group">

                            <label>
                                Application Deadline
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                min={todayString}
                                max={maxDeadline}
                                required
                            />

                            <small>
                                📅 Deadline can only be
                                within the next 40 days.
                            </small>

                        </div>


                        {/* ==================================
                            DESCRIPTION
                        ================================== */}

                        <div className="form-group full-width">

                            <label>
                                Job Description
                                <span className="required-star">
                                    *
                                </span>
                            </label>

                            <textarea
                                rows="12"
                                name="description"
                                placeholder={
                                    selectedTitle === "Others"
                                        ? "Write your job description..."
                                        : "Select a job title to generate a description..."
                                }
                                value={
                                    formData.description
                                }
                                onChange={handleChange}
                                maxLength={5000}
                                required
                            />

                            <div className="description-footer">

                                <small>
                                    {selectedTitle !== "Others"
                                        ? "✨ AI-ready template generated from the selected role. You can edit it before posting."
                                        : "✍️ Write a clear description including responsibilities and required skills."
                                    }
                                </small>

                                <span>
                                    {
                                        formData.description.length
                                    }
                                    /5000
                                </span>

                            </div>

                        </div>


                        {/* ==================================
                            AI NOTICE
                        ================================== */}

                        <div className="ai-box">

                            <div className="ai-icon">
                                🤖
                            </div>

                            <div>

                                <strong>
                                    AI Skill Analysis
                                </strong>

                                <p>
                                    AI will analyze the final
                                    job description and automatically
                                    extract technical skills.
                                </p>

                            </div>

                        </div>


                        {/* ==================================
                            SUBMIT
                        ================================== */}

                        <button
                            type="submit"
                            className="post-job-btn"
                            disabled={
                                loading ||
                                companyLoading
                            }
                        >

                            {loading
                                ? "🤖 AI is Analyzing & Posting..."
                                : "🚀 Post Job"
                            }

                        </button>


                    </form>

                </div>

            </div>

        </div>

    );

}


export default PostJob;