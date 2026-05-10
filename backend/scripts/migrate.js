const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
  const idempotent = sql
    .replace(
      /CREATE TABLE\s+(?!IF NOT EXISTS)/gi,
      "CREATE TABLE IF NOT EXISTS ",
    )
    .replace(
      /CREATE INDEX\s+(?!IF NOT EXISTS)/gi,
      "CREATE INDEX IF NOT EXISTS ",
    );

  try {
    console.log("Running schema migration...");
    await pool.query(idempotent);
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
