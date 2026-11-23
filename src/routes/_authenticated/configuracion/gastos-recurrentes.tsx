import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { financialDataQuery } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntegerInput } from "@/components/ui/number-input";
import { formatMoney } from "@/lib/finance";
import { clampDay, useFinancialPreferences, type FinancialPreferences, type RecurringFrequency } from "@/lib/financial-preferences";
import { PLATIUM_CARD, PLATIUM_INPUT } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";
import { Field } from "@/components/app/settings-field";

export const Route = createFileRoute("/_authenticated/configuracion/gastos-recurrentes")({
  head: () => ({ meta: [{ title: "Gastos recurrentes · Platium" }] }),
  component: GastosRecurrentesConfigPage,
});

function GastosRecurrentesConfigPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const [preferences, setPreferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const { data } = useQuery(financialDataQuery(user?.id));

  const updatePreferences = (next: (prev: FinancialPreferences) => FinancialPreferences) => setPreferences(next);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Gastos recurrentes"
        subtitle="Ubicamos alquiler, servicios y suscripciones en la fecha en que suelen debitarse."
      />

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        {(data?.fijos?.length ?? 0) === 0 ? (
          <p className="text-sm text-[#70706a]">Primero cargá gastos fijos como alquiler, internet o gimnasio. Después los vas a poder ordenar por fecha.</p>
        ) : (
          <div className="grid gap-3">
            {data?.fijos.map((expense: any) => {
              const item = preferences.recurringSettings[expense.id] ?? {};
              const frequency = item.frequency ?? "mensual";
              return (
                <div key={expense.id} className="grid gap-3 rounded-md border border-[#d9d9d9] p-3 md:grid-cols-[1fr_130px_160px]">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{expense.gasto}</div>
                    <div className="text-xs text-[#70706a] mt-0.5">
                      {expense.categoria ?? "Gasto fijo"} · {formatMoney(Number(expense.monto_mensual), expense.moneda || currency)}
                    </div>
                  </div>
                  <Field label="¿Qué día suele debitarse?">
                    <IntegerInput className={PLATIUM_INPUT}
                      value={item.debitDay ? String(item.debitDay) : ""}
                      placeholder="Día"
                      onChange={(e) => updatePreferences((prev) => ({
                        ...prev,
                        recurringSettings: {
                          ...prev.recurringSettings,
                          [expense.id]: {
                            ...prev.recurringSettings[expense.id],
                            debitDay: e.target.value ? clampDay(e.target.value) : undefined,
                          },
                        },
                      }))}
                    />
                  </Field>
                  <Field label="¿Cada cuánto se repite?">
                    <Select
                      value={frequency}
                      onValueChange={(value) => updatePreferences((prev) => ({
                        ...prev,
                        recurringSettings: {
                          ...prev.recurringSettings,
                          [expense.id]: { ...prev.recurringSettings[expense.id], frequency: value as RecurringFrequency },
                        },
                      }))}
                    >
                      <SelectTrigger className={PLATIUM_INPUT}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="quincenal">Quincenal</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
