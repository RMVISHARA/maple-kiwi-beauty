import { NextResponse } from "next/server";
import { getVariantImage } from "@/lib/images";

export const dynamic = "force-dynamic";

// GET /api/products/variants/:id/image  -> serve a variant image stored in MySQL
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const image = await getVariantImage(Number(id));
    if (!image?.data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(image.data, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/products/variants/[id]/image error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image", details: error.message },
      { status: 500 }
    );
  }
}
