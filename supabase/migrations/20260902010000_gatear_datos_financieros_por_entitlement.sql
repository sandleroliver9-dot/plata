-- Bloqueo real de acceso: si el trial venció y el usuario no pagó, Postgres
-- directamente no le devuelve ni le deja escribir sus datos financieros —
-- da lo mismo si entra por la app o por el navegador, no hay forma de
-- esquivarlo del lado del cliente.
--
-- Ojo: esto todavía no tiene pantalla de aviso en la app (queda para
-- cuando esté el diseño final). Hasta entonces, alguien que llegue a este
-- estado va a ver sus pantallas vacías/en cero sin explicación — hoy no le
-- pasa a nadie real porque los usuarios existentes ya quedaron con
-- status='paid' en la migración anterior.
CREATE OR REPLACE FUNCTION public.has_active_entitlement(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements
    WHERE user_id = p_user_id
      AND (status = 'paid' OR trial_ends_at > now())
  );
$$;

-- Movimientos y fuentes de ingreso/gasto
DROP POLICY IF EXISTS "own movimientos" ON public.movimientos;
CREATE POLICY "own movimientos" ON public.movimientos FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own ingresos" ON public.ingresos;
CREATE POLICY "own ingresos" ON public.ingresos FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own gastos_fijos" ON public.gastos_fijos;
CREATE POLICY "own gastos_fijos" ON public.gastos_fijos FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

-- Crédito, cuotas y préstamos
DROP POLICY IF EXISTS "own tarjetas_cuotas" ON public.tarjetas_cuotas;
CREATE POLICY "own tarjetas_cuotas" ON public.tarjetas_cuotas FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own prestamos" ON public.prestamos;
CREATE POLICY "own prestamos" ON public.prestamos FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

-- Patrimonio: inmuebles e inversiones
DROP POLICY IF EXISTS "own inmuebles" ON public.inmuebles;
CREATE POLICY "own inmuebles" ON public.inmuebles FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own inversiones" ON public.inversiones;
CREATE POLICY "own inversiones" ON public.inversiones FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own activos" ON public.inversiones_activos;
CREATE POLICY "own activos" ON public.inversiones_activos FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own compras" ON public.inversiones_compras;
CREATE POLICY "own compras" ON public.inversiones_compras FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own ventas" ON public.inversiones_ventas;
CREATE POLICY "own ventas" ON public.inversiones_ventas FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own dividendos" ON public.inversiones_dividendos;
CREATE POLICY "own dividendos" ON public.inversiones_dividendos FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

-- Metas y vencimientos
DROP POLICY IF EXISTS "own metas" ON public.metas;
CREATE POLICY "own metas" ON public.metas FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

DROP POLICY IF EXISTS "own vencimientos" ON public.vencimientos;
CREATE POLICY "own vencimientos" ON public.vencimientos FOR ALL
  USING (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.has_active_entitlement(auth.uid()));

-- No se tocan a propósito: profiles (necesario para que la app sepa quién
-- es y muestre la futura pantalla de "pagá para seguir"), entitlements (el
-- propio estado de pago, tiene que poder leerse siempre), categorias
-- (configuración liviana, sin valor económico en sí misma), feedback
-- (tiene que poder seguir escribiendo aunque el trial haya vencido, por si
-- quiere reclamar o cancelar), y push_subscriptions/notificaciones_enviadas
-- (mecanismo de notificaciones, no datos financieros).
