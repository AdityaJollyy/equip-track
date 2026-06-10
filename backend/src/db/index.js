import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

// Setup __dirname workaround for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for secure Supabase connections
  },
});

// Helper function for executing clean, parameterized database queries
const query = (text, params) => pool.query(text, params);

// Connect to Database and execute automated migrations
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`\n⚙️  Supabase PostgreSQL Connected! Host: ${client.host}`);
    client.release();

    // Dynamically locate and read the schema.sql file
    const schemaPath = path.join(__dirname, "../../schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf-8");

    console.log("⚙️  Running database migrations from schema.sql...");
    await query(schemaSQL);
    console.log("✅ Database schema synchronized successfully.");
  } catch (error) {
    console.error(
      "\n❌ Supabase connection or migration FAILED: ",
      error.stack
    );
    process.exit(1);
  }
};

export { pool, query, connectDB };
