import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { financialDataQuery, useDolarTC } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DecimalInput } from "@/components/ui/number-input";
import { formatMoney } from "@/lib/finance";
import { parseNumberInput } from "@/lib/number-input";
import { getEmergencyFundSummary, getMonthlyCashflow } from "@/lib/financial-centers";
import { useFinancialPreferences, type FinancialPreferences } from "@/lib/financial-preferences";
import { PLATIUM_CARD, PLATIUM_LABEL, PLATIUM_INPUT } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";
import { Field } from "@/components/app/settings-field";

export const Route = createFileRoute("/_authenticated/configuracion/fondo-emergencia")({
  head: () => ({ meta: [{ title: "Fondo de emergencia · Platium" }] }),
  component: FondoEmergenciaPage,
});

function parseSoftAmount(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const parsed = parseNumberInput(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function FondoEmergenciaPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const [preferences, setPreferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });

  const { data } = useQuery(financialDataQuery(user?.id));
  const { tc } = useDolarTC();

  const cash = getMonthlyCashflow({
    profile,
    movimientos: data?.movimientos,
    ingresos: data?.ingresos,
    gastosFijos: data?.fijos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    preferences,
    tc,
  });
  const emergency = getEmergencyFundSummary(cash, preferences);

  const updatePreferences = (next: (prev: FinancialPreferences) => FinancialPreferences) => setPreferences(next);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Fondo de emergencia"
        subtitle="Comparamos tu fondo actual contra tus gastos estimados."
      />

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#eaf2fa] grid place-items-center text-[#20376b] shrink-0"><Shield className="size-5" /></div>
          <div>
            <div className="num text-2xl font-bold text-[#20376b]">{formatMoney(emergency.current, currency)}</div>
            <div className="text-xs text-[#70706a]">de {formatMoney(emergency.recommended, currency)} recomendados · cubre {emergency.coveredMonths.toFixed(1)} meses</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Meses objetivo">
            <Select
              value={String(preferences.emergencyFund.months)}
              onValueChange={(value) => updatePreferences((prev) => ({
                ...prev,
                emergencyFund: { ...prev.emergencyFund, months: Number(value) as 3 | 6 | 12 },
              }))}
            >
              <SelectTrigger className={PLATIUM_INPUT}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fondo actual">
            <DecimalInput className={PLATIUM_INPUT}
              value={preferences.emergencyFund.current ? String(preferences.emergencyFund.current) : ""}
              placeholder="Ej: 500000"
              onChange={(e) => updatePreferences((prev) => ({
                ...prev,
                emergencyFund: { ...prev.emergencyFund, current: parseSoftAmount(e.target.value) },
              }))}
            />
          </Field>
        </div>

        <div className="rounded-md border border-[#d9d9d9] p-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-[#70706a]">Falta para tu objetivo</span>
            <span className="num font-semibold">{formatMoney(emergency.gap, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
