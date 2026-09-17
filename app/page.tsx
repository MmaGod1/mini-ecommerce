"use client";

import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const { products, categories, loading, productsError, refreshProducts } =
    useShop();
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

      {productsError && products.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-red-600 text-sm font-semibold mb-2">
            {productsError}
          </p>
          <button
            onClick={() => refreshProducts()}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gold-600 text-white hover:bg-gold-700"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-ink-500 text-sm text-center py-10">
          {loading ? "Loading products..." : "No products match your search."}
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
