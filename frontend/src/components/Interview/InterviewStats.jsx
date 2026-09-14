import "./InterviewStats.css";

function InterviewStats({

    faceDetected,

    lookingForward,

    confidence,

    eyeContact,

    smile

}) {

    return (

        <div className="interview-stats">

            <h2>Interview Analytics</h2>

            <div className="stat">

                <span>Face</span>

                <strong>

                    {faceDetected ? "🟢 Detected" : "🔴 Missing"}

                </strong>

            </div>

            <div className="stat">

                <span>Eye Contact</span>

                <strong>

                    {eyeContact}%

                </strong>

            </div>

            <div className="stat">

                <span>Confidence</span>

                <strong>

                    {confidence}%

                </strong>

            </div>

            <div className="stat">

                <span>Looking</span>

                <strong>

                    {

                        lookingForward

                        ?

                        "👀 Forward"

                        :

                        "↙ Away"

                    }

                </strong>

            </div>

            <div className="stat">

                <span>Smile</span>

                <strong>

                    {

                        smile

                        ?

                        "😊 Yes"

                        :

                        "😐 No"

                    }

                </strong>

            </div>

        </div>

    );

}

export default InterviewStats;