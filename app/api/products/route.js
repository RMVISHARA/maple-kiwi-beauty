import { NextResponse } from "next/server";
import { getAllProducts, createProduct, toPublicProduct, FALLBACK_PRODUCTS } from "@/lib/products";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/products  -> list all products with their benefits.
// Admin-only fields (e.g. expiry date) are only returned to admin tokens.
export async function GET(request) {
  try {
    const products = await getAllProducts();
    const isAdmin = Boolean(requireAdmin(request));
    return NextResponse.json(isAdmin ? products : products.map(toPublicProduct));
  } catch (error) {
    // If MySQL/XAMPP is unreachable, fall back to static data so the
    // storefront still renders. The header signals degraded mode.
    console.error("GET /api/products DB error, serving fallback:", error.message);
    return NextResponse.json(FALLBACK_PRODUCTS, {
      headers: { "x-data-source": "fallback" },
    });
  }
}

// POST /api/products  -> create a new product (+ optional benefits[])
export async function POST(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();

    const required = ["name", "brand", "category", "subtitle", "price", "targetCustomers"];
    const missing = required.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");
    if (!body.image && !body.imageUploadId) {
      missing.push("image");
    }
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const id = await createProduct(body);
    return NextResponse.json({ id, message: "Product created" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    // Validation errors carry a status (e.g. 400) and a user-friendly message.
    const status = error.status || 500;
    return NextResponse.json(
      status === 500
        ? { error: "Failed to create product", details: error.message }
        : { error: error.message },
      { status }
    );
  }
}
