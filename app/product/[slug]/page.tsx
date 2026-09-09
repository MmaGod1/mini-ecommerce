"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { calculateLineTotal, formatNaira } from "@/lib/pricing";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { products, cart, addToCart } = useShop();

  const product = products.find((p) => p.slug === slug);

  const [selectedVariantId, setSelectedVariantId] = useState(
    product?.variants.find((v) => v.stock > 0)?.id ?? product?.variants[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product?.variants.find((v) => v.id === selectedVariantId);

  // How many of this exact colour are already sitting in the cart,
  // so we never let someone add more than what's actually in stock.
  const alreadyInCart =
    cart.find((c) => c.variantId === variant?.id)?.quantity ?? 0;
  const remainingStock = variant
    ? Math.max(variant.stock - alreadyInCart, 0)
    : 0;

  const pricing = useMemo(() => {
    if (!variant) return null;
    return calculateLineTotal(variant.price, quantity, product?.discountTiers);
  }, [variant, quantity, product]);

  if (!product || !variant) {
    return <p className="text-ink-700">Product not found.</p>;
  }

  const isSoldOut = variant.stock === 0;
  const atCartLimit = !isSoldOut && remainingStock === 0;
  const maxQty = Math.max(remainingStock, 1);

  function handleAddToCart() {
    if (!variant || !product || isSoldOut || remainingStock === 0) return;
    const qtyToAdd = Math.min(quantity, remainingStock);
    addToCart({
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      color: variant.color,
      unitPrice: variant.price,
      quantity: qtyToAdd,
      imageUrl: variant.imageUrl || product.imageUrl,
    });
    setQuantity(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gold-50 rounded-lg flex items-center justify-center overflow-hidden">
        {variant.imageUrl || product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={variant.imageUrl || product.imageUrl}
            alt={`${product.name} - ${variant.color}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gold-200" />
        )}
      </div>

      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gold-600 mb-2"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-ink-900">{product.name}</h1>
        <p className="text-ink-500 text-sm mt-1">{product.category}</p>
        <p className="text-ink-700 mt-3 text-sm">{product.description}</p>

        {/* Colour variant picker */}
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink-900 mb-2">Colour</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const soldOut = v.stock === 0;
              const isSelected = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  disabled={soldOut}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    soldOut
                      ? "border-ink-500/20 text-ink-500/50 line-through cursor-not-allowed"
                      : isSelected
                      ? "bg-gold-500 border-gold-500 text-white"
                      : "border-gold-300 text-gold-700 hover:bg-gold-50"
                  }`}
                >
                  {v.color}
                  {soldOut ? " (Sold Out)" : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price + stock */}
        <div className="mt-5">
          <p className="text-2xl font-bold text-gold-700">
            {formatNaira(variant.price)}
          </p>
          <p
            className={`text-sm mt-1 ${
              isSoldOut ? "text-red-600 font-semibold" : "text-ink-500"
            }`}
          >
            {isSoldOut
              ? "Sold Out"
              : variant.stock <= 2
              ? `Only ${variant.stock} left \u2014 order soon`
              : `${variant.stock} in stock`}
          </p>
          {alreadyInCart > 0 && !isSoldOut && (
            <p className="text-xs text-gold-600 mt-0.5">
              {alreadyInCart} already in your cart
            </p>
          )}
        </div>

        {/* Discount tiers info */}
        {product.discountTiers && product.discountTiers.length > 0 && (
          <div className="mt-3 bg-gold-50 border border-gold-200 rounded-lg p-3 text-sm text-gold-700">
            <p className="font-semibold mb-1">Buy more, save more</p>
            <ul className="space-y-0.5">
              {[...product.discountTiers]
                .sort((a, b) => a.minQty - b.minQty)
                .map((t) => (
                  <li key={t.minQty}>
                    Buy {t.minQty}+ &mdash; {t.discountPercent}% off
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Quantity selector */}
        {!isSoldOut && !atCartLimit && (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center bg-gold-50 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 text-gold-700 font-bold"
              >
                &minus;
              </button>
              <span className="w-10 text-center font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="w-9 h-9 text-gold-700 font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-ink-500">
              Max {maxQty} more available
            </span>
          </div>
        )}

        {atCartLimit && (
          <p className="mt-5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            You already have all {variant.stock} available in your cart.
          </p>
        )}

        {/* Live total with discount applied */}
        {pricing && !isSoldOut && !atCartLimit && (
          <div className="mt-4 border-t border-gold-200 pt-4">
            {pricing.discountPercent > 0 && (
              <p className="text-sm text-ink-500 line-through">
                {formatNaira(pricing.subtotal)}
              </p>
            )}
            <p className="text-xl font-bold text-ink-900">
              {formatNaira(pricing.total)}
              {pricing.discountPercent > 0 && (
                <span className="ml-2 text-sm font-semibold text-gold-600">
                  ({pricing.discountPercent}% off applied)
                </span>
              )}
            </p>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={isSoldOut || atCartLimit}
          className={`mt-5 w-full py-3 rounded-full font-bold text-white transition-colors ${
            isSoldOut || atCartLimit
              ? "bg-ink-500/30 cursor-not-allowed"
              : "bg-gold-600 hover:bg-gold-700"
          }`}
        >
          {isSoldOut
            ? "Sold Out"
            : atCartLimit
            ? "Max in Cart"
            : added
            ? "Added!"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
