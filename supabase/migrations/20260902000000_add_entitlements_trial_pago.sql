-- Base del sistema de monetización: prueba gratis de 7 días + estado de pago.
--
-- Se guarda en una tabla APARTE de `profiles` a propósito: la policy RLS de
-- profiles ("own profile" FOR ALL USING auth.uid() = id) deja al usuario
-- editar cualquier columna de su propia fila. Si el estado de pago viviera
-- ahí, cualquiera podría marcarse "pagado" desde la consola del navegador
-- con un simple update. Acá el usuario solo puede LEER su propio estado —
-- escribirlo va a quedar reservado al backend (service_role), cuando se
-- conecten los webhooks de pago (Stripe / RevenueCat) más adelante.
CREATE TABLE public.entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'paid')),
  trial_ends_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_source TEXT CHECK (payment_source IN ('apple', 'google', 'stripe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo lectura para el usuario dueño de la fila. Sin policy de INSERT/UPDATE/
-- DELETE para `authenticated`: nadie autenticado puede escribir acá, ni
-- siquiera su propia fila. Únicamente `service_role` (que no pasa por RLS)
-- va a poder marcar un pago como confirmado.
GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own entitlement" ON public.entitlements FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER entitlements_updated_at BEFORE UPDATE ON public.entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- A partir de ahora, todo usuario nuevo arranca con 7 días de prueba gratis
-- desde el momento en que se crea la cuenta.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.entitlements (user_id, status, trial_ends_at)
  VALUES (NEW.id, 'trial', now() + interval '7 days');

  INSERT INTO public.categorias (user_id, nombre, tipo, prioridad, color) VALUES
    (NEW.id, 'Sueldo', 'Ingreso', 'Alta', '#10b981'),
    (NEW.id, 'Bonos', 'Ingreso', 'Media', '#34d399'),
    (NEW.id, 'Extra', 'Ingreso', 'Baja', '#6ee7b7'),
    (NEW.id, 'Alquiler', 'Gasto', 'Alta', '#ef4444'),
    (NEW.id, 'Servicios', 'Gasto', 'Alta', '#f97316'),
    (NEW.id, 'Supermercado', 'Gasto', 'Alta', '#f59e0b'),
    (NEW.id, 'Transporte', 'Gasto', 'Media', '#eab308'),
    (NEW.id, 'Tarjeta', 'Gasto', 'Alta', '#8b5cf6'),
    (NEW.id, 'Préstamo', 'Gasto', 'Alta', '#a855f7'),
    (NEW.id, 'Salud', 'Gasto', 'Alta', '#ec4899'),
    (NEW.id, 'Ocio', 'Gasto', 'Baja', '#06b6d4'),
    (NEW.id, 'Educación', 'Gasto', 'Media', '#3b82f6'),
    (NEW.id, 'Otros', 'Gasto', 'Baja', '#64748b');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Usuarios que ya existen hoy (vos y los testers): se los marca como
-- "paid" directamente, sin trial — son quienes probaron la app antes de
-- que existiera el cobro, no tiene sentido cortarles el acceso ahora.
INSERT INTO public.entitlements (user_id, status, trial_ends_at, paid_at, payment_source)
SELECT id, 'paid', now(), now(), NULL
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
