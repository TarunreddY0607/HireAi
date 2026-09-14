import "./AIAvatar.css";

function AIAvatar({ speaking }) {

    return (

        <div className="avatar-container">

            <div className={

                speaking

                ?

                "avatar speaking"

                :

                "avatar"

            }>

                👩

            </div>

            <h3>

                Sophia

            </h3>

            <p>

                AI Recruiter

            </p>

        </div>

    );

}

export default AIAvatar;