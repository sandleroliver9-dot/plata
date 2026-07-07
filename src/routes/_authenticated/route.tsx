import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/app-shell";
import { FeedbackWidget } from "@/components/app/feedback-widget";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";

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

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await waitForSession();
    if (!session) throw redirect({ to: "/auth" });
    return { user: session.user };
  },
  component: () => (
    <AppShell>
      <Outlet />
      <FeedbackWidget />
      <OnboardingWizard />
    </AppShell>
  ),
});
