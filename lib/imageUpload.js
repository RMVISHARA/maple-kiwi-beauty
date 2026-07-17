import sharp from "sharp";
import { MAX_IMAGE_UPLOAD_BYTES, MAX_IMAGE_UPLOAD_LABEL } from "@/lib/imageLimits";

export { MAX_IMAGE_UPLOAD_BYTES, MAX_IMAGE_UPLOAD_LABEL };

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function validateImageFile(file, maxBytes = MAX_IMAGE_UPLOAD_BYTES) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw Object.assign(new Error("Invalid image file."), { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw Object.assign(
      new Error("Unsupported file type. Use JPG, PNG, WEBP, GIF or AVIF."),
      { status: 400 }
    );
  }
  if (file.size > maxBytes) {
    throw Object.assign(
      new Error(`Image is too large (max ${MAX_IMAGE_UPLOAD_LABEL}).`),
      { status: 400 }
    );
  }
}

/**
 * Resize and compress an uploaded image before storing it in MySQL so we stay
 * well below typical max_allowed_packet limits.
 */
export async function optimizeImageForStorage(
  input,
  {
    maxWidth = 1200,
    maxHeight = 1200,
    maxOutputBytes = 900 * 1024,
    quality = 82,
  } = {}
) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  let currentQuality = quality;

  for (let attempt = 0; attempt < 6; attempt++) {
    const output = await sharp(buffer, { animated: false })
      .rotate()
      .resize(maxWidth, maxHeight, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: currentQuality })
      .toBuffer();

    if (output.length <= maxOutputBytes || currentQuality <= 45) {
      return { data: output, mimeType: "image/webp" };
    }

    currentQuality -= 10;
  }

  throw Object.assign(
    new Error(
      "We could not compress that image enough to save it. Please try a smaller photo."
    ),
    { status: 400 }
  );
}

export function friendlyImageUploadError(error) {
  const message = error?.message || "";

  if (message.includes("max_allowed_packet")) {
    return "That image is too large to save. Please try a smaller photo (under 10 MB).";
  }
  if (message.includes("ER_NET_PACKET_TOO_LARGE")) {
    return "That image is too large to save. Please try a smaller photo (under 10 MB).";
  }

  return message || "Failed to upload image.";
}
