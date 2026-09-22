"use client";

import { useState } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { formatNaira } from "@/lib/pricing";

const LOW_STOCK_THRESHOLD = 2;

export default function AdminDashboard() {
  const { products, updateVariantStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  async function handleStockChange(
    productId: string,
    variantId: string,
    newStock: number
  ) {
    try {
      await updateVariantStock(productId, variantId, newStock);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update stock.");
    }
  }

  return (
    <div>
            <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="text-xl font-bold text-ink-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-gold-600 text-white hover:bg-gold-700"
        >
          + Add Product
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products by name or slug..."
        className="w-full rounded-full bg-white border border-gold-200 px-4 py-2 text-sm outline-none focus:border-gold-500 card-shadow mb-5"
      />

      {filteredProducts.length === 0 ? (
        <p className="text-ink-500 text-sm text-center py-10">
          {products.length === 0
            ? "No products yet."
            : "No products match your search."}
        </p>
      ) : (
      <div className="space-y-4">
        {filteredProducts.map((p) => {
          const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
          const isSoldOut = totalStock === 0;
          return (
            <div key={p.id} className="bg-white rounded-lg card-shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-gold-50 flex items-center justify-center overflow-hidden shrink-0">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gold-200" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      isSoldOut ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {isSoldOut ? "Sold Out" : "Available"}
                  </span>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-gold-400 text-gold-700 hover:bg-gold-50"
                  >
                    Edit
                  </Link>
                </div>
              </div>

              {p.discountTiers && p.discountTiers.length > 0 && (
                <p className="text-xs text-gold-600 mt-2">
                  Discounts:{" "}
                  {p.discountTiers
                    .map((t) => `${t.minQty}+ = ${t.discountPercent}% off`)
                    .join(", ")}
                </p>
              )}

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {p.variants.map((v) => {
                  const isLow =
                    v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <div
                      key={v.id}
                      className={`rounded-md px-3 py-2 text-sm flex items-center justify-between ${
                        isLow ? "bg-amber-50 border border-amber-300" : "bg-gold-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden shrink-0">
                          {v.imageUrl || p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={v.imageUrl || p.imageUrl}
                              alt={v.color}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gold-200" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 truncate">
                            {v.color}
                            {v.size ? `, Size ${v.size}` : ""}
                          </p>
                          <p className="text-xs text-ink-500">
                            {formatNaira(v.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isLow && !isSoldOut && (
                          <span className="text-[10px] font-bold text-amber-700">
                            Low
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleStockChange(p.id, v.id, v.stock - 1)
                          }
                          className="w-6 h-6 rounded bg-white border border-gold-300 text-gold-700 font-bold text-xs"
                        >
                          &minus;
                        </button>
                        <span
                          className={`w-6 text-center text-xs font-bold ${
                            v.stock === 0 ? "text-red-600" : "text-ink-700"
                          }`}
                        >
                          {v.stock}
                        </span>
                        <button
                          onClick={() =>
                            handleStockChange(p.id, v.id, v.stock + 1)
                          }
                          className="w-6 h-6 rounded bg-white border border-gold-300 text-gold-700 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                                })}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}