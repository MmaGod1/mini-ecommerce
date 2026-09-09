"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Product, Order, OrderItem, CartLine } from "@/lib/types";
import { initialProducts } from "@/lib/data";
import { calculateLineTotal } from "@/lib/pricing";

type ShopContextType = {
  products: Product[];
  categories: string[];
  cart: CartLine[];
  orders: Order[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (productId: string) => void;
  updateVariantStock: (
    productId: string,
    variantId: string,
    newStock: number
  ) => void;
  addCategory: (name: string) => void;
  addToCart: (line: CartLine) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  placeOrder: (details: {
    location: string;
    phone: string;
    comments?: string;
  }) => Order;
};

const ShopContext = createContext<ShopContextType | null>(null);

const DEFAULT_CATEGORIES = ["Clothing", "Footwear", "Bags"];

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed]
    );
  }

  function addProduct(p: Product) {
    setProducts((prev) => [...prev, p]);
    addCategory(p.category);
  }

  function updateProduct(updated: Product) {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    addCategory(updated.category);
  }

  function deleteProduct(productId: string) {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  function updateVariantStock(
    productId: string,
    variantId: string,
    newStock: number
  ) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              variants: p.variants.map((v) =>
                v.id === variantId
                  ? { ...v, stock: Math.max(0, newStock) }
                  : v
              ),
            }
      )
    );
  }

  function addToCart(line: CartLine) {
    setCart((prev) => {
      const product = products.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      const stockLimit = variant?.stock ?? Infinity;

      const existing = prev.find((c) => c.variantId === line.variantId);
      if (existing) {
        const cappedQty = Math.min(
          existing.quantity + line.quantity,
          stockLimit
        );
        return prev.map((c) =>
          c.variantId === line.variantId ? { ...c, quantity: cappedQty } : c
        );
      }
      const cappedQty = Math.min(line.quantity, stockLimit);
      return [...prev, { ...line, quantity: cappedQty }];
    });
  }

  function removeFromCart(variantId: string) {
    setCart((prev) => prev.filter((c) => c.variantId !== variantId));
  }

  function clearCart() {
    setCart([]);
  }

  function placeOrder(details: {
    location: string;
    phone: string;
    comments?: string;
  }): Order {
    // Build order line items with their discount applied.
    const items: OrderItem[] = cart.map((line) => {
      const product = products.find((p) => p.id === line.productId);
      const { total, discountPercent } = calculateLineTotal(
        line.unitPrice,
        line.quantity,
        product?.discountTiers
      );
      return { ...line, discountPercent, lineTotal: total };
    });

    // Decrement stock per variant, this is the "sold out at zero" logic.
    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        variants: product.variants.map((v) => {
          const match = cart.find((c) => c.variantId === v.id);
          if (match) {
            return { ...v, stock: Math.max(0, v.stock - match.quantity) };
          }
          return v;
        }),
      }))
    );

    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const order: Order = {
      id: `#${Math.floor(10000 + Math.random() * 90000)}`,
      items,
      total,
      location: details.location,
      phone: details.phone,
      comments: details.comments,
      createdAt: new Date().toISOString(),
      status: "Paid",
    };

    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        addProduct,
        updateProduct,
        deleteProduct,
        updateVariantStock,
        addCategory,
        addToCart,
        removeFromCart,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within a ShopProvider");
  return ctx;
}
