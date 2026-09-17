# YourShop

A Next.js storefront now backed by Supabase for real, persistent, multi-user data.

## Setup

1. Create a Supabase project, run `supabase/schema.sql`, then `supabase/security-and-orders.sql`, then `supabase/bundles-and-sizes.sql`, then `supabase/paystack.sql` in the SQL Editor (in that exact order).
2. Create a Storage bucket called `product-images` (Storage tab → New Bucket → make it **public**).
3. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   The service role key is powerful, it's only ever read on the server (inside `app/api/*` route handlers via `lib/supabaseServer.ts`). It's never sent to the browser. `.gitignore` already excludes `.env.local`.
4. Create your own admin login: Supabase dashboard → **Authentication → Users → Add user**, set your email and a password there directly. There is no public sign-up page, deliberately, since this store only ever needs one admin.
5. Create a Paystack account (free, test mode needs no business verification) and grab your **Test Secret Key** and **Test Public Key** from Settings → API Keys & Webhooks. Add both to `.env.local`:
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
   PAYSTACK_SECRET_KEY=sk_test_...
   ```
6. `npm install`
7. `npm run dev`, then visit `/admin`, you'll be redirected to `/admin/login` until you sign in.

## Admin authentication (new)

`/admin` and everything under it, plus every `/api/admin/*` route and the full order list, now require a logged-in session. This is enforced in `middleware.ts`, which runs on the server before any of those requests are handled, not just hidden in the UI.

- Log in at `/admin/login` with the email/password you created directly in the Supabase dashboard.
- There's a "Log out" button on every admin page.
- The public storefront, checkout, and the phone-based "My Orders" lookup are untouched, no login needed for customers, only for you.

This uses Supabase Auth with cookie-based sessions (`@supabase/ssr`), which is what lets the server-side middleware actually verify who's asking, rather than just trusting a password typed into a form with no real session behind it.

## What changed with this Supabase pass

- **Products, categories, and stock are now real and persistent.** They live in Supabase, not browser memory, so they survive refreshes, and are shared across every visitor and device, exactly what was missing before.
- **All writes (add/edit/delete product, add category, adjust stock) go through server API routes** (`app/api/admin/...`) using the service-role key, never directly from the browser. The anon key used in the browser can only *read* products/categories, it has no write access at all (enforced by Row Level Security, see `supabase/security-and-orders.sql`).
- **Orders are placed through a database function (`place_order`), not client-side logic.** This is the fix for the multi-user race condition discussed earlier: the function locks each variant row before checking stock, so two people can never both successfully buy the last unit, whoever's request reaches the database first wins, the other gets a clear "sold out" error instead of a phantom order.
- **Price and discount are calculated inside that same database function**, from the database's own current values, never trusted from the request body. A tampered checkout request can't change what gets charged.
- **Order data is no longer loaded for every visitor.** The admin orders page and the customer "My Orders" lookup each fetch only what they need from the server, instead of the whole order list living in shared app state (that would have meant every shopper's browser silently downloading every other customer's phone number and address just by loading the site).
- **Product photos now upload to Supabase Storage** instead of being embedded as base64 data, they load faster and don't bloat the database. Photos are uploaded through a server route too, not directly from the browser.

## Important: there is still no admin login

This section intentionally left as history: as of this pass, `/admin` now requires a real login (see above). What's still worth knowing:

- There's exactly one way to become an admin: you create your own account directly in the Supabase dashboard. There's no self-service sign-up anywhere in the app, on purpose.
- If you ever need a second admin (e.g. a helper managing orders), add their email the same way, directly in Supabase → Authentication → Users. Don't build a public registration form for this.
- Password reset isn't wired up yet, if you forget your password, reset it from the Supabase dashboard directly (Authentication → Users → the "..." menu on your user).

## Project structure

- `lib/types.ts` - shared data shapes
- `lib/pricing.ts` - discount tier calculation (also duplicated, more strictly, inside the database function)
- `lib/validation.ts` - phone/address validation
- `lib/supabaseClient.ts` - browser client (anon key, read-only by policy)
- `lib/supabaseServer.ts` - server-only client (service role key, full access)
- `lib/supabase/client.ts` - browser auth client (cookie-based session, used for login/logout)
- `middleware.ts` - gates `/admin/*`, `/api/admin/*`, and the full order list behind a logged-in session
- `lib/mappers.ts` - converts Supabase rows into the app's Product/Order shapes
- `lib/uploadImage.ts` - client helper that posts a file to the upload API route
- `context/ShopContext.tsx` - products/categories/cart state, calls Supabase directly for reads and API routes for writes
- `app/api/` - all server-side routes (admin writes, image upload, order placement/lookup)
- `supabase/schema.sql` - initial tables
- `supabase/security-and-orders.sql` - RLS policies and the atomic `place_order` function

## Sizes and Bundle Deals (new)

**Sizes** are optional and per colour: when adding or editing a product, each colour row can also have a size (e.g. Black, size 40). Each colour+size combination tracks its own stock, exactly like colours did before, so Black size 40 can sell out while Black size 42 stays available. Products that don't need sizes (bags, caps) just leave it blank, the size picker doesn't even show up for customers on those products.

**Bundle Deals** are a different kind of discount from the per-product quantity tiers: "buy N different hand-picked products, get X% off", rather than "buy more of one product." Manage these from the admin dashboard's "Bundle Deals" button:
- Pick which products are eligible (a hand-picked list, not a whole category)
- Set the minimum number of *different* products a customer needs (buying 5 of one eligible product doesn't count, it has to be 5 different ones)
- Set the discount percentage

Like every other discount in this app, the bundle discount is calculated inside the database function (`place_order`) at the moment of payment, not trusted from the browser. One honest limitation: the checkout page's running total doesn't preview the bundle discount before payment (that math only lives in the database function to avoid duplicating and potentially drifting from the source of truth), so the final charged total can come out lower than what checkout displayed, customers see the real breakdown afterward in their order confirmation and "My Orders" lookup.

## Payments (new)

Checkout now goes through real Paystack payment, replacing the old placeholder that instantly marked orders "Paid" without any actual charge. The flow:

1. Customer fills in their details and clicks Pay. The browser asks the server for a **quote** (`/api/orders/quote`), the real price, calculated the same way `place_order` calculates it (discounts, bundles, everything), but without touching stock, since this is just a preview.
2. Paystack's popup opens for that exact amount. The browser never decides the price, it only ever displays what the server already calculated.
3. Once payment succeeds, Paystack hands back a reference. The browser sends that reference (not an amount, not a "trust me it worked") to `/api/orders`.
4. The server verifies the payment directly with Paystack's own API using the secret key, confirms the charged amount matches the quoted price, and only then calls `place_order` to actually create the order and decrement stock.
5. If anything goes wrong after payment succeeded (most likely: stock sold out in the few seconds between quote and payment), the server automatically issues a Paystack refund and tells the customer plainly, rather than leaving them charged with no order.

None of this trusts the browser at any step, price, payment success, and stock are all confirmed server-side, in that order, before an order is ever created.

Test mode: use Paystack's documented test card numbers to try the flow without moving real money. When you're ready to accept real payments, this only needs one change: replace the test keys in `.env.local` with live keys from Paystack, once your Paystack account is verified with real business and bank details, nothing in the code changes.

Known limitation: `quote_order` and `place_order` calculate pricing independently (one is read-only, one locks rows and writes), rather than sharing code. They're written to match exactly, but if the discount or bundle pricing rules are ever changed in one, the other needs the same change made manually, that's called out in the comments in `supabase/paystack.sql` and `supabase/bundles-and-sizes.sql`.
