// A single colour option for a product. Each colour tracks its own stock,
// so selling out "Blue" does not affect "Red" of the same product.
export type Variant = {
  id: string;
  color: string;
  price: number;
  stock: number;
  imageUrl?: string;
};

// An optional quantity-based discount rule.
// Example: { minQty: 10, discountPercent: 15 } means
// "buy 10 or more of this product, get 15% off".
// A product can have zero, one, or several tiers (e.g. 5+ = 5%, 10+ = 12%, 20+ = 20%).
export type DiscountTier = {
  minQty: number;
  discountPercent: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  variants: Variant[];
  discountTiers?: DiscountTier[];
};

export type CartLine = {
  productId: string;
  productName: string;
  variantId: string;
  color: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
};

export type OrderItem = CartLine & {
  discountPercent: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  location: string;
  phone: string;
  comments?: string;
  createdAt: string;
  status: "Paid";
};
