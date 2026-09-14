import db from "../config/db.js";

// ==========================================
// Save Interview History
// ==========================================

export const saveInterviewHistory = (req, res) => {

    const userId = req.user.userId;

    const {

        role,

        difficulty,

        totalQuestions,

        overallScore,

        technicalScore,

        communicationScore,

        confidenceScore,

        recommendation,

        feedback,

        strengths,

        improvements

    } = req.body;

    const sql = `

        INSERT INTO interview_history(

            user_id,

            role,

            difficulty,

            total_questions,

            overall_score,

            technical_score,

            communication_score,

            confidence_score,

            recommendation,

            feedback,

            strengths,

            improvements

        )

        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)

    `;

    db.query(

        sql,

        [

            userId,

            role,

            difficulty,

            totalQuestions,

            overallScore,

            technicalScore,

            communicationScore,

            confidenceScore,

            recommendation,

            feedback,

            JSON.stringify(strengths || []),

            JSON.stringify(improvements || [])

        ],

        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success:false,

                    message:"Database Error"

                });

            }

            return res.status(201).json({

                success:true,

                message:"Interview Saved Successfully"

            });

        }

    );

};

// ==========================================
// Get Interview History
// ==========================================

export const getInterviewHistory = (req,res)=>{

    const userId=req.user.userId;

    const sql=`

        SELECT *

        FROM interview_history

        WHERE user_id=?

        ORDER BY created_at DESC

    `;

    db.query(sql,[userId],(err,result)=>{

        if(err){

            console.log(err);

            return res.status(500).json({

                success:false,

                message:"Database Error"

            });

        }

        return res.json({

            success:true,

            history:result

        });

    });

};

// ==========================================
// Get Single Interview
// ==========================================

export const getInterviewById=(req,res)=>{

    const id=req.params.id;

    const sql=`

        SELECT *

        FROM interview_history

        WHERE id=?

    `;

    db.query(sql,[id],(err,result)=>{

        if(err){

            console.log(err);

            return res.status(500).json({

                success:false,

                message:"Database Error"

            });

        }

        if(result.length===0){

            return res.status(404).json({

                success:false,

                message:"Interview Not Found"

            });

        }

        const interview=result[0];

        interview.strengths=JSON.parse(interview.strengths||"[]");

        interview.improvements=JSON.parse(interview.improvements||"[]");

        return res.json({

            success:true,

            interview

        });

    });

};

// ==========================================
// Delete Interview
// ==========================================

export const deleteInterview=(req,res)=>{

    const id=req.params.id;

    const sql=`

        DELETE

        FROM interview_history

        WHERE id=?

    `;

    db.query(sql,[id],(err)=>{

        if(err){

            console.log(err);

            return res.status(500).json({

                success:false,

                message:"Database Error"

            });

        }

        return res.json({

            success:true,

            message:"Interview Deleted"

        });

    });

};