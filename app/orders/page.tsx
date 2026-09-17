"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { formatNaira } from "@/lib/pricing";
import { Order } from "@/lib/types";

function OrdersLookup() {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const justPaid = searchParams.get("justPaid") === "1";

  async function runSearch() {
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    setOrders(res.ok ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    if (searchParams.get("phone")) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      {justPaid && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-lg shrink-0">
            &#10003;
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              Payment successful
            </p>
            <p className="text-xs text-green-700">
              Your order is below. A receipt has also been sent to your
              email.
            </p>
          </div>
        </div>
      )}
      <h1 className="text-xl font-bold text-ink-900 mb-2">My Orders</h1>
      <p className="text-sm text-ink-500 mb-4">
        Enter the phone number you used at checkout to see your orders.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="e.g. 08012345678"
          className="flex-1 rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
        />
        <button
          onClick={runSearch}
          className="px-5 rounded-lg bg-gold-600 text-white text-sm font-semibold hover:bg-gold-700"
        >
          Find
        </button>
      </div>

      {loading && (
        <p className="text-sm text-ink-500 text-center py-6">Searching...</p>
      )}

      {!loading && searched && orders.length === 0 && (
        <p className="text-sm text-ink-500 text-center py-6">
          No orders found for that phone number.
        </p>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-lg card-shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-ink-900">{o.id}</p>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                {o.status}
              </span>
            </div>
            <p className="text-xs text-ink-500 mb-3">
              {new Date(o.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              &middot; Delivering to {o.location}
            </p>
            <div className="space-y-2">
              {o.items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-gold-50 flex items-center justify-center overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gold-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">
                      {item.productName} &middot; {item.color}
                      {item.size ? `, Size ${item.size}` : ""}
                    </p>
                    <p className="text-xs text-ink-500">
                      Qty: {item.quantity}
                      {item.bundleDiscountPercent > 0 && (
                        <span className="text-gold-600">
                          {" "}
                          &middot; {item.bundleDiscountPercent}% bundle
                          discount applied
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink-900 shrink-0">
                    {formatNaira(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gold-100 mt-3 pt-3 flex justify-between font-bold text-ink-900">
              <span>Total</span>
              <span>{formatNaira(o.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersLookup />
    </Suspense>
  );
}
