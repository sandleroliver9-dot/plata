
-- Activos
CREATE TABLE public.inversiones_activos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker text,
  nombre text NOT NULL,
  tipo text NOT NULL,
  sector text,
  moneda_base text NOT NULL DEFAULT 'USD',
  valor_actual_usd numeric(18,6),
  precio_actualizado_en timestamptz,
  activo boolean NOT NULL DEFAULT true,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inversiones_activos TO authenticated;
GRANT ALL ON public.inversiones_activos TO service_role;
ALTER TABLE public.inversiones_activos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own activos" ON public.inversiones_activos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_inv_activos_updated BEFORE UPDATE ON public.inversiones_activos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX inv_activos_user_idx ON public.inversiones_activos(user_id);

-- Compras
CREATE TABLE public.inversiones_compras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activo_id uuid NOT NULL REFERENCES public.inversiones_activos(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  cantidad numeric(18,6) NOT NULL,
  precio_usd numeric(18,6) NOT NULL,
  tc numeric(18,6),
  broker text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inversiones_compras TO authenticated;
GRANT ALL ON public.inversiones_compras TO service_role;
ALTER TABLE public.inversiones_compras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own compras" ON public.inversiones_compras
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX inv_compras_user_activo_idx ON public.inversiones_compras(user_id, activo_id);

-- Ventas
CREATE TABLE public.inversiones_ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activo_id uuid NOT NULL REFERENCES public.inversiones_activos(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  cantidad numeric(18,6) NOT NULL,
  precio_usd numeric(18,6) NOT NULL,
  tc numeric(18,6),
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inversiones_ventas TO authenticated;
GRANT ALL ON public.inversiones_ventas TO service_role;
ALTER TABLE public.inversiones_ventas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ventas" ON public.inversiones_ventas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX inv_ventas_user_activo_idx ON public.inversiones_ventas(user_id, activo_id);

-- Dividendos
CREATE TABLE public.inversiones_dividendos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activo_id uuid NOT NULL REFERENCES public.inversiones_activos(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  monto_usd numeric(18,6) NOT NULL,
  tc numeric(18,6),
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inversiones_dividendos TO authenticated;
GRANT ALL ON public.inversiones_dividendos TO service_role;
ALTER TABLE public.inversiones_dividendos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dividendos" ON public.inversiones_dividendos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX inv_divs_user_activo_idx ON public.inversiones_dividendos(user_id, activo_id);

-- Backfill desde la tabla anterior
DO $$
DECLARE r record; new_activo uuid; precio_usd numeric; tc numeric;
BEGIN
  FOR r IN SELECT * FROM public.inversiones WHERE activo = true LOOP
    INSERT INTO public.inversiones_activos (user_id, ticker, nombre, tipo, moneda_base, valor_actual_usd)
    VALUES (
      r.user_id, r.ticker, r.activo_nombre, r.tipo, r.moneda,
      CASE WHEN r.moneda = 'USD' THEN r.valor_actual ELSE NULL END
    ) RETURNING id INTO new_activo;

    IF r.moneda = 'USD' THEN
      precio_usd := r.precio_compra;
      tc := NULL;
    ELSE
      precio_usd := r.precio_compra; -- placeholder; sin TC histórico
      tc := 1;
    END IF;

    INSERT INTO public.inversiones_compras (user_id, activo_id, fecha, cantidad, precio_usd, tc, broker)
    VALUES (r.user_id, new_activo, r.fecha, r.cantidad, precio_usd, tc, r.broker);
  END LOOP;
END $$;
