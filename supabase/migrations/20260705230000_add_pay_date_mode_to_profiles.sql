-- El "tipo de fecha de cobro" (día fijo / primer, segundo, tercer o último día
-- hábil / variable) vivía solo en localStorage del navegador, desconectado del
-- pay_day que sí se guarda en el perfil. Eso hacía que Alertas/Insights/
-- Proyecciones/Configuración pudieran calcular "en qué mes financiero estamos"
-- distinto a Dashboard/Movimientos/Ingresos, y que la configuración no viajara
-- entre dispositivos. Se centraliza acá.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pay_date_mode text NOT NULL DEFAULT 'fixed_day'
  CHECK (pay_date_mode IN ('fixed_day', 'first_business_day', 'second_business_day', 'third_business_day', 'last_business_day', 'variable'));
