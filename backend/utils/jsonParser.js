export function robustJSONParse(text) {
    if (!text) {
        throw new Error("Empty input text");
    }

    // 1. Strip think tags (reasoning thoughts)
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // 2. Strip markdown blocks
    cleaned = cleaned
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    // 3. Find the first '{' and the last '}'
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
        throw new Error("No JSON object structure found in response");
    }

    const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);

    try {
        return JSON.parse(jsonCandidate);
    } catch (e) {
        console.log("Standard JSON.parse failed. Attempting dirty cleaning...");
        
        // Clean trailing commas in objects and arrays
        let dirtyCleaned = jsonCandidate
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]");

        return JSON.parse(dirtyCleaned);
    }
}
