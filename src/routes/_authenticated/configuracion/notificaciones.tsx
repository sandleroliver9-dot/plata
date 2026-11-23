import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { IntegerInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { updateNotificationPreferences, savePushSubscription, deletePushSubscription } from "@/lib/notifications.functions";
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";
import { PLATIUM_CARD, PLATIUM_INPUT } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";
import { Field } from "@/components/app/settings-field";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const Route = createFileRoute("/_authenticated/configuracion/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones · Platium" }] }),
  component: NotificacionesConfigPage,
});

function NotificacionesConfigPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();

  const [notifForm, setNotifForm] = useState({
    notifyEmail: profile?.notify_email ?? true,
    notifyPush: profile?.notify_push ?? false,
    alertDays: String(profile?.alert_days ?? 7),
  });

  useEffect(() => {
    setNotifForm({
      notifyEmail: profile?.notify_email ?? true,
      notifyPush: profile?.notify_push ?? false,
      alertDays: String(profile?.alert_days ?? 7),
    });
  }, [profile?.notify_email, profile?.notify_push, profile?.alert_days]);

  const saveNotifPrefs = useServerFn(updateNotificationPreferences);
  const savePush = useServerFn(savePushSubscription);
  const deletePush = useServerFn(deletePushSubscription);

  const notifMutation = useMutation({
    mutationFn: async (next: Partial<typeof notifForm>) => {
      const merged = { ...notifForm, ...next };
      await saveNotifPrefs({
        data: { notifyEmail: merged.notifyEmail, notifyPush: merged.notifyPush, alertDays: Number(merged.alertDays) || 7 },
      });
      return merged;
    },
    onSuccess: (merged) => {
      setNotifForm(merged);
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleTogglePush(checked: boolean) {
    if (checked) {
      if (!VAPID_PUBLIC_KEY) {
        toast.info("Las notificaciones push todavía no están configuradas en esta cuenta.");
        return;
      }
      try {
        const sub = await subscribeToPush(VAPID_PUBLIC_KEY);
        await savePush({ data: sub });
        notifMutation.mutate({ notifyPush: true });
        toast.success("Notificaciones push activadas");
      } catch (e: any) {
        toast.error(e?.message || "No se pudo activar las notificaciones push");
      }
    } else {
      try {
        const endpoint = await unsubscribeFromPush();
        if (endpoint) await deletePush({ data: { endpoint } });
      } catch {
        // Si falla la baja del lado del navegador igual apagamos la
        // preferencia server-side: el cron deja de mandar independientemente.
      }
      notifMutation.mutate({ notifyPush: false });
    }
  }

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Notificaciones"
        subtitle="Te avisamos cuando tenés vencimientos próximos, por email y/o notificación push del navegador."
      />

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Avisarme por email</div>
            <div className="text-xs text-[#70706a]">Un resumen cuando tenés vencimientos próximos.</div>
          </div>
          <Switch checked={notifForm.notifyEmail} onCheckedChange={(v) => notifMutation.mutate({ notifyEmail: v })} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Notificaciones push</div>
            <div className="text-xs text-[#70706a]">
              {isPushSupported() ? "Directo en tu navegador, sin abrir la app." : "Tu navegador no soporta notificaciones push."}
            </div>
          </div>
          <Switch
            checked={notifForm.notifyPush}
            onCheckedChange={handleTogglePush}
            disabled={!isPushSupported() || !VAPID_PUBLIC_KEY}
          />
        </div>
        <Field label="Avisarme con cuántos días de anticipación">
          <IntegerInput className={PLATIUM_INPUT}
            value={notifForm.alertDays}
            onChange={(e) => setNotifForm({ ...notifForm, alertDays: e.target.value })}
            onBlur={() => notifMutation.mutate({ alertDays: notifForm.alertDays })}
            placeholder="7"
          />
        </Field>
      </div>
    </div>
  );
}
