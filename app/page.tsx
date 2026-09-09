"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const { products, categories } = useShop();
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const tabs = ["All", ...categories];

  const filtered = products.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesQuery =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500">
          &#128269;
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-full bg-white border border-gold-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-gold-500 card-shadow"
        />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              category === c
                ? "bg-gold-500 text-white"
                : "bg-gold-100 text-gold-700 hover:bg-gold-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-500 text-sm text-center py-10">
          No products match your search.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
