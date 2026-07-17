import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserFromRequest, sanitizeUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/auth/me  -> returns the current user for a valid Bearer token
export async function GET(request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await query(
      "SELECT id, name, email, role, created_at, avatar_mime_type FROM users WHERE id = :id",
      { id: payload.id }
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: sanitizeUser(rows[0]) });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to load user", details: error.message },
      { status: 500 }
    );
  }
}
