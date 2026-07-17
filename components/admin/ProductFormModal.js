"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Plus, Trash2, Upload, Loader2, CalendarClock, Boxes, Ruler } from "lucide-react";
import { ORIGINS } from "@/lib/origins";
import { MAX_IMAGE_UPLOAD_LABEL } from "@/lib/imageLimits";
import { getExpiryStatus, formatDaysLeft, EXPIRY_STATUS, NEAR_EXPIRY_DAYS } from "@/lib/expiry";
import {
  MEASUREMENT_UNITS,
  UNIT_GROUPS,
  PACKAGE_TYPES,
  formatMeasurementLabel,
} from "@/lib/measurement";
import { apiGet, apiSend, apiUpload } from "@/lib/adminApi";
import {
  BADGE_PRESETS,
  BADGE_COLOR_SWATCHES,
  BADGE_CUSTOM,
  resolveBadgeSelect,
  findBadgePreset,
} from "@/lib/badges";
import ProductBadge from "@/components/ProductBadge";
import { CATEGORY_CUSTOM, resolveCategorySelect, FALLBACK_CATEGORIES } from "@/lib/categoryData";
import DatePicker from "@/components/admin/DatePicker";

// Earliest selectable expiry date is tomorrow (past + current dates are blocked).
function tomorrowISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const emptyProduct = {
  name: "",
  brand: "",
  origin: ORIGINS.CANADA,
  category: "Anti Aging",
  badge: "",
  badgeColor: "",
  subtitle: "",
  price: "",
  originalPrice: "",
  discountPercent: "",
  reviewsCount: 0,
  size: "",
  unit: "ml",
  packageType: "",
  image: "",
  targetCustomers: "",
  climateBenefit: "",
  inStock: true,
  stockQuantity: "",
  showStock: false,
  expiryDate: "",
  benefits: [""],
  variants: [],
};

// A blank additional size/packaging option.
function blankVariant() {
  return {
    size: "",
    unit: "ml",
    packageType: "",
    price: "",
    originalPrice: "",
    discountPercent: "",
    stockQuantity: "",
    inStock: true,
    expiryDate: "",
    image: "",
    imageUploadId: null,
  };
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState(() => ({
    ...emptyProduct,
    ...product,
    badge: product?.badge ?? "",
    badgeColor: product?.badgeColor ?? findBadgePreset(product?.badge)?.bg ?? "",
    discountPercent: product?.discountPercent ?? "",
    originalPrice: product?.originalPrice ?? "",
    size: product?.size ?? "",
    unit: product?.unit ?? "ml",
    packageType: product?.packageType ?? "",
    expiryDate: product?.expiryDate ?? "",
    stockQuantity: product?.stockQuantity ?? "",
    showStock: product ? !!product.showStock : false,
    targetCustomers: product?.targetCustomers ?? "",
    climateBenefit: product?.climateBenefit ?? "",
    benefits: product?.benefits?.length ? product.benefits : [""],
    inStock: product ? product.inStock !== false : true,
    variants: (product?.variants || []).map((v) => ({
      id: v.id,
      size: v.size ?? "",
      unit: v.unit ?? "ml",
      packageType: v.packageType ?? "",
      price: v.price ?? "",
      originalPrice: v.originalPrice ?? "",
      discountPercent: v.discountPercent ?? "",
      stockQuantity: v.stockQuantity ?? "",
      inStock: v.inStock !== false,
      expiryDate: v.expiryDate ?? "",
      image: v.image ?? "",
      imageUploadId: null,
    })),
  }));
  const [badgeSelect, setBadgeSelect] = useState(() => resolveBadgeSelect(product?.badge));
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [categorySelect, setCategorySelect] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUploadId, setImageUploadId] = useState(null);
  const fileInputRef = useRef(null);

  // Multiple additional images state
  const [additionalImages, setAdditionalImages] = useState(
    product?.images ? product.images.slice(1) : []
  );
  const [additionalImageUploadIds, setAdditionalImageUploadIds] = useState([]);
  const [additionalUploading, setAdditionalUploading] = useState(false);
  const additionalFileInputRef = useRef(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateVariant = (i, patch) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], ...patch };
      return { ...f, variants };
    });
  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, blankVariant()] }));
  const removeVariant = (i) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiGet("/api/categories");
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
        return data;
      }
    } catch {
      // Keep fallback list when API is unavailable.
    }
    return FALLBACK_CATEGORIES;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await loadCategories();
      if (!active) return;
      const initialCategory = product?.category ?? list[0]?.name ?? "Anti Aging";
      setForm((f) => ({ ...f, category: initialCategory }));
      setCategorySelect(resolveCategorySelect(initialCategory, list));
    })();
    return () => {
      active = false;
    };
  }, [product?.category, loadCategories]);

  const handleCategorySelect = (value) => {
    setCategorySelect(value);
    if (value === CATEGORY_CUSTOM) {
      setForm((f) => ({
        ...f,
        category: f.category && !categories.some((c) => c.name.toLowerCase() === f.category.toLowerCase())
          ? f.category
          : "",
      }));
      return;
    }
    setForm((f) => ({ ...f, category: value }));
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setError("");
    setCategoryBusy(true);
    try {
      const created = await apiSend("/api/categories", "POST", { name });
      await loadCategories();
      setNewCategoryName("");
      setCategorySelect(created.name);
      setForm((f) => ({ ...f, category: created.name }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCategoryBusy(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setError("");
    setCategoryBusy(true);
    try {
      await apiSend(`/api/categories/${cat.id}`, "DELETE");
      const updated = await loadCategories();
      if (form.category === cat.name) {
        const next = updated[0]?.name ?? "";
        setForm((f) => ({ ...f, category: next }));
        setCategorySelect(next || CATEGORY_CUSTOM);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCategoryBusy(false);
    }
  };

  const handleBadgeSelect = (value) => {
    setBadgeSelect(value);
    if (!value) {
      setForm((f) => ({ ...f, badge: "", badgeColor: "" }));
      return;
    }
    if (value === BADGE_CUSTOM) {
      setForm((f) => ({ ...f, badge: f.badge && !findBadgePreset(f.badge) ? f.badge : "", badgeColor: f.badgeColor || "#3d2f27" }));
      return;
    }
    const preset = BADGE_PRESETS.find((p) => p.value === value);
    if (preset) {
      setForm((f) => ({ ...f, badge: preset.value, badgeColor: preset.bg }));
    }
  };

  const handleBadgeColor = (bg) => {
    setForm((f) => ({ ...f, badgeColor: bg }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { uploadId, path } = await apiUpload(file);
      set("image", path);
      setImageUploadId(uploadId);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      // Allow re-selecting the same file later.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAdditionalFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    setAdditionalUploading(true);
    try {
      for (const file of files) {
        const { uploadId, path } = await apiUpload(file);
        setAdditionalImages((prev) => [...prev, path]);
        setAdditionalImageUploadIds((prev) => [...prev, uploadId]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAdditionalUploading(false);
      if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";
    }
  };

  const removeAdditionalImage = (index) => {
    const imgUrl = additionalImages[index];
    if (imgUrl.includes("/api/image-uploads/")) {
      const parts = imgUrl.split("/");
      const uploadId = Number(parts[parts.length - 1]);
      if (!isNaN(uploadId)) {
        setAdditionalImageUploadIds((prev) => prev.filter((id) => id !== uploadId));
      }
    }
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setBenefit = (i, value) =>
    setForm((f) => {
      const benefits = [...f.benefits];
      benefits[i] = value;
      return { ...f, benefits };
    });

  const addBenefit = () => setForm((f) => ({ ...f, benefits: [...f.benefits, ""] }));
  const removeBenefit = (i) =>
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.brand || !form.category?.trim() || !form.subtitle || !form.price || (!form.image && !imageUploadId) || !form.targetCustomers) {
      setError("Please fill all required fields (marked with *).");
      return;
    }

    // Prices are stored in an INT column (max ~2.1 billion). Catch out-of-range
    // or non-numeric values here so the user gets a clear message instead of a
    // failed save. LKR 100,000,000 is far above any realistic product price.
    const MAX_PRICE = 100000000;
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Price must be a valid number greater than 0.");
      return;
    }
    if (priceNum > MAX_PRICE) {
      setError(`Price is too large. Please enter an amount up to LKR ${MAX_PRICE.toLocaleString()}.`);
      return;
    }
    if (form.originalPrice !== "" && Number(form.originalPrice) > MAX_PRICE) {
      setError(`Original price is too large. Please enter an amount up to LKR ${MAX_PRICE.toLocaleString()}.`);
      return;
    }

    // A newly chosen expiry date must be in the future (never today or past).
    // An unchanged, already-stored date is left alone so unrelated edits aren't blocked.
    const expiryChanged = (form.expiryDate || "") !== (product?.expiryDate || "");
    if (form.expiryDate && expiryChanged && form.expiryDate < tomorrowISO()) {
      setError("Expiry date must be a future date (today and past dates are not allowed).");
      return;
    }

    // Each additional size/option needs a valid price. Fully-blank rows are ignored.
    const variantRowHasData = (v) =>
      v.price !== "" || v.size !== "" || v.packageType || v.stockQuantity !== "" || v.originalPrice !== "";
    for (const v of form.variants) {
      if (!variantRowHasData(v)) continue;
      const vp = Number(v.price);
      if (v.price === "" || !Number.isFinite(vp) || vp <= 0) {
        setError("Each additional size/option needs a valid price (greater than 0).");
        return;
      }
      if (vp > MAX_PRICE) {
        setError(`A variant price is too large. Keep it up to LKR ${MAX_PRICE.toLocaleString()}.`);
        return;
      }
    }

    const variantsPayload = form.variants
      .filter(variantRowHasData)
      .map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        size: v.size === "" ? null : Math.max(0, Number(v.size)),
        unit: v.size === "" ? null : v.unit || null,
        packageType: v.packageType || null,
        price: Number(v.price),
        originalPrice: v.originalPrice === "" ? null : Number(v.originalPrice),
        discountPercent: v.discountPercent === "" ? null : Number(v.discountPercent),
        stockQuantity: v.stockQuantity === "" ? null : Math.max(0, Number(v.stockQuantity)),
        inStock: !!v.inStock,
        expiryDate: v.expiryDate || null,
        image: v.image || null,
        ...(v.imageUploadId ? { imageUploadId: v.imageUploadId } : {}),
      }));

    const payload = {
      name: form.name,
      brand: form.brand,
      origin: form.origin || ORIGINS.CANADA,
      category: form.category.trim(),
      badge: form.badge?.trim() ? form.badge.trim() : null,
      badgeColor: form.badge?.trim() && form.badgeColor ? form.badgeColor : null,
      subtitle: form.subtitle,
      price: Number(form.price),
      originalPrice: form.originalPrice === "" ? null : Number(form.originalPrice),
      discountPercent: form.discountPercent === "" ? null : Number(form.discountPercent),
      reviewsCount: Number(form.reviewsCount) || 0,
      size: form.size === "" ? null : Math.max(0, Number(form.size)),
      unit: form.size === "" ? null : form.unit || null,
      packageType: form.packageType || null,
      image: form.image,
      images: [form.image, ...additionalImages],
      ...(imageUploadId ? { imageUploadId } : {}),
      additionalImageUploadIds,
      targetCustomers: form.targetCustomers,
      climateBenefit: form.climateBenefit || null,
      inStock: !!form.inStock,
      stockQuantity: form.stockQuantity === "" ? null : Math.max(0, Number(form.stockQuantity)),
      showStock: !!form.showStock,
      expiryDate: form.expiryDate ? form.expiryDate : null,
      benefits: form.benefits.map((b) => b.trim()).filter(Boolean),
      variants: variantsPayload,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await apiSend(`/api/products/${product.id}`, "PUT", payload);
      } else {
        await apiSend("/api/products", "POST", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-brand-cream border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-espresso focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose";
  const labelClass = "text-[11px] font-bold uppercase tracking-wide text-brand-espresso/60 mb-1 block";

  return (
    <div className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-brand-card rounded-2xl border border-brand-border shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-brand-card border-b border-brand-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-serif text-xl font-bold text-brand-espresso">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-brand-espresso/5 text-brand-espresso/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-brand-rose/10 border border-brand-rose/25 text-brand-rose rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Product Name *</label>
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Brand *</label>
              <input className={inputClass} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Category *</label>
              <div className="space-y-3">
                <select
                  className={inputClass}
                  value={categorySelect}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value={CATEGORY_CUSTOM}>Type new category…</option>
                </select>

                {categorySelect === CATEGORY_CUSTOM && (
                  <input
                    className={inputClass}
                    placeholder="Enter new category name"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  />
                )}

                <div className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="Add another category for future use"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={categoryBusy || !newCategoryName.trim()}
                    className="shrink-0 inline-flex items-center gap-1 bg-brand-espresso hover:bg-brand-rose disabled:opacity-50 text-brand-cream text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {categories.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-brand-espresso/50 mb-2">Manage categories</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1.5 bg-brand-cream border border-brand-border rounded-full pl-3 pr-1.5 py-1 text-[11px] font-semibold text-brand-espresso"
                        >
                          {cat.name}
                          {cat.productCount > 0 ? (
                            <span className="text-[9px] text-brand-espresso/40">({cat.productCount})</span>
                          ) : null}
                          <button
                            type="button"
                            title={`Delete ${cat.name}`}
                            disabled={categoryBusy}
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 rounded-full text-brand-rose hover:bg-brand-rose/10 disabled:opacity-40"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-brand-espresso/40 mt-2">
                      Categories in use by products cannot be deleted until those products are reassigned.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Origin</label>
              <select className={inputClass} value={form.origin} onChange={(e) => set("origin", e.target.value)}>
                <option value={ORIGINS.CANADA}>Canada</option>
                <option value={ORIGINS.NEW_ZEALAND}>New Zealand</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Subtitle / Short focus *</label>
            <input className={inputClass} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Price (LKR) *</label>
              <input type="number" min="0" max="100000000" step="1" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Original Price</label>
              <input type="number" min="0" max="100000000" step="1" className={inputClass} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Discount %</label>
              <input type="number" className={inputClass} value={form.discountPercent} onChange={(e) => set("discountPercent", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Reviews count</label>
              <input type="number" className={inputClass} value={form.reviewsCount} onChange={(e) => set("reviewsCount", e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-brand-border/70 bg-brand-cream/40 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Ruler className="w-4 h-4 text-brand-rose" />
              <label className={`${labelClass} mb-0`}>Default Size & Measurement Unit</label>
            </div>
            <p className="text-[11px] text-brand-espresso/50 mb-3">
              How this product is measured. Use millilitres (mL) or litres for liquids, grams (g) or
              ounces for creams &amp; powders, or a count (pieces, sheets, ampoules…) for items like
              sheet masks. Also pick the packaging form. This is the <strong>default option</strong> —
              add more sizes below. Shown to customers on the product page.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Size / Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={inputClass}
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <select className={inputClass} value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                  {Object.entries(UNIT_GROUPS).map(([group, groupLabel]) => (
                    <optgroup key={group} label={groupLabel}>
                      {MEASUREMENT_UNITS.filter((u) => u.group === group).map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Packaging / Type</label>
                <select
                  className={inputClass}
                  value={form.packageType}
                  onChange={(e) => set("packageType", e.target.value)}
                >
                  <option value="">Not specified</option>
                  {PACKAGE_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formatMeasurementLabel({ size: form.size, unit: form.unit, packageType: form.packageType }) && (
              <div className="flex items-center gap-2 pt-3">
                <span className="text-[10px] font-semibold text-brand-espresso/50">Customer sees</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-espresso/5 border border-brand-border/60 text-brand-espresso">
                  {formatMeasurementLabel({ size: form.size, unit: form.unit, packageType: form.packageType })}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-brand-border/70 bg-brand-cream/40 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Boxes className="w-4 h-4 text-brand-rose" />
              <label className={`${labelClass} mb-0`}>Additional Sizes &amp; Packaging (optional)</label>
            </div>
            <p className="text-[11px] text-brand-espresso/50 mb-3">
              Sell the same product in more than one size or packaging. The fields above are the
              default option; add extra options here (e.g. a larger bottle, a jar, or a value pack).
              Each option has its own price, stock, image and (optional) expiry — customers choose
              which one to buy.
            </p>
            {form.variants.length > 0 && (
              <div className="space-y-4">
                {form.variants.map((v, i) => (
                  <VariantCard
                    key={i}
                    index={i}
                    variant={v}
                    onChange={(patch) => updateVariant(i, patch)}
                    onRemove={() => removeVariant(i)}
                    inputClass={inputClass}
                    labelClass={labelClass}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={addVariant}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-rose hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add another size / option
            </button>
          </div>

          <div>
            <label className={labelClass}>Badge (optional)</label>
            <div className="space-y-3">
              <select
                className={inputClass}
                value={badgeSelect}
                onChange={(e) => handleBadgeSelect(e.target.value)}
              >
                <option value="">No badge</option>
                {BADGE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
                <option value={BADGE_CUSTOM}>Custom badge…</option>
              </select>

              {badgeSelect === BADGE_CUSTOM && (
                <input
                  className={inputClass}
                  placeholder="Type your badge label"
                  value={form.badge}
                  onChange={(e) => set("badge", e.target.value.toUpperCase())}
                />
              )}

              {badgeSelect && (
                <div>
                  <p className="text-[10px] font-semibold text-brand-espresso/50 mb-2">Badge colour</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {BADGE_COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.bg}
                        type="button"
                        title={swatch.label}
                        onClick={() => handleBadgeColor(swatch.bg)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          form.badgeColor === swatch.bg ? "border-brand-rose ring-2 ring-brand-rose/30" : "border-brand-border"
                        }`}
                        style={{ backgroundColor: swatch.bg }}
                      />
                    ))}
                    <label className="relative w-8 h-8 rounded-full border-2 border-brand-border overflow-hidden cursor-pointer hover:scale-110 transition-transform" title="Custom colour">
                      <input
                        type="color"
                        value={form.badgeColor || "#3d2f27"}
                        onChange={(e) => handleBadgeColor(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(${BADGE_COLOR_SWATCHES.map((s) => s.bg).join(", ")})`,
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={form.badgeColor}
                      onChange={(e) => handleBadgeColor(e.target.value)}
                      placeholder="#3d2f27"
                      className="w-24 bg-brand-cream border border-brand-border rounded-lg px-2 py-1.5 text-xs text-brand-espresso focus:outline-none focus:ring-1 focus:ring-brand-rose"
                    />
                  </div>
                </div>
              )}

              {form.badge?.trim() && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-semibold text-brand-espresso/50">Preview</span>
                  <ProductBadge text={form.badge.trim()} color={form.badgeColor} />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Product Image *</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-20 h-20 rounded-lg bg-brand-cream border border-brand-border/60 relative overflow-hidden shrink-0 flex items-center justify-center">
                {form.image ? (
                  <Image src={form.image} alt="Preview" fill className="object-contain p-1.5" sizes="80px" />
                ) : (
                  <span className="text-[10px] text-brand-espresso/40 text-center px-1">No image</span>
                )}
              </div>

              <div className="flex-grow space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 bg-brand-espresso hover:bg-brand-rose text-brand-cream text-xs font-semibold px-4 py-2.5 rounded-full transition-colors disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading…" : "Upload from computer"}
                </button>
                {/* Manual path fallback */}
                <input
                  className={inputClass}
                  value={form.image}
                  onChange={(e) => {
                    set("image", e.target.value);
                    setImageUploadId(null);
                  }}
                  placeholder="/images/products/your-image.png"
                />
                <p className="text-[10px] text-brand-espresso/40">
                  JPG, PNG, WEBP, GIF or AVIF · max {MAX_IMAGE_UPLOAD_LABEL}. Uploads are saved to the database. Or paste a static path above.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Images (Different Angles) */}
          <div className="border-t border-brand-border/40 pt-4 mt-2">
            <label className={labelClass}>Additional Images (Different Angles)</label>
            <div className="space-y-4">
              <input
                ref={additionalFileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={handleAdditionalFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => additionalFileInputRef.current?.click()}
                disabled={additionalUploading}
                className="inline-flex items-center gap-2 bg-brand-espresso hover:bg-brand-rose text-brand-cream text-xs font-semibold px-4 py-2.5 rounded-full transition-colors disabled:opacity-60 cursor-pointer"
              >
                {additionalUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {additionalUploading ? "Uploading Angle..." : "Upload additional angles"}
              </button>

              {/* Previews */}
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-2 bg-brand-card p-3 rounded-xl border border-brand-border/40">
                  {additionalImages.map((img, index) => (
                    <div key={index} className="aspect-square rounded-lg bg-brand-cream border border-brand-border/60 relative overflow-hidden flex items-center justify-center group shadow-sm">
                      <Image src={img} alt={`Angle ${index + 1}`} fill className="object-contain p-1" sizes="80px" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute inset-0 bg-red-600/80 text-brand-cream opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-xs transition-opacity rounded-lg cursor-pointer"
                        title="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Target Customers *</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.targetCustomers}
              onChange={(e) => set("targetCustomers", e.target.value)}
              placeholder="e.g. Ideal for dry, sensitive skin looking for lightweight daily hydration in tropical climates."
            />
            <p className="text-[10px] text-brand-espresso/40 mt-1">
              A short description of who this product is best suited for. Shown to shoppers in the product info drawer under &ldquo;Target Customers&rdquo;.
            </p>
          </div>

          <div>
            <label className={labelClass}>Climate Benefit</label>
            <textarea className={inputClass} rows={2} value={form.climateBenefit} onChange={(e) => set("climateBenefit", e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Benefits</label>
            <div className="space-y-2">
              {form.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={inputClass} value={b} onChange={(e) => setBenefit(i, e.target.value)} placeholder={`Benefit ${i + 1}`} />
                  <button type="button" onClick={() => removeBenefit(i)} className="p-2 text-brand-rose hover:bg-brand-rose/10 rounded-lg shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addBenefit} className="text-xs font-semibold text-brand-rose flex items-center gap-1 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add benefit
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-brand-border/70 bg-brand-cream/40 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Boxes className="w-4 h-4 text-brand-rose" />
              <label className={`${labelClass} mb-0`}>Stock Quantity</label>
            </div>
            <p className="text-[11px] text-brand-espresso/50 mb-2.5">
              How many units are currently in stock. This count is reduced automatically each time a
              customer buys the product. Leave blank to not track stock quantity.
            </p>
            <input
              type="number"
              min="0"
              className={`${inputClass} max-w-[240px]`}
              value={form.stockQuantity}
              onChange={(e) => set("stockQuantity", e.target.value)}
              placeholder="e.g. 50"
            />
            <label className="flex items-center gap-2 cursor-pointer select-none mt-3">
              <input
                type="checkbox"
                checked={form.showStock}
                onChange={(e) => set("showStock", e.target.checked)}
                className="rounded border-brand-border text-brand-rose focus:ring-brand-rose"
              />
              <span className="text-sm font-semibold text-brand-espresso">
                Show remaining stock count to customers
              </span>
            </label>
          </div>

          <div className="rounded-xl border border-brand-border/70 bg-brand-cream/40 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-brand-rose" />
              <label className={`${labelClass} mb-0`}>Stock Expiry Date (admin only)</label>
            </div>
            <p className="text-[11px] text-brand-espresso/50 mb-2.5">
              Pick when this stock expires from the calendar. Only future dates can be selected — today and
              past dates are blocked. Visible only in the admin dashboard, never shown to customers.
              Products expiring within {NEAR_EXPIRY_DAYS} days are flagged as “near expiry”.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <DatePicker
                className="w-full max-w-[240px]"
                value={form.expiryDate || ""}
                onChange={(v) => set("expiryDate", v)}
                minDate={tomorrowISO()}
                placeholder="Select expiry date"
              />
              {form.expiryDate && (
                <button
                  type="button"
                  onClick={() => set("expiryDate", "")}
                  className="text-[11px] font-semibold text-brand-espresso/50 hover:text-brand-rose"
                >
                  Clear
                </button>
              )}
              {form.expiryDate && (() => {
                const { status, daysLeft } = getExpiryStatus(form.expiryDate);
                const styles = {
                  [EXPIRY_STATUS.EXPIRED]: "bg-red-100 text-red-700",
                  [EXPIRY_STATUS.NEAR]: "bg-amber-100 text-amber-800",
                  [EXPIRY_STATUS.OK]: "bg-green-100 text-green-800",
                }[status] || "bg-gray-100 text-gray-600";
                const label = {
                  [EXPIRY_STATUS.EXPIRED]: "Expired",
                  [EXPIRY_STATUS.NEAR]: "Near expiry",
                  [EXPIRY_STATUS.OK]: "In date",
                }[status] || "";
                return (
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${styles}`}>
                    {label} · {formatDaysLeft(daysLeft)}
                  </span>
                );
              })()}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} className="rounded border-brand-border text-brand-rose focus:ring-brand-rose" />
            <span className="text-sm font-semibold text-brand-espresso">In stock (uncheck to mark Out of Stock)</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-border/50">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-full text-sm font-semibold text-brand-espresso/70 hover:bg-brand-espresso/5">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full text-sm font-semibold bg-brand-rose hover:bg-brand-rose-hover disabled:opacity-60 text-brand-cream shadow">
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// A single additional size/packaging option in the product form.
function VariantCard({ index, variant, onChange, onRemove, inputClass, labelClass }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const { uploadId, path } = await apiUpload(file);
      onChange({ image: path, imageUploadId: uploadId });
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const label = formatMeasurementLabel({
    size: variant.size,
    unit: variant.unit,
    packageType: variant.packageType,
  });

  return (
    <div className="rounded-lg border border-brand-border/60 bg-brand-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-brand-espresso/70">
          Option {index + 1}
          {label ? <span className="text-brand-rose"> · {label}</span> : ""}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-brand-rose hover:bg-brand-rose/10 rounded-lg"
          title="Remove option"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Size</label>
          <input
            type="number"
            min="0"
            step="any"
            className={inputClass}
            value={variant.size}
            onChange={(e) => onChange({ size: e.target.value })}
            placeholder="e.g. 60"
          />
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <select className={inputClass} value={variant.unit} onChange={(e) => onChange({ unit: e.target.value })}>
            {Object.entries(UNIT_GROUPS).map(([group, groupLabel]) => (
              <optgroup key={group} label={groupLabel}>
                {MEASUREMENT_UNITS.filter((u) => u.group === group).map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Packaging</label>
          <select
            className={inputClass}
            value={variant.packageType}
            onChange={(e) => onChange({ packageType: e.target.value })}
          >
            <option value="">Not specified</option>
            {PACKAGE_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Price (LKR) *</label>
          <input
            type="number"
            min="0"
            max="100000000"
            className={inputClass}
            value={variant.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Original Price</label>
          <input
            type="number"
            min="0"
            max="100000000"
            className={inputClass}
            value={variant.originalPrice}
            onChange={(e) => onChange({ originalPrice: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Discount %</label>
          <input
            type="number"
            className={inputClass}
            value={variant.discountPercent}
            onChange={(e) => onChange({ discountPercent: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Stock Qty</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={variant.stockQuantity}
            onChange={(e) => onChange({ stockQuantity: e.target.value })}
            placeholder="Blank = untracked"
          />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Expiry (admin only)</label>
          <div className="flex items-center gap-2">
            <DatePicker
              className="flex-1"
              value={variant.expiryDate || ""}
              onChange={(val) => onChange({ expiryDate: val })}
              minDate={tomorrowISO()}
              placeholder="Optional"
            />
            {variant.expiryDate && (
              <button
                type="button"
                onClick={() => onChange({ expiryDate: "" })}
                className="text-[11px] font-semibold text-brand-espresso/50 hover:text-brand-rose"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <div className="w-14 h-14 rounded-lg bg-brand-cream border border-brand-border/60 relative overflow-hidden shrink-0 flex items-center justify-center">
          {variant.image ? (
            <Image src={variant.image} alt="Variant" fill className="object-contain p-1" sizes="56px" />
          ) : (
            <span className="text-[9px] text-brand-espresso/40 text-center px-1 leading-tight">Uses main image</span>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={handleFile}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 bg-brand-espresso hover:bg-brand-rose text-brand-cream text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-60"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Uploading…" : variant.image ? "Change image" : "Upload image"}
            </button>
            {variant.image && (
              <button
                type="button"
                onClick={() => onChange({ image: "", imageUploadId: null })}
                className="text-[11px] font-semibold text-brand-espresso/50 hover:text-brand-rose"
              >
                Remove
              </button>
            )}
          </div>
          {uploadError && <p className="text-[10px] text-brand-rose">{uploadError}</p>}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={variant.inStock}
              onChange={(e) => onChange({ inStock: e.target.checked })}
              className="rounded border-brand-border text-brand-rose focus:ring-brand-rose"
            />
            <span className="text-[11px] font-semibold text-brand-espresso">In stock</span>
          </label>
        </div>
      </div>
    </div>
  );
}
