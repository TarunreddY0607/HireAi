import "../../pages/ResumeEditor/ResumeEditor.css";

function ExperienceSection({

    experience,

    setExperience,

    aiSuggestions = [],

    atsScore = 0

}) {

    const addExperience = () => {

        setExperience([

            ...experience,

            {

                company: "",

                role: "",

                duration: "",

                description: ""

            }

        ]);

    };

    const updateExperience = (index, field, value) => {

        const updated = [...experience];

        updated[index][field] = value;

        setExperience(updated);

    };

    const removeExperience = (index) => {

        setExperience(

            experience.filter((_, i) => i !== index)

        );

    };

    const experienceSuggestions = aiSuggestions.filter(item =>

        item.toLowerCase().includes("experience") ||

        item.toLowerCase().includes("internship") ||

        item.toLowerCase().includes("intern") ||

        item.toLowerCase().includes("company") ||

        item.toLowerCase().includes("work") ||

        item.toLowerCase().includes("freelance")

    );

    return (

        <div className="resume-section">

            <h2>💼 Experience</h2>

            <div className="summary-info">

                <span>

                    Total Experience : {experience.length}

                </span>

                <span>

                    Resume Score : {atsScore}%

                </span>

            </div>

            {

                experience.map((item, index) => (

                    <div

                        className="card-item"

                        key={index}

                    >

                        <input

                            type="text"

                            placeholder="Company"

                            value={item.company}

                            onChange={(e) =>

                                updateExperience(

                                    index,

                                    "company",

                                    e.target.value

                                )

                            }

                        />

                        <input

                            type="text"

                            placeholder="Role"

                            value={item.role}

                            onChange={(e) =>

                                updateExperience(

                                    index,

                                    "role",

                                    e.target.value

                                )

                            }

                        />

                        <input

                            type="text"

                            placeholder="Duration"

                            value={item.duration}

                            onChange={(e) =>

                                updateExperience(

                                    index,

                                    "duration",

                                    e.target.value

                                )

                            }

                        />

                        <textarea

                            className="resume-textarea"

                            placeholder="Describe your responsibilities and achievements..."

                            value={item.description}

                            onChange={(e) =>

                                updateExperience(

                                    index,

                                    "description",

                                    e.target.value

                                )

                            }

                            rows={4}

                        />

                        <button

                            className="delete-btn"

                            onClick={() => removeExperience(index)}

                        >

                            Remove

                        </button>

                    </div>

                ))

            }

            <button

                className="add-btn"

                onClick={addExperience}

            >

                + Add Experience

            </button>

            <p className="ai-tip">

                💡 Include internships, freelance work, part-time jobs, or real-world projects. Mention measurable achievements whenever possible.

            </p>

            {

                experienceSuggestions.length > 0 && (

                    <div className="section-ai-box">

                        <h3>

                            🤖 AI Recommendation

                        </h3>

                        <ul>

                            {

                                experienceSuggestions.map((item, index) => (

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

                experience.length === 0 && (

                    <div className="warning-box">

                        ⚠ No experience added. Even internships, freelance work or college projects can improve your resume score.

                    </div>

                )

            }

            {

                experience.length > 0 && (

                    <div className="success-box">

                        ✅ Great! Experience is one of the strongest resume score factors.

                    </div>

                )

            }

        </div>

    );

}

export default ExperienceSection;