import { NextResponse } from "next/server";
import { createOrder, getAllOrders, getOrdersByUserId } from "@/lib/orders";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/orders           -> list all orders (admin only)
// GET /api/orders?mine=1    -> current user's orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";

    if (mine) {
      const payload = getUserFromRequest(request);
      if (!payload) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 });
      }
      const orders = await getOrdersByUserId(payload.id);
      return NextResponse.json(orders);
    }

    if (!requireAdmin(request)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders  { customer, items, paymentMethod }
export async function POST(request) {
  try {
    const body = await request.json();

    // Associate the order with a logged-in user when a valid token is present.
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json(
        { error: "Sign in required to place an order" },
        { status: 401 }
      );
    }
    const userId = payload.id;

    const order = await createOrder({
      customer: body.customer || {},
      items: body.items || [],
      paymentMethod: body.paymentMethod || "Bank Transfer",
      userId,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status }
    );
  }
}
