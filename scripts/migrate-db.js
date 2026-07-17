#!/usr/bin/env node
/**
 * Runs pending SQL files from db/migrations/ in filename order.
 * Tracks applied migrations in the _schema_migrations table.
 *
 * Usage: npm run db:migrate
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const MIGRATIONS_DIR = path.resolve(process.cwd(), "db", "migrations");

// MySQL codes for "already exists" — safe to ignore when re-applying.
const IGNORABLE_ERRORS = new Set([
  1050, // ER_TABLE_EXISTS_ERROR
  1060, // ER_DUP_FIELDNAME
  1061, // ER_DUP_KEYNAME
]);

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
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

function getDbConfig() {
  const fileEnv = parseEnvFile(path.resolve(process.cwd(), ".env.local"));
  return {
    host: process.env.MYSQL_HOST || fileEnv.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || fileEnv.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || fileEnv.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || fileEnv.MYSQL_PASSWORD || "",
    database:
      process.env.MYSQL_DATABASE || fileEnv.MYSQL_DATABASE || "maple_kiwi_beauty",
  };
}

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(conn) {
  const [rows] = await conn.execute("SELECT id FROM _schema_migrations");
  return new Set(rows.map((r) => r.id));
}

function stripSqlComments(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();
}

async function runSqlFile(conn, sql) {
  // Split on semicolons at end of line (simple but works for our migration files).
  const statements = sql
    .split(/;\s*[\r\n]+/)
    .map((s) => stripSqlComments(s.trim()))
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await conn.query(statement);
    } catch (error) {
      if (IGNORABLE_ERRORS.has(error.errno)) continue;
      throw error;
    }
  }
}

/**
 * @param {import('mysql2/promise').Connection} [existingConn]
 * @param {{ silent?: boolean }} [options]
 */
async function runMigrations(existingConn, options = {}) {
  const { silent = false } = options;
  const log = (msg) => {
    if (!silent) console.log(msg);
  };

  const config = getDbConfig();
  const conn =
    existingConn ||
    (await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      multipleStatements: true,
    }));

  const ownsConnection = !existingConn;

  try {
    await ensureMigrationsTable(conn);
    const applied = await getAppliedMigrations(conn);
    const files = listMigrationFiles();

    if (files.length === 0) {
      log("[migrate-db] No migration files in db/migrations/.");
      return { applied: [], skipped: [] };
    }

    const newlyApplied = [];
    const skipped = [];

    for (const file of files) {
      const id = file.replace(/\.sql$/i, "");
      if (applied.has(id)) {
        skipped.push(id);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, "utf8");
      if (!sql.trim()) {
        log(`[migrate-db] Skipping empty migration "${file}".`);
        continue;
      }

      log(`[migrate-db] Applying ${file}…`);
      await runSqlFile(conn, sql);
      await conn.execute("INSERT INTO _schema_migrations (id) VALUES (?)", [id]);
      newlyApplied.push(id);
      log(`[migrate-db] Applied ${file}.`);
    }

    if (newlyApplied.length === 0 && !silent) {
      log("[migrate-db] Database is up to date.");
    }

    return { applied: newlyApplied, skipped };
  } finally {
    if (ownsConnection) await conn.end();
  }
}

if (require.main === module) {
  runMigrations()
    .catch((error) => {
      console.error(`[migrate-db] ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = { runMigrations, getDbConfig };
