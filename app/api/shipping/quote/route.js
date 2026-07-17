import { NextResponse } from "next/server";
import { getShippingQuote } from "@/lib/shipping";

export const dynamic = "force-dynamic";

// POST /api/shipping/quote  { district, city?, subtotal, items? }
export async function POST(request) {
  try {
    const body = await request.json();
    const quote = getShippingQuote({
      district: body.district,
      city: body.city ?? "",
      subtotal: body.subtotal,
    });

    if (quote.error) {
      return NextResponse.json(quote, { status: 400 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("POST /api/shipping/quote error:", error);
    return NextResponse.json(
      { error: "Failed to calculate delivery charge" },
      { status: 500 }
    );
  }
}
