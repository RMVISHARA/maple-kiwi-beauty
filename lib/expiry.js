// Shared (client + server safe) helpers for product expiry logic.
// Expiry dates are admin-only and used to monitor stock freshness and to flag
// products that should be discounted to clear before they expire.

// A product is considered "near expiry" when it expires within this many days.
export const NEAR_EXPIRY_DAYS = 90;

export const EXPIRY_STATUS = {
  EXPIRED: "expired",
  NEAR: "near",
  OK: "ok",
  NONE: "none",
};

/**
 * Classify a product's expiry date relative to today.
 * @param {string|Date|null} expiryDate  ISO date string ("YYYY-MM-DD") or Date
 * @param {{ nearDays?: number }} [options]
 * @returns {{ status: "expired"|"near"|"ok"|"none", daysLeft: number|null }}
 */
export function getExpiryStatus(expiryDate, { nearDays = NEAR_EXPIRY_DAYS } = {}) {
  if (!expiryDate) return { status: EXPIRY_STATUS.NONE, daysLeft: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = expiryDate instanceof Date ? new Date(expiryDate) : new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(exp.getTime())) return { status: EXPIRY_STATUS.NONE, daysLeft: null };
  exp.setHours(0, 0, 0, 0);

  const daysLeft = Math.round((exp.getTime() - today.getTime()) / 86400000);

  let status;
  if (daysLeft < 0) status = EXPIRY_STATUS.EXPIRED;
  else if (daysLeft <= nearDays) status = EXPIRY_STATUS.NEAR;
  else status = EXPIRY_STATUS.OK;

  return { status, daysLeft };
}

/** Human-friendly summary of how long until (or since) expiry. */
export function formatDaysLeft(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return "—";
  if (daysLeft < 0) return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago`;
  if (daysLeft === 0) return "Today";
  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
}

/** True when a product is expired or approaching expiry (candidate for discount). */
export function isExpiringSoon(expiryDate, options) {
  const { status } = getExpiryStatus(expiryDate, options);
  return status === EXPIRY_STATUS.EXPIRED || status === EXPIRY_STATUS.NEAR;
}
