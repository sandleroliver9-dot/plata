-- Notificaciones por email/push de vencimientos próximos.
--
-- `alert_days` persiste server-side el umbral que hoy vive solo en
-- localStorage (riskProfileSettings.alertDays en financial-preferences.ts):
-- un cron no tiene acceso al localStorage del navegador del usuario, así que
-- para poder decidir "avisale a este usuario 7 días antes" necesita este
-- valor en la base. Default 7 = perfil de riesgo "moderado" (el default de
-- la app hoy), independiente de lo que el usuario haya elegido en el
-- navegador — se sincroniza desde la UI cuando el usuario toca el switch.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_email BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_push BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS alert_days INTEGER NOT NULL DEFAULT 7;

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own push_subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX push_subscriptions_user_idx ON public.push_subscriptions(user_id);

-- Log de avisos ya enviados, para no mandar el mismo aviso todos los días
-- hasta que la fecha llegue. `referencia_id` matchea el id sintético que ya
-- arma buildUpcomingEvents() (ej: "vencimiento-<uuid>", "tarjeta-<id>-<n>",
-- "prestamo-<id>-<n>") — un mismo evento nunca se vuelve a avisar por el
-- mismo canal, ni siquiera si el cron corre de nuevo el mismo día.
CREATE TABLE public.notificaciones_enviadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  referencia_id TEXT NOT NULL,
  canal TEXT NOT NULL CHECK (canal IN ('email', 'push')),
  enviado_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, referencia_id, canal)
);
GRANT SELECT ON public.notificaciones_enviadas TO authenticated;
GRANT ALL ON public.notificaciones_enviadas TO service_role;
ALTER TABLE public.notificaciones_enviadas ENABLE ROW LEVEL SECURITY;
-- Solo lectura para el propio usuario: el cron corre con service_role (que
-- se salta RLS), la app nunca inserta acá directamente.
CREATE POLICY "own notificaciones_enviadas read" ON public.notificaciones_enviadas FOR SELECT USING (auth.uid() = user_id);
