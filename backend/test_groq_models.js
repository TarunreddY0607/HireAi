import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testAvailable() {
    const candidates = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "qwen/qwen3.6-27b",
        "groq/compound-mini"
    ];

    for (const m of candidates) {
        try {
            console.log(`\nTesting ${m}...`);
            const start = Date.now();
            const res = await groq.chat.completions.create({
                model: m,
                messages: [{ role: "user", content: "Extract in JSON format: {\"name\": \"John Doe\", \"skills\": [\"JavaScript\", \"React\"]}" }],
                response_format: { type: "json_object" },
                max_tokens: 1000
            });
            console.log(`✅ ${m} Success (${Date.now() - start}ms):`, res.choices[0].message.content.substring(0, 100));
        } catch (err) {
            console.error(`❌ ${m} Error:`, err.message);
        }
    }
}

testAvailable();
