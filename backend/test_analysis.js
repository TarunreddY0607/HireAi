import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { extractResumeData, analyzeResumeData } from "./services/aiService.js";

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

async function testAnalysis() {
    try {
        console.log("1. Extracting PDF text from uploads/1788534244264.pdf...");
        const text = await extractText("uploads/1788534244264.pdf");
        console.log("Extracted text length:", text.length);
        console.log("Text preview:\n", text.substring(0, 300));

        console.log("\n2. Calling extractResumeData...");
        const extracted = await extractResumeData(text);
        console.log("Extracted data:", extracted);

        console.log("\n3. Calling analyzeResumeData...");
        const analyzed = await analyzeResumeData(extracted);
        console.log("Analyzed data:", analyzed);
    } catch (err) {
        console.error("ERROR during analysis:", err);
    }
}

testAnalysis();
