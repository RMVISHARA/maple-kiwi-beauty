import { NextResponse } from "next/server";
import { getImageUpload } from "@/lib/images";

export const dynamic = "force-dynamic";

// GET /api/image-uploads/:id  -> serve a staged upload (preview before product save)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const upload = await getImageUpload(Number(id));
    if (!upload?.image_data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(upload.image_data, {
      status: 200,
      headers: {
        "Content-Type": upload.image_mime_type || "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/image-uploads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image", details: error.message },
      { status: 500 }
    );
  }
}
