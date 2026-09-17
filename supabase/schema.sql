-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text,
  image_url text,
  created_at timestamptz default now()
);

-- Colour variants, each with its own price and stock
create table variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  color text not null,
  price integer not null,
  stock integer not null default 0,
  image_url text
);

-- Optional quantity discount tiers per product
create table discount_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  min_qty integer not null,
  discount_percent integer not null
);

-- Orders
create table orders (
  id text primary key, -- e.g. #10493, matches the current format
  location text not null,
  phone text not null,
  comments text,
  total integer not null,
  status text not null default 'Paid',
  created_at timestamptz default now()
);

-- Line items per order (snapshotted, so edits to products later don't change past orders)
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text references orders(id) on delete cascade,
  variant_id uuid,
  product_name text not null,
  color text not null,
  unit_price integer not null,
  quantity integer not null,
  discount_percent integer not null default 0,
  line_total integer not null,
  image_url text
);

-- Seed the starting categories so the dropdown isn't empty
insert into categories (name) values ('Clothing'), ('Footwear'), ('Bags');
