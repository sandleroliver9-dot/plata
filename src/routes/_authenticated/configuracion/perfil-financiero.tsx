import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { incomeFrequencyLabel, useFinancialPreferences, type FinancialPreferences } from "@/lib/financial-preferences";
import { PLATIUM_CARD, PLATIUM_INPUT } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";

export const Route = createFileRoute("/_authenticated/configuracion/perfil-financiero")({
  head: () => ({ meta: [{ title: "Perfil financiero · Platium" }] }),
  component: PerfilFinancieroPage,
});

function PerfilFinancieroPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences, setPreferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });

  const updatePreferences = (next: (prev: FinancialPreferences) => FinancialPreferences) => setPreferences(next);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Perfil financiero"
        subtitle="Definí qué tan temprano querés que la app te avise."
      />

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        <Select
          value={preferences.riskProfile}
          onValueChange={(value) => updatePreferences((prev) => ({ ...prev, riskProfile: value as FinancialPreferences["riskProfile"] }))}
        >
          <SelectTrigger className={PLATIUM_INPUT}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="conservador">Conservador</SelectItem>
            <SelectItem value="equilibrado">Equilibrado</SelectItem>
            <SelectItem value="agresivo">Agresivo</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid gap-2 text-sm text-[#70706a]">
          <div><Badge variant="secondary">{preferences.riskProfile}</Badge></div>
          <p><span className="font-medium text-[#111]">Conservador:</span> alerta antes.</p>
          <p><span className="font-medium text-[#111]">Equilibrado:</span> balanceado.</p>
          <p><span className="font-medium text-[#111]">Agresivo:</span> tolera más variación.</p>
          <p>Ingreso principal: {incomeFrequencyLabel(preferences.income.frequency)}.</p>
          <p>Gastos recurrentes configurados: {Object.values(preferences.recurringSettings).filter((x) => x.frequency || x.debitDay).length}</p>
        </div>
      </div>
    </div>
  );
}
