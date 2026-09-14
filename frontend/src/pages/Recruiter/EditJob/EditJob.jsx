import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import RecruiterSidebar from "../../../components/Recruiter/RecruiterSidebar/RecruiterSidebar";
import RecruiterTopbar from "../../../components/Recruiter/RecruiterTopbar/RecruiterTopbar";

import {

    getJobById,

    updateJob

} from "../../../services/jobService";

import "./EditJob.css";

function EditJob(){

    const { id } = useParams();

    const navigate = useNavigate();

    const [formData,setFormData]=useState({

        title:"",

        company:"",

        location:"",

        description:"",

        salary:"",

        experience:"",

        employment_type:"",

        vacancies:"",

        deadline:""

    });

    useEffect(()=>{

        loadJob();

    },[]);

    const loadJob=async()=>{

        try{

            const data=await getJobById(id);

            setFormData({

                title:data.job.title,

                company:data.job.company,

                location:data.job.location,

                description:data.job.description,

                salary:data.job.salary,

                experience:data.job.experience,

                employment_type:data.job.employment_type,

                vacancies:data.job.vacancies,

                deadline:data.job.deadline?.split("T")[0]

            });

        }

        catch(err){

            console.log(err);

        }

    };

    const handleChange=(e)=>{

        setFormData({

            ...formData,

            [e.target.name]:e.target.value

        });

    };

    const handleSubmit=async(e)=>{

        e.preventDefault();

        try{

            await updateJob(id,formData);

            alert("Job Updated Successfully");

            navigate("/recruiter/my-jobs");

        }

        catch(err){

            console.log(err);

            alert("Update Failed");

        }

    };

    return(

        <div className="recruiter-dashboard">

            <RecruiterSidebar/>

            <div className="dashboard-content">

                <RecruiterTopbar/>

                <div className="edit-job-container">

                    <h1>

                        ✏ Edit Job

                    </h1>

                    <form

                        className="edit-job-form"

                        onSubmit={handleSubmit}

                    >

                        <input

                            name="title"

                            value={formData.title}

                            onChange={handleChange}

                            placeholder="Job Title"

                        />

                        <input

                            name="company"

                            value={formData.company}

                            onChange={handleChange}

                            placeholder="Company"

                        />

                        <input

                            name="location"

                            value={formData.location}

                            onChange={handleChange}

                            placeholder="Location"

                        />

                        <textarea

                            name="description"

                            value={formData.description}

                            onChange={handleChange}

                            rows="6"

                        />

                        <input

                            name="salary"

                            value={formData.salary}

                            onChange={handleChange}

                            placeholder="Salary"

                        />

                        <input

                            name="experience"

                            value={formData.experience}

                            onChange={handleChange}

                            placeholder="Experience"

                        />

                        <input

                            name="employment_type"

                            value={formData.employment_type}

                            onChange={handleChange}

                            placeholder="Employment Type"

                        />

                        <input

                            name="vacancies"

                            value={formData.vacancies}

                            onChange={handleChange}

                            placeholder="Vacancies"

                        />

                        <input

                            type="date"

                            name="deadline"

                            value={formData.deadline}

                            onChange={handleChange}

                        />

                        <button>

                            Update Job

                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default EditJob;