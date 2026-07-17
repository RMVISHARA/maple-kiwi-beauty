import { NextResponse } from "next/server";
import { deleteCategory } from "@/lib/categories";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/categories/:id
export async function DELETE(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!id) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    const status = error.message?.includes("Cannot delete") ? 409 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status }
    );
  }
}
