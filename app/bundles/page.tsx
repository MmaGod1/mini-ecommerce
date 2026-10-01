"use client";

import Link from "next/link";
import { useShop } from "@/context/ShopContext";

export default function BundlesPage() {
  const { bundles, products, loading } = useShop();

  if (loading) {
    return <p className="text-center py-10 text-ink-500">Loading bundle deals...</p>;
  }

  if (bundles.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-xl font-bold text-ink-900 mb-2">
          Bundle Deals
        </h1>
        <p className="text-sm text-ink-500">
          There are no bundle deals available right now.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-ink-900 mb-2">Bundle Deals</h1>
      <p className="text-sm text-ink-500 mb-6">
        Choose different eligible products to unlock automatic bundle
        discounts.
      </p>

      <div className="space-y-6">
        {bundles.map((bundle) => {
          const eligibleProducts = products.filter((product) =>
            bundle.productIds.includes(product.id)
          );

          return (
            <section
              key={bundle.id}
              className="bg-white rounded-lg card-shadow p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-ink-900">
                    {bundle.name}
                  </h2>
                  <p className="text-sm text-ink-600 mt-1">
                    Choose any {bundle.minItems} different products and get{" "}
                    <span className="font-bold text-gold-700">
                      {bundle.discountPercent}% off
                    </span>
                    .
                  </p>
                </div>

                <Link
                  href="/"
                  className="self-start sm:self-auto px-4 py-2 rounded-full bg-gold-600 text-white text-sm font-semibold hover:bg-gold-700"
                >
                  Shop products
                </Link>
              </div>

              <p className="text-xs text-ink-500 mb-3">
                You need {bundle.minItems} different eligible products.
                Buying more than one variant or quantity of the same product
                does not count as another product.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {eligibleProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="rounded-lg border border-gold-100 overflow-hidden hover:border-gold-400 transition-colors"
                  >
                    <div className="aspect-square bg-gold-50">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-ink-400">
                          No image
                        </div>
                      )}
                    </div>

                    <p className="p-2 text-sm font-semibold text-ink-900 truncate">
                      {product.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}