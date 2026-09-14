import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import RecruiterSidebar from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";
import RecruiterTopbar from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";

import { getJobById } from "../../../services/jobService";

import "./ViewJob.css";

function ViewJob() {

    const { id } = useParams();

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadJob();

    }, []);

    const loadJob = async () => {

        try {

            const data = await getJobById(id);

            setJob(data.job);

        }

        catch(err){

            console.log(err);

        }

        finally{

            setLoading(false);

        }

    };

    if(loading){

        return <h2>Loading...</h2>;

    }

    return(

        <div className="recruiter-dashboard">

            <RecruiterSidebar />

            <div className="dashboard-content">

                <RecruiterTopbar />

                <div className="view-job-container">

                    <h1>

                        👁 Job Details

                    </h1>

                    <div className="view-card">

                        <h2>

                            {job.title}

                        </h2>

                        <p>

                            <strong>Company :</strong> {job.company}

                        </p>

                        <p>

                            <strong>Location :</strong> {job.location}

                        </p>

                        <p>

                            <strong>Salary :</strong> {job.salary}

                        </p>

                        <p>

                            <strong>Experience :</strong> {job.experience}

                        </p>

                        <p>

                            <strong>Employment :</strong> {job.employment_type}

                        </p>

                        <p>

                            <strong>Vacancies :</strong> {job.vacancies}

                        </p>

                        <p>

                            <strong>Deadline :</strong> {job.deadline?.split("T")[0]}

                        </p>

                        <h3>

                            Description

                        </h3>

                        <p>

                            {job.description}

                        </p>

                        <h3>

                            Required Skills

                        </h3>

                        <div className="skills">

                            {

                                job.required_skills.map((skill,index)=>(

                                    <span key={index}>

                                        {skill}

                                    </span>

                                ))

                            }

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ViewJob;