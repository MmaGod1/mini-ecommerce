import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

async function insertProductWithUniqueSlug(
  baseSlug: string,
  productData: {
    name: string;
    category: string;
    description: string | null;
    image_url: string | null;
  }
) {
  let slug = baseSlug;
  let attempt = 0;
  const maxAttempts = 20;

  while (attempt < maxAttempts) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({ ...productData, slug })
      .select()
      .single();

    if (!error) return data;

    const isSlugCollision =
      error.code === "23505" && error.message.includes("products_slug_key");

    if (!isSlugCollision) {
      throw error;
    }

    attempt += 1;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  throw new Error(
    "Could not generate a unique identifier for this product after several attempts."
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, slug, category, description, imageUrl, variants, discountTiers } =
    body;

    let product;
  try {
    product = await insertProductWithUniqueSlug(slug, {
      name,
      category,
      description: description ?? null,
      image_url: imageUrl ?? null,
    });
  } catch (err) {
    console.error("[admin/products] insert failed:", err);
    return NextResponse.json(
      { error: "Something went wrong saving this product. Please try again." },
      { status: 400 }
    );
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
