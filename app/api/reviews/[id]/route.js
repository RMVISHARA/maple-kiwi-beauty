import { NextResponse } from "next/server";
import { updateReview, deleteReview, getReviewById } from "@/lib/reviews";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PUT /api/reviews/:id — admin moderation
export async function PUT(request, { params }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateReview(Number(id), {
      status: body.status,
      isFeatured: body.isFeatured,
    });

    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update review", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/:id
export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const ok = await deleteReview(Number(id));
    if (!ok) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("DELETE /api/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete review", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/reviews/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const review = await getReviewById(Number(id));
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json(review);
  } catch (error) {
    console.error("GET /api/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch review", details: error.message },
      { status: 500 }
    );
  }
}
