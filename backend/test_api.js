import jwt from "jsonwebtoken";

async function testApiCall() {
    const token = jwt.sign(
        { userId: 26, role: "job_seeker" },
        "hireai_super_secret_key",
        { expiresIn: "1d" }
    );

    console.log("Calling /api/ai/analyze/23 with token...");
    try {
        const res = await fetch("http://localhost:5000/api/ai/analyze/23", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response data:", data);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testApiCall();
