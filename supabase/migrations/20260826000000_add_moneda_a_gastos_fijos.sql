-- Soporte de moneda mixta para gastos fijos (ej: alquiler o Netflix pagado
-- en USD). Mismo criterio que la migración anterior para ingresos y
-- movimientos: `moneda` es NULLABLE a propósito, NULL significa "misma
-- moneda que profiles.currency" (comportamiento de hoy, sin cambios), así
-- que ninguna fila existente se ve afectada.
ALTER TABLE public.gastos_fijos ADD COLUMN IF NOT EXISTS moneda TEXT;
