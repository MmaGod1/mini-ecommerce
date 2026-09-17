import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { mapBundleRow } from "@/lib/mappers";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bundles")
    .select("*, bundle_products(product_id)")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data.map(mapBundleRow));
}

export async function POST(req: Request) {
  const { name, minItems, discountPercent, productIds } = await req.json();

  if (!name?.trim() || !minItems || !discountPercent || !productIds?.length) {
    return NextResponse.json(
      { error: "Name, minimum items, discount, and at least one product are required." },
      { status: 400 }
    );
  }

  const { data: bundle, error } = await supabaseAdmin
    .from("bundles")
    .insert({
      name: name.trim(),
      min_items: minItems,
      discount_percent: discountPercent,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { error: linkError } = await supabaseAdmin.from("bundle_products").insert(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productIds.map((productId: string) => ({
      bundle_id: bundle.id,
      product_id: productId,
    }))
  );

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 400 });
  }

  return NextResponse.json({ id: bundle.id });
}
