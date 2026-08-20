-- NutriBit: esquema de base de datos
-- Ejecutar en Supabase Dashboard -> SQL Editor -> New Query
--
-- Configuración recomendada del proyecto (Dashboard -> Settings -> API / Data API):
--   1. Enable Data API: ON (necesario para supabase-js).
--   2. Automatically expose new tables: OFF (control manual de qué se expone).
--   3. Enable automatic RLS: ON en el dashboard, o ejecutar el event trigger
--      del final de este script, que activa RLS en toda tabla nueva de public.

CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  calories NUMERIC(10, 2) NOT NULL CHECK (calories >= 0),
  protein NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (protein >= 0),
  carbs NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (carbs >= 0),
  fat NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (fat >= 0),
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_date DATE NOT NULL, -- la fecha la envía el cliente (zona horaria local)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_goal NUMERIC(10, 2) NOT NULL DEFAULT 2000 CHECK (daily_calorie_goal > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC(10, 2) NOT NULL CHECK (weight > 0),
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals (user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_weight_user_date ON weight_log (user_id, log_date);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own meals" ON meals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own profile" ON user_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own weight" ON weight_log FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Automatic RLS: activa Row Level Security en cada tabla nueva del esquema public.
-- Red de seguridad: una tabla nueva sin políticas queda inaccesible (no expuesta por accidente).
CREATE OR REPLACE FUNCTION public.enable_rls_on_new_tables()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  obj RECORD;
BEGIN
  FOR obj IN
    SELECT * FROM pg_event_trigger_ddl_commands()
    WHERE command_tag = 'CREATE TABLE' AND schema_name = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
  END LOOP;
END;
$$;

DROP EVENT TRIGGER IF EXISTS enable_rls_trigger;
CREATE EVENT TRIGGER enable_rls_trigger
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION public.enable_rls_on_new_tables();
