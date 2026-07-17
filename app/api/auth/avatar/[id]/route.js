import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/auth/avatar/:id — serve a user's profile photo
export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const rows = await query(
      "SELECT avatar_data, avatar_mime_type FROM users WHERE id = :id",
      { id: Number(id) }
    );
    const row = rows[0];
    if (!row?.avatar_data) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    return new NextResponse(row.avatar_data, {
      status: 200,
      headers: {
        "Content-Type": row.avatar_mime_type || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/auth/avatar/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar", details: error.message },
      { status: 500 }
    );
  }
}
