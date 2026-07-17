import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendSignupOtpEmail } from "@/lib/email";
import { generateOtpCode, getOtpExpiryDate } from "@/lib/otp";
import { isValidEmail, INVALID_EMAIL_MESSAGE } from "@/lib/validation";
import { verifyEmailDeliverable } from "@/lib/emailDeliverability";

export const dynamic = "force-dynamic";

// POST /api/auth/send-otp  { name, email, password }
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: INVALID_EMAIL_MESSAGE },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Make sure we don't send codes to fake/undeliverable addresses.
    const deliverability = await verifyEmailDeliverable(normalizedEmail);
    if (!deliverability.ok) {
      return NextResponse.json({ error: deliverability.reason }, { status: 400 });
    }

    const existing = await query("SELECT id FROM users WHERE email = :email", {
      email: normalizedEmail,
    });
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const otpCode = generateOtpCode();
    const passwordHash = await hashPassword(password);
    const expiresAt = getOtpExpiryDate();

    await query("DELETE FROM signup_otps WHERE email = :email", {
      email: normalizedEmail,
    });

    await query(
      `INSERT INTO signup_otps (email, name, password_hash, otp_code, expires_at)
       VALUES (:email, :name, :passwordHash, :otpCode, :expiresAt)`,
      {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        otpCode,
        expiresAt,
      }
    );

    await sendSignupOtpEmail({
      to: normalizedEmail,
      name: name.trim(),
      otpCode,
    });

    return NextResponse.json({
      message: "Verification code sent to your email",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("POST /api/auth/send-otp error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code", details: error.message },
      { status: 500 }
    );
  }
}
