import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is missing!");
}
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = "7d";

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract and verify the bearer token from a Next.js request.
 * @param {Request} request
 * @returns {object|null} decoded token payload or null
 */
export function getUserFromRequest(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return verifyToken(token);
}

/**
 * Return the decoded payload only if the request carries a valid admin token.
 * @param {Request} request
 * @returns {object|null}
 */
export function requireAdmin(request) {
  const payload = getUserFromRequest(request);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

/** Public URL for a user's stored avatar (when present). */
export function userAvatarUrl(userId) {
  return `/api/auth/avatar/${userId}`;
}

/** Strip sensitive / binary fields before returning a user to the client. */
export function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash, avatar_data, avatar_mime_type, ...safe } = row;
  return {
    ...safe,
    avatarUrl: avatar_mime_type ? userAvatarUrl(row.id) : null,
  };
}
