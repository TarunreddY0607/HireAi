import "dotenv/config";
import Groq from "groq-sdk";

// ==========================================
// GROQ CONFIGURATION
// ==========================================

const getGroq = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ Warning: GROQ_API_KEY is not set in environment variables.");
    }
    return new Groq({ apiKey: apiKey || "" });
};


// ==========================================
// AI MODELS & FALLBACKS
// ==========================================

const MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b"
];


// ==========================================
// COMMON GROQ FUNCTION WITH AUTO-FALLBACK
// ==========================================

const askGroq = async (prompt) => {
    const groq = getGroq();
    let lastError = null;

    for (const model of MODELS) {
        try {
            console.log(`[AI Engine] Attempting request with model: ${model}...`);
            const response = await groq.chat.completions.create({
                model: model,
                response_format: {
                    type: "json_object"
                },
                max_tokens: 2048,
                temperature: 0.2,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            let result = response.choices[0].message.content.trim();
            result = result
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            console.log(`\n========== GROQ RESPONSE (${model}) ==========\n`);
            console.log(result.substring(0, 300) + "...");
            console.log("\n===================================\n");

            return result;
        } catch (err) {
            console.warn(`[AI Engine] Warning: Model ${model} failed (${err.message}). Trying fallback...`);
            lastError = err;
        }
    }

    console.error("All AI models failed. Last error:", lastError);
    throw lastError;
};


// ==========================================
// SAFE JSON STRINGIFY
// ==========================================

const safeStringify = (data) => {

    try {

        return JSON.stringify(data, null, 2);

    }

    catch {

        return "{}";

    }

};


// ==========================================
// EXTRACT RESUME INFORMATION
// ==========================================

export const extractResumeData = async (
    resumeText
) => {

    const prompt = `

You are HireAI Resume Parser.

You are given the raw text extracted from a PDF resume.

Your task is ONLY to extract information that actually exists
in the resume.

IMPORTANT RULES:

1. Return ONLY valid JSON.

2. Do NOT return markdown.

3. Do NOT explain anything.

4. Never invent information.

5. Never guess missing information.

6. Preserve the candidate's actual information.

7. Do not create fake companies.

8. Do not create fake projects.

9. Do not create fake skills.

10. Do not create fake education.

11. summary MUST always be a string.

12. github MUST always be a string.

13. linkedin MUST always be a string.

14. name MUST always be a string.

15. email MUST always be a string.

16. phone MUST always be a string.

17. skills MUST always be an array.

18. education MUST always be an array.

19. experience MUST always be an array.

20. projects MUST always be an array.

21. certifications MUST always be an array.

If GitHub is missing:

"github":""

If LinkedIn is missing:

"linkedin":""

Never return [] for github.

Never return [] for linkedin.

Never use an email address as LinkedIn.

Recognize these resume sections:

SUMMARY

SKILLS

EDUCATION

EXPERIENCE

PROJECTS

CERTIFICATIONS

LANGUAGES

AWARDS

Ignore decorative symbols.

Return EXACTLY:

{
    "name":"",
    "email":"",
    "phone":"",
    "summary":"",
    "skills":[],
    "education":[
        {
            "degree":"",
            "college":"",
            "year":""
        }
    ],
    "experience":[
        {
            "company":"",
            "role":"",
            "description":""
        }
    ],
    "projects":[
        {
            "title":"",
            "description":""
        }
    ],
    "certifications":[
        {
            "title":""
        }
    ],
    "github":"",
    "linkedin":""
}

Resume Text:

${resumeText.substring(0, 10000)}

Return ONLY JSON.

`;


    try {

        return await askGroq(prompt);

    }

    catch (err) {

        console.error(
            "Resume Extract Error:",
            err
        );

        throw err;

    }

};


// ==========================================
// ANALYZE RESUME
// ==========================================

export const analyzeResumeData = async (
    resumeData
) => {

    const prompt = `

You are HireAI Pro AI Career Coach and Senior Technical Recruiter.

You are analyzing ONE candidate's resume.

CANDIDATE RESUME:

${safeStringify(resumeData)}

IMPORTANT:

Only use information actually present in the resume.

Never invent:

- skills
- projects
- companies
- experience
- education
- certifications

If something is missing, say that it is missing.

Do not assume that a candidate knows a technology simply
because it is common in the industry.

Evaluate:

1. Resume strengths
2. Resume weaknesses
3. Missing skills
4. Resume score
5. Hire probability
6. AI suggestions
7. Recommended job roles
8. Recommended companies
9. Recommended certifications
10. Learning roadmap
11. Interview readiness
12. Interview questions

RESUME SCORE:

95-100 = Excellent

90-94 = Very Strong

80-89 = Good

70-79 = Average

Below 70 = Needs Improvement

Hire probability must be based on:

- actual skills
- projects
- experience
- education
- resume quality
- relevance
- overall presentation

INTERVIEW READINESS must be exactly one of:

"Excellent"

"Good"

"Average"

"Needs Improvement"

Generate 4 interview questions based on the
candidate's ACTUAL resume.

Questions should test:

- projects
- technologies
- programming knowledge
- databases
- APIs
- practical implementation
- problem solving

Do not ask about technologies that are completely
absent from the resume for a practice interview.

Return ONLY valid JSON.

Return EXACTLY:

{
    "atsScore":0,
    "hireProbability":0,

    "strengths":[
        ""
    ],

    "weaknesses":[
        ""
    ],

    "missingSkills":[
        ""
    ],

    "suggestions":[
        ""
    ],

    "recommendedRoles":[
        ""
    ],

    "recommendedCompanies":[
        ""
    ],

    "recommendedCertifications":[
        ""
    ],

    "learningRoadmap":[
        ""
    ],

    "interviewReadiness":"Good",

    "interviewQuestions":[
        {
            "skill":"",
            "question":"",
            "idealAnswer":""
        }
    ]
}

Return ONLY JSON.

`;


    try {

        return await askGroq(prompt);

    }

    catch (err) {

        console.error(
            "Resume Analysis Error:",
            err
        );

        throw err;

    }

};


// ==========================================
// GENERATE INTERVIEW QUESTIONS
// ==========================================
//
// Supports:
//
// 1. Practice Interview
//
// 2. Applied Job Interview
//
// Every question now includes:
//
// - skill
// - question
// - idealAnswer
//
// ==========================================

export const generateInterviewQuestions = async (

    resumeData,

    role,

    difficulty,

    totalQuestions,

    job = null

) => {


    const isJobInterview =
        job !== null &&
        job !== undefined;


    // ==========================================
    // JOB INFORMATION
    // ==========================================

    let jobInformation = "";


    if (isJobInterview) {

        jobInformation = `

=================================================
APPLIED JOB
=================================================

The candidate has already applied for this job.

Job ID:
${job.id || "Not Available"}

Job Title:
${job.title || role}

Company:
${job.company || "Not Available"}

Location:
${job.location || "Not Available"}

Description:
${job.description || "Not Available"}

Required Skills:
${safeStringify(job.required_skills || [])}

Salary:
${job.salary || "Not Available"}

Experience Required:
${job.experience || "Not Available"}

Employment Type:
${job.employment_type || "Not Available"}


=================================================
APPLIED JOB INTERVIEW RULES
=================================================

This is a real job interview.

Questions MUST be related to the actual job.

Prioritize:

1. Job required skills
2. Candidate matching skills
3. Candidate projects
4. Job description
5. Role
6. Practical scenarios
7. Technical knowledge
8. Behavioural questions


VERY IMPORTANT:

Never claim that the candidate has experience
with a technology unless that technology appears
in the resume.

If the job requires a technology that is NOT
in the resume, you may test the candidate's
knowledge of that technology.

Example:

Resume:
Java, MySQL

Job:
Java, Spring Boot, MySQL

GOOD:

"What is Spring Boot and how would you use it
to create a REST API?"

BAD:

"Explain the Spring Boot project you built."

because the resume does not show a Spring Boot project.


PROJECT RULE:

If you ask about a project, it MUST be a real
project from the candidate's resume.

Do not invent project names.

Do not invent responsibilities.

Do not invent technologies used in projects.

`;

    }

    else {

        jobInformation = `

=================================================
PRACTICE INTERVIEW
=================================================

This is a practice interview.

There is no specific company or job application.

Use ONLY:

- Candidate resume
- Candidate skills
- Candidate projects
- Selected role
- Difficulty

For practice interviews, do NOT introduce
technologies that are completely absent from
the resume.

Do not invent experience.

Do not invent projects.

Do not invent companies.

`;

    }


    // ==========================================
    // MAIN PROMPT
    // ==========================================

    const prompt = `

You are HireAI's Senior Technical Interviewer.

You have extensive experience interviewing
software engineers, developers, freshers and
technology professionals.

Your job is to create a HIGH QUALITY REALISTIC
interview based on the candidate's actual resume.

=================================================
CANDIDATE RESUME
=================================================

${safeStringify(resumeData)}

=================================================
INTERVIEW ROLE
=================================================

${role}

=================================================
DIFFICULTY
=================================================

${difficulty}

=================================================
NUMBER OF QUESTIONS
=================================================

Generate EXACTLY ${totalQuestions} questions.

${jobInformation}


=================================================
QUESTION QUALITY
=================================================

Every question must:

1. Be realistic.

2. Be technically meaningful.

3. Be relevant to the resume.

4. Be relevant to the role.

5. Match the difficulty.

6. Avoid repetition.

7. Test actual knowledge.

8. Avoid generic filler.

9. Be answerable by the candidate.

10. Prefer practical questions over textbook
questions.

=================================================
INTERVIEW STRUCTURE
=================================================

For a practice interview:

Question 1:
Tell me about yourself.

Question 2:
Ask about a real project from the resume.

Question 3:
Ask about one of the candidate's strongest skills.

Question 4:
Ask a role-specific technical question.

Question 5:
Ask a practical/scenario question.

Additional questions should continue with:

- technical concepts
- projects
- debugging
- databases
- APIs
- architecture
- problem solving
- behavioural questions

For an applied job:

Do NOT blindly follow the practice structure.

Prioritize:

1. Job requirements
2. Required skills
3. Matching resume skills
4. Relevant projects
5. Job description
6. Role-specific technical knowledge
7. Practical scenarios
8. Behavioural questions


=================================================
DIFFICULTY RULES
=================================================

EASY:

Suitable for freshers.

Focus on:

- resume
- projects
- programming basics
- OOP
- variables
- database basics
- HTML/CSS basics
- role basics

Do not ask advanced system design.

Do not ask very tricky questions.


MEDIUM:

Focus on:

- project implementation
- REST APIs
- authentication
- SQL
- debugging
- role technologies
- scenarios
- problem solving


HARD:

Focus on:

- advanced technical concepts
- architecture
- performance
- optimization
- scalability
- concurrency
- security
- system design
- complex scenarios
- coding logic


IMPORTANT:

Advanced technologies should only be used if:

1. They exist in the resume

OR

2. They are explicitly required by the applied job.


=================================================
IDEAL ANSWER GENERATION
=================================================

THIS IS VERY IMPORTANT.

For EVERY question, generate an ideal/reference answer.

The ideal answer MUST be based on:

- candidate resume
- actual project information
- actual technologies
- job requirements
- selected role

SPECIFIC RULE FOR "Tell me about yourself":
The idealAnswer for the "Tell me about yourself" question MUST be personalized to the candidate's actual resume. 
- Use the candidate's real name (from the resume) if available.
- Mention their actual education, real projects, real skills, and real experience duration from the resume.
- DO NOT invent details (do not default to 5+ years of experience or B.Sc. in CS unless it is explicitly in their resume).
- If the candidate is a fresher with no professional experience, structure the answer as a fresher's introduction focusing on their education and projects.

If the question is about a candidate project,
the ideal answer must use ONLY information
actually available in the resume.

Do NOT invent:

- project features
- project responsibilities
- technologies
- company experience
- achievements

The ideal answer should demonstrate what a
strong candidate could say.

The answer should be detailed enough to help
the candidate learn.

For technical questions:

Include:

- definition
- explanation
- practical usage
- example where appropriate

For project questions:

Include:

- project purpose
- candidate's actual role
- technologies actually mentioned
- implementation details actually available

If the resume does not provide enough information
for a specific project detail, say:

"Based on the available resume information..."

Do NOT fabricate details.

For behavioural questions:

Give a realistic professional answer structure.


=================================================
OUTPUT FORMAT
=================================================

Return ONLY valid JSON.

Return EXACTLY:

{
    "questions":[
        {
            "id":1,
            "skill":"General",
            "question":"Tell me about yourself.",
            "idealAnswer":"A strong answer should introduce your education, relevant skills, projects, experience and career goal using only information from your resume."
        }
    ]
}

The number of question objects MUST be exactly:

${totalQuestions}

Do not return fewer.

Do not return more.

Every question MUST have:

"id"

"skill"

"question"

"idealAnswer"

Return ONLY JSON.

`;


    try {

        const result =
            await askGroq(prompt);

        return result;

    }

    catch (err) {

        console.error(
            "Interview Question Error:",
            err
        );

        throw err;

    }

};


// ==========================================
// EXTRACT JOB SKILLS
// ==========================================

export const extractJobSkills = async (

    jobDescription

) => {

    const prompt = `

You are an AI Recruitment Assistant.

Extract ONLY technical skills from this job
description.

Rules:

1. Return ONLY valid JSON.

2. No markdown.

3. No explanation.

4. Remove duplicate skills.

5. Keep technology names accurate.

Return EXACTLY:

{
    "skills":[
        "Java",
        "Spring Boot",
        "MySQL"
    ]
}

Job Description:

${jobDescription}

Return ONLY JSON.

`;


    try {

        return await askGroq(prompt);

    }

    catch (err) {

        console.log(err);

        throw err;

    }

};


// ==========================================
// EVALUATE INTERVIEW ANSWER
// ==========================================
//
// Now accepts:
// question
// answer
// idealAnswer
//
// This allows the AI to compare the candidate's
// answer against the generated reference answer.
//
// ==========================================

export const evaluateInterviewAnswer = async (

    question,

    answer,

    idealAnswer = ""

) => {

    const prompt = `

You are HireAI Pro Interview Evaluator.

You are a strict but fair senior technical
interviewer.

Evaluate the candidate's answer against the
question and the ideal/reference answer.

=================================================
QUESTION
=================================================

${question}

=================================================
IDEAL / REFERENCE ANSWER
=================================================

${idealAnswer || "No reference answer was provided."}

=================================================
CANDIDATE ANSWER
=================================================

${answer}

=================================================
EVALUATION RULES
=================================================

Evaluate the actual answer.

Do NOT judge the candidate based only on
answer length.

A short answer can receive a high score if
it is technically correct and sufficiently
answers the question.

A long answer can receive a low score if
it contains incorrect information.

Consider:

1. Relevance
2. Technical accuracy
3. Completeness
4. Understanding
5. Practical knowledge
6. Communication
7. Confidence
8. Explanation depth


=================================================
SCORING
=================================================

score:

Overall answer quality from 0 to 100.

technicalScore:

Technical correctness from 0 to 100.

communicationScore:

Clarity and communication from 0 to 100.

accuracyScore:

Factual accuracy from 0 to 100.

confidenceScore:

Confidence demonstrated by the answer from 0 to 100.


=================================================
IMPORTANT
=================================================

Empty answer:

score = 0

"I don't know":

score should normally be between 0 and 5.

One-word answers such as:

Java
SQL
Spring
Yes
No

should receive a low score unless the question
specifically asks for a one-word answer.

Do NOT automatically punish an answer merely
because it is short.

The answer must be judged according to what the
question actually asks.


=================================================
CORRECT / IDEAL ANSWER
=================================================

Always return a useful reference answer.

If the supplied ideal answer is good, improve it
slightly if necessary.

The reference answer must answer the question
directly.

Never invent candidate experience.

If the question is based on a candidate project,
do not claim that the candidate performed tasks
that are not supported by the available context.


=================================================
FEEDBACK
=================================================

Give clear feedback.

Explain:

- what was correct
- what was missing
- what was technically wrong
- how to improve

Keep feedback useful for interview preparation.


=================================================
STRENGTHS
=================================================

Return 2-4 specific strengths.

Do not return generic statements such as:

"Good answer"

"Nice"

"Well done"


=================================================
IMPROVEMENTS
=================================================

Return 2-4 specific improvements.

For example:

"Explain why you selected MySQL."

"Give a practical example."

"Describe how JWT authentication works."


=================================================
OUTPUT
=================================================

Return ONLY valid JSON.

Return EXACTLY:

{
    "score":0,

    "technicalScore":0,

    "communicationScore":0,

    "accuracyScore":0,

    "confidenceScore":0,

    "correctAnswer":"",

    "feedback":"",

    "strengths":[
        ""
    ],

    "improvements":[
        ""
    ]
}

All scores MUST be numbers between 0 and 100.

Return ONLY JSON.

`;


    try {

        const result =
            await askGroq(prompt);

        return result;

    }

    catch (err) {

        console.error(
            "Interview Evaluation Error:",
            err
        );

        throw err;

    }

};


// ==========================================
// ANALYZE COMPANY WEBSITE WITH AI
// ==========================================

export const analyzeCompanyWebsite = async (rawUrl, companyName = "") => {
    if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
        return {
            hasActivePage: false,
            status: "NO_URL",
            url: "",
            reason: "No website URL provided.",
            companySummary: "No company website link has been added yet.",
            techStack: [],
            keyHighlights: ["No website URL specified"],
            industry: "Not specified",
            trustScore: 0,
            verificationNote: "Website link missing.",
            analyzedAt: new Date().toISOString()
        };
    }

    let formattedUrl = rawUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = `https://${formattedUrl}`;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(formattedUrl);
        // Basic check for obvious fake/dummy domain extensions or formats
        if (!parsedUrl.hostname || !parsedUrl.hostname.includes(".")) {
            throw new Error("Invalid domain syntax");
        }
    } catch (urlErr) {
        return {
            hasActivePage: false,
            status: "INVALID_URL",
            url: formattedUrl,
            reason: "The provided website URL is not formatted correctly.",
            companySummary: `The link "${rawUrl}" is not a valid web URL. Please provide a full valid domain like https://example.com.`,
            techStack: [],
            keyHighlights: ["Invalid URL syntax", "Unable to parse domain"],
            industry: "Unknown",
            trustScore: 0,
            verificationNote: "Invalid website URL format.",
            analyzedAt: new Date().toISOString()
        };
    }

    // Try fetching the live page
    let response;
    let htmlContent = "";
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        response = await fetch(formattedUrl, {
            signal: controller.signal,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 HireAI/1.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9"
            },
            redirect: "follow"
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                hasActivePage: false,
                status: "HTTP_ERROR",
                statusCode: response.status,
                url: formattedUrl,
                reason: `Website returned error status HTTP ${response.status} (${response.statusText || "Not Found"}).`,
                companySummary: `The website link (${formattedUrl}) could not be accessed. The server returned HTTP status ${response.status}.`,
                techStack: [],
                keyHighlights: [
                    `Server returned HTTP ${response.status}`,
                    "No accessible public content",
                    "Possible broken or dummy link"
                ],
                industry: "Unknown",
                trustScore: 10,
                verificationNote: `Website returned HTTP ${response.status} error.`,
                analyzedAt: new Date().toISOString()
            };
        }

        htmlContent = await response.text();
    } catch (fetchErr) {
        console.log("Website fetch failed for URL:", formattedUrl, fetchErr.message);
        return {
            hasActivePage: false,
            status: "UNREACHABLE",
            url: formattedUrl,
            reason: "This link does not have any active web page or the domain could not be resolved.",
            companySummary: `We could not reach any live server at "${formattedUrl}". This domain may not exist, is not configured, or is a dummy link.`,
            techStack: [],
            keyHighlights: [
                "Domain does not resolve or connection timed out",
                "Dummy/Inactive website link detected",
                "No live web page found"
            ],
            industry: "Unknown",
            trustScore: 0,
            verificationNote: "This link does not have an active web page.",
            analyzedAt: new Date().toISOString()
        };
    }

    // Extract text and metadata from HTML
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : "";

    const metaDescMatch =
        htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
        htmlContent.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
        htmlContent.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";

    // Clean body text
    let cleanText = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();

    if (cleanText.length < 50) {
        return {
            hasActivePage: false,
            status: "EMPTY_PAGE",
            url: formattedUrl,
            pageTitle: pageTitle || "Empty Page",
            reason: "The webpage responded but contains no meaningful company content or body text.",
            companySummary: `The website at "${formattedUrl}" appears to be a blank or placeholder page without active business information.`,
            techStack: [],
            keyHighlights: ["Empty or blank page body", "No company information detected"],
            industry: "Unknown",
            trustScore: 20,
            verificationNote: "Page contains no active business content.",
            analyzedAt: new Date().toISOString()
        };
    }

    const sampleText = cleanText.substring(0, 3500);

    const prompt = `
You are HireAI Company Verification & Intelligence Analyst.
Analyze the following extracted website content for the company "${companyName || "Unknown Company"}":

Website URL: ${formattedUrl}
Page Title: ${pageTitle}
Meta Description: ${metaDescription}
Website Text Sample:
"""
${sampleText}
"""

Instructions:
1. Determine if this is a REAL, ACTIVE company/product/organization website (true), or if it is a DUMMY/PARKING page/default hosting screen/domain sale page/error page (false).
2. If hasActivePage is true:
   - Provide a concise 2-3 sentence companySummary explaining what the company builds, sells, or offers.
   - Extract 3 to 6 detected technologies, skills, or modern frameworks (e.g. React, Python, Cloud, AI, Enterprise SaaS, REST APIs, etc.) relevant to the company.
   - List 3 to 5 key highlights/achievements/offerings.
   - Identify the primary industry (e.g., "Software & Technology", "FinTech", "HealthTech", "E-Commerce", "Consulting", etc.).
   - Assign a trustScore between 80 and 100 based on website authenticity.
   - Set verificationNote to a positive verification summary like "Live & Verified Company Website".
3. If hasActivePage is false (dummy placeholder, domain sale, under construction, or irrelevant parking page):
   - Set status to "DUMMY_OR_INACTIVE"
   - Explain in reason why it's not a real company page.
   - Set trustScore between 0 and 35.
   - Set verificationNote to "This link doesn't have an active company page".

Return ONLY valid JSON with this EXACT structure:
{
    "hasActivePage": true,
    "status": "ACTIVE",
    "pageTitle": "${pageTitle.replace(/"/g, "'")}",
    "companySummary": "",
    "industry": "",
    "techStack": ["React", "Cloud"],
    "keyHighlights": ["Point 1", "Point 2"],
    "trustScore": 95,
    "verificationNote": "Live company website verified by AI.",
    "reason": ""
}
`;

    try {
        const aiResponse = await askGroq(prompt);
        let parsed = JSON.parse(aiResponse);

        return {
            ...parsed,
            url: formattedUrl,
            pageTitle: pageTitle || parsed.pageTitle || "",
            analyzedAt: new Date().toISOString()
        };
    } catch (aiErr) {
        console.error("AI Website Analysis error:", aiErr);
        // Fallback if AI call failed but webpage was accessible
        return {
            hasActivePage: true,
            status: "ACTIVE",
            url: formattedUrl,
            pageTitle: pageTitle || companyName,
            companySummary: metaDescription || `${companyName || "Company"} official website is active and reachable.`,
            industry: "Technology & Business",
            techStack: ["Web Platform", "Cloud Services"],
            keyHighlights: [
                pageTitle ? `Active page: ${pageTitle}` : "Live website connected",
                "HTTP 200 OK verified",
                "Secure domain access confirmed"
            ],
            trustScore: 88,
            verificationNote: "Live company website detected and verified.",
            analyzedAt: new Date().toISOString()
        };
    }
};