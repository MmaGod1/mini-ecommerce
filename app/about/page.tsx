export const metadata = {
  title: "About & Policies | Cherry's Closet",
  description:
    "About Cherry's Closet, our Terms of Service, Refund Policy, Delivery Policy, and contact information.",
};

const SECTIONS = [
  { id: "about", label: "About Us" },
  { id: "terms", label: "Terms of Service" },
  { id: "refunds", label: "Refund Policy" },
  { id: "delivery", label: "Delivery / Pickup Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink-900 mb-2">
        About &amp; Policies
      </h1>
      <p className="text-ink-500 text-sm mb-6">
        Everything you need to know about shopping with Cherry's Closet.
      </p>

      {/* Jump navigation */}
      <nav className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 mb-10 pb-1">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold bg-gold-100 text-gold-700 hover:bg-gold-200 transition-colors"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {/* ABOUT */}
        <section id="about" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gold-700 mb-3">About Us</h2>
          <div className="bg-white rounded-lg card-shadow p-5 text-sm text-ink-700 space-y-3">
            <p>
              Cherry's Closet is an online store offering clothing, footwear,
              bags, and accessories. We're based in Nigeria and serve
              customers there, with orders also available to customers in
              Ghana, Cameroun.
            </p>
            <p>
              We list our full catalogue online with clear pricing, current
              stock, and photos for every item. Payment is processed
              securely through Paystack, and orders are arranged for pickup
              at a location agreed with the customer after payment, rather
              than door-to-door delivery.
            </p>
          </div>
        </section>

        {/* TERMS OF SERVICE */}
        <section id="terms" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gold-700 mb-3">
            Terms of Service
          </h2>
          <div className="bg-white rounded-lg card-shadow p-5 text-sm text-ink-700 space-y-4">
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                1. Acceptance of Terms
              </p>
              <p>
                By browsing or placing an order on this website, you agree
                to these Terms of Service. If you do not agree, please do
                not use this website to place an order.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                2. Products &amp; Availability
              </p>
              <p>
                We make reasonable efforts to display accurate product
                descriptions, images, pricing, and stock levels. Stock is
                checked and confirmed at the moment of payment, so an item
                shown as available may occasionally sell out between
                browsing and checkout; in that case, you will not be
                charged for that item, and any affected payment will be
                refunded in full.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                3. Pricing &amp; Payment
              </p>
              <p>
                All prices are listed in Nigerian Naira (₦). Payment is
                processed securely through Paystack and is required in
                full before an order is confirmed. We do not store or have
                access to your card details, these are handled entirely by
                Paystack.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                4. Order Confirmation
              </p>
              <p>
                An order is only confirmed once payment has been
                successfully verified. You will receive a payment receipt
                from Paystack, and you can look up your order status at any
                time using the phone number provided at checkout.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                5. Changes to These Terms
              </p>
              <p>
                We may update these terms from time to time to reflect
                changes in how we operate. The version published on this
                page at the time of your order is the one that applies to
                that order.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                6. Governing Law
              </p>
              <p>
                These terms are governed by the laws of the Federal
                Republic of Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* REFUND POLICY */}
        <section id="refunds" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gold-700 mb-3">
            Refund Policy
          </h2>
          <div className="bg-white rounded-lg card-shadow p-5 text-sm text-ink-700 space-y-4">
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                When a refund applies
              </p>
              <p>
                We offer a refund or exchange if an item arrives damaged,
                defective, or different from what you ordered. Please
                report any such issue within 48 hours of collecting your
                order, using the contact details below, along with your
                order number and, where possible, a photo of the item.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                When a refund does not apply
              </p>
              <p>
                We're unable to offer a refund for a simple change of mind
                once an order has been paid for and collected. We encourage
                checking sizing, colour, and item details carefully before
                checkout.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                If a payment succeeds but an order fails
              </p>
              <p>
                In the rare case a payment is confirmed but stock runs out
                at the exact same moment (for example, two customers buying
                the last unit at once), the affected payment is
                automatically refunded in full through Paystack.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                Refund method &amp; timing
              </p>
              <p>
                Approved refunds are issued back to the original payment
                method through Paystack. Processing typically takes 3–10
                business days, depending on your bank, once we've
                initiated the refund on our end.
              </p>
            </div>
          </div>
        </section>

        {/* DELIVERY / PICKUP POLICY */}
        <section id="delivery" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gold-700 mb-3">
            Delivery / Pickup Policy
          </h2>
          <div className="bg-white rounded-lg card-shadow p-5 text-sm text-ink-700 space-y-4">
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                How orders are fulfilled
              </p>
              <p>
                Cherry's Closet does not offer door-to-door delivery. After
                payment, orders are arranged for collection at a pickup
                point based on the country, state/region, and area you
                provide at checkout.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                Arranging pickup
              </p>
              <p>
                We'll contact you using the phone number provided at
                checkout to confirm the exact pickup location and a
                convenient time. Please ensure your phone number is
                correct and reachable.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-900 mb-1">
                Areas served
              </p>
              <p>
                We currently arrange pickup for customers across Nigeria
                Cameroun, and Ghana. If you're ordering from elsewhere, please
                contact us before paying to confirm we can fulfil your
                order.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gold-700 mb-3">
            Contact Us
          </h2>
          <div className="bg-white rounded-lg card-shadow p-5 text-sm text-ink-700 space-y-2">
            <p>
              Have a question about an order, a return, or anything else?
              Reach us directly:
            </p>
            <div className="mt-3 space-y-1.5">
              <p>
                <span className="font-semibold text-gold-700">Phone / WhatsApp:</span>{" "}
                +2347072356343
              </p>
              <p>
                <span className="font-semibold text-gold-700">Email:</span>{" "}
                ukambaperpetua@gmail.com
              </p>
              <p>
                <span className="font-semibold text-gold-700">Business Location:</span>{" "}
                Onitsha / Anambra, NIGERIA
              </p>
              <p>
                <span className="font-semibold text-gold-700">Hours:</span>{" "}
                Mon–Sat, 9am–6pm
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}