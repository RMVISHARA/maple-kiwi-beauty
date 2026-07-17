#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mysql = require("mysql2/promise");
const { runMigrations } = require("./migrate-db");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    env[key] = value.replace(/^["']|["']$/g, "");
  }

  return env;
}

function ask(question, defaultValue = "n") {
  if (process.env.SKIP_DB_PROMPT === "true" || !process.stdin.isTTY) {
    console.log(`${question} [Non-interactive mode: Defaulting to "${defaultValue}"]`);
    return Promise.resolve(defaultValue);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function isYes(answer) {
  const normalized = String(answer || "")
    .trim()
    .toLowerCase();
  return normalized === "y" || normalized === "yes";
}

async function importSchemaIfAccepted(conn, database, skipPrompt = false) {
  const schemaPath = path.resolve(process.cwd(), "db", "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.warn(`[ensure-db] Schema file not found at "${schemaPath}".`);
    return;
  }

  if (!skipPrompt) {
    const importAnswer = await ask(
      `[ensure-db] Import schema from "db/schema.sql" into "${database}" now? (y/n): `
    );
    if (!isYes(importAnswer)) {
      console.log("[ensure-db] Schema import skipped.");
      return;
    }
  }

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  if (!schemaSql.trim()) {
    console.warn("[ensure-db] Schema file is empty, nothing to import.");
    return;
  }

  await conn.query(schemaSql);
  console.log(`[ensure-db] Imported schema into "${database}".`);
}

async function main() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const fileEnv = parseEnvFile(envPath);

  const host = process.env.MYSQL_HOST || fileEnv.MYSQL_HOST || "localhost";
  const port = Number(process.env.MYSQL_PORT || fileEnv.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || fileEnv.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || fileEnv.MYSQL_PASSWORD || "";
  const database =
    process.env.MYSQL_DATABASE || fileEnv.MYSQL_DATABASE || "maple_kiwi_beauty";

  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
  } catch (error) {
    console.warn(
      `[ensure-db] Skipping DB existence check: could not connect to MySQL (${error.message})`
    );
    return;
  }

  try {
    const [rows] = await conn.execute(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
      [database]
    );

    let databaseExists = rows.length > 0;
    if (rows.length > 0) {
      console.log(`[ensure-db] Database "${database}" already exists.`);
    } else {
      const answer = await ask(
        `[ensure-db] Database "${database}" does not exist. Create it now? (y/n): `
      );

      if (isYes(answer)) {
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        console.log(`[ensure-db] Created database "${database}".`);
        databaseExists = true;
      } else {
        console.log(`[ensure-db] Database "${database}" was not created.`);
        return;
      }
    }

    if (!databaseExists) return;

    const [productTableRows] = await conn.execute(
      `SELECT TABLE_NAME
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'`,
      [database]
    );

    if (productTableRows.length === 0) {
      await importSchemaIfAccepted(conn, database);
      return;
    }

    // Auto-apply any new files in db/migrations/ (no prompt).
    await conn.query(`USE \`${database}\``);
    await runMigrations(conn, { silent: false });

    const reimportAnswer = await ask(
      `[ensure-db] Tables already exist. Re-import full schema from "db/schema.sql"? (y/n): `
    );
    if (isYes(reimportAnswer)) {
      console.warn(
        "[ensure-db] Warning: re-import resets seed products 1–5. For schema updates, prefer adding a file under db/migrations/ and running npm run db:migrate."
      );
      await importSchemaIfAccepted(conn, database, true);
    }
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error(`[ensure-db] ${error.message}`);
  process.exitCode = 1;
});
