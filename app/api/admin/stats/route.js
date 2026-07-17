import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/stats  -> dashboard metrics (admin only)
export async function GET(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Income excludes cancelled orders.
    const [income] = await query(
      "SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS paidOrders FROM orders WHERE status <> 'CANCELLED'"
    );
    const [orderCounts] = await query(
      `SELECT
         COUNT(*) AS totalOrders,
         SUM(status = 'PENDING') AS pendingOrders,
         SUM(status = 'DELIVERED') AS deliveredOrders
       FROM orders`
    );
    const [productCounts] = await query(
      "SELECT COUNT(*) AS totalProducts, SUM(in_stock = 0) AS outOfStock FROM products"
    );
    const [customerCount] = await query(
      "SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'"
    );
    const recentOrders = await query(
      "SELECT id, customer_name, customer_email, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5"
    );
    const topProducts = await query(
      `SELECT product_name, brand, SUM(quantity) AS unitsSold, SUM(line_total) AS revenue
       FROM order_items
       GROUP BY product_name, brand
       ORDER BY unitsSold DESC
       LIMIT 5`
    );

    return NextResponse.json({
      revenue: Number(income.revenue) || 0,
      totalOrders: Number(orderCounts.totalOrders) || 0,
      pendingOrders: Number(orderCounts.pendingOrders) || 0,
      deliveredOrders: Number(orderCounts.deliveredOrders) || 0,
      totalProducts: Number(productCounts.totalProducts) || 0,
      outOfStock: Number(productCounts.outOfStock) || 0,
      totalCustomers: Number(customerCount.totalCustomers) || 0,
      recentOrders,
      topProducts,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Failed to load stats", details: error.message },
      { status: 500 }
    );
  }
}
