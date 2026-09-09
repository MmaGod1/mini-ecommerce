"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { calculateLineTotal, formatNaira } from "@/lib/pricing";
import { isValidNigerianPhone, isValidAddress } from "@/lib/validation";

export default function CheckoutPage() {
  const { cart, products, removeFromCart, placeOrder } = useShop();
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [comments, setComments] = useState("");
  const [attemptedPay, setAttemptedPay] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(
    null
  );

  const lines = useMemo(() => {
    return cart.map((line) => {
      const product = products.find((p) => p.id === line.productId);
      const { subtotal, total, discountPercent } = calculateLineTotal(
        line.unitPrice,
        line.quantity,
        product?.discountTiers
      );
      return { ...line, subtotal, total, discountPercent };
    });
  }, [cart, products]);

  const grandTotal = lines.reduce((sum, l) => sum + l.total, 0);

  const addressValid = isValidAddress(location);
  const phoneValid = isValidNigerianPhone(phone);
  const canPay = cart.length > 0 && addressValid && phoneValid;

  function handlePay() {
    setAttemptedPay(true);
    if (!canPay) return;
    const order = placeOrder({ location, phone, comments });
    setConfirmedOrderId(order.id);
  }

  if (confirmedOrderId) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl mx-auto mb-4">
          &#10003;
        </div>
        <h1 className="text-xl font-bold text-ink-900">
          Payment Successful
        </h1>
        <p className="text-ink-500 mt-1">Order {confirmedOrderId}</p>
        <p className="text-xs text-ink-500 mt-3">
          Save this order number, along with the phone number you used, to
          look up your order later.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-full bg-gold-600 text-white font-semibold hover:bg-gold-700"
          >
            Continue Shopping
          </button>
          <button
            onClick={() =>
              router.push(`/orders?phone=${encodeURIComponent(phone)}`)
            }
            className="px-5 py-2.5 rounded-full border border-gold-400 text-gold-700 font-semibold hover:bg-gold-50"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-ink-700">Your cart is empty.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-5 py-2.5 rounded-full bg-gold-600 text-white font-semibold hover:bg-gold-700"
        >
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Order summary */}
      <div>
        <h1 className="text-xl font-bold text-ink-900 mb-4">Order Summary</h1>
        <div className="space-y-3">
          {lines.map((l) => (
            <div
              key={l.variantId}
              className="bg-white rounded-lg card-shadow p-3 flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-md bg-gold-50 flex items-center justify-center overflow-hidden shrink-0">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.imageUrl}
                    alt={l.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gold-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink-900 truncate">
                  {l.productName} &middot; {l.color}
                </p>
                <p className="text-xs text-ink-500">Qty: {l.quantity}</p>
                {l.discountPercent > 0 && (
                  <p className="text-xs text-gold-600">
                    {l.discountPercent}% discount applied
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-ink-900">
                  {formatNaira(l.total)}
                </p>
                <button
                  onClick={() => removeFromCart(l.variantId)}
                  className="mt-1 text-xs font-semibold text-red-600 border border-red-200 rounded-full px-3 py-1 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-gold-200 pt-4 flex justify-between items-center">
          <span className="font-semibold text-ink-900">Total</span>
          <span className="text-xl font-bold text-gold-700">
            {formatNaira(grandTotal)}
          </span>
        </div>
      </div>

      {/* Customer info + payment */}
      <div>
        <h2 className="text-lg font-bold text-ink-900 mb-4">
          Delivery Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Delivery Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 12 Aba Road, Port Harcourt"
              className={`w-full rounded-lg bg-gold-50 border px-3 py-2 text-sm outline-none focus:border-gold-500 ${
                attemptedPay && !addressValid
                  ? "border-red-400"
                  : "border-gold-200"
              }`}
            />
            {attemptedPay && !addressValid && (
              <p className="text-xs text-red-600 mt-1">
                Please enter a full delivery address (street, area, city).
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className={`w-full rounded-lg bg-gold-50 border px-3 py-2 text-sm outline-none focus:border-gold-500 ${
                attemptedPay && !phoneValid
                  ? "border-red-400"
                  : "border-gold-200"
              }`}
            />
            {attemptedPay && !phoneValid && (
              <p className="text-xs text-red-600 mt-1">
                Enter a valid Nigerian phone number, e.g. 08012345678.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Additional Comments{" "}
              <span className="font-normal text-ink-500">(optional)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Anything you'd like to add about your order"
              rows={3}
              className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500 resize-none"
            />
          </div>

          <div className="bg-white rounded-lg card-shadow p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold">
              &#128274;
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">
                Secure payment via Paystack
              </p>
              <p className="text-xs text-ink-500">
                Card &middot; Bank Transfer &middot; USSD
              </p>
            </div>
          </div>

          <button
            onClick={handlePay}
            className="w-full py-3 rounded-full font-bold text-white bg-gold-600 hover:bg-gold-700"
          >
            Pay {formatNaira(grandTotal)}
          </button>
          {attemptedPay && !canPay && (
            <p className="text-xs text-red-600 text-center">
              A valid delivery address and phone number are required to
              place an order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
