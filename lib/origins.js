export const ORIGINS = {
  CANADA: "CANADA",
  NEW_ZEALAND: "NEW ZEALAND",
};

export function normalizeOrigin(origin) {
  const value = String(origin || "")
    .trim()
    .toUpperCase()
    .replace(/_/g, " ");

  if (value.includes("NEW ZEALAND") || value === "NZ") {
    return ORIGINS.NEW_ZEALAND;
  }
  if (value.includes("CANADA") || value === "CA") {
    return ORIGINS.CANADA;
  }
  return value;
}

export function isNewZealandOrigin(origin) {
  return normalizeOrigin(origin) === ORIGINS.NEW_ZEALAND;
}

export function isCanadaOrigin(origin) {
  return normalizeOrigin(origin) === ORIGINS.CANADA;
}

export function getOriginEmoji(origin) {
  return isNewZealandOrigin(origin) ? "🥝" : "🍁";
}

export function matchesOriginFilter(product, originFilter) {
  if (!originFilter) return true;
  return normalizeOrigin(product?.origin) === normalizeOrigin(originFilter);
}
