import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseServer";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

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
  } catch (error) {
    console.error("Paystack refund failed:", error);
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 401 }
    );
  }

  const rawBody = await req.text();

  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let event: any;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const transaction = event.data;
  const reference = transaction?.reference;

  if (!reference) {
    return NextResponse.json(
      { error: "Missing transaction reference" },
      { status: 400 }
    );
  }

  // The browser callback may already have created the order.
  // If so, this webhook is simply a duplicate notification.
  const { data: existingOrder, error: existingOrderError } =
    await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("paystack_reference", reference)
      .maybeSingle();

  if (existingOrderError) {
    console.error("Webhook order lookup failed:", existingOrderError);
    return NextResponse.json(
      { error: "Could not check existing order" },
      { status: 500 }
    );
  }

  if (existingOrder) {
    return NextResponse.json({
      received: true,
      orderId: existingOrder.id,
    });
  }

  const metadata = transaction?.metadata;

  const items = metadata?.items;
  const location = metadata?.location;
  const phone = metadata?.phone;
  const comments = metadata?.comments ?? null;

  if (!Array.isArray(items) || !items.length || !location || !phone) {
    console.error(
      "Webhook is missing order metadata:",
      JSON.stringify(metadata)
    );

    return NextResponse.json(
      { error: "Missing order metadata" },
      { status: 400 }
    );
  }

  const strippedItems = items.map((item: any) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  // Recalculate the amount from our database.
  const { data: expectedTotal, error: quoteError } =
    await supabaseAdmin.rpc("quote_order", {
      p_items: strippedItems,
    });

  if (quoteError) {
    console.error("Webhook quote failed:", quoteError);

    await refundPaystackTransaction(reference);

    return NextResponse.json(
      { error: "Could not calculate order total" },
      { status: 400 }
    );
  }

  const expectedKobo = Math.round(expectedTotal * 100);

  if (transaction.amount !== expectedKobo) {
    console.error(
      `Webhook amount mismatch. Expected ${expectedKobo}, received ${transaction.amount}`
    );

    await refundPaystackTransaction(reference);

    return NextResponse.json(
      { error: "Payment amount does not match order" },
      { status: 400 }
    );
  }

  const cleanedPhone = phone.replace(/[\s-]/g, "");

  const orderId = `#${Math.floor(10000 + Math.random() * 90000)}`;

  const { data, error } = await supabaseAdmin.rpc("place_order", {
    p_order_id: orderId,
    p_location: location,
    p_phone: cleanedPhone,
    p_comments: comments,
    p_items: strippedItems,
    p_paystack_reference: reference,
  });

  if (error) {
    console.error("Webhook place_order failed:", error);

    if (error.message?.startsWith("INSUFFICIENT_STOCK")) {
      await refundPaystackTransaction(reference);
    } else {
      await refundPaystackTransaction(reference);
    }

    return NextResponse.json(
      { error: "Order could not be completed" },
      { status: 400 }
    );
  }

  console.log(`Webhook created order ${data} for payment ${reference}`);

  return NextResponse.json({
    received: true,
    orderId: data,
  });
}