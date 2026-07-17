import { query, pool } from "@/lib/db";

export { FALLBACK_CATEGORIES, CATEGORY_CUSTOM, resolveCategorySelect } from "@/lib/categoryData";

function mapCategoryRow(row) {
  return {
    id: row.id,
    name: row.name,
    productCount: Number(row.product_count ?? row.productCount ?? 0),
  };
}

export async function getAllCategories() {
  const rows = await query(
    `SELECT c.id, c.name,
            (SELECT COUNT(*) FROM products p WHERE p.category = c.name) AS product_count
     FROM categories c
     ORDER BY c.sort_order ASC, c.name ASC`
  );
  return rows.map(mapCategoryRow);
}

export async function createCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Category name is required");
  }
  if (trimmed.length > 100) {
    throw new Error("Category name must be 100 characters or less");
  }

  const existing = await query("SELECT id FROM categories WHERE LOWER(name) = LOWER(:name)", {
    name: trimmed,
  });
  if (existing.length > 0) {
    throw new Error("This category already exists");
  }

  const [result] = await pool.execute(
    `INSERT INTO categories (name, sort_order)
     SELECT :name, COALESCE(MAX(sort_order), 0) + 1 FROM categories`,
    { name: trimmed }
  );

  return { id: result.insertId, name: trimmed, productCount: 0 };
}

export async function deleteCategory(id) {
  const rows = await query(
    `SELECT c.id, c.name,
            (SELECT COUNT(*) FROM products p WHERE p.category = c.name) AS product_count
     FROM categories c
     WHERE c.id = :id`,
    { id }
  );
  if (rows.length === 0) return false;

  const category = mapCategoryRow(rows[0]);
  if (category.productCount > 0) {
    throw new Error(
      `Cannot delete "${category.name}" — ${category.productCount} product${category.productCount === 1 ? "" : "s"} still use it`
    );
  }

  const [result] = await pool.execute("DELETE FROM categories WHERE id = :id", { id });
  return result.affectedRows > 0;
}

/** Create the category row if it does not exist yet (e.g. when saving a product). */
export async function ensureCategory(name) {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  const existing = await query("SELECT id, name FROM categories WHERE LOWER(name) = LOWER(:name)", {
    name: trimmed,
  });
  if (existing.length > 0) return existing[0].name;

  await pool.execute(
    `INSERT INTO categories (name, sort_order)
     SELECT :name, COALESCE(MAX(sort_order), 0) + 1 FROM categories`,
    { name: trimmed }
  );
  return trimmed;
}
