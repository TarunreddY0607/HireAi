import "../../pages/ResumeEditor/ResumeEditor.css";

function EducationSection({

    education,

    setEducation,

    aiSuggestions = [],

    atsScore = 0

}) {

    const addEducation = () => {

        setEducation([

            ...education,

            {

                degree: "",

                college: "",

                cgpa: "",

                year: ""

            }

        ]);

    };

    const updateEducation = (index, field, value) => {

        const updated = [...education];

        updated[index][field] = value;

        setEducation(updated);

    };

    const removeEducation = (index) => {

        setEducation(

            education.filter((_, i) => i !== index)

        );

    };

    const educationSuggestions = aiSuggestions.filter(item =>

        item.toLowerCase().includes("education") ||

        item.toLowerCase().includes("college") ||

        item.toLowerCase().includes("degree") ||

        item.toLowerCase().includes("cgpa") ||

        item.toLowerCase().includes("university")

    );

    return (

        <div className="resume-section">

            <h2>🎓 Education</h2>

            <div className="summary-info">

                <span>

                    Total Education : {education.length}

                </span>

                <span>

                    Resume Score : {atsScore}%

                </span>

            </div>

            {

                education.map((item, index) => (

                    <div

                        className="card-item"

                        key={index}

                    >

                        <input

                            type="text"

                            placeholder="Degree"

                            value={item.degree}

                            onChange={(e) =>

                                updateEducation(

                                    index,

                                    "degree",

                                    e.target.value

                                )

                            }

                        />

                        <input

                            type="text"

                            placeholder="College"

                            value={item.college}

                            onChange={(e) =>

                                updateEducation(

                                    index,

                                    "college",

                                    e.target.value

                                )

                            }

                        />

                        <input

                            type="text"

                            placeholder="CGPA"

                            value={item.cgpa}

                            onChange={(e) =>

                                updateEducation(

                                    index,

                                    "cgpa",

                                    e.target.value

                                )

                            }

                        />

                        <input

                            type="text"

                            placeholder="Year"

                            value={item.year}

                            onChange={(e) =>

                                updateEducation(

                                    index,

                                    "year",

                                    e.target.value

                                )

                            }

                        />

                        <button

                            className="delete-btn"

                            onClick={() => removeEducation(index)}

                        >

                            Remove

                        </button>

                    </div>

                ))

            }

            <button

                className="add-btn"

                onClick={addEducation}

            >

                + Add Education

            </button>

            <p className="ai-tip">

                💡 Include your degree, college, CGPA and graduation year for better resume score.

            </p>

            {

                educationSuggestions.length > 0 && (

                    <div className="section-ai-box">

                        <h3>

                            🤖 AI Recommendation

                        </h3>

                        <ul>

                            {

                                educationSuggestions.map((item, index) => (

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

                education.length === 0 && (

                    <div className="warning-box">

                        ⚠ No education details found. This can significantly reduce your resume score.

                    </div>

                )

            }

            {

                education.length > 0 && (

                    <div className="success-box">

                        ✅ Education details added successfully.

                    </div>

                )

            }

        </div>

    );

}

export default EducationSection;