// A single colour+size option for a product. Each colour, and each size
// within a colour, tracks its own stock, so "Black, size 40" can sell out
// while "Black, size 42" or "Red, size 40" stay available. Size is
// optional, products that don't need it (bags, caps) just leave it blank.
export type Variant = {
  id: string;
  color: string;
  size?: string;
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

// A cross-product bundle deal, e.g. "buy any 5 of these hand-picked
// products, get 10% off". Separate from DiscountTier, which only ever
// looks at quantity of ONE product. A bundle looks at how many DISTINCT
// eligible products are in the cart, not how many of any single one.
export type Bundle = {
  id: string;
  name: string;
  minItems: number;
  discountPercent: number;
  productIds: string[];
};

export type CartLine = {
  productId: string;
  productName: string;
  variantId: string;
  color: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
};

export type OrderItem = CartLine & {
  discountPercent: number;
  bundleDiscountPercent: number;
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
