import dns from "node:dns/promises";

// SERVER-ONLY: uses Node's DNS resolver, so never import this into a client
// component. It checks whether an email address can plausibly receive mail
// (its domain resolves to a mail server) and rejects known disposable domains.

// A small blocklist of common throwaway / temporary inbox providers. This is
// intentionally short; the MX check below catches most fake domains anyway.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "sharklasers.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "trashmail.com",
  "yopmail.com",
  "getnada.com",
  "dispostable.com",
  "fakeinbox.com",
  "maildrop.cc",
  "throwawaymail.com",
  "mailnesia.com",
  "mohmal.com",
  "emailondeck.com",
  "spam4.me",
  "grr.la",
]);

export function getEmailDomain(email) {
  if (typeof email !== "string") return "";
  const at = email.lastIndexOf("@");
  if (at === -1) return "";
  return email.slice(at + 1).trim().toLowerCase();
}

export function isDisposableEmailDomain(email) {
  return DISPOSABLE_DOMAINS.has(getEmailDomain(email));
}

/**
 * Verify that an email address is plausibly real and can receive mail.
 * - Rejects disposable/temporary email providers.
 * - Confirms the domain has MX records (or an A/AAAA record as a fallback,
 *   which still allows mail delivery per RFC 5321).
 *
 * Returns { ok: true } or { ok: false, reason } where `reason` is a
 * user-friendly message. Network/DNS failures resolve to ok:true (fail-open)
 * so a flaky resolver never blocks legitimate sign-ups — the OTP email itself
 * is the ultimate proof of deliverability.
 */
export async function verifyEmailDeliverable(email) {
  const domain = getEmailDomain(email);
  if (!domain || domain.indexOf(".") === -1) {
    return { ok: false, reason: "Please enter a valid email address." };
  }

  if (isDisposableEmailDomain(email)) {
    return {
      ok: false,
      reason: "Disposable email addresses aren't allowed. Please use a permanent email address.",
    };
  }

  try {
    const mx = await dns.resolveMx(domain);
    if (Array.isArray(mx) && mx.some((r) => r.exchange)) {
      return { ok: true };
    }
  } catch (err) {
    // ENOTFOUND / ENODATA mean no MX records; fall through to the A-record
    // check. Any other error (timeout, SERVFAIL) is treated as inconclusive.
    if (err?.code !== "ENOTFOUND" && err?.code !== "ENODATA") {
      return { ok: true };
    }
  }

  // No MX records — some domains accept mail on their A/AAAA record instead.
  try {
    await dns.lookup(domain);
    return { ok: true };
  } catch (err) {
    if (err?.code === "ENOTFOUND" || err?.code === "ENODATA") {
      return {
        ok: false,
        reason: "This email domain can't receive mail. Please check the address and try again.",
      };
    }
    // Inconclusive DNS error — don't block the user.
    return { ok: true };
  }
}
