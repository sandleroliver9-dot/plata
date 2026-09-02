-- Recordatorio de sueldo: el cron de notificaciones (ver
-- notifications.functions.ts) avisa por push/email cuando llega el día de
-- cobro configurado (o, en modo "variable", una vez por semana) y todavía no
-- se cargó el Sueldo del período actual. El monto sugerido reusa la misma
-- cuenta que ya existe en Ingresos (último sueldo + inflación INDEC), así que
-- no hace falta ninguna tabla nueva para eso.
--
-- Lo único que faltaba persistir es el "Todavía no cobré" — que el usuario
-- pueda frenar los recordatorios de ESTE período sin tener que cargar un
-- ingreso falso. Vive en su propia tabla (no en profiles) porque es un
-- estado por período, no por usuario: el mes que viene vuelve a poder avisar
-- normalmente.
CREATE TABLE public.salary_reminder_dismissals (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mes_financiero TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, mes_financiero)
);
GRANT SELECT, INSERT ON public.salary_reminder_dismissals TO authenticated;
GRANT ALL ON public.salary_reminder_dismissals TO service_role;
ALTER TABLE public.salary_reminder_dismissals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own salary_reminder_dismissals" ON public.salary_reminder_dismissals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
