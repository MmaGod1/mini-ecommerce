import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, slug, category, description, imageUrl, variants, discountTiers } =
    body;

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      slug,
      category,
      description: description ?? null,
      image_url: imageUrl ?? null,
    })
    .select()
    .single();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 400 });
  }

  if (variants?.length) {
    const { error: variantError } = await supabaseAdmin.from("variants").insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants.map((v: any) => ({
        product_id: product.id,
        color: v.color,
        size: v.size ?? null,
        price: v.price,
        stock: v.stock,
        image_url: v.imageUrl ?? null,
      }))
    );
    if (variantError) {
      return NextResponse.json({ error: variantError.message }, { status: 400 });
    }
  }

  if (discountTiers?.length) {
    const { error: tierError } = await supabaseAdmin
      .from("discount_tiers")
      .insert(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        discountTiers.map((t: any) => ({
          product_id: product.id,
          min_qty: t.minQty,
          discount_percent: t.discountPercent,
        }))
      );
    if (tierError) {
      return NextResponse.json({ error: tierError.message }, { status: 400 });
    }
  }

  // Keep the categories lookup table in sync, in case this product used
  // a brand-new category typed into the "+ New" box on the form.
  if (category) {
    await supabaseAdmin
      .from("categories")
      .upsert({ name: category }, { onConflict: "name" });
  }

  return NextResponse.json({ id: product.id });
}
