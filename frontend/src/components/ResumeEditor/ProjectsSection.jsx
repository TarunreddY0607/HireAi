import "../../pages/ResumeEditor/ResumeEditor.css";

function ProjectsSection({

    projects,

    setProjects,

    aiSuggestions = [],

    atsScore = 0

}) {

    const addProject = () => {

        setProjects([

            ...projects,

            {

                title: "",

                description: "",

                technologies: []

            }

        ]);

    };

    const updateProject = (index, field, value) => {

        const updated = [...projects];

        updated[index][field] = value;

        setProjects(updated);

    };

    const removeProject = (index) => {

        setProjects(

            projects.filter((_, i) => i !== index)

        );

    };

    const projectSuggestions = aiSuggestions.filter(item =>

        item.toLowerCase().includes("project") ||

        item.toLowerCase().includes("application") ||

        item.toLowerCase().includes("github") ||

        item.toLowerCase().includes("full stack") ||

        item.toLowerCase().includes("portfolio")

    );

    return (

        <div className="resume-section">

            <h2>🚀 Projects</h2>

            <div className="summary-info">

                <span>

                    Total Projects : {projects.length}

                </span>

                <span>

                    Resume Score : {atsScore}%

                </span>

            </div>

            {

                projects.map((item, index) => (

                    <div

                        className="card-item"

                        key={index}

                    >

                        <input

                            type="text"

                            placeholder="Project Title"

                            value={item.title}

                            onChange={(e) =>

                                updateProject(

                                    index,

                                    "title",

                                    e.target.value

                                )

                            }

                        />

                        <textarea

                            className="resume-textarea"

                            placeholder="Describe the project, your contribution and achievements..."

                            value={item.description}

                            onChange={(e) =>

                                updateProject(

                                    index,

                                    "description",

                                    e.target.value

                                )

                            }

                            rows={4}

                        />

                        <input

                            type="text"

                            placeholder="Technologies (React, Node.js, Spring Boot, MySQL)"

                            value={

                                Array.isArray(item.technologies)

                                    ? item.technologies.join(", ")

                                    : item.technologies

                            }

                            onChange={(e) =>

                                updateProject(

                                    index,

                                    "technologies",

                                    e.target.value

                                        .split(",")

                                        .map(t => t.trim())

                                        .filter(Boolean)

                                )

                            }

                        />

                        <button

                            className="delete-btn"

                            onClick={() => removeProject(index)}

                        >

                            Remove

                        </button>

                    </div>

                ))

            }

            <button

                className="add-btn"

                onClick={addProject}

            >

                + Add Project

            </button>

            <p className="ai-tip">

                💡 Mention technologies, your contribution, measurable results and GitHub repository whenever possible.

            </p>

            {

                projectSuggestions.length > 0 && (

                    <div className="section-ai-box">

                        <h3>

                            🤖 AI Recommendation

                        </h3>

                        <ul>

                            {

                                projectSuggestions.map((item, index) => (

                                    <li key={index}>

                                        {item}

                                    </li>

                                ))

                            }

                        </ul>

                    </div>

                )

            }

            {

                projects.length < 2 && (

                    <div className="warning-box">

                        ⚠ Add at least 2-3 quality projects with modern technologies to improve your resume score.

                    </div>

                )

            }

            {

                projects.length >= 2 && (

                    <div className="success-box">

                        ✅ Excellent! Strong projects significantly improve recruiter interest and resume score.

                    </div>

                )

            }

        </div>

    );

}

export default ProjectsSection;