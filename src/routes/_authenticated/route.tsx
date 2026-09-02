import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/app-shell";
import { FeedbackWidget } from "@/components/app/feedback-widget";
import { SimulatorChat } from "@/components/app/simulator-chat";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { PaywallScreen } from "@/components/app/paywall-screen";

// waitForSession() puede tardar hasta 6s reintentando (ver comentario abajo)
// antes de saber si hay sesion o redirigir a /auth. Sin pendingComponent, esos
// 6 segundos se veian como una pantalla negra en blanco, sin ningun indicio de
// que la app esta cargando (el primer vistazo de cualquier tester nuevo).
function AuthPending() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="size-14 rounded-2xl grid place-items-center" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
        <Wallet className="size-7 text-primary-foreground" />
      </div>
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

async function waitForSession() {
  // 24 intentos x 250ms = 6s. Antes eran 3s (12 intentos): en dispositivos o
  // redes lentas alcanzaba a expirar y deslogueaba a un usuario con sesión
  // válida antes de que localStorage terminara de resolver.
  for (let attempt = 0; attempt < 24; attempt += 1) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) return data.session;
    } catch {
      // Reintenta: un fallo puntual de red/storage no debería deslogear.
    }
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }
  return null;
}

// El bloqueo REAL de datos ya está en Supabase (RLS vía
// has_active_entitlement()) — esto es solo para decidir qué pantalla
// mostrar. Si la consulta falla (red, etc.) se deja pasar: en el peor caso
// alguien sin trial activo ve el shell de la app, pero igual no puede leer
// ni escribir ningún dato financiero real, así que no es un agujero de
// seguridad, solo una UX de emergencia.
async function isEntitled(userId: string) {
  try {
    const { data, error } = await supabase
      .from("entitlements")
      .select("status, trial_ends_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return true;
    if (data.status === "paid") return true;
    return new Date(data.trial_ends_at).getTime() > Date.now();
  } catch {
    return true;
  }
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  pendingComponent: AuthPending,
  pendingMs: 200,
  beforeLoad: async () => {
    const session = await waitForSession();
    if (!session) throw redirect({ to: "/auth" });
    const entitled = await isEntitled(session.user.id);
    return { user: session.user, entitled };
  },
  component: () => {
    const { entitled } = Route.useRouteContext();
    if (!entitled) return <PaywallScreen />;
    return (
      <AppShell>
        <Outlet />
        <FeedbackWidget />
        <SimulatorChat />
        <OnboardingWizard />
      </AppShell>
    );
  },
});
