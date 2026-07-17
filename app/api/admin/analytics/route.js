import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/analytics?days=30  (admin only)
export async function GET(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(Math.max(Number(searchParams.get("days")) || 30, 7), 365);

    // Sales grouped by day (excludes cancelled orders).
    const salesRows = await query(
      `SELECT DATE(created_at) AS d, SUM(total) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE status <> 'CANCELLED' AND created_at >= (CURRENT_DATE - INTERVAL :days DAY)
       GROUP BY DATE(created_at)`,
      { days }
    );

    // Build a continuous series for the last N days (fill gaps with zeros).
    const byDate = new Map(
      salesRows.map((r) => [
        new Date(r.d).toISOString().slice(0, 10),
        { revenue: Number(r.revenue) || 0, orders: Number(r.orders) || 0 },
      ])
    );
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setHours(0, 0, 0, 0);
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const point = byDate.get(key) || { revenue: 0, orders: 0 };
      series.push({ date: key, revenue: point.revenue, orders: point.orders });
    }

    const statusBreakdown = await query(
      "SELECT status, COUNT(*) AS count, COALESCE(SUM(total),0) AS total FROM orders GROUP BY status"
    );

    const categoryBreakdown = await query(
      `SELECT p.category AS category, COALESCE(SUM(oi.quantity),0) AS unitsSold, COALESCE(SUM(oi.line_total),0) AS revenue
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       GROUP BY p.category
       ORDER BY revenue DESC`
    );

    const [totals] = await query(
      `SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders
       FROM orders WHERE status <> 'CANCELLED'`
    );
    const revenue = Number(totals.revenue) || 0;
    const orders = Number(totals.orders) || 0;

    return NextResponse.json({
      days,
      series,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: Number(s.count) || 0,
        total: Number(s.total) || 0,
      })),
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        unitsSold: Number(c.unitsSold) || 0,
        revenue: Number(c.revenue) || 0,
      })),
      totalRevenue: revenue,
      totalOrders: orders,
      averageOrderValue: orders ? Math.round(revenue / orders) : 0,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics", details: error.message },
      { status: 500 }
    );
  }
}
