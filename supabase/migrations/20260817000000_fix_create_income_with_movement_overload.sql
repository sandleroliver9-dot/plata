-- Bug real reportado por un tester: al cargar el sueldo (onboarding o
-- Configuración) aparecía "Could not choose the best candidate function
-- between create_income_with_movement(...)".
--
-- Causa: la migración de moneda mixta (20260720030000) agregó `p_moneda` a
-- create_income_with_movement con CREATE OR REPLACE FUNCTION — pero Postgres
-- solo reemplaza una función si la firma (cantidad y tipo de parámetros) es
-- IDÉNTICA. Como la nueva versión tiene un parámetro más, Postgres la creó
-- como una función SOBRECARGADA nueva, dejando la versión vieja (sin
-- p_moneda) todavía viva. src/lib/profile.functions.ts llama a la función
-- pasando solo los primeros 6 parámetros (nunca pasó p_moneda ni p_notas ni
-- p_ajuste_esperado) — como esos parámetros tienen default en AMBAS
-- versiones, Postgres no puede decidir cuál de las dos llamar y tira el
-- error de ambigüedad. src/routes/_authenticated/ingresos.tsx no lo sufre
-- porque siempre pasa los 9 parámetros completos (incluido p_moneda), lo que
-- deja una sola función posible.
--
-- Se borra la versión vieja (8 parámetros, sin p_moneda): la de 9 parámetros
-- ya cubre el mismo comportamiento para cualquier llamador que no pase
-- moneda (p_moneda default NULL = "misma moneda que profiles.currency",
-- documentado en 20260720030000).
DROP FUNCTION IF EXISTS public.create_income_with_movement(
  uuid, text, numeric, date, text, text, text, numeric
);
