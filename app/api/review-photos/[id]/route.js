import { NextResponse } from "next/server";
import { getReviewPhoto } from "@/lib/reviewPhotos";

export const dynamic = "force-dynamic";

// GET /api/review-photos/:id — serve a review photo stored in MySQL
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const photo = await getReviewPhoto(Number(id));
    if (!photo?.data) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return new NextResponse(photo.data, {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/review-photos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo", details: error.message },
      { status: 500 }
    );
  }
}
