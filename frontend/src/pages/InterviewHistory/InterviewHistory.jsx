import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";

import { getInterviewHistory } from "../../services/interviewHistoryService";

import "./InterviewHistory.css";

function InterviewHistory() {
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadHistory();

    }, []);

    const loadHistory = async () => {

        try {

            const data = await getInterviewHistory();

            setHistory(data.history);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="dashboard">

            <Sidebar />

            <div className="main-content">

                <Topbar />

                <div className="history-page">

                    <h1>

                        📜 Interview History

                    </h1>

                    {

                        loading ?

                        (

                            <h2>

                                Loading...

                            </h2>

                        )

                        :

                        history.length === 0 ?

                        (

                            <h2>

                                No Interviews Found

                            </h2>

                        )

                        :

                        (

                            history.map((item,index)=>(

                                <div

                                    key={index}

                                    className="history-card"

                                >

                                    <div>

                                        <h2>

                                            {item.role}

                                        </h2>

                                        <p>

                                            Difficulty : {item.difficulty}

                                        </p>

                                        <p>

                                            Score : {item.overall_score}/100

                                        </p>

                                        <p>

                                            {

                                                new Date(

                                                    item.created_at

                                                ).toLocaleDateString()

                                            }

                                        </p>

                                    </div>

                                    <button

    onClick={() =>

        navigate(

            "/interview-report",

            {

                state: {

                    feedback: {

                        score: item.overall_score,

                        feedback: item.feedback,

                       strengths: Array.isArray(item.strengths)
    ? item.strengths
    : [item.strengths],

improvements: Array.isArray(item.improvements)
    ? item.improvements
    : [item.improvements]
                    }

                }

            }

        )

    }

>

    View Report

</button>

                                </div>

                            ))

                        )

                    }

                </div>

            </div>

        </div>

    );

}

export default InterviewHistory;