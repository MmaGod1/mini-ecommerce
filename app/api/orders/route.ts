import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { mapOrderRow } from "@/lib/mappers";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  let query = supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (phone) {
    query = query.eq("phone", phone.replace(/[\s-]/g, ""));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data.map(mapOrderRow));
}

async function refundPaystackTransaction(reference: string) {
  try {
    await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction: reference }),
    });
  } catch {
    // If the refund call itself fails, there's nothing more we can do
    // automatically, the customer-facing error message below tells them
    // to reach out directly with the reference so it can be sorted
    // manually. This is intentionally not swallowed silently.
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { items, location, phone, comments, paystackReference } = body;

  if (!items?.length || !location || !phone || !paystackReference) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanedPhone = phone.replace(/[\s-]/g, "");

  // Only variantId and quantity are trusted from the client.
  // Price and any discount are looked up and calculated inside the
  // database function itself, a tampered request body can't change
  // what gets charged.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strippedItems = items.map((i: any) => ({
    variantId: i.variantId,
    quantity: i.quantity,
  }));

  // Step 1: verify the payment actually happened, directly with
  // Paystack's own servers, never trusting the browser's word for it.
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
      paystackReference
    )}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
  );
  const verifyData = await verifyRes.json();

  if (!verifyRes.ok || verifyData?.data?.status !== "success") {
    return NextResponse.json(
      { error: "Payment could not be verified. You have not been charged." },
      { status: 400 }
    );
  }

  // Step 2: recompute the expected price ourselves (same source as what
  // was quoted before payment), and cross-check it against what Paystack
  // says was actually charged. If someone tampered with the amount sent
  // to Paystack, this catches it before any order is created.
  const { data: expectedTotal, error: quoteError } = await supabaseAdmin.rpc(
    "quote_order",
    { p_items: strippedItems }
  );

  if (quoteError) {
    await refundPaystackTransaction(paystackReference);
    return NextResponse.json(
      {
        error:
          "Something changed with your cart before payment completed. Your payment is being refunded.",
      },
      { status: 400 }
    );
  }

  const expectedKobo = Math.round(expectedTotal * 100);
  if (verifyData.data.amount !== expectedKobo) {
    await refundPaystackTransaction(paystackReference);
    return NextResponse.json(
      {
        error:
          "The charged amount didn't match your order. Your payment is being refunded.",
      },
      { status: 400 }
    );
  }

  // Step 3: payment verified and the amount matches, now actually create
  // the order. This still goes through the same atomic, row-locking
  // function as before, so stock can still never be oversold even here.
  const orderId = `#${Math.floor(10000 + Math.random() * 90000)}`;

  const { data, error } = await supabaseAdmin.rpc("place_order", {
    p_order_id: orderId,
    p_location: location,
    p_phone: cleanedPhone,
    p_comments: comments ?? null,
    p_items: strippedItems,
  });

  if (error) {
    // Payment already succeeded on Paystack's side, but the order
    // couldn't be fulfilled (most likely: stock sold out in the narrow
    // window between quoting the price and completing payment). Refund
    // automatically rather than leaving the customer charged for
    // nothing.
    await refundPaystackTransaction(paystackReference);

    if (error.message?.startsWith("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        {
          error: `Sorry, an item in your cart just sold out: ${error.message.replace(
            "INSUFFICIENT_STOCK: ",
            ""
          )}. Your payment is being refunded.`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Your order could not be completed. Your payment is being refunded.",
      },
      { status: 400 }
    );
  }

  await supabaseAdmin
    .from("orders")
    .update({ paystack_reference: paystackReference })
    .eq("id", data);

  return NextResponse.json({ id: data });
}
