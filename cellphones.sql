-- supabase_cellphones_table.sql
-- SQL to create a `cellphones` table (Postgres / Supabase compatible)
-- Usage: paste into your Postgres/Supabase SQL editor and run.
-- Notes:
-- - No RLS is enabled here (unrestricted). Manage access at the connection level or add RLS later if needed.
-- - Uses `pgcrypto` for gen_random_uuid() and `pg_trgm` for fast ILIKE searches.
-- - Should work on Render Managed PostgreSQL (extensions are commonly available).

-- 1) Extensions (safe if already installed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- trigram indexes for faster ILIKE searches

-- 2) Create table `cellphones`
CREATE TABLE IF NOT EXISTS public.cellphones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  variant text,                -- e.g., Plus/Pro/Ultra
  color text,
  storage_gb integer,          -- e.g., 64, 128, 256
  ram_gb integer,              -- e.g., 4, 6, 8, 12
  imei text,                   -- optionally track IMEI; not all entries may have it
  serial_number text,          -- optional manufacturer serial
  condition text DEFAULT 'new',-- new | used | refurbished (free text; constrain if you prefer)
  release_year integer,

  price numeric(10,2) NOT NULL DEFAULT 0.00,
  -- Generated columns (VAT 15%)
  price_with_vat numeric(12,2) GENERATED ALWAYS AS (round(price * 1.15, 2)) STORED,
  price_vat_amount numeric(12,2) GENERATED ALWAYS AS (round(price * 0.15, 2)) STORED,

  quantity integer NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 3) Indexes to optimize search
-- Trigram indexes for partial/case-insensitive brand/model search
CREATE INDEX IF NOT EXISTS idx_cellphones_brand_trgm ON public.cellphones USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cellphones_model_trgm ON public.cellphones USING gin (model gin_trgm_ops);
-- Helpful lower() btree indexes for exact case-insensitive comparisons
CREATE INDEX IF NOT EXISTS idx_cellphones_brand_lower ON public.cellphones (lower(brand));
CREATE INDEX IF NOT EXISTS idx_cellphones_model_lower ON public.cellphones (lower(model));
-- Unique IMEI when provided (allow multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cellphones_imei_unique ON public.cellphones (imei) WHERE imei IS NOT NULL;
-- Optional: quick filter by in_stock
CREATE INDEX IF NOT EXISTS idx_cellphones_in_stock ON public.cellphones (in_stock);

-- 4) Sample data
INSERT INTO public.cellphones (
  brand, model, variant, color, storage_gb, ram_gb, imei, serial_number, condition,
  release_year, price, quantity, in_stock, metadata
) VALUES
('Apple', 'iPhone 13', 'Base', 'Midnight', 128, 4, '356789012345678', 'SN-APL-13-0001', 'new', 2021, 699.00, 10, true, '{"os":"iOS","battery_mAh":3240}'),
('Samsung', 'Galaxy S21', '5G', 'Phantom Gray', 256, 8, '357890123456789', 'SN-SAM-S21-0002', 'refurbished', 2021, 549.99, 5, true, '{"os":"Android","battery_mAh":4000}'),
('Xiaomi', 'Redmi Note 12', NULL, 'Blue', 128, 6, NULL, 'SN-XMI-RN12-0003', 'new', 2023, 229.50, 0, false, '{"os":"Android","dual_sim":true}'),
('Google', 'Pixel 7', NULL, 'Obsidian', 128, 8, '358901234567890', 'SN-GGL-P7-0004', 'used', 2022, 399.00, 3, true, '{"os":"Android","battery_mAh":4355}');

-- 5) Optional: add columns later if the table already exists
ALTER TABLE IF EXISTS public.cellphones
  ADD COLUMN IF NOT EXISTS price_with_vat numeric(12,2) GENERATED ALWAYS AS (round(price * 1.15, 2)) STORED;
ALTER TABLE IF EXISTS public.cellphones
  ADD COLUMN IF NOT EXISTS price_vat_amount numeric(12,2) GENERATED ALWAYS AS (round(price * 0.15, 2)) STORED;

-- Security notes
-- - RLS is NOT enabled here; access is unrestricted at the table level.
-- - If exposing a public connection (anonymous), strongly consider enabling RLS later and adding read-only policies.
-- - For write operations from untrusted clients, prefer going through a backend API.

-- End of file
