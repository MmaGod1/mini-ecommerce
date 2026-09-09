import { Product } from "./types";

export const initialProducts: Product[] = [
  {
    id: "p1",
    slug: "denim-jacket",
    name: "Denim Jacket",
    category: "Clothing",
    description:
      "Classic unisex denim jacket. Durable stitching, relaxed fit, works for everyday wear or layering.",
    variants: [
      { id: "p1-blue", color: "Blue", price: 12500, stock: 12 },
      { id: "p1-black", color: "Black", price: 12500, stock: 0 },
      { id: "p1-lightwash", color: "Light Wash", price: 13000, stock: 5 },
    ],
    discountTiers: [
      { minQty: 5, discountPercent: 8 },
      { minQty: 10, discountPercent: 15 },
    ],
  },
  {
    id: "p2",
    slug: "ankara-sneakers",
    name: "Ankara Print Sneakers",
    category: "Footwear",
    description:
      "Canvas sneakers with bold Ankara print panels. Comfortable everyday wear with a standout look.",
    variants: [
      { id: "p2-redprint", color: "Red Print", price: 9500, stock: 8 },
      { id: "p2-blueprint", color: "Blue Print", price: 9500, stock: 3 },
    ],
    discountTiers: [{ minQty: 10, discountPercent: 12 }],
  },
  {
    id: "p3",
    slug: "leather-weekend-bag",
    name: "Leather Weekend Bag",
    category: "Bags",
    description:
      "Spacious weekend bag in genuine leather. Fits airline carry-on sizing, with a detachable shoulder strap.",
    variants: [
      { id: "p3-brown", color: "Brown", price: 22000, stock: 4 },
      { id: "p3-black", color: "Black", price: 22000, stock: 2 },
    ],
    // No discount tiers, discounting is optional per product.
  },
  {
    id: "p4",
    slug: "canvas-sneakers",
    name: "Canvas Sneakers",
    category: "Footwear",
    description: "Everyday canvas sneakers. Lightweight, breathable, easy to pair with anything.",
    variants: [
      { id: "p4-white", color: "White", price: 8000, stock: 20 },
      { id: "p4-navy", color: "Navy", price: 8000, stock: 15 },
      { id: "p4-black", color: "Black", price: 8000, stock: 0 },
    ],
    discountTiers: [
      { minQty: 3, discountPercent: 5 },
      { minQty: 10, discountPercent: 10 },
    ],
  },
];
