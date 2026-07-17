/** Preset product badges with default colours for the admin picker & storefront fallback. */
export const BADGE_PRESETS = [
  { label: "Bestseller", value: "BESTSELLER", bg: "#3d2f27", text: "#faf8f5" },
  { label: "Sale", value: "SALE", bg: "#c4726e", text: "#faf8f5" },
  { label: "Top Rated", value: "TOP RATED", bg: "#8A9A86", text: "#ffffff" },
  { label: "Climate Pick", value: "CLIMATE PICK", bg: "#4B6F44", text: "#ffffff" },
  { label: "Essential", value: "ESSENTIAL", bg: "#8FBC8F", text: "#3d2f27" },
  { label: "New", value: "NEW", bg: "#6366f1", text: "#ffffff" },
  { label: "Limited", value: "LIMITED", bg: "#b45309", text: "#ffffff" },
  { label: "Popular", value: "POPULAR", bg: "#db2777", text: "#ffffff" },
];

export const BADGE_COLOR_SWATCHES = [
  { label: "Espresso", bg: "#3d2f27", text: "#faf8f5" },
  { label: "Rose", bg: "#c4726e", text: "#faf8f5" },
  { label: "Sage", bg: "#8A9A86", text: "#ffffff" },
  { label: "Forest", bg: "#4B6F44", text: "#ffffff" },
  { label: "Sea Green", bg: "#8FBC8F", text: "#3d2f27" },
  { label: "Gold", bg: "#c9a227", text: "#3d2f27" },
  { label: "Indigo", bg: "#6366f1", text: "#ffffff" },
  { label: "Amber", bg: "#b45309", text: "#ffffff" },
];

export const BADGE_CUSTOM = "__custom__";

export function findBadgePreset(badgeText) {
  if (!badgeText) return null;
  const upper = badgeText.toUpperCase();
  return BADGE_PRESETS.find((p) => p.value === upper) ?? null;
}

export function resolveBadgeSelect(badgeText) {
  if (!badgeText?.trim()) return "";
  return findBadgePreset(badgeText) ? findBadgePreset(badgeText).value : BADGE_CUSTOM;
}

/** Pick readable text colour from a background hex. */
export function contrastTextColor(bgHex) {
  if (!bgHex || !/^#[0-9a-fA-F]{6}$/.test(bgHex)) return "#faf8f5";
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#3d2f27" : "#faf8f5";
}

/** Resolve inline styles for a product badge pill. */
export function getBadgeStyle(badgeText, badgeColor) {
  if (!badgeText) return null;

  const preset = findBadgePreset(badgeText);
  const bg = badgeColor || preset?.bg || "#3d2f27";
  const text = preset?.text && !badgeColor ? preset.text : contrastTextColor(bg);

  return { backgroundColor: bg, color: text };
}
