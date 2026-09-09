import { DiscountTier } from "./types";

/**
 * Finds the best discount tier that applies to a given quantity.
 * Tiers are per-product and optional. A product with no tiers simply
 * never discounts, regardless of quantity.
 *
 * If several tiers qualify (e.g. 5+ and 10+ for a qty of 12),
 * the highest qualifying minQty wins.
 */
export function getApplicableDiscount(
  qty: number,
  tiers?: DiscountTier[]
): DiscountTier | null {
  if (!tiers || tiers.length === 0) return null;
  const qualifying = tiers
    .filter((t) => qty >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty);
  return qualifying[0] ?? null;
}

export function calculateLineTotal(
  unitPrice: number,
  qty: number,
  tiers?: DiscountTier[]
) {
  const discount = getApplicableDiscount(qty, tiers);
  const discountPercent = discount?.discountPercent ?? 0;
  const subtotal = unitPrice * qty;
  const total = Math.round(subtotal * (1 - discountPercent / 100));
  return { subtotal, total, discountPercent };
}

export function formatNaira(amount: number): string {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}
