import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct, toPublicProduct } from "@/lib/products";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/products/:id  (expiry date only returned to admin tokens)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await getProductById(Number(id));
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const isAdmin = Boolean(requireAdmin(request));
    return NextResponse.json(isAdmin ? product : toPublicProduct(product));
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id  -> partial update (only provided fields change)
export async function PUT(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const ok = await updateProduct(Number(id), body);
    if (!ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = await getProductById(Number(id));
    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    const status = error.status || 500;
    return NextResponse.json(
      status === 500
        ? { error: "Failed to update product", details: error.message }
        : { error: error.message },
      { status }
    );
  }
}

// DELETE /api/products/:id
export async function DELETE(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const { id } = await params;
    const ok = await deleteProduct(Number(id));
    if (!ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: error.message },
      { status: 500 }
    );
  }
}
