import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { signToken, sanitizeUser } from "@/lib/auth";
import { MAX_ATTEMPTS } from "@/lib/otp";
import { isValidEmail, INVALID_EMAIL_MESSAGE } from "@/lib/validation";

export const dynamic = "force-dynamic";

// POST /api/auth/verify-otp  { email, otp }
export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email?.trim() || !otp?.trim()) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: INVALID_EMAIL_MESSAGE }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpCode = String(otp).trim();

    const rows = await query(
      `SELECT id, name, email, password_hash, otp_code, attempts, expires_at
       FROM signup_otps
       WHERE email = :email
       ORDER BY id DESC
       LIMIT 1`,
      { email: normalizedEmail }
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No pending sign-up found. Please start again." },
        { status: 404 }
      );
    }

    const pending = rows[0];

    if (new Date(pending.expires_at) < new Date()) {
      await query("DELETE FROM signup_otps WHERE id = :id", { id: pending.id });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      await query("DELETE FROM signup_otps WHERE id = :id", { id: pending.id });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    if (pending.otp_code !== otpCode) {
      await query(
        "UPDATE signup_otps SET attempts = attempts + 1 WHERE id = :id",
        { id: pending.id }
      );
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    const existing = await query("SELECT id FROM users WHERE email = :email", {
      email: normalizedEmail,
    });
    if (existing.length > 0) {
      await query("DELETE FROM signup_otps WHERE email = :email", {
        email: normalizedEmail,
      });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const result = await query(
      "INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :passwordHash)",
      {
        name: pending.name,
        email: normalizedEmail,
        passwordHash: pending.password_hash,
      }
    );

    await query("DELETE FROM signup_otps WHERE email = :email", {
      email: normalizedEmail,
    });

    const user = {
      id: result.insertId,
      name: pending.name,
      email: normalizedEmail,
      role: "customer",
    };
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json({ user: sanitizeUser(user), token }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
