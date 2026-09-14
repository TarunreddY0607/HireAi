import { useState } from "react";
import "../../pages/ResumeEditor/ResumeEditor.css";

const PREDEFINED_SKILLS = [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React.js",
    "Vue.js",
    "Angular",
    "Node.js",
    "Express.js",
    "Java",
    "Spring Boot",
    "Python",
    "Django",
    "Flask",
    "C++",
    "C#",
    "Ruby on Rails",
    "PHP",
    "Swift",
    "Kotlin",
    "Go",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Git & GitHub",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Google Cloud",
    "REST APIs",
    "GraphQL",
    "Machine Learning",
    "Data Science",
    "Power BI",
    "Agile/Scrum"
];

function SkillsSection({

    skills,

    setSkills,

    aiSuggestions = [],

    atsScore = 0

}) {

    const [newSkill, setNewSkill] = useState("");

    const addSkill = () => {

        if (!newSkill.trim()) return;

        if (
            skills.some(
                skill =>
                    skill.toLowerCase() === newSkill.trim().toLowerCase()
            )
        ) {
            return;
        }

        setSkills([...skills, newSkill.trim()]);

        setNewSkill("");

    };

    const removeSkill = (index) => {

        setSkills(
            skills.filter((_, i) => i !== index)
        );

    };

    const skillSuggestions = aiSuggestions.filter(item =>
        item.toLowerCase().includes("skill") ||
        item.toLowerCase().includes("java") ||
        item.toLowerCase().includes("spring") ||
        item.toLowerCase().includes("react") ||
        item.toLowerCase().includes("node") ||
        item.toLowerCase().includes("mysql") ||
        item.toLowerCase().includes("docker") ||
        item.toLowerCase().includes("api")
    );

    return (

        <div className="resume-section">

            <h2>💻 Skills</h2>

            <div className="summary-info">

                <span>

                    Total Skills : {skills.length}

                </span>

                <span>

                    Resume Score : {atsScore}%

                </span>

            </div>

            <div className="skill-input">

                <select 
                    value=""
                    onChange={(e) => {
                        const selected = e.target.value;
                        if (!selected) return;
                        if (!skills.some(skill => skill.toLowerCase() === selected.toLowerCase())) {
                            setSkills([...skills, selected]);
                        }
                    }}
                    className="skills-dropdown"
                >
                    <option value="">-- Quick Select Skill --</option>
                    {PREDEFINED_SKILLS.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>

                <input

                    type="text"

                    placeholder="Or type custom skill..."

                    value={newSkill}

                    onChange={(e) => setNewSkill(e.target.value)}

                    onKeyDown={(e) => {

                        if (e.key === "Enter") {

                            e.preventDefault();

                            addSkill();

                        }

                    }}

                />

                <button onClick={addSkill}>

                    Add Skill

                </button>

            </div>

            <div className="skills-list">

                {

                    skills.map((skill, index) => (

                        <div
                            className="skill-chip"
                            key={index}
                        >

                            {skill}

                            <span
                                onClick={() => removeSkill(index)}
                            >
                                ✖
                            </span>

                        </div>

                    ))

                }

            </div>

            <p className="ai-tip">

                💡 Add programming languages, frameworks, databases, cloud tools, version control, APIs and development tools.

            </p>

            {

                skillSuggestions.length > 0 && (

                    <div className="section-ai-box">

                        <h3>

                            🤖 AI Suggested Skills

                        </h3>

                        <ul>

                            {

                                skillSuggestions.map((item, index) => (

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

                skills.length < 6 && (

                    <div className="warning-box">

                        ⚠ Your resume has only {skills.length} skill(s). Adding more relevant technical skills can significantly improve your resume score.

                    </div>

                )

            }

            {

                skills.length >= 6 && (

                    <div className="success-box">

                        ✅ Great! Your resume contains a good number of technical skills.

                    </div>

                )

            }

        </div>

    );

}

export default SkillsSection;