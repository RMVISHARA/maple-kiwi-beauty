import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export function generateOtpCode() {
  const max = 10 ** OTP_LENGTH;
  const value = crypto.randomInt(0, max);
  return String(value).padStart(OTP_LENGTH, "0");
}

export function getOtpExpiryDate() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

export { OTP_LENGTH, OTP_TTL_MINUTES, MAX_ATTEMPTS };
