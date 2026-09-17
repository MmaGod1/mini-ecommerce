import { Product, Variant, DiscountTier, Order, OrderItem, Bundle } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProductRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    imageUrl: row.image_url ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: (row.variants ?? []).map(
      (v: any): Variant => ({
        id: v.id,
        color: v.color,
        size: v.size ?? undefined,
        price: v.price,
        stock: v.stock,
        imageUrl: v.image_url ?? undefined,
      })
    ),
    discountTiers:
      row.discount_tiers && row.discount_tiers.length > 0
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          row.discount_tiers.map(
            (t: any): DiscountTier => ({
              minQty: t.min_qty,
              discountPercent: t.discount_percent,
            })
          )
        : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    location: row.location,
    phone: row.phone,
    comments: row.comments ?? undefined,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (row.order_items ?? []).map(
      (i: any): OrderItem => ({
        productId: i.product_id ?? "",
        productName: i.product_name,
        variantId: i.variant_id,
        color: i.color,
        size: i.size ?? undefined,
        unitPrice: i.unit_price,
        quantity: i.quantity,
        discountPercent: i.discount_percent,
        bundleDiscountPercent: i.bundle_discount_percent ?? 0,
        lineTotal: i.line_total,
        imageUrl: i.image_url ?? undefined,
      })
    ),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBundleRow(row: any): Bundle {
  return {
    id: row.id,
    name: row.name,
    minItems: row.min_items,
    discountPercent: row.discount_percent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productIds: (row.bundle_products ?? []).map((bp: any) => bp.product_id),
  };
}
