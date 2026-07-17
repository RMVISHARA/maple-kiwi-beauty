import { NextResponse } from "next/server";
import {
  getReviews,
  createReview,
  filterFallbackReviews,
  FALLBACK_REVIEWS,
} from "@/lib/reviews";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { filterReviewPhotoFiles, MAX_REVIEW_PHOTOS } from "@/lib/reviewPhotos";
import { friendlyImageUploadError } from "@/lib/imageUpload";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

async function parseReviewPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const productId = Number(formData.get("productId"));
    const rating = Number(formData.get("rating"));
    const text = (formData.get("body") || "").toString().trim();
    const photoFiles = formData
      .getAll("photos")
      .filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);
    if (photoFiles.length) filterReviewPhotoFiles(photoFiles);

    return { productId, rating, text, photoFiles };
  }

  const body = await request.json();
  return {
    productId: Number(body.productId),
    rating: Number(body.rating),
    text: (body.body || "").trim(),
    photoFiles: [],
  };
}

// GET /api/reviews?productId=1&status=APPROVED&featured=1
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const featured = searchParams.get("featured") === "1";
  const all = searchParams.get("all") === "1";
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

  const isAdmin = requireAdmin(request);
  const status = all && isAdmin ? searchParams.get("status") || undefined : "APPROVED";

  if (all && !isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const reviews = await getReviews({
      productId: productId ? Number(productId) : undefined,
      status: status || undefined,
      featured,
      limit,
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews DB error, serving fallback:", error.message);
    const reviews = filterFallbackReviews({
      productId: productId ? Number(productId) : undefined,
      status: status || "APPROVED",
      featured,
      limit,
    });
    return NextResponse.json(all && isAdmin ? FALLBACK_REVIEWS : reviews, {
      headers: { "x-data-source": "fallback" },
    });
  }
}

// POST /api/reviews — submit a review (pending moderation; sign-in required)
export async function POST(request) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Sign in to write a review" }, { status: 401 });
    }

    const rows = await query("SELECT id, name FROM users WHERE id = :id", { id: authUser.id });
    if (!rows.length) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }

    const authorName = rows[0].name?.trim();
    const { productId, rating, text, photoFiles } = await parseReviewPayload(request);

    if (!productId || !authorName || !text) {
      return NextResponse.json(
        { error: "productId and body are required" },
        { status: 400 }
      );
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (text.length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }

    if (photoFiles.length > MAX_REVIEW_PHOTOS) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_REVIEW_PHOTOS} photos.` },
        { status: 400 }
      );
    }

    const id = await createReview({
      productId,
      userId: authUser.id,
      authorName,
      rating,
      body: text,
      photoFiles,
    });

    return NextResponse.json(
      { id, message: "Review submitted and pending approval" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    const status = error.status || 500;
    return NextResponse.json(
      { error: friendlyImageUploadError(error) },
      { status }
    );
  }
}
