# YourShop

A Next.js storefront prototype built for the sales-event launch.

## Features

- Colour variants per product, each tracking its own stock (selling out one colour never affects another)
- Optional per-product quantity discounts (e.g. buy 5+, save 8%; buy 10+, save 15%), fully configurable per product, or none at all
- Custom categories, not locked to Clothing/Footwear/Bags; add new ones (e.g. Caps, Accessories) right from the product form
- Product photo upload: one main photo per product, plus an optional photo per colour if a variant looks meaningfully different
- Edit and delete products from the admin dashboard
- Quick +/- stock adjustment right on the dashboard, no need to open the full edit form just to restock or correct a count
- Low-stock highlighting (2 or fewer left) on both the admin dashboard and the product page, so a restock decision doesn't come as a surprise
- Working search bar on the shop page, combined with category filtering
- Checkout collecting delivery location, phone number, and an optional comments field
- Admin dashboard: product list with thumbnails, live stock/sold-out status, edit/delete, and an orders view
- Gold colour theme throughout

## Running it locally

```
npm install
npm run dev
```

Then open http://localhost:3000. Visit /admin for the admin side.

Note: this project pins `next` to exactly `15.5.9` in package.json. If `npm run dev` reports a different Next.js version, something outside this package.json changed it (e.g. a global Next install, or files copied into an existing project folder rather than running npm install directly inside this extracted folder). Running `npm install` fresh inside this exact folder should always resolve to 15.5.9.

## What's real vs. what's a stand-in right now

This is a working prototype of the *logic and interface*. A few things are intentionally simplified for now:

1. **Data storage** - products, categories, stock, and orders currently live in memory (`context/ShopContext.tsx`), so they reset on refresh. This is a stand-in for Supabase (Postgres), the next real wiring step.
2. **Payment** - the "Pay" button on checkout immediately marks the order paid and decrements stock, standing in for a real Paystack integration. In production, stock should only decrement after Paystack's webhook confirms payment (not from the browser), to avoid race conditions on the last unit of a product.
3. **Product photos** - stored as embedded image data for now (works fine in the browser session), will move to proper file storage (e.g. Supabase Storage) once the backend is wired in, so photos persist and load faster.

Everything else, discount math, per-colour stock tracking, checkout fields, dynamic categories, edit/delete, stock adjustment, search, is the real logic and carries over directly once the backend is connected.

## Project structure

- `lib/types.ts` - data shapes (Product, Variant, DiscountTier, Order)
- `lib/pricing.ts` - discount tier calculation logic
- `lib/data.ts` - seed product data
- `context/ShopContext.tsx` - in-memory store (swap for Supabase queries later)
- `components/ProductForm.tsx` - shared add/edit product form
- `app/` - pages (home, product detail, checkout, admin)
