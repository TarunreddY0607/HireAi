import "./AIAvatar.css";

function AIAvatar({

    speaking,

    recruiter = "Sophia"

}) {

    return (

        <div className="avatar-wrapper">

            <div
                className={
                    speaking
                        ? "avatar-circle speaking"
                        : "avatar-circle"
                }
            >

                👩🏻‍💼

            </div>

            <h2>

                {recruiter}

            </h2>

            <p>

                AI Recruiter

            </p>

        </div>

    );

}

export default AIAvatar;