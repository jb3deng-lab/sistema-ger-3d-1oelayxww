CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  filament_cost NUMERIC NOT NULL DEFAULT 150,
  energy_cost NUMERIC NOT NULL DEFAULT 1.5,
  machine_cost NUMERIC NOT NULL DEFAULT 2.0,
  profit_margin NUMERIC NOT NULL DEFAULT 50,
  company_name TEXT NOT NULL DEFAULT 'Minha 3D Print',
  company_document TEXT NOT NULL DEFAULT '00.000.000/0001-00',
  company_email TEXT NOT NULL DEFAULT 'contato@minha3d.com',
  company_phone TEXT NOT NULL DEFAULT '(11) 99999-9999',
  company_address TEXT NOT NULL DEFAULT 'Rua Principal, 1000 - Centro',
  company_logo TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.machines (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purchase_value NUMERIC NOT NULL,
  useful_life_hours NUMERIC NOT NULL,
  depreciation_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.filaments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  initial_weight NUMERIC NOT NULL,
  current_weight NUMERIC NOT NULL,
  brand TEXT,
  purchase_date TEXT,
  cost_per_kg NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  total_material NUMERIC NOT NULL,
  total_machine NUMERIC NOT NULL,
  total_energy NUMERIC NOT NULL,
  total_total NUMERIC NOT NULL,
  suggested_price NUMERIC NOT NULL,
  discount NUMERIC NOT NULL,
  final_price NUMERIC NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  piece_name TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  time_hours NUMERIC NOT NULL,
  filament_id TEXT NOT NULL REFERENCES public.filaments(id) ON DELETE CASCADE,
  machine_id TEXT NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  costs_material NUMERIC NOT NULL,
  costs_machine NUMERIC NOT NULL,
  costs_energy NUMERIC NOT NULL,
  costs_total NUMERIC NOT NULL,
  suggested_price NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  start_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_settings" ON public.settings;
CREATE POLICY "auth_settings" ON public.settings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_clients" ON public.clients;
CREATE POLICY "auth_clients" ON public.clients FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_machines" ON public.machines;
CREATE POLICY "auth_machines" ON public.machines FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_filaments" ON public.filaments;
CREATE POLICY "auth_filaments" ON public.filaments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_quotes" ON public.quotes;
CREATE POLICY "auth_quotes" ON public.quotes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_quote_items" ON public.quote_items;
CREATE POLICY "auth_quote_items" ON public.quote_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_orders" ON public.orders;
CREATE POLICY "auth_orders" ON public.orders FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_transactions" ON public.transactions;
CREATE POLICY "auth_transactions" ON public.transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'josiascontaia@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'josiascontaia@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.settings (user_id) VALUES (new_user_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;
