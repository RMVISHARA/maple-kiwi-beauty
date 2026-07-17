// Shared input validation helpers used by both client components and API routes.

// Practical, RFC-5322-inspired email pattern (mirrors the HTML5 `type="email"`
// rules). The local part is built from dot-separated "atoms", so a dot may only
// appear BETWEEN characters — never at the start/end and never doubled
// (rejects ".a@x.com", "a.@x.com", "a..b@x.com"). The domain is one or more
// dot-separated labels ending in a TLD (rejects "a@b" or "a@b.").
const EMAIL_REGEX =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;
  // Belt-and-suspenders guards on top of the regex.
  if (trimmed.includes("..")) return false; // no consecutive dots anywhere
  if (/\s/.test(trimmed)) return false; // no whitespace inside
  if ((trimmed.match(/@/g) || []).length !== 1) return false; // exactly one @
  const [local, domain] = trimmed.split("@");
  if (!local || local.length > 64) return false;
  if (!domain || domain.length > 255) return false;
  return EMAIL_REGEX.test(trimmed);
}

export const INVALID_EMAIL_MESSAGE = "Please enter a valid email address.";

export { EMAIL_REGEX };
