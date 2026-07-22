import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, verifyPassword, signToken, sanitizeUser } from "@/lib/auth";
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

    const normalizedEmail = email.trim().toLowerCase();

    // Auto-seed primary admin account if attempting login and account doesn't exist in DB yet
    if (normalizedEmail === "admin@maplekiwibeauty.lk" && password === "admin@123") {
      try {
        const existingAdmin = await query("SELECT id FROM users WHERE email = :email", { email: normalizedEmail });
        if (existingAdmin.length === 0) {
          const passwordHash = await hashPassword("admin@123");
          await query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', :email, :passwordHash, 'admin')",
            { email: normalizedEmail, passwordHash }
          );
        }
      } catch (seedErr) {
        console.error("Failed auto-seeding admin account:", seedErr);
      }
    }

    const rows = await query("SELECT * FROM users WHERE email = :email", { email: normalizedEmail });
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
