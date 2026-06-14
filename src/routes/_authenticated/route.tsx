import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/app-shell";
import { FeedbackWidget } from "@/components/app/feedback-widget";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";

async function waitForSession() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }
  return null;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && window.localStorage.getItem("plata_preview_mode") === "1") {
      return { user: null };
    }
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
