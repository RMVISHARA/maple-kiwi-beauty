import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/auth/register — direct registration is disabled; OTP verification is required.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Email verification is required. Use /api/auth/send-otp then /api/auth/verify-otp to create an account.",
    },
    { status: 400 }
  );
}
