"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { calculateLineTotal, formatNaira } from "@/lib/pricing";
import { isValidPhone, isValidArea, isValidEmail } from "@/lib/validation";
import { COUNTRIES, statesForCountry } from "@/lib/locations";
import { openPaystackCheckout } from "@/lib/paystack";
import { toCustomerMessage } from "@/lib/customerError";

export default function CheckoutPage() {
  const { cart, products, removeFromCart, placeOrder } = useShop();
  const router = useRouter();

  const [country, setCountry] = useState<string>(COUNTRIES[0]);
  const [state, setState] = useState<string>(statesForCountry(COUNTRIES[0])[0]);
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [attemptedPay, setAttemptedPay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const areaValid = isValidArea(area);
  const phoneValid = isValidPhone(phone);
  const emailValid = isValidEmail(email);
  const canPay = cart.length > 0 && areaValid && phoneValid && emailValid;

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    setState(statesForCountry(newCountry)[0]);
  }

  async function handlePay() {
    setAttemptedPay(true);
    setSubmitError(null);
    if (!canPay) return;
    setSubmitting(true);

    try {
      // Ask the server for the real, authoritative amount to charge,
      // this is what actually gets sent to Paystack, never a number
      // computed in the browser.
      const quoteRes = await fetch("/api/orders/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      const quoteData = await quoteRes.json();
      if (!quoteRes.ok) {
        throw new Error(quoteData.error ?? "Could not calculate your total.");
      }

      const amountKobo = Math.round(quoteData.total * 100);
      const location = `${area.trim()}, ${state}, ${country}`;

      await openPaystackCheckout({
        email,
        amountKobo,
        onSuccess: async (reference) => {
          try {
            await placeOrder({
              location,
              phone,
              comments,
              paystackReference: reference,
            });
            // Send them straight to the page that actually persists,
            // this re-fetches from the server every time it loads, so
            // reloading afterward still shows the order, unlike the
            // in-memory "success" screen this used to show.
            router.push(
              `/orders?phone=${encodeURIComponent(phone)}&justPaid=1`
            );
          } catch (err) {
            setSubmitError(toCustomerMessage(err));
            setSubmitting(false);
          }
        },
        onClose: () => {
          // Customer closed the Paystack popup without paying, not an
          // error, just let them try again.
          setSubmitting(false);
        },
      });
    } catch (err) {
      setSubmitError(toCustomerMessage(err));
      setSubmitting(false);
    }
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
      <div className="min-w-0">
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
                  {l.size ? `, Size ${l.size}` : ""}
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
        <p className="text-xs text-ink-500 mt-1">
          If your cart qualifies for a bundle deal, that discount is applied
          automatically when payment completes, the amount Paystack charges
          may come out lower than shown here.
        </p>
      </div>

      {/* Customer info + payment */}
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-ink-900 mb-4">
          Pickup Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              className={`w-full rounded-lg bg-gold-50 border px-3 py-2 text-sm outline-none focus:border-gold-500 ${
                attemptedPay && !emailValid
                  ? "border-red-400"
                  : "border-gold-200"
              }`}
            />
            {attemptedPay && !emailValid && (
              <p className="text-xs text-red-600 mt-1">
                Paystack requires a valid email to send your payment
                receipt to.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gold-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full max-w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gold-700 mb-1">
                State / Region
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full max-w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
              >
                {statesForCountry(country).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Pickup Area / Landmark
            </label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Rumuola, near Rainbow Tower"
              className={`w-full rounded-lg bg-gold-50 border px-3 py-2 text-sm outline-none focus:border-gold-500 ${
                attemptedPay && !areaValid
                  ? "border-red-400"
                  : "border-gold-200"
              }`}
            />
            {attemptedPay && !areaValid && (
              <p className="text-xs text-red-600 mt-1">
                Please enter the area or a nearby landmark for pickup
                arrangement.
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
                Enter a valid phone number, e.g. 08012345678.
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
            disabled={submitting}
            className="w-full py-3 rounded-full font-bold text-white bg-gold-600 hover:bg-gold-700 disabled:opacity-60"
          >
            {submitting ? "Processing..." : `Pay ${formatNaira(grandTotal)}`}
          </button>
          {submitError && (
            <p className="text-xs text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}
          {attemptedPay && !canPay && !submitError && (
            <p className="text-xs text-red-600 text-center">
              A valid email, pickup area, and phone number are all required
              to place an order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
