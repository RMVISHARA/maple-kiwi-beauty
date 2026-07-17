// Shared (client + server safe) helpers for product variants.
//
// A product can be sold in several sizes / packagings. The product row itself
// is the DEFAULT option; `product.variants` holds the extra options. This module
// flattens both into a single list of "buyable options" the UI can render, and
// derives things like the "from" price.

import { formatMeasurement, getPackageLabel, formatMeasurementLabel } from "@/lib/measurement";

/**
 * Build the full list of buyable options for a product: the product's own
 * fields as the first (base) option, followed by each variant. Every option has
 * a stable `key` so the cart and selectors can identify it.
 */
export function buildVariantOptions(product) {
  if (!product) return [];

  const base = {
    key: "base",
    isBase: true,
    variantId: null,
    size: product.size ?? null,
    unit: product.unit ?? null,
    packageType: product.packageType ?? null,
    price: Number(product.price),
    originalPrice: product.originalPrice ?? null,
    discountPercent: product.discountPercent ?? null,
    stockQuantity: product.stockQuantity ?? null,
    inStock: product.inStock !== false,
    expiryDate: product.expiryDate ?? null,
    image: product.image,
    measurement: formatMeasurement(product.size, product.unit),
    packageLabel: getPackageLabel(product.packageType),
    label: formatMeasurementLabel(product) || "Standard",
  };

  const options = [base];

  for (const v of product.variants || []) {
    options.push({
      key: `v${v.id}`,
      isBase: false,
      variantId: v.id,
      size: v.size ?? null,
      unit: v.unit ?? null,
      packageType: v.packageType ?? null,
      price: Number(v.price),
      originalPrice: v.originalPrice ?? null,
      discountPercent: v.discountPercent ?? null,
      stockQuantity: v.stockQuantity ?? null,
      inStock: v.inStock !== false,
      expiryDate: v.expiryDate ?? null,
      image: v.image || product.image,
      measurement: formatMeasurement(v.size, v.unit),
      packageLabel: getPackageLabel(v.packageType),
      label: formatMeasurementLabel(v) || "Option",
    });
  }

  return options;
}

/** True when the product offers more than one buyable option. */
export function hasVariants(product) {
  return (product?.variants?.length || 0) > 0;
}

/** Lowest price across all options (the "from" price shown on cards). */
export function getPriceFrom(product) {
  const options = buildVariantOptions(product);
  if (options.length === 0) return Number(product?.price) || 0;
  return Math.min(...options.map((o) => o.price));
}

/** Pick the option a customer should see first: first in-stock option, else the base. */
export function getDefaultOption(product) {
  const options = buildVariantOptions(product);
  return options.find((o) => o.inStock) || options[0] || null;
}
