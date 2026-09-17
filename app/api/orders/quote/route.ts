import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { items } = await req.json();

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strippedItems = items.map((i: any) => ({
    variantId: i.variantId,
    quantity: i.quantity,
  }));

  const { data, error } = await supabaseAdmin.rpc("quote_order", {
    p_items: strippedItems,
  });

  if (error) {
    if (error.message?.startsWith("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        { error: "One or more items in your cart no longer have enough stock." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ total: data as number });
}
