
-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============== PROFILES ===============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  country TEXT DEFAULT 'AR',
  currency TEXT NOT NULL DEFAULT 'ARS',
  salary NUMERIC(14,2) DEFAULT 0,
  pay_day INTEGER DEFAULT 1 CHECK (pay_day BETWEEN 1 AND 31),
  overdraft_allowed NUMERIC(14,2) DEFAULT 0,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== CATEGORIAS ===============
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Ingreso','Gasto')),
  prioridad TEXT DEFAULT 'Media' CHECK (prioridad IN ('Alta','Media','Baja')),
  color TEXT DEFAULT '#4f46e5',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias TO authenticated;
GRANT ALL ON public.categorias TO service_role;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own categorias" ON public.categorias FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX categorias_user_idx ON public.categorias(user_id);

-- =============== MOVIMIENTOS ===============
CREATE TABLE public.movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  fecha DATE NOT NULL,
  mes_financiero TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Ingreso','Gasto')),
  categoria TEXT,
  descripcion TEXT,
  medio TEXT,
  monto NUMERIC(14,2) NOT NULL,
  tarjeta TEXT,
  es_cuota BOOLEAN NOT NULL DEFAULT false,
  cuota_origen_id UUID,
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movimientos TO authenticated;
GRANT ALL ON public.movimientos TO service_role;
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own movimientos" ON public.movimientos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX movimientos_user_fecha_idx ON public.movimientos(user_id, fecha DESC);
CREATE INDEX movimientos_user_mes_idx ON public.movimientos(user_id, mes_financiero);
CREATE TRIGGER movimientos_updated_at BEFORE UPDATE ON public.movimientos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== INGRESOS ===============
CREATE TABLE public.ingresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  fecha_cobro DATE NOT NULL,
  mes_financiero TEXT NOT NULL,
  concepto TEXT NOT NULL,
  tipo TEXT DEFAULT 'Sueldo' CHECK (tipo IN ('Sueldo','Bono','Aguinaldo','Extra','Otro')),
  monto NUMERIC(14,2) NOT NULL,
  ajuste_esperado NUMERIC(14,2) DEFAULT 0,
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingresos TO authenticated;
GRANT ALL ON public.ingresos TO service_role;
ALTER TABLE public.ingresos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ingresos" ON public.ingresos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ingresos_user_idx ON public.ingresos(user_id, fecha_cobro DESC);

-- =============== GASTOS FIJOS ===============
CREATE TABLE public.gastos_fijos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  gasto TEXT NOT NULL,
  categoria TEXT,
  monto_mensual NUMERIC(14,2) NOT NULL,
  inicio DATE,
  fin DATE,
  medio TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gastos_fijos TO authenticated;
GRANT ALL ON public.gastos_fijos TO service_role;
ALTER TABLE public.gastos_fijos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own gastos_fijos" ON public.gastos_fijos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX gastos_fijos_user_idx ON public.gastos_fijos(user_id);

-- =============== TARJETAS CUOTAS ===============
CREATE TABLE public.tarjetas_cuotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  compra TEXT NOT NULL,
  tarjeta TEXT NOT NULL,
  valor_cuota NUMERIC(14,2) NOT NULL,
  cuota_actual INTEGER NOT NULL DEFAULT 1,
  cuotas_totales INTEGER NOT NULL CHECK (cuotas_totales > 0),
  inicio DATE NOT NULL,
  fin DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarjetas_cuotas TO authenticated;
GRANT ALL ON public.tarjetas_cuotas TO service_role;
ALTER TABLE public.tarjetas_cuotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tarjetas_cuotas" ON public.tarjetas_cuotas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX tarjetas_cuotas_user_idx ON public.tarjetas_cuotas(user_id);

-- =============== PRESTAMOS ===============
CREATE TABLE public.prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cuota_mensual NUMERIC(14,2) NOT NULL,
  cuotas_totales INTEGER NOT NULL,
  cuotas_pagadas INTEGER NOT NULL DEFAULT 0,
  tasa NUMERIC(6,3) DEFAULT 0,
  inicio DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prestamos TO authenticated;
GRANT ALL ON public.prestamos TO service_role;
ALTER TABLE public.prestamos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prestamos" ON public.prestamos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============== INVERSIONES ===============
CREATE TABLE public.inversiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL,
  activo_nombre TEXT NOT NULL,
  ticker TEXT,
  moneda TEXT NOT NULL DEFAULT 'USD',
  cantidad NUMERIC(18,6) NOT NULL DEFAULT 0,
  precio_compra NUMERIC(18,6) NOT NULL DEFAULT 0,
  valor_actual NUMERIC(18,6) NOT NULL DEFAULT 0,
  broker TEXT,
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inversiones TO authenticated;
GRANT ALL ON public.inversiones TO service_role;
ALTER TABLE public.inversiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inversiones" ON public.inversiones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============== INMUEBLES ===============
CREATE TABLE public.inmuebles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  propiedad TEXT NOT NULL,
  tipo TEXT,
  pais TEXT,
  ciudad TEXT,
  moneda TEXT NOT NULL DEFAULT 'USD',
  valor_estimado NUMERIC(14,2) NOT NULL DEFAULT 0,
  deuda_asociada NUMERIC(14,2) NOT NULL DEFAULT 0,
  fecha_tasacion DATE,
  alquilado BOOLEAN NOT NULL DEFAULT false,
  renta_mensual NUMERIC(14,2) DEFAULT 0,
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inmuebles TO authenticated;
GRANT ALL ON public.inmuebles TO service_role;
ALTER TABLE public.inmuebles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inmuebles" ON public.inmuebles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============== METAS ===============
CREATE TABLE public.metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  meta TEXT NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  objetivo NUMERIC(14,2) NOT NULL,
  ahorrado NUMERIC(14,2) NOT NULL DEFAULT 0,
  fecha_objetivo DATE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas TO authenticated;
GRANT ALL ON public.metas TO service_role;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own metas" ON public.metas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============== VENCIMIENTOS ===============
CREATE TABLE public.vencimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  monto NUMERIC(14,2) NOT NULL,
  fecha DATE NOT NULL,
  recurrente BOOLEAN NOT NULL DEFAULT false,
  pagado BOOLEAN NOT NULL DEFAULT false,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vencimientos TO authenticated;
GRANT ALL ON public.vencimientos TO service_role;
ALTER TABLE public.vencimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own vencimientos" ON public.vencimientos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX vencimientos_user_fecha_idx ON public.vencimientos(user_id, fecha);

-- =============== AUTO PROFILE + CATEGORIAS ON SIGNUP ===============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.categorias (user_id, nombre, tipo, prioridad, color) VALUES
    (NEW.id, 'Sueldo', 'Ingreso', 'Alta', '#10b981'),
    (NEW.id, 'Bonos', 'Ingreso', 'Media', '#34d399'),
    (NEW.id, 'Extra', 'Ingreso', 'Baja', '#6ee7b7'),
    (NEW.id, 'Alquiler', 'Gasto', 'Alta', '#ef4444'),
    (NEW.id, 'Servicios', 'Gasto', 'Alta', '#f97316'),
    (NEW.id, 'Supermercado', 'Gasto', 'Alta', '#f59e0b'),
    (NEW.id, 'Transporte', 'Gasto', 'Media', '#eab308'),
    (NEW.id, 'Tarjeta', 'Gasto', 'Alta', '#8b5cf6'),
    (NEW.id, 'Préstamo', 'Gasto', 'Alta', '#a855f7'),
    (NEW.id, 'Salud', 'Gasto', 'Alta', '#ec4899'),
    (NEW.id, 'Ocio', 'Gasto', 'Baja', '#06b6d4'),
    (NEW.id, 'Educación', 'Gasto', 'Media', '#3b82f6'),
    (NEW.id, 'Otros', 'Gasto', 'Baja', '#64748b');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
