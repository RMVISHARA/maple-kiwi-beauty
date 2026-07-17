import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword, signToken, sanitizeUser } from "@/lib/auth";
import { isValidEmail, INVALID_EMAIL_MESSAGE } from "@/lib/validation";

export const dynamic = "force-dynamic";

// POST /api/auth/login  { email, password }
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: INVALID_EMAIL_MESSAGE }, { status: 400 });
    }

    const rows = await query("SELECT * FROM users WHERE email = :email", { email: email.trim() });
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = rows[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ user: sanitizeUser(user), token });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Login failed", details: error.message },
      { status: 500 }
    );
  }
}
