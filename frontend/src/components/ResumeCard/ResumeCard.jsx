import "./ResumeCard.css";

function ResumeCard({ profile }) {

    // ==========================================
    // RESUME NAME
    // ==========================================
    //
    // Take the actual name extracted/stored
    // from the resume first.
    //
    // full_name = name found in resume
    // resume_name = optional resume name
    //
    // ==========================================

    const resumeName =
        profile?.full_name?.trim() ||
        profile?.name?.trim() ||
        profile?.resume_name?.trim() ||
        "Not Available";


    // ==========================================
    // RESUME EMAIL
    // ==========================================

    const resumeEmail =
        profile?.resume_email?.trim() ||
        profile?.email?.trim() ||
        "Not Available";


    // ==========================================
    // RESUME PHONE
    // ==========================================

    const resumePhone =
        profile?.resume_phone?.trim() ||
        profile?.phone?.trim() ||
        "Not Available";


    // ==========================================
    // RESUME FILE
    // ==========================================

    const resumePath =
        profile?.resume_path?.trim() ||
        "Not Uploaded";


    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
        "\n========== RESUME CARD =========="
    );

    console.log(
        "Resume Full Name:",
        profile?.full_name
    );

    console.log(
        "Resume Name:",
        profile?.resume_name
    );

    console.log(
        "Displayed Name:",
        resumeName
    );

    console.log(
        "Resume Email:",
        resumeEmail
    );

    console.log(
        "Resume Phone:",
        resumePhone
    );

    console.log(
        "Resume File:",
        resumePath
    );

    console.log(
        "=================================\n"
    );


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="resume-card">

            <h2>
                Resume Overview
            </h2>


            {/* ==================================
                NAME
            ================================== */}

            <p>

                <strong>
                    Name :
                </strong>

                {" "}

                {resumeName}

            </p>


            {/* ==================================
                EMAIL
            ================================== */}

            <p>

                <strong>
                    Email :
                </strong>

                {" "}

                {resumeEmail}

            </p>


            {/* ==================================
                PHONE
            ================================== */}

            <p>

                <strong>
                    Phone :
                </strong>

                {" "}

                {resumePhone}

            </p>


            {/* ==================================
                RESUME FILE
            ================================== */}

            <p>

                <strong>
                    Resume :
                </strong>

                {" "}

                {resumePath}

            </p>

        </div>

    );

}

export default ResumeCard;