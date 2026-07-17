import { pool, query } from "@/lib/db";

export function productImageUrl(productId) {
  return `/api/products/${productId}/image`;
}

export function variantImageUrl(variantId) {
  return `/api/products/variants/${variantId}/image`;
}

export function imageUploadUrl(uploadId) {
  return `/api/image-uploads/${uploadId}`;
}

/** Save an uploaded file buffer to the staging table (admin upload step). */
export async function saveImageUpload(buffer, mimeType) {
  const [result] = await pool.execute(
    "INSERT INTO image_uploads (image_data, image_mime_type) VALUES (:data, :mimeType)",
    { data: buffer, mimeType }
  );
  return result.insertId;
}

export async function getImageUpload(id) {
  const rows = await query(
    "SELECT image_data, image_mime_type FROM image_uploads WHERE id = :id",
    { id }
  );
  return rows[0] || null;
}

export async function deleteImageUpload(id) {
  await pool.execute("DELETE FROM image_uploads WHERE id = :id", { id });
}

/** Copy a staged upload into a product row and remove the staging record. */
export async function attachUploadToProduct(productId, uploadId) {
  const upload = await getImageUpload(uploadId);
  if (!upload) return false;

  await pool.execute(
    `UPDATE products
     SET image_data = :data, image_mime_type = :mimeType, image = :image
     WHERE id = :productId`,
    {
      data: upload.image_data,
      mimeType: upload.image_mime_type,
      image: productImageUrl(productId),
      productId,
    }
  );
  await deleteImageUpload(uploadId);
  return true;
}

/** Fetch stored image bytes for a product (null if only a static path is used). */
export async function getProductImage(productId) {
  const rows = await query(
    "SELECT image_data, image_mime_type, image FROM products WHERE id = :id",
    { id: productId }
  );
  const row = rows[0];
  if (!row?.image_data) return null;
  return { data: row.image_data, mimeType: row.image_mime_type || "image/png" };
}

export function additionalImageUrl(imageId) {
  return `/api/product-images/${imageId}/image`;
}

/** Copy a staged upload into product_images and remove the staging record. */
export async function attachAdditionalUploadToProduct(productId, uploadId) {
  const upload = await getImageUpload(uploadId);
  if (!upload) return null;

  const [result] = await pool.execute(
    `INSERT INTO product_images (product_id, image, image_data, image_mime_type)
     VALUES (:productId, '', :data, :mimeType)`,
    {
      productId,
      data: upload.image_data,
      mimeType: upload.image_mime_type,
    }
  );
  const newImageId = result.insertId;
  const imageUrl = additionalImageUrl(newImageId);

  await pool.execute(
    `UPDATE product_images SET image = :imageUrl WHERE id = :imageId`,
    { imageUrl, imageId: newImageId }
  );

  await deleteImageUpload(uploadId);
  return imageUrl;
}

/** Fetch stored image bytes for an additional product image. */
export async function getAdditionalImage(imageId) {
  const rows = await query(
    "SELECT image_data, image_mime_type FROM product_images WHERE id = :id",
    { id: imageId }
  );
  const row = rows[0];
  if (!row?.image_data) return null;
  return { data: row.image_data, mimeType: row.image_mime_type || "image/png" };
}

/** Copy a staged upload into a variant row and remove the staging record. */
export async function attachUploadToVariant(variantId, uploadId) {
  const upload = await getImageUpload(uploadId);
  if (!upload) return false;

  await pool.execute(
    `UPDATE product_variants
     SET image_data = :data, image_mime_type = :mimeType, image = :image
     WHERE id = :variantId`,
    {
      data: upload.image_data,
      mimeType: upload.image_mime_type,
      image: variantImageUrl(variantId),
      variantId,
    }
  );
  await deleteImageUpload(uploadId);
  return true;
}

/** Fetch stored image bytes for a variant (null if only a static path is used). */
export async function getVariantImage(variantId) {
  const rows = await query(
    "SELECT image_data, image_mime_type, image FROM product_variants WHERE id = :id",
    { id: variantId }
  );
  const row = rows[0];
  if (!row?.image_data) return null;
  return { data: row.image_data, mimeType: row.image_mime_type || "image/png" };
}
