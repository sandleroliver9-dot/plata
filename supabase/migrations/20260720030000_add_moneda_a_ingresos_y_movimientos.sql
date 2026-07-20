-- Soporte de moneda mixta (ej: sueldo cobrado en USD, gastos en ARS).
--
-- `moneda` es NULLABLE a propósito: NULL significa "misma moneda que
-- profiles.currency" (el comportamiento de hoy, sin cambios), así que
-- ninguna fila existente ni ningún flujo que no pase `moneda` explícita se ve
-- afectado. Sólo las filas que declaran una moneda DISTINTA a la de gastos
-- del usuario disparan conversión (con el tipo de cambio del día) en los
-- cálculos que suman ingresos + gastos (financial-centers.ts, projection.ts).
ALTER TABLE public.ingresos ADD COLUMN IF NOT EXISTS moneda TEXT;
ALTER TABLE public.movimientos ADD COLUMN IF NOT EXISTS moneda TEXT;

-- create_income_with_movement: agrega p_moneda (nullable, al final para no
-- romper ningún llamador existente que no lo pase) y la propaga al
-- movimiento espejo, para que ambas filas sepan en qué moneda está el monto.
CREATE OR REPLACE FUNCTION public.create_income_with_movement(
  p_user_id UUID,
  p_concepto TEXT,
  p_monto NUMERIC(14,2),
  p_fecha_cobro DATE,
  p_mes_financiero TEXT,
  p_tipo TEXT DEFAULT 'Sueldo',
  p_notas TEXT DEFAULT NULL,
  p_ajuste_esperado NUMERIC(14,2) DEFAULT NULL,
  p_moneda TEXT DEFAULT NULL
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
    user_id, concepto, monto, fecha_cobro, mes_financiero, tipo, notas, ajuste_esperado, moneda, activo
  ) VALUES (
    p_user_id, p_concepto, p_monto, p_fecha_cobro, p_mes_financiero, p_tipo, p_notas, p_ajuste_esperado, p_moneda, true
  )
  RETURNING * INTO v_ingreso;

  v_categoria := CASE WHEN p_tipo = 'Sueldo' THEN 'Sueldo' ELSE 'Extra' END;

  INSERT INTO public.movimientos (
    user_id, tipo, descripcion, monto, fecha, mes_financiero, categoria, activo, ingreso_id, moneda
  ) VALUES (
    p_user_id, 'Ingreso', p_concepto, p_monto, p_fecha_cobro, p_mes_financiero, v_categoria, true, v_ingreso.id, p_moneda
  );

  RETURN v_ingreso;
END;
$$;
