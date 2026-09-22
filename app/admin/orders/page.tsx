"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/pricing";
import { toCustomerMessage } from "@/lib/customerError";
import { Order } from "@/lib/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReceiptHtml(order: Order): string {
  const dateStr = new Date(order.createdAt).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows = order.items
    .map((item) => {
      const label = `${escapeHtml(item.productName)}${
        item.size ? `, Size ${escapeHtml(item.size)}` : ""
      } (${escapeHtml(item.color)})`;
      const discountNote =
        item.discountPercent > 0 || item.bundleDiscountPercent > 0
          ? `<div class="muted">${
              item.discountPercent > 0 ? `${item.discountPercent}% off` : ""
            }${
              item.discountPercent > 0 && item.bundleDiscountPercent > 0
                ? " + "
                : ""
            }${
              item.bundleDiscountPercent > 0
                ? `${item.bundleDiscountPercent}% bundle deal`
                : ""
            }</div>`
          : "";
      return `
        <tr>
          <td>${label}${discountNote}</td>
          <td class="right">${item.quantity}</td>
          <td class="right">${formatNaira(item.unitPrice)}</td>
          <td class="right">${formatNaira(item.lineTotal)}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Receipt ${escapeHtml(order.id)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1F1B10;
    max-width: 420px;
    margin: 0 auto;
    padding: 24px 20px;
  }
  h1 {
    text-align: center;
    font-size: 22px;
    letter-spacing: 0.5px;
    margin: 0 0 2px;
  }
  .tagline {
    text-align: center;
    font-size: 12px;
    color: #6B6248;
    margin: 0 0 18px;
  }
  .meta { font-size: 13px; margin-bottom: 14px; }
  .meta div { margin-bottom: 2px; }
  .label { color: #96690A; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 14px; }
  th { text-align: left; border-bottom: 2px solid #1F1B10; padding: 6px 4px; font-size: 11px; text-transform: uppercase; }
  td { padding: 8px 4px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .right { text-align: right; white-space: nowrap; }
  .muted { font-size: 11px; color: #96690A; margin-top: 2px; }
  .total-row td { border-bottom: none; border-top: 2px solid #1F1B10; font-weight: bold; font-size: 15px; padding-top: 10px; }
  .status {
    display: inline-block;
    background: #2E9E5B;
    color: white;
    font-weight: bold;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 14px;
  }
  .closing {
    text-align: center;
    font-size: 13px;
    font-style: italic;
    color: #6B6248;
    margin-top: 20px;
    border-top: 1px dashed #ccc;
    padding-top: 14px;
  }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  <h1>CHERRY'S CLOSET</h1>
  <p class="tagline">Order Receipt</p>

  <div class="meta">
    <div><span class="label">Order:</span> ${escapeHtml(order.id)}</div>
    <div><span class="label">Date:</span> ${escapeHtml(dateStr)}</div>
    <div><span class="label">Phone:</span> ${escapeHtml(order.phone)}</div>
    <div><span class="label">Delivery/Pickup:</span> ${escapeHtml(
      order.location
    )}</div>
    ${
      order.comments
        ? `<div><span class="label">Comments:</span> ${escapeHtml(
            order.comments
          )}</div>`
        : ""
    }
  </div>

  <span class="status">${escapeHtml(order.status)}</span>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="right">Qty</th>
        <th class="right">Unit</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="3">Total</td>
        <td class="right">${formatNaira(order.total)}</td>
      </tr>
    </tbody>
  </table>

  <p class="closing">Thank you for shopping with Cherry's Closet.</p>
</body>
</html>`;
}

function printReceipt(order: Order) {
  const printWindow = window.open("", "_blank", "width=420,height=640");
  if (!printWindow) {
    alert(
      "Your browser blocked the print window. Please allow pop-ups for this site and try again."
    );
    return;
  }
  printWindow.document.write(buildReceiptHtml(order));
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function loadOrders() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load orders.");
      setOrders(data);
    } catch (err) {
      setLoadError(toCustomerMessage(err, "Couldn't load orders. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.items.some((item) => item.productName.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <p className="text-ink-500 text-sm">Loading orders...</p>;
  }

  if (loadError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-sm font-semibold mb-2">{loadError}</p>
        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-gold-600 text-white hover:bg-gold-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-ink-900 mb-4">Orders Received</h1>

      {orders.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number, phone, or product..."
          className="w-full rounded-full bg-white border border-gold-200 px-4 py-2 text-sm outline-none focus:border-gold-500 card-shadow mb-5"
        />
      )}

      {orders.length === 0 ? (
        <p className="text-ink-500 text-sm">No orders yet.</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-ink-500 text-sm text-center py-10">
          No orders match your search.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="bg-white rounded-lg card-shadow p-4">
              <div className="flex items-center justify-between mb-2 gap-2">
                <p className="font-bold text-ink-900">{o.id}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                    {o.status}
                  </span>
                  <button
                    onClick={() => printReceipt(o)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-gold-400 text-gold-700 hover:bg-gold-50"
                  >
                    Print Receipt
                  </button>
                </div>
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
                  <div
                    key={item.variantId}
                    className="flex items-center gap-3"
                  >
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
      )}
    </div>
  );
}
