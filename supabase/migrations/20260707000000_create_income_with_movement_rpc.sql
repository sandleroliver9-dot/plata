-- El backend Express (API) da de alta un ingreso y su movimiento espejo (asi
-- getMonthlyCashflow, que lee de `movimientos`, ve el ingreso) en dos inserts
-- separados desde Node. Si el segundo insert fallaba, quedaba el primero a
-- medias sin ninguna forma de deshacerlo. Esta funcion hace ambos inserts en
-- una unica transaccion de Postgres.

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
  INSERT INTO public.ingresos (
    user_id, concepto, monto, fecha_cobro, mes_financiero, tipo, notas, ajuste_esperado, activo
  ) VALUES (
    p_user_id, p_concepto, p_monto, p_fecha_cobro, p_mes_financiero, p_tipo, p_notas, p_ajuste_esperado, true
  )
  RETURNING * INTO v_ingreso;

  v_categoria := CASE WHEN p_tipo = 'Sueldo' THEN 'Sueldo' ELSE 'Extra' END;

  INSERT INTO public.movimientos (
    user_id, tipo, descripcion, monto, fecha, mes_financiero, categoria, activo
  ) VALUES (
    p_user_id, 'Ingreso', p_concepto, p_monto, p_fecha_cobro, p_mes_financiero, v_categoria, true
  );

  RETURN v_ingreso;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_income_with_movement(
  UUID, TEXT, NUMERIC(14,2), DATE, TEXT, TEXT, TEXT, NUMERIC(14,2)
) TO authenticated, service_role;
