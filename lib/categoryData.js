/** Client-safe category constants & helpers (no database imports). */

export const FALLBACK_CATEGORIES = [
  { id: 1, name: "Anti Aging", productCount: 1 },
  { id: 2, name: "Brightening", productCount: 1 },
  { id: 3, name: "Acne & Oil Control", productCount: 1 },
  { id: 4, name: "Hydration", productCount: 1 },
  { id: 5, name: "Sun Protection", productCount: 1 },
];

export const CATEGORY_CUSTOM = "__custom__";

export function resolveCategorySelect(categoryName, categories) {
  if (!categoryName?.trim()) return categories[0]?.name ?? "";
  const match = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  return match ? match.name : CATEGORY_CUSTOM;
}
