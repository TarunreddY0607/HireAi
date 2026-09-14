import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "mysql",
        database: process.env.DB_NAME || "hire_ai"
    });

    try {
        const [rows] = await connection.execute("SELECT is_analyzed FROM job_seekers WHERE user_id = 16");
        console.log("is_analyzed status:", rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

run();
