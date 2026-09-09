import Link from "next/link";
import { Product } from "@/lib/types";
import { formatNaira } from "@/lib/pricing";

export default function ProductCard({ product }: { product: Product }) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isSoldOut = totalStock === 0;
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block bg-white rounded-lg card-shadow overflow-hidden hover:-translate-y-0.5 transition-transform"
    >
      <div className="aspect-square bg-gold-50 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gold-200" />
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-ink-900 text-sm">{product.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gold-700 font-bold text-sm">
            {minPrice === maxPrice
              ? formatNaira(minPrice)
              : `${formatNaira(minPrice)}\u2013${formatNaira(maxPrice)}`}
          </span>
          {isSoldOut ? (
            <span className="text-xs font-bold text-red-600">Sold Out</span>
          ) : (
            <span className="text-xs text-gold-600">
              {product.variants.length} colour
              {product.variants.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {product.discountTiers && product.discountTiers.length > 0 && (
          <p className="text-[11px] text-gold-600 mt-1">
            Buy {Math.min(...product.discountTiers.map((t) => t.minQty))}+
            and save
          </p>
        )}
      </div>
    </Link>
  );
}
