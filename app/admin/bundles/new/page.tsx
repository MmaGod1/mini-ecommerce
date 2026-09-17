"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";

export default function NewBundlePage() {
  const { products } = useShop();
  const router = useRouter();

  const [name, setName] = useState("");
  const [minItems, setMinItems] = useState("5");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (
      !name.trim() ||
      !minItems ||
      !discountPercent ||
      selectedIds.length === 0
    ) {
      alert(
        "Please name the bundle, set a minimum item count and discount, and pick at least one eligible product."
      );
      return;
    }
    if (selectedIds.length < Number(minItems)) {
      alert(
        `You picked ${selectedIds.length} eligible products, but the minimum is ${minItems}. A customer could never actually reach this deal, pick more products or lower the minimum.`
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          minItems: Number(minItems),
          discountPercent: Number(discountPercent),
          productIds: selectedIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save bundle.");
      router.push("/admin/bundles");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-ink-900 mb-1">
        New Bundle Deal
      </h1>
      <p className="text-sm text-ink-500 mb-5">
        Customers who buy at least this many DIFFERENT products from your
        picked list get a discount, buying more of just one of them doesn't
        count.
      </p>

      <div className="bg-white rounded-lg card-shadow p-5 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gold-700 mb-1">
            Bundle Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mix & Match Footwear Deal"
            className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Minimum different items
            </label>
            <input
              value={minItems}
              onChange={(e) => setMinItems(e.target.value)}
              type="number"
              min="2"
              className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Discount (%)
            </label>
            <input
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              type="number"
              min="1"
              max="100"
              className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gold-700 mb-2">
            Eligible Products ({selectedIds.length} selected)
          </label>
          <div className="border border-gold-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gold-100">
            {products.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-gold-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                />
                <span className="flex-1">{p.name}</span>
                <span className="text-xs text-ink-500">{p.category}</span>
              </label>
            ))}
            {products.length === 0 && (
              <p className="px-3 py-4 text-sm text-ink-500">
                Add some products first.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3 rounded-full font-bold text-white bg-gold-600 hover:bg-gold-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Bundle"}
        </button>
      </div>
    </div>
  );
}
