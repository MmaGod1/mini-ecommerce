"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { Bundle } from "@/lib/types";

export default function BundlesPage() {
  const { products } = useShop();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBundles() {
    setLoading(true);
    const res = await fetch("/api/admin/bundles");
    const data = await res.json();
    if (res.ok) setBundles(data);
    setLoading(false);
  }

  useEffect(() => {
    loadBundles();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this bundle deal? This can't be undone."
    );
    if (!confirmed) return;
    await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    await loadBundles();
  }

  function productName(id: string) {
    return products.find((p) => p.id === id)?.name ?? "(deleted product)";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Bundle Deals</h1>
          <p className="text-sm text-ink-500 mt-1">
            "Buy N different products from this list, get X% off." Separate
            from the per-product quantity discounts on the product form.
          </p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="px-4 py-2 rounded-full text-sm font-semibold bg-gold-600 text-white hover:bg-gold-700 whitespace-nowrap"
        >
          + New Bundle
        </Link>
      </div>

      {loading ? (
        <p className="text-ink-500 text-sm">Loading...</p>
      ) : bundles.length === 0 ? (
        <p className="text-ink-500 text-sm">
          No bundle deals yet. Create one to offer a discount when customers
          buy several different products together.
        </p>
      ) : (
        <div className="space-y-4">
          {bundles.map((b) => (
            <div key={b.id} className="bg-white rounded-lg card-shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-ink-900">{b.name}</p>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-gold-700 mb-2">
                Buy {b.minItems}+ different items from this list &rarr;{" "}
                {b.discountPercent}% off
              </p>
              <div className="flex flex-wrap gap-1.5">
                {b.productIds.map((id) => (
                  <span
                    key={id}
                    className="text-xs bg-gold-50 text-ink-700 rounded-full px-2.5 py-1"
                  >
                    {productName(id)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
