import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { updateSavingTarget } from "@/lib/profile.functions";
import { PLATIUM_CARD, PLATIUM_LABEL } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";

export const Route = createFileRoute("/_authenticated/configuracion/objetivo-ahorro")({
  head: () => ({ meta: [{ title: "Objetivo de ahorro · Platium" }] }),
  component: ObjetivoAhorroPage,
});

function ObjetivoAhorroPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [pct, setPct] = useState<number>(() => Number(profile?.saving_target ?? 20));

  useEffect(() => {
    if (profile?.saving_target !== undefined && profile?.saving_target !== null) {
      setPct(Number(profile.saving_target));
    }
  }, [profile?.saving_target]);

  const saveTarget = useServerFn(updateSavingTarget);
  const mutation = useMutation({
    mutationFn: (savingTarget: number) => saveTarget({ data: { savingTarget } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    const saved = Number(profile?.saving_target ?? 20);
    if (pct === saved) return;
    const t = setTimeout(() => mutation.mutate(pct), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, profile?.saving_target]);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Objetivo de ahorro"
        subtitle="Definí qué porcentaje de tus ingresos querés apuntar a ahorrar cada mes."
      />

      <div className={`${PLATIUM_CARD} p-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-[#eaf2fa] grid place-items-center text-[#20376b] shrink-0"><Target className="size-5" /></div>
          <div className="num text-2xl font-bold text-[#20376b]">{pct}%</div>
        </div>
        <Label className={PLATIUM_LABEL}>Objetivo de ahorro</Label>
        <Slider value={[pct]} onValueChange={(v) => setPct(v[0])} min={0} max={60} step={5} className="mt-3" />
        <p className="text-xs text-[#70706a] mt-3">Se usa en el dashboard, en alertas y en insights para avisarte si te estás alejando de tu objetivo.</p>
      </div>
    </div>
  );
}
