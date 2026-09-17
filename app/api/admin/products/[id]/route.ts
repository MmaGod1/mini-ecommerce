import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, category, description, imageUrl, variants, discountTiers } =
    body;

  const { error: updateError } = await supabaseAdmin
    .from("products")
    .update({
      name,
      category,
      description: description ?? null,
      image_url: imageUrl ?? null,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // Full replace: simplest way to keep variants/discount tiers in sync
  // with whatever the edit form submitted, rather than diffing rows.
  await supabaseAdmin.from("variants").delete().eq("product_id", id);
  await supabaseAdmin.from("discount_tiers").delete().eq("product_id", id);

  if (variants?.length) {
    const { error } = await supabaseAdmin.from("variants").insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants.map((v: any) => ({
        product_id: id,
        color: v.color,
        size: v.size ?? null,
        price: v.price,
        stock: v.stock,
        image_url: v.imageUrl ?? null,
      }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (discountTiers?.length) {
    const { error } = await supabaseAdmin.from("discount_tiers").insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      discountTiers.map((t: any) => ({
        product_id: id,
        min_qty: t.minQty,
        discount_percent: t.discountPercent,
      }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (category) {
    await supabaseAdmin
      .from("categories")
      .upsert({ name: category }, { onConflict: "name" });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
