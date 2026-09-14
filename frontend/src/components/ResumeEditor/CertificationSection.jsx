import { useState } from "react";
import "../../pages/ResumeEditor/ResumeEditor.css";

function CertificationSection({

    certifications,

    setCertifications,

    aiSuggestions = [],

    atsScore = 0

}) {

    const [newCertification, setNewCertification] = useState("");

    const addCertification = () => {

    if (!newCertification.trim()) return;

    const exists = certifications.some(cert => {

        const value =
            typeof cert === "string"
                ? cert
                : cert.title || "";

        return (
            value.toLowerCase() ===
            newCertification.trim().toLowerCase()
        );

    });

    if (exists) return;

    setCertifications([

        ...certifications,

        {
            title: newCertification.trim()
        }

    ]);

    setNewCertification("");

};

    const removeCertification = (index) => {

        setCertifications(

            certifications.filter((_, i) => i !== index)

        );

    };

    const certificationSuggestions = aiSuggestions.filter(item =>

        item.toLowerCase().includes("certification") ||

        item.toLowerCase().includes("certificate") ||

        item.toLowerCase().includes("aws") ||

        item.toLowerCase().includes("azure") ||

        item.toLowerCase().includes("cloud") ||

        item.toLowerCase().includes("oracle") ||

        item.toLowerCase().includes("java") ||

        item.toLowerCase().includes("nptel")

    );

    return (

        <div className="resume-section">

            <h2>🏆 Certifications</h2>

            <div className="summary-info">

                <span>

                    Total Certifications : {certifications.length}

                </span>

                <span>

                    Resume Score : {atsScore}%

                </span>

            </div>

            <div className="skill-input">

                <input

                    type="text"

                    placeholder="Certification Name"

                    value={newCertification}

                    onChange={(e) =>
                        setNewCertification(e.target.value)
                    }

                    onKeyDown={(e) => {

                        if (e.key === "Enter") {

                            e.preventDefault();

                            addCertification();

                        }

                    }}

                />

                <button onClick={addCertification}>

                    Add

                </button>

            </div>

            <div className="skills-list">

                {

                    certifications.map((item, index) => (

                        <div

                            className="skill-chip"

                            key={index}

                        >

                    🏅 {typeof item === "string" ? item : item.title}

                            <span

                                onClick={() =>
                                    removeCertification(index)
                                }

                            >

                                ✖

                            </span>

                        </div>

                    ))

                }

            </div>

            <p className="ai-tip">

                💡 Add industry-recognized certifications such as AWS, Azure, Oracle, Google Cloud, NPTEL, Coursera or internship certificates.

            </p>

            {

                certificationSuggestions.length > 0 && (

                    <div className="section-ai-box">

                        <h3>

                            🤖 AI Recommendation

                        </h3>

                        <ul>

                            {

                                certificationSuggestions.map((item, index) => (

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

                certifications.length === 0 && (

                    <div className="warning-box">

                        ⚠ Certifications increase recruiter confidence and can improve your resume score.

                    </div>

                )

            }

            {

                certifications.length >= 2 && (

                    <div className="success-box">

                        ✅ Great! Your certifications strengthen your resume and demonstrate continuous learning.

                    </div>

                )

            }

        </div>

    );

}

export default CertificationSection;