// Shared (client + server safe) helpers for product measurement units.
//
// Cosmetic products around the world are sold in a mix of measurement systems:
//   - Volume (liquids, serums, toners, oils, mists) — mL, L, fl oz
//   - Weight (creams, balms, powders, clays, soaps, sticks) — g, kg, oz
//   - Count  (sheet masks, patches, wipes, cotton pads, capsules, ampoules)
// On top of that, the physical form / packaging ("the kind") varies a lot:
//   bottles, tubes, jars, sticks, compacts, sachets, sheet masks, etc.
//
// A product therefore stores three related pieces of information:
//   size        -> the numeric amount (e.g. 50)
//   unit        -> the measurement unit code (e.g. "g")
//   packageType -> the physical form / packaging code (e.g. "jar")

// Grouping used for the <optgroup> labels in the admin form.
export const UNIT_GROUPS = {
  volume: "Volume (liquids)",
  weight: "Weight (creams, powders, solids)",
  count: "Count (pieces, sheets, etc.)",
};

// Measurement units commonly used for cosmetics worldwide.
// `short` is what we show to customers, `label` is the fuller admin dropdown text.
export const MEASUREMENT_UNITS = [
  { value: "ml", label: "Millilitre (mL)", short: "mL", group: "volume" },
  { value: "l", label: "Litre (L)", short: "L", group: "volume" },
  { value: "fl_oz", label: "Fluid ounce (fl oz)", short: "fl oz", group: "volume" },
  { value: "g", label: "Gram (g)", short: "g", group: "weight" },
  { value: "kg", label: "Kilogram (kg)", short: "kg", group: "weight" },
  { value: "mg", label: "Milligram (mg)", short: "mg", group: "weight" },
  { value: "oz", label: "Ounce (oz)", short: "oz", group: "weight" },
  { value: "pcs", label: "Pieces (pcs)", short: "pcs", group: "count" },
  { value: "sheets", label: "Sheets", short: "sheets", group: "count" },
  { value: "pairs", label: "Pairs", short: "pairs", group: "count" },
  { value: "wipes", label: "Wipes", short: "wipes", group: "count" },
  { value: "pads", label: "Pads", short: "pads", group: "count" },
  { value: "capsules", label: "Capsules", short: "capsules", group: "count" },
  { value: "ampoules", label: "Ampoules", short: "ampoules", group: "count" },
  { value: "sachets", label: "Sachets", short: "sachets", group: "count" },
];

// Physical form / packaging types ("tube or powder or any other kind").
export const PACKAGE_TYPES = [
  { value: "bottle", label: "Bottle" },
  { value: "dropper", label: "Dropper Bottle" },
  { value: "pump", label: "Pump Bottle" },
  { value: "spray", label: "Spray Bottle" },
  { value: "mist", label: "Mist / Facial Spray" },
  { value: "tube", label: "Tube" },
  { value: "jar", label: "Jar / Pot" },
  { value: "tin", label: "Tin" },
  { value: "powder", label: "Powder" },
  { value: "loose_powder", label: "Loose Powder" },
  { value: "compact", label: "Compact / Pressed Powder" },
  { value: "cushion", label: "Cushion Compact" },
  { value: "stick", label: "Stick" },
  { value: "pencil", label: "Pencil" },
  { value: "roll_on", label: "Roll-On" },
  { value: "palette", label: "Palette" },
  { value: "bar", label: "Bar (soap / shampoo)" },
  { value: "sheet_mask", label: "Sheet Mask" },
  { value: "patch", label: "Patch" },
  { value: "ampoule", label: "Ampoule / Vial" },
  { value: "sachet", label: "Sachet" },
  { value: "refill", label: "Refill Pouch" },
];

const UNIT_BY_VALUE = Object.fromEntries(MEASUREMENT_UNITS.map((u) => [u.value, u]));
const PACKAGE_BY_VALUE = Object.fromEntries(PACKAGE_TYPES.map((p) => [p.value, p]));

/** Look up a unit definition by its code (e.g. "g"). */
export function getUnit(unit) {
  return unit ? UNIT_BY_VALUE[unit] || null : null;
}

/** Human label for a package type code (e.g. "jar" -> "Jar / Pot"). */
export function getPackageLabel(packageType) {
  return packageType ? PACKAGE_BY_VALUE[packageType]?.label || null : null;
}

/** Format a numeric size, trimming trailing zeros (50.00 -> "50", 50.5 -> "50.5"). */
export function formatSize(size) {
  if (size === null || size === undefined || size === "") return "";
  const n = Number(size);
  if (Number.isNaN(n)) return "";
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(2)));
}

/**
 * Build the customer-facing size label, e.g. "50 g", "40 mL", "10 sheets".
 * Returns "" when there isn't enough information to display.
 */
export function formatMeasurement(size, unit) {
  const sizeText = formatSize(size);
  const unitDef = getUnit(unit);
  if (sizeText && unitDef) return `${sizeText} ${unitDef.short}`;
  if (sizeText) return sizeText;
  return "";
}

/**
 * Full label including the packaging form when present,
 * e.g. "50 g · Jar" or just "40 mL" when no package type is set.
 * Accepts a product-like object ({ size, unit, packageType }).
 */
export function formatMeasurementLabel(product) {
  if (!product) return "";
  const measurement = formatMeasurement(product.size, product.unit);
  const pkg = getPackageLabel(product.packageType);
  if (measurement && pkg) return `${measurement} · ${pkg}`;
  return measurement || pkg || "";
}

/** True when a product carries any measurement/packaging info worth displaying. */
export function hasMeasurement(product) {
  return Boolean(product && (formatMeasurement(product.size, product.unit) || getPackageLabel(product.packageType)));
}
