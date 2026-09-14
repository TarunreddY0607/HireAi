import "dotenv/config";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function extractText(filePath) {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = "";
    for (let page = 1; page <= pdf.numPages; page++) {
        const currentPage = await pdf.getPage(page);
        const content = await currentPage.getTextContent();
        const pageText = content.items.map(item => item.str).join(" ");
        text += pageText + "\n\n";
    }
    return text.replace(/\r/g, "").replace(/\t/g, " ").replace(/ +/g, " ").trim();
}

async function testWithModel(modelName) {
    console.log(`\n================ Testing ${modelName} ================`);
    const text = await extractText("uploads/1788534244264.pdf");

    const prompt1 = `
You are a Resume Parser. Extract data into JSON:
{
  "name": "",
  "email": "",
  "phone": "",
  "summary": "",
  "skills": [],
  "education": [{"degree":"", "college":"", "year":""}],
  "experience": [{"company":"", "role":"", "description":""}],
  "projects": [{"title":"", "description":""}],
  "certifications": [{"title":""}],
  "github": "",
  "linkedin": ""
}
Resume Text:
${text.substring(0, 5000)}
`;

    try {
        const res1 = await groq.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt1 }],
            response_format: { type: "json_object" },
            max_tokens: 1500
        });
        const extracted = JSON.parse(res1.choices[0].message.content);
        console.log("✅ Step 1 (Extraction) Success! Candidate Name:", extracted.name);

        const prompt2 = `
Analyze candidate resume:
${JSON.stringify(extracted)}

Return JSON:
{
  "atsScore": 75,
  "hireProbability": 60,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingSkills": ["..."],
  "suggestions": ["..."],
  "recommendedRoles": ["..."],
  "recommendedCompanies": ["..."],
  "recommendedCertifications": ["..."],
  "learningRoadmap": ["..."],
  "interviewReadiness": "Good",
  "interviewQuestions": [{"skill":"", "question":"", "idealAnswer":""}]
}
`;
        const res2 = await groq.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: prompt2 }],
            response_format: { type: "json_object" },
            max_tokens: 1500
        });
        const analyzed = JSON.parse(res2.choices[0].message.content);
        console.log("✅ Step 2 (Analysis) Success! ATS Score:", analyzed.atsScore, "| Hire Prob:", analyzed.hireProbability);
    } catch (err) {
        console.error("❌ Error on", modelName, ":", err.message);
    }
}

async function run() {
    await testWithModel("openai/gpt-oss-120b");
    await testWithModel("openai/gpt-oss-20b");
}

run();
