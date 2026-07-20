import mysql from "mysql2/promise";

// A single shared connection pool is reused across hot reloads in development.
// In Next.js, modules can be re-evaluated, so we cache the pool on globalThis.
const globalForDb = globalThis;

function createPool() {
  const host = process.env.MYSQL_HOST || "localhost";
  const useSsl = host.includes("tidbcloud.com") || process.env.MYSQL_SSL === "true";

  return mysql.createPool({
    host,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "maple_kiwi_beauty",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
}

export const pool = globalForDb.__mysqlPool ?? createPool();

if (!globalForDb.__mysqlPool) {
  globalForDb.__mysqlPool = pool;
}

/**
 * Run a parameterized query against the pool.
 * @param {string} sql
 * @param {object|Array} [params]
 * @returns {Promise<any>} the result rows
 */
export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Run a set of statements inside a single transaction. The callback receives a
 * dedicated connection; commit/rollback are handled automatically.
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<T>} fn
 * @returns {Promise<T>}
 * @template T
 */
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
