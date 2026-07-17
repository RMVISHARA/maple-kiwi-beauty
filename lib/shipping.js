/**
 * Manual location-based delivery pricing for Sri Lanka.
 * Rates are maintained here — no courier API required.
 */

export const FREE_SHIPPING_LIMIT = 15000;

export const ZONE_RATES = {
  COLOMBO_METRO: 350,
  WESTERN_PROVINCE: 400,
  MAIN_CITIES: 450,
  REMOTE: 550,
  VERY_REMOTE: 650,
};

export const ZONE_LABELS = {
  COLOMBO_METRO: "Colombo / nearby suburbs",
  WESTERN_PROVINCE: "Western Province",
  MAIN_CITIES: "Main cities island-wide",
  REMOTE: "Remote areas",
  VERY_REMOTE: "Very remote areas",
  FREE: "Free delivery",
};

export const SRI_LANKA_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

/** Gampaha-area suburbs that qualify for Colombo metro pricing. */
const COLOMBO_METRO_CITIES = new Set([
  "kelaniya",
  "wattala",
  "ja-ela",
  "ja ela",
  "kiribathgoda",
  "ragama",
  "kadawatha",
  "mahabage",
  "peliyagoda",
  "kandana",
  "minuwangoda",
  "divulapitiya",
]);

/** Cities in Western Province that are priced as main hubs. */
const MAIN_CITY_OVERRIDES = new Set([
  "negombo",
  "panadura",
  "horana",
  "beruwala",
  "kalutara",
]);

const MAIN_CITY_DISTRICTS = new Set([
  "Kandy",
  "Galle",
  "Matara",
  "Jaffna",
  "Kurunegala",
  "Ratnapura",
  "Anuradhapura",
  "Batticaloa",
  "Trincomalee",
  "Matale",
  "Hambantota",
]);

const REMOTE_DISTRICTS = new Set([
  "Ampara",
  "Badulla",
  "Monaragala",
  "Puttalam",
  "Polonnaruwa",
  "Nuwara Eliya",
  "Kegalle",
]);

const VERY_REMOTE_DISTRICTS = new Set([
  "Kilinochchi",
  "Mannar",
  "Mullaitivu",
  "Vavuniya",
]);

function normalizeCity(city) {
  return (city || "").trim().toLowerCase();
}

/**
 * Resolve delivery zone from district and optional city.
 */
export function resolveZone(district, city = "") {
  if (!district || !SRI_LANKA_DISTRICTS.includes(district)) {
    return null;
  }

  const cityKey = normalizeCity(city);

  if (district === "Colombo") {
    return "COLOMBO_METRO";
  }

  if (district === "Gampaha") {
    if (COLOMBO_METRO_CITIES.has(cityKey)) return "COLOMBO_METRO";
    if (MAIN_CITY_OVERRIDES.has(cityKey)) return "MAIN_CITIES";
    return "WESTERN_PROVINCE";
  }

  if (district === "Kalutara") {
    if (MAIN_CITY_OVERRIDES.has(cityKey)) return "MAIN_CITIES";
    return "WESTERN_PROVINCE";
  }

  if (VERY_REMOTE_DISTRICTS.has(district)) {
    return "VERY_REMOTE";
  }

  if (REMOTE_DISTRICTS.has(district)) {
    return "REMOTE";
  }

  if (MAIN_CITY_DISTRICTS.has(district)) {
    return "MAIN_CITIES";
  }

  // Fallback for any unlisted district
  return "REMOTE";
}

/**
 * Compute shipping quote. Server-authoritative — call from API and order creation.
 */
export function getShippingQuote({ district, city = "", subtotal = 0 }) {
  const zone = resolveZone(district, city);
  if (!zone) {
    return {
      shipping: null,
      error: "Please select a valid delivery district",
      isFreeShipping: false,
    };
  }

  const shipping = ZONE_RATES[zone];
  const isFreeShipping = FREE_SHIPPING_LIMIT !== null && subtotal >= FREE_SHIPPING_LIMIT;

  return {
    shipping: isFreeShipping ? 0 : shipping,
    zone,
    zoneLabel: ZONE_LABELS[zone],
    isFreeShipping,
  };
}
