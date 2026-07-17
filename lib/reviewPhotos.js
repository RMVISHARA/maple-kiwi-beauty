import { pool, query } from "@/lib/db";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/imageLimits";
import {
  validateImageFile,
  optimizeImageForStorage,
} from "@/lib/imageUpload";

export const MAX_REVIEW_PHOTOS = 5;

export function reviewPhotoUrl(id) {
  return `/api/review-photos/${id}`;
}

function validateFile(file) {
  validateImageFile(file, MAX_IMAGE_UPLOAD_BYTES);
}

export function filterReviewPhotoFiles(files) {
  const list = (Array.isArray(files) ? files : [files]).filter(
    (file) => file && typeof file.arrayBuffer === "function" && file.size > 0
  );

  if (list.length > MAX_REVIEW_PHOTOS) {
    throw Object.assign(new Error(`You can upload up to ${MAX_REVIEW_PHOTOS} photos.`), { status: 400 });
  }

  list.forEach(validateFile);
  return list;
}

export async function saveReviewPhotosForReview(reviewId, files, conn) {
  const list = filterReviewPhotoFiles(files);
  if (!list.length) return [];

  const executor = conn || pool;
  const urls = [];

  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    const raw = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImageForStorage(raw, {
      maxWidth: 1400,
      maxHeight: 1400,
      maxOutputBytes: 900 * 1024,
    });
    const [result] = await executor.execute(
      `INSERT INTO review_photos (review_id, image_data, image_mime_type, sort_order)
       VALUES (:reviewId, :data, :mimeType, :sortOrder)`,
      { reviewId, data: optimized.data, mimeType: optimized.mimeType, sortOrder: i }
    );
    urls.push(reviewPhotoUrl(result.insertId));
  }

  return urls;
}

export async function getReviewPhoto(id) {
  const rows = await query(
    "SELECT image_data, image_mime_type FROM review_photos WHERE id = :id",
    { id }
  );
  const row = rows[0];
  if (!row?.image_data) return null;
  return { data: row.image_data, mimeType: row.image_mime_type || "image/jpeg" };
}

export async function getReviewPhotoUrls(reviewIds) {
  if (!reviewIds.length) return {};

  const placeholders = reviewIds.map((_, i) => `:id${i}`).join(", ");
  const params = Object.fromEntries(reviewIds.map((id, i) => [`id${i}`, id]));
  const rows = await query(
    `SELECT id, review_id FROM review_photos
     WHERE review_id IN (${placeholders})
     ORDER BY review_id, sort_order, id`,
    params
  );

  const byReview = {};
  for (const row of rows) {
    if (!byReview[row.review_id]) byReview[row.review_id] = [];
    byReview[row.review_id].push(reviewPhotoUrl(row.id));
  }
  return byReview;
}

/** @deprecated Legacy filesystem cleanup for old /images/reviews/ paths. */
export async function deleteReviewPhoto(photoPath) {
  if (!photoPath || !photoPath.startsWith("/images/reviews/")) return;
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filepath = path.join(process.cwd(), "public", photoPath.replace(/^\//, ""));
    await fs.unlink(filepath);
  } catch {
    // File may already be gone.
  }
}

export async function deleteLegacyReviewPhotos(photos) {
  for (const photo of photos || []) {
    if (photo?.startsWith("/images/reviews/")) {
      await deleteReviewPhoto(photo);
    }
  }
}
