-- Create products table
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  is_active boolean default true,
  title text not null,
  subtitle text,
  description text,                     -- Full about section text (admin editable, supports newlines)
  superprofile_url text,                -- SuperProfile.bio embed URL
  price decimal(10,2) not null,
  original_price decimal(10,2),
  ba9chich_product_id integer,          -- ID on store.ba9chich.com (e.g. 11309)
  hero_image text,
  preview_images jsonb default '[]',    -- [{url, caption}]
  features jsonb default '[]',          -- ["string", ...]
  testimonials jsonb default '[]',      -- [{name, text, rating, avatar}]
  faqs jsonb default '[]',              -- [{question, answer}]
  sections jsonb default '[]',          -- dynamic page sections
  upsell_slugs text[] default '{}',
  delivery_content text,                -- Content sent by email upon purchase
  created_at timestamptz default now()
);

-- Create orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  amount decimal(10,2),
  flouci_url text,
  flouci_payment_id text,               -- Store the successful payment ID from webhook
  ba9chich_checkout_done boolean default false,
  payment_status text default 'pending',  -- pending | redirected | confirmed
  created_at timestamptz default now()
);

-- Enable RLS
alter table products enable row level security;
alter table orders   enable row level security;

-- Set up RLS policies
create policy "public read active products"
  on products for select using (is_active = true);
