"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product, CartLine } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { mapProductRow } from "@/lib/mappers";

type ShopContextType = {
  products: Product[];
  categories: string[];
  cart: CartLine[];
  loading: boolean;
  productsError: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateVariantStock: (
    productId: string,
    variantId: string,
    newStock: number
  ) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  addToCart: (line: CartLine) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  placeOrder: (details: {
    location: string;
    phone: string;
    comments?: string;
    paystackReference: string;
  }) => Promise<{ id: string }>;
};

const ShopContext = createContext<ShopContextType | null>(null);

const CART_STORAGE_KEY = "yourshop-cart";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function refreshProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*, variants(*), discount_tiers(*)")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setProducts(data.map(mapProductRow));
      setProductsError(null);
      return;
    }

    // Transient network blips happen, so try once more after a short
    // pause before treating this as a real failure worth telling the
    // person about.
    await sleep(800);
    const retry = await supabase
      .from("products")
      .select("*, variants(*), discount_tiers(*)")
      .order("created_at", { ascending: true });

    if (!retry.error && retry.data) {
      setProducts(retry.data.map(mapProductRow));
      setProductsError(null);
    } else {
      console.error(
        "[ShopContext] Could not load products after retrying:",
        retry.error?.message ?? error?.message
      );
      setProductsError(
        "Couldn't load products, check your connection and try again."
      );
    }
  }

  async function refreshCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data.map((c) => c.name));
    }
  }

  // Load any cart saved from a previous visit. cartHydrated starts
  // false, so the save-effect below is guaranteed to skip its very
  // first run rather than overwrite a save it hasn't read yet. Using
  // STATE (not a ref) for that flag is what actually matters here:
  // setCart and setCartHydrated below are called together and become
  // visible on the same next render, so the save-effect can never see
  // "hydrated" without cart having already caught up alongside it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      // Corrupt or inaccessible storage, just start with an empty cart.
    } finally {
      setCartHydrated(true);
    }
  }, []);

  // Persist the cart on every change, so refreshing the page, or
  // closing and reopening the tab, doesn't lose what's in it.
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage errors (e.g. private browsing quota limits).
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([refreshProducts(), refreshCategories()]);
      setLoading(false);
    })();
  }, []);

  async function throwIfNotOk(res: Response) {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error("Your admin session has expired. Please log in again.");
      }
      throw new Error(data.error ?? "Something went wrong. Please try again.");
    }
  }

  async function addProduct(p: Product) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    await throwIfNotOk(res);
    await Promise.all([refreshProducts(), refreshCategories()]);
  }

  async function updateProduct(p: Product) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    await throwIfNotOk(res);
    await Promise.all([refreshProducts(), refreshCategories()]);
  }

  async function deleteProduct(productId: string) {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    await throwIfNotOk(res);
    await refreshProducts();
  }

  async function updateVariantStock(
    productId: string,
    variantId: string,
    newStock: number
  ) {
    const res = await fetch(`/api/admin/variants/${variantId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock }),
    });
    await throwIfNotOk(res);
    await refreshProducts();
  }

  async function addCategory(name: string) {
    if (!name.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await throwIfNotOk(res);
    await refreshCategories();
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

  async function placeOrder(details: {
    location: string;
    phone: string;
    comments?: string;
    paystackReference: string;
  }): Promise<{ id: string }> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        location: details.location,
        phone: details.phone,
        comments: details.comments,
        paystackReference: details.paystackReference,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? "Could not place order");
    }

    clearCart();
    await refreshProducts();
    return { id: data.id as string };
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        cart,
        loading,
        productsError,
        refreshProducts,
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
