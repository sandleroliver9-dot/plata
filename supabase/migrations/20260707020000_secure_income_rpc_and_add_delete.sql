-- create_income_with_movement es SECURITY DEFINER (se salta RLS) y estaba
-- otorgada a `authenticated` sin verificar que auth.uid() coincida con
-- p_user_id: cualquier usuario logueado podia invocarla desde el cliente
-- (supabase.rpc(...)) pasando el user_id de OTRO usuario y crear ingresos +
-- movimientos falsos en su cuenta. Se agrega el chequeo de ownership.
--
-- Ademas, ingresos.tsx (la pantalla real que usan los usuarios, que habla
-- directo con Supabase sin pasar por el backend Express) hacia el alta con
-- dos inserts separados no atomicos -- exactamente el problema que esta
-- funcion fue creada para resolver, pero nunca la llamaba. Se agrega la
-- contraparte de borrado (delete_income_with_movement) para que el flujo
-- completo (alta y baja) sea atomico y seguro de invocar desde el cliente.

CREATE OR REPLACE FUNCTION public.create_income_with_movement(
  p_user_id UUID,
  p_concepto TEXT,
  p_monto NUMERIC(14,2),
  p_fecha_cobro DATE,
  p_mes_financiero TEXT,
  p_tipo TEXT DEFAULT 'Sueldo',
  p_notas TEXT DEFAULT NULL,
  p_ajuste_esperado NUMERIC(14,2) DEFAULT NULL
)
RETURNS public.ingresos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ingreso public.ingresos;
  v_categoria TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  INSERT INTO public.ingresos (
    user_id, concepto, monto, fecha_cobro, mes_financiero, tipo, notas, ajuste_esperado, activo
  ) VALUES (
    p_user_id, p_concepto, p_monto, p_fecha_cobro, p_mes_financiero, p_tipo, p_notas, p_ajuste_esperado, true
  )
  RETURNING * INTO v_ingreso;

  v_categoria := CASE WHEN p_tipo = 'Sueldo' THEN 'Sueldo' ELSE 'Extra' END;

  INSERT INTO public.movimientos (
    user_id, tipo, descripcion, monto, fecha, mes_financiero, categoria, activo, ingreso_id
  ) VALUES (
    p_user_id, 'Ingreso', p_concepto, p_monto, p_fecha_cobro, p_mes_financiero, v_categoria, true, v_ingreso.id
  );

  RETURN v_ingreso;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_income_with_movement(
  p_user_id UUID,
  p_ingreso_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.ingresos SET activo = false WHERE id = p_ingreso_id AND user_id = p_user_id;
  UPDATE public.movimientos SET activo = false WHERE ingreso_id = p_ingreso_id AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_income_with_movement(UUID, UUID) TO authenticated, service_role;
