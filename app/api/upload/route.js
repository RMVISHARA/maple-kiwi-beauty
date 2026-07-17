import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveImageUpload, imageUploadUrl } from "@/lib/images";
import {
  validateImageFile,
  optimizeImageForStorage,
  friendlyImageUploadError,
} from "@/lib/imageUpload";

export const dynamic = "force-dynamic";

// POST /api/upload  (multipart/form-data, field "file")  -> { uploadId, path } (admin only)
// Saves the image bytes to MySQL (image_uploads staging table).
export async function POST(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    validateImageFile(file);
    const raw = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImageForStorage(raw, {
      maxWidth: 1800,
      maxHeight: 1800,
      maxOutputBytes: 900 * 1024,
    });
    const uploadId = await saveImageUpload(optimized.data, optimized.mimeType);

    return NextResponse.json(
      { uploadId, path: imageUploadUrl(uploadId) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);
    const status = error.status || 500;
    return NextResponse.json(
      { error: friendlyImageUploadError(error) },
      { status }
    );
  }
}
