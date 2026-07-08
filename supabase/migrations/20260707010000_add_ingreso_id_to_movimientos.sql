-- Cuando se carga un ingreso, se crea un movimiento espejo (tipo "Ingreso")
-- para que impacte en el cashflow. Hasta ahora no había ningún vínculo real
-- entre ambas filas: para borrar el movimiento al eliminar el ingreso, el
-- código lo buscaba por heurística (descripcion+monto+fecha+tipo), lo que
-- podía borrar el movimiento equivocado si había otro similar ese mismo día.
-- Este FK reemplaza esa heurística por un vínculo real.

ALTER TABLE public.movimientos
  ADD COLUMN ingreso_id UUID REFERENCES public.ingresos(id) ON DELETE SET NULL;

CREATE INDEX movimientos_ingreso_id_idx ON public.movimientos(ingreso_id) WHERE ingreso_id IS NOT NULL;

-- La función RPC usada por el backend Express para el alta atómica de
-- ingresos también debe vincular el movimiento al ingreso recién creado.
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
    user_id, tipo, descripcion, monto, fecha, mes_financiero, categoria, activo, ingreso_id
  ) VALUES (
    p_user_id, 'Ingreso', p_concepto, p_monto, p_fecha_cobro, p_mes_financiero, v_categoria, true, v_ingreso.id
  );

  RETURN v_ingreso;
END;
$$;
