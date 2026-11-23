import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { financialDataQuery } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DecimalInput, IntegerInput } from "@/components/ui/number-input";
import { formatMoney } from "@/lib/finance";
import {
  clampDay,
  payDateModeLabel,
  useFinancialPreferences,
  type FinancialPreferences,
  type IncomeFrequency,
  type PayDateMode,
} from "@/lib/financial-preferences";
import { parseIntegerInput, parseOptionalNumberInput } from "@/lib/number-input";
import { updateFinancialProfile } from "@/lib/profile.functions";
import { PLATIUM_CARD, PLATIUM_BUTTON_PRIMARY, PLATIUM_INPUT } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";
import { Field } from "@/components/app/settings-field";

export const Route = createFileRoute("/_authenticated/configuracion/ingresos")({
  head: () => ({ meta: [{ title: "Ingresos y cobros · Platium" }] }),
  component: IngresosConfigPage,
});

function IngresosConfigPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [preferences, setPreferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const [profileForm, setProfileForm] = useState({
    payDay: String(profile?.pay_day ?? 1),
    salary: String(profile?.salary ?? ""),
  });

  useEffect(() => {
    setProfileForm({
      payDay: String(profile?.pay_day ?? 1),
      salary: profile?.salary ? String(profile.salary) : "",
    });
  }, [profile?.pay_day, profile?.salary]);

  const { data } = useQuery(financialDataQuery(user?.id));

  const saveProfile = useServerFn(updateFinancialProfile);
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const payDay = clampDay(parseIntegerInput(profileForm.payDay, "Dia de cobro", 1));
      const salary = parseOptionalNumberInput(profileForm.salary, 0, "Sueldo");
      // El objetivo de ahorro se edita en su propia pantalla, pero esta
      // funcion de servidor siempre pisa esa columna: hay que reenviar el
      // valor actual del perfil, no un default, o se resetearia solo.
      const savingTarget = Number(profile?.saving_target ?? 20);
      await saveProfile({
        data: {
          payDay,
          salary,
          savingTarget,
          payDateMode: preferences.income.payDateMode,
          incomeFrequency: preferences.income.frequency,
        },
      });
    },
    onSuccess: () => {
      toast.success("Configuración guardada");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      qc.invalidateQueries({ queryKey: ["financial-data", user?.id] });
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updatePreferences = (next: (prev: FinancialPreferences) => FinancialPreferences) => setPreferences(next);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Ingresos y cobros"
        subtitle="¿Cuándo cobrás normalmente? Esto ayuda a proyectar tu liquidez con más precisión."
      />

      <div className="flex justify-end">
        <Button className={PLATIUM_BUTTON_PRIMARY} onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending}>
          Guardar
        </Button>
      </div>

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Tipo de fecha de cobro">
            <Select
              value={preferences.income.payDateMode}
              onValueChange={(value) => updatePreferences((prev) => ({
                ...prev,
                income: { ...prev.income, payDateMode: value as PayDateMode },
              }))}
            >
              <SelectTrigger className={PLATIUM_INPUT}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_day">Día fijo del mes</SelectItem>
                <SelectItem value="first_business_day">Primer día hábil del mes</SelectItem>
                <SelectItem value="second_business_day">Segundo día hábil del mes</SelectItem>
                <SelectItem value="third_business_day">Tercer día hábil del mes</SelectItem>
                <SelectItem value="last_business_day">Último día hábil del mes</SelectItem>
                <SelectItem value="variable">Personalizado / variable</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#70706a]">{payDateModeLabel(preferences.income.payDateMode)}</p>
          </Field>
          {preferences.income.payDateMode === "fixed_day" ? (
            <Field label="Día de cobro">
              <IntegerInput className={PLATIUM_INPUT} value={profileForm.payDay} onChange={(e) => setProfileForm({ ...profileForm, payDay: e.target.value })} placeholder="1 a 31" />
            </Field>
          ) : preferences.income.payDateMode === "variable" ? (
            <div className="rounded-md border border-[#d9d9d9] bg-[#f5f5f4] p-3 text-sm text-[#70706a]">
              Si tu fecha cambia mucho, cargá cada ingreso manualmente cuando lo sepas.
            </div>
          ) : null}
          <Field label="Frecuencia de cobro">
            <Select value={preferences.income.frequency} onValueChange={(value) => updatePreferences((prev) => ({ ...prev, income: { ...prev.income, frequency: value as IncomeFrequency } }))}>
              <SelectTrigger className={PLATIUM_INPUT}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="quincenal">Quincenal</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#70706a]">Esto indica cada cuánto suele entrar ese ingreso.</p>
          </Field>
          <Field label="Sueldo o ingreso principal">
            <DecimalInput className={PLATIUM_INPUT} value={profileForm.salary} onChange={(e) => setProfileForm({ ...profileForm, salary: e.target.value })} placeholder="Ej: 1500000" />
          </Field>
        </div>

        {(data?.ingresos?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#70706a]">Ingresos cargados</div>
            <div className="divide-y divide-[#d9d9d9] border-t border-[#d9d9d9]">
              {data?.ingresos.map((income: any) => {
                const item = preferences.incomeSettings[income.id] ?? {};
                return (
                  <div key={income.id} className="grid gap-3 py-4 md:grid-cols-[1fr_120px_160px]">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{income.concepto}</div>
                      <div className="text-xs text-[#70706a] mt-0.5">
                        {income.tipo ?? "Ingreso"} · {formatMoney(Number(income.monto), currency)} · {income.fecha_cobro}
                      </div>
                    </div>
                    <IntegerInput className={PLATIUM_INPUT}
                      aria-label={`Día de cobro de ${income.concepto}`}
                      value={item.payDay ? String(item.payDay) : ""}
                      placeholder="Día"
                      onChange={(e) => updatePreferences((prev) => ({
                        ...prev,
                        incomeSettings: {
                          ...prev.incomeSettings,
                          [income.id]: {
                            ...prev.incomeSettings[income.id],
                            payDay: e.target.value ? clampDay(e.target.value) : undefined,
                          },
                        },
                      }))}
                    />
                    <Select
                      value={item.frequency ?? "variable"}
                      onValueChange={(value) => updatePreferences((prev) => ({
                        ...prev,
                        incomeSettings: {
                          ...prev.incomeSettings,
                          [income.id]: { ...prev.incomeSettings[income.id], frequency: value as IncomeFrequency },
                        },
                      }))}
                    >
                      <SelectTrigger className={PLATIUM_INPUT}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="quincenal">Quincenal</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#70706a]">Primero cargá un ingreso en la sección Ingresos. Después vas a poder ajustar cada uno si hace falta.</p>
        )}
      </div>
    </div>
  );
}
