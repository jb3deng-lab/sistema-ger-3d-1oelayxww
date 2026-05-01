DO $$
BEGIN
  -- Add new fields to settings
  ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS operator_hour_cost numeric NOT NULL DEFAULT 0;
  ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS categories jsonb NOT NULL DEFAULT '["B2B", "B2C"]'::jsonb;
  ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS sales_methods jsonb NOT NULL DEFAULT '[{"name": "Dinheiro/Pix", "fee": 0}]'::jsonb;

  -- Add client_type to clients
  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_type text;

  -- Add sales method to quotes
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS sales_method text;
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS sales_fee_percent numeric NOT NULL DEFAULT 0;
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS sales_fee_value numeric NOT NULL DEFAULT 0;

  -- Add new fields to quote_items
  ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS product_id text;
  ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS materials jsonb NOT NULL DEFAULT '[]'::jsonb;
  ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS extra_components jsonb NOT NULL DEFAULT '[]'::jsonb;
  ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS prep_time_hours numeric NOT NULL DEFAULT 0;
  ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS costs_operator numeric NOT NULL DEFAULT 0;
  ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS costs_extra numeric NOT NULL DEFAULT 0;
  ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS profit_margin numeric;

  -- Add quote_id to transactions
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS quote_id text;
END $$;

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  print_time_mins numeric NOT NULL DEFAULT 0,
  prep_time_mins numeric NOT NULL DEFAULT 0,
  packaging_cost numeric NOT NULL DEFAULT 0,
  profit_margin numeric,
  materials jsonb NOT NULL DEFAULT '[]'::jsonb,
  extra_components jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

DROP POLICY IF EXISTS "auth_products" ON public.products;
CREATE POLICY "auth_products" ON public.products
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
