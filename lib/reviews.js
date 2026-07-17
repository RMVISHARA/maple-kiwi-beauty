import { query, withTransaction } from "@/lib/db";
import {
  saveReviewPhotosForReview,
  getReviewPhotoUrls,
  deleteLegacyReviewPhotos,
} from "@/lib/reviewPhotos";

const REVIEW_COLUMNS = `
  r.id, r.product_id, r.user_id, r.author_name, r.rating, r.body, r.photos,
  r.status, r.is_featured, r.created_at,
  p.name AS product_name
`;

function parsePhotos(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

function mapReviewRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    authorName: row.author_name,
    rating: row.rating,
    body: row.body,
    photos: parsePhotos(row.photos),
    status: row.status,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    productName: row.product_name || null,
  };
}

async function attachPhotosToReviews(reviews) {
  if (!reviews.length) return reviews;
  const photoMap = await getReviewPhotoUrls(reviews.map((r) => r.id));
  return reviews.map((r) => ({
    ...r,
    photos: photoMap[r.id]?.length ? photoMap[r.id] : r.photos,
  }));
}

export const FALLBACK_REVIEWS = [
  {
    id: 1,
    productId: 1,
    authorName: "Amaya Perera",
    rating: 5,
    body: "My fine lines have softened after 6 weeks. Lightweight enough for Colombo humidity — no greasy feel at all.",
    photos: [],
    status: "APPROVED",
    isFeatured: true,
    productName: "Retinol 1% in Squalane",
  },
  {
    id: 2,
    productId: 3,
    authorName: "Dilshan Fernando",
    rating: 5,
    body: "Finally something that controls oil in this heat. Breakouts around my T-zone have calmed down noticeably.",
    photos: [],
    status: "APPROVED",
    isFeatured: true,
    productName: "Niacinamide 10% + Zinc 1%",
  },
  {
    id: 3,
    productId: 4,
    authorName: "Nethmi Jayawardena",
    rating: 5,
    body: "Absorbs instantly and my skin feels plump all day. Perfect under makeup in tropical weather.",
    photos: [],
    status: "APPROVED",
    isFeatured: true,
    productName: "Hyaluronic Acid 2% + B5",
  },
  {
    id: 4,
    productId: 5,
    authorName: "Kavindu Silva",
    rating: 5,
    body: "SPF 50 that does not feel heavy — I wear it daily before going out. Authentic Aveeno quality.",
    photos: [],
    status: "APPROVED",
    isFeatured: true,
    productName: "Protect + Hydrate SPF 50 Sunscreen",
  },
  {
    id: 5,
    productId: 2,
    authorName: "Tharushi Wickramasinghe",
    rating: 5,
    body: "Dark spots are fading after a month. Genuine import, fast islandwide delivery. Highly recommend!",
    photos: [],
    status: "APPROVED",
    isFeatured: true,
    productName: "Ascorbyl Glucoside Solution 12%",
  },
];

async function syncProductReviewCount(productId, conn) {
  const sql = `UPDATE products SET reviews_count = (
       SELECT COUNT(*) FROM reviews WHERE product_id = :productId AND status = 'APPROVED'
     ) WHERE id = :productId`;
  if (conn) {
    await conn.execute(sql, { productId });
  } else {
    await query(sql, { productId });
  }
}

export async function getReviews({ productId, status, featured, limit } = {}) {
  let sql = `
    SELECT ${REVIEW_COLUMNS}
    FROM reviews r
    LEFT JOIN products p ON p.id = r.product_id
    WHERE 1=1
  `;
  const params = {};

  if (productId) {
    sql += " AND r.product_id = :productId";
    params.productId = productId;
  }
  if (status) {
    sql += " AND r.status = :status";
    params.status = status;
  }
  if (featured) {
    sql += " AND r.is_featured = 1 AND r.status = 'APPROVED'";
  }

  sql += " ORDER BY r.created_at DESC";

  if (limit) {
    sql += " LIMIT :limit";
    params.limit = limit;
  }

  const rows = await query(sql, params);
  return attachPhotosToReviews(rows.map(mapReviewRow));
}

export async function getReviewById(id) {
  const rows = await query(
    `SELECT ${REVIEW_COLUMNS} FROM reviews r
     LEFT JOIN products p ON p.id = r.product_id
     WHERE r.id = :id`,
    { id }
  );
  const review = mapReviewRow(rows[0]);
  if (!review) return null;
  const [withPhotos] = await attachPhotosToReviews([review]);
  return withPhotos;
}

export async function createReview({ productId, userId, authorName, rating, body, photoFiles = [] }) {
  return withTransaction(async (conn) => {
    const [result] = await conn.execute(
      `INSERT INTO reviews (product_id, user_id, author_name, rating, body, status)
       VALUES (:productId, :userId, :authorName, :rating, :body, 'PENDING')`,
      {
        productId,
        userId: userId || null,
        authorName,
        rating,
        body,
      }
    );

    const reviewId = result.insertId;
    if (photoFiles.length) {
      await saveReviewPhotosForReview(reviewId, photoFiles, conn);
    }

    return reviewId;
  });
}

export async function updateReview(id, { status, isFeatured }) {
  const existing = await getReviewById(id);
  if (!existing) return null;

  const fields = [];
  const params = { id };

  if (status !== undefined) {
    fields.push("status = :status");
    params.status = status;
  }
  if (isFeatured !== undefined) {
    fields.push("is_featured = :isFeatured");
    params.isFeatured = isFeatured ? 1 : 0;
  }

  if (fields.length === 0) return existing;

  await withTransaction(async (conn) => {
    await conn.execute(`UPDATE reviews SET ${fields.join(", ")} WHERE id = :id`, params);

    const oldApproved = existing.status === "APPROVED";
    const newApproved = status === "APPROVED";
    if (oldApproved || newApproved || status !== undefined) {
      await syncProductReviewCount(existing.productId, conn);
    }
  });

  return getReviewById(id);
}

export async function deleteReview(id) {
  const existing = await getReviewById(id);
  if (!existing) return false;

  await withTransaction(async (conn) => {
    await conn.execute("DELETE FROM reviews WHERE id = :id", { id });
    if (existing.status === "APPROVED") {
      await syncProductReviewCount(existing.productId, conn);
    }
  });

  await deleteLegacyReviewPhotos(existing.photos);

  return true;
}

export function filterFallbackReviews({ productId, status, featured, limit } = {}) {
  let list = [...FALLBACK_REVIEWS];
  if (productId) list = list.filter((r) => r.productId === Number(productId));
  if (status) list = list.filter((r) => r.status === status);
  if (featured) list = list.filter((r) => r.isFeatured);
  if (limit) list = list.slice(0, limit);
  return list;
}
