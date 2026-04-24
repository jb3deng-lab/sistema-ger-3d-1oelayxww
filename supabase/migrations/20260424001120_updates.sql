DO $DO$
BEGIN
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "auth_profiles" ON public.profiles;
  CREATE POLICY "auth_profiles" ON public.profiles 
    FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

  ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS power_watts NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS maintenance_items JSONB NOT NULL DEFAULT '[]'::jsonb;

  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS packaging_cost NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC NOT NULL DEFAULT 0;

END $DO$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $func$
BEGIN
  INSERT INTO public.profiles (id, name, address)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, name, address)
SELECT id, COALESCE(raw_user_meta_data->>'name', ''), COALESCE(raw_user_meta_data->>'address', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
