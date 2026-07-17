import { NextResponse } from "next/server";
import { getAllCategories, createCategory, FALLBACK_CATEGORIES } from "@/lib/categories";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/categories
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories DB error, serving fallback:", error.message);
    return NextResponse.json(FALLBACK_CATEGORIES, {
      headers: { "x-data-source": "fallback" },
    });
  }
}

// POST /api/categories  { name }
export async function POST(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { name } = await request.json();
    const category = await createCategory(name);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: error.message?.includes("already exists") ? 409 : 500 }
    );
  }
}
