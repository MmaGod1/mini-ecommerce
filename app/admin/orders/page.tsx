"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/pricing";
import { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) setOrders(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="text-ink-500 text-sm">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-ink-900 mb-4">
          Orders Received
        </h1>
        <p className="text-ink-500 text-sm">No orders yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-ink-900 mb-5">
        Orders Received
      </h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-lg card-shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-ink-900">{o.id}</p>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                {o.status}
              </span>
            </div>

            <div className="text-sm text-ink-700 space-y-0.5 mb-3">
              <p>
                <span className="font-semibold text-gold-700">
                  Location:
                </span>{" "}
                {o.location}
              </p>
              <p>
                <span className="font-semibold text-gold-700">Phone:</span>{" "}
                {o.phone}
              </p>
              {o.comments && (
                <p>
                  <span className="font-semibold text-gold-700">
                    Comments:
                  </span>{" "}
                  {o.comments}
                </p>
              )}
            </div>

            <div className="border-t border-gold-100 pt-2 space-y-2">
              {o.items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-gold-50 flex items-center justify-center overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gold-200" />
                    )}
                  </div>
                  <span className="flex-1 text-sm">
                    {item.productName} &middot; {item.color}
                    {item.size ? `, Size ${item.size}` : ""} &times;{" "}
                    {item.quantity}
                    {item.discountPercent > 0 && (
                      <span className="text-gold-600">
                        {" "}
                        ({item.discountPercent}% off)
                      </span>
                    )}
                    {item.bundleDiscountPercent > 0 && (
                      <span className="text-gold-600">
                        {" "}
                        (+{item.bundleDiscountPercent}% bundle deal)
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-sm shrink-0">
                    {formatNaira(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gold-100 mt-2 pt-2 flex justify-between font-bold text-ink-900">
              <span>Total</span>
              <span>{formatNaira(o.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
