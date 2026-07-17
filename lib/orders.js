import { query, withTransaction } from "@/lib/db";
import { getShippingQuote } from "@/lib/shipping";

/**
 * Create an order plus its line items inside a single transaction.
 * Totals are computed server-side from the submitted items so the client
 * cannot tamper with pricing.
 */
export async function createOrder({ customer, items, userId = null, paymentMethod = "COD" }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error("Order must contain at least one item"), { status: 400 });
  }
  if (!customer?.name?.trim()) {
    throw Object.assign(new Error("Customer name is required"), { status: 400 });
  }
  if (!customer?.district?.trim()) {
    throw Object.assign(new Error("Delivery district is required"), { status: 400 });
  }
  if (!customer?.phone?.trim()) {
    throw Object.assign(new Error("Contact phone number is required"), { status: 400 });
  }
  if (!customer?.address?.trim()) {
    throw Object.assign(new Error("Delivery address is required"), { status: 400 });
  }

  const normalizedItems = [];
  for (const item of items) {
    const productId = item.id ?? null;
    const variantId = item.variantId ?? null;
    const quantity = Math.max(1, Number(item.quantity) || 1);

    if (!productId) {
      throw Object.assign(new Error("Each item requires a product ID"), { status: 400 });
    }

    const productRows = await query(
      "SELECT name, brand, price FROM products WHERE id = :id",
      { id: productId }
    );
    if (productRows.length === 0) {
      throw Object.assign(new Error(`Product not found: ID ${productId}`), { status: 404 });
    }

    const product = productRows[0];
    let unitPrice = Number(product.price);
    const name = product.name;
    const brand = product.brand ?? null;

    if (variantId) {
      const variantRows = await query(
        "SELECT price FROM product_variants WHERE id = :id AND product_id = :productId",
        { id: variantId, productId }
      );
      if (variantRows.length === 0) {
        throw Object.assign(new Error(`Product variant not found: ID ${variantId}`), { status: 404 });
      }
      unitPrice = Number(variantRows[0].price);
    }

    normalizedItems.push({
      productId,
      productVariantId: variantId,
      name,
      brand,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    });
  }

  const subtotal = normalizedItems.reduce((acc, i) => acc + i.lineTotal, 0);

  const quote = getShippingQuote({
    district: customer.district.trim(),
    city: customer.city?.trim() ?? "",
    subtotal,
  });

  if (quote.error || quote.shipping === null) {
    throw Object.assign(new Error(quote.error || "Invalid delivery location"), { status: 400 });
  }

  const shipping = quote.shipping;
  const total = subtotal + shipping;

  return withTransaction(async (conn) => {
    const [orderResult] = await conn.execute(
      `INSERT INTO orders
        (user_id, customer_name, customer_email, customer_phone, address,
         subtotal, shipping, total, payment_method, status)
       VALUES
        (:userId, :name, :email, :phone, :address,
         :subtotal, :shipping, :total, :paymentMethod, 'PENDING')`,
      {
        userId,
        name: customer.name.trim(),
        email: customer.email ?? null,
        phone: customer.phone ?? null,
        address: [
          customer.address?.trim(),
          customer.city?.trim(),
          customer.district?.trim(),
        ]
          .filter(Boolean)
          .join(", ") || null,
        subtotal,
        shipping,
        total,
        paymentMethod,
      }
    );

    const orderId = orderResult.insertId;

    for (const item of normalizedItems) {
      await conn.execute(
        `INSERT INTO order_items
          (order_id, product_id, product_variant_id, product_name, brand, unit_price, quantity, line_total)
         VALUES
          (:orderId, :productId, :productVariantId, :name, :brand, :unitPrice, :quantity, :lineTotal)`,
        { orderId, ...item }
      );
    }
    // Note: stock is NOT reduced here. It is deducted only when an admin marks
    // the order CONFIRMED or DELIVERED (see updateOrderStatus).

    return {
      id: orderId,
      subtotal,
      shipping,
      total,
      status: "PENDING",
      zone: quote.zone,
      zoneLabel: quote.zoneLabel,
    };
  });
}

export async function getAllOrders() {
  const orders = await query("SELECT * FROM orders ORDER BY created_at DESC");
  if (orders.length === 0) return [];

  const items = await query("SELECT * FROM order_items");
  return orders.map((order) => ({
    ...order,
    items: items.filter((i) => i.order_id === order.id),
  }));
}

export async function getOrdersByUserId(userId) {
  const orders = await query(
    "SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC",
    { userId }
  );
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map((_, i) => `:id${i}`).join(", ");
  const params = Object.fromEntries(orderIds.map((id, i) => [`id${i}`, id]));
  const items = await query(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
    params
  );

  return orders.map((order) => ({
    ...order,
    items: items.filter((i) => i.order_id === order.id),
  }));
}

export async function getOrderById(id) {
  const orders = await query("SELECT * FROM orders WHERE id = :id", { id });
  if (orders.length === 0) return null;

  const items = await query("SELECT * FROM order_items WHERE order_id = :id", { id });
  return { ...orders[0], items };
}

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

// Statuses that indicate the sale is going ahead, so tracked stock is deducted.
const STOCK_DEDUCTING_STATUSES = new Set(["CONFIRMED", "DELIVERED"]);

async function adjustStockForItems(conn, orderId, direction) {
  const [items] = await conn.execute(
    "SELECT product_id, product_variant_id, quantity FROM order_items WHERE order_id = :id",
    { id: orderId }
  );
  for (const item of items) {
    // A line bought a specific variant — adjust that variant's stock instead of
    // the parent product.
    if (item.product_variant_id) {
      if (direction < 0) {
        await conn.execute(
          `UPDATE product_variants
             SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - :quantity, 0)
           WHERE id = :variantId AND stock_quantity IS NOT NULL`,
          { variantId: item.product_variant_id, quantity: item.quantity }
        );
        await conn.execute(
          `UPDATE product_variants
             SET in_stock = 0
           WHERE id = :variantId AND stock_quantity IS NOT NULL AND stock_quantity <= 0`,
          { variantId: item.product_variant_id }
        );
      } else {
        await conn.execute(
          `UPDATE product_variants
             SET stock_quantity = COALESCE(stock_quantity, 0) + :quantity
           WHERE id = :variantId AND stock_quantity IS NOT NULL`,
          { variantId: item.product_variant_id, quantity: item.quantity }
        );
        await conn.execute(
          `UPDATE product_variants
             SET in_stock = 1
           WHERE id = :variantId AND stock_quantity IS NOT NULL AND stock_quantity > 0`,
          { variantId: item.product_variant_id }
        );
      }
      continue;
    }

    if (!item.product_id) continue;
    if (direction < 0) {
      // Deduct — never below zero, and auto out-of-stock at zero.
      await conn.execute(
        `UPDATE products
           SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - :quantity, 0)
         WHERE id = :productId AND stock_quantity IS NOT NULL`,
        { productId: item.product_id, quantity: item.quantity }
      );
      await conn.execute(
        `UPDATE products
           SET in_stock = 0
         WHERE id = :productId AND stock_quantity IS NOT NULL AND stock_quantity <= 0`,
        { productId: item.product_id }
      );
    } else {
      // Restock (order cancelled after being deducted) and re-enable if positive.
      await conn.execute(
        `UPDATE products
           SET stock_quantity = COALESCE(stock_quantity, 0) + :quantity
         WHERE id = :productId AND stock_quantity IS NOT NULL`,
        { productId: item.product_id, quantity: item.quantity }
      );
      await conn.execute(
        `UPDATE products
           SET in_stock = 1
         WHERE id = :productId AND stock_quantity IS NOT NULL AND stock_quantity > 0`,
        { productId: item.product_id }
      );
    }
  }
}

export async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw Object.assign(new Error(`Invalid status. Allowed: ${ORDER_STATUSES.join(", ")}`), {
      status: 400,
    });
  }

  return withTransaction(async (conn) => {
    const [rows] = await conn.execute(
      "SELECT id, stock_deducted FROM orders WHERE id = :id",
      { id }
    );
    if (rows.length === 0) return false;

    const alreadyDeducted = !!rows[0].stock_deducted;
    const shouldDeduct = STOCK_DEDUCTING_STATUSES.has(status);

    if (shouldDeduct && !alreadyDeducted) {
      // Order is confirmed/delivered for the first time — reduce stock now.
      await adjustStockForItems(conn, id, -1);
      await conn.execute("UPDATE orders SET stock_deducted = 1 WHERE id = :id", { id });
    } else if (status === "CANCELLED" && alreadyDeducted) {
      // Cancelling a previously-deducted order returns the stock.
      await adjustStockForItems(conn, id, +1);
      await conn.execute("UPDATE orders SET stock_deducted = 0 WHERE id = :id", { id });
    }

    const [result] = await conn.execute(
      "UPDATE orders SET status = :status WHERE id = :id",
      { status, id }
    );
    return result.affectedRows > 0;
  });
}
