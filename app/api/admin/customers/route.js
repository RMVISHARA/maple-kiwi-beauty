import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/customers  -> everyone who has ordered, with spend totals (admin only)
export async function GET(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Aggregate orders by customer (keyed on email, falling back to name).
    const customers = await query(
      `SELECT
         COALESCE(NULLIF(customer_email, ''), customer_name) AS customerKey,
         MAX(customer_name) AS name,
         MAX(customer_email) AS email,
         MAX(customer_phone) AS phone,
         COUNT(*) AS orderCount,
         SUM(total) AS totalSpent,
         MAX(created_at) AS lastOrder
       FROM orders
       GROUP BY customerKey
       ORDER BY totalSpent DESC`
    );

    return NextResponse.json(
      customers.map((c) => ({
        name: c.name,
        email: c.email,
        phone: c.phone,
        orderCount: Number(c.orderCount) || 0,
        totalSpent: Number(c.totalSpent) || 0,
        lastOrder: c.lastOrder,
      }))
    );
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json(
      { error: "Failed to load customers", details: error.message },
      { status: 500 }
    );
  }
}
