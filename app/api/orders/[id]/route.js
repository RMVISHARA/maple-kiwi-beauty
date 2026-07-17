import { NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET /api/orders/:id  (admin only)
export async function GET(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const { id } = await params;
    const order = await getOrderById(Number(id));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/orders/:id  { status }  (admin only)
export async function PUT(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const { id } = await params;
    const { status } = await request.json();
    const previous = await getOrderById(Number(id));
    if (!previous) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const ok = await updateOrderStatus(Number(id), status);
    if (!ok) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = await getOrderById(Number(id));

    // Email the customer when status moves away from PENDING (or changes again).
    const nextStatus = String(status || "").toUpperCase();
    const shouldNotify =
      order &&
      nextStatus !== "PENDING" &&
      nextStatus !== String(previous.status || "").toUpperCase();

    let emailResult = null;
    if (shouldNotify) {
      try {
        emailResult = await sendOrderStatusEmail(order);
      } catch (emailError) {
        console.error(`PUT /api/orders/[id] email error for order #${id}:`, emailError);
        emailResult = { error: emailError.message };
      }
    }

    return NextResponse.json({ ...order, email: emailResult });
  } catch (error) {
    const code = error.status || 500;
    if (code === 500) console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: code });
  }
}
