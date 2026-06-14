import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Shield, Wallet, CreditCard, Receipt, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DecimalInput, IntegerInput } from "@/components/ui/number-input";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/finance";
import { getEmergencyFundSummary, getMonthlyCashflow } from "@/lib/financial-centers";
import {
  clampDay,
  incomeFrequencyLabel,
  payDateModeLabel,
  useFinancialPreferences,
  type FinancialPreferences,
  type IncomeFrequency,
  type PayDateMode,
  type RecurringFrequency,
} from "@/lib/financial-preferences";
import { parseIntegerInput, parseNumberInput, parseOptionalNumberInput } from "@/lib/number-input";
import { updateFinancialProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/configuracion")({
  head: () => ({ meta: [{ title: "Configuracion · Plata" }] }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [preferences, setPreferences] = useFinancialPreferences(user?.id);
  const [profileForm, setProfileForm] = useState({
    payDay: String(profile?.pay_day ?? 1),
    salary: String(profile?.salary ?? ""),
    savingTarget: String(profile?.saving_target ?? 20),
  });

  useEffect(() => {
    setProfileForm({
      payDay: String(profile?.pay_day ?? 1),
      salary: profile?.salary ? String(profile.salary) : "",
      savingTarget: String(profile?.saving_target ?? 20),
    });
  }, [profile?.pay_day, profile?.salary, profile?.saving_target]);

  const { data } = useQuery({
    queryKey: ["financial-settings-data", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [ingresos, fijos, tarjetas, prestamos, movimientos] = await Promise.all([
        supabase.from("ingresos").select("id,concepto,tipo,monto,fecha_cobro,activo").eq("activo", true).order("fecha_cobro", { ascending: false }).limit(80),
        supabase.from("gastos_fijos").select("*").eq("activo", true).order("monto_mensual", { ascending: false }),
        supabase.from("tarjetas_cuotas").select("*").eq("activo", true).order("tarjeta", { ascending: true }),
        supabase.from("prestamos").select("*").eq("activo", true),
        supabase.from("movimientos").select("*").eq("activo", true).order("fecha", { ascending: false }).limit(200),
      ]);
      return {
        ingresos: ingresos.data ?? [],
        fijos: fijos.data ?? [],
        tarjetas: tarjetas.data ?? [],
        prestamos: prestamos.data ?? [],
        movimientos: movimientos.data ?? [],
      };
    },
  });

  const saveProfile = useServerFn(updateFinancialProfile);
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const payDay = clampDay(parseIntegerInput(profileForm.payDay, "Dia de cobro", 1));
      const salary = parseOptionalNumberInput(profileForm.salary, 0, "Sueldo");
      const savingTarget = Math.max(0, Math.min(80, parseIntegerInput(profileForm.savingTarget, "Objetivo de ahorro", 20)));
      await saveProfile({ data: { payDay, salary, savingTarget } });
      setPreferences((prev) => ({
        ...prev,
        income: {
          ...prev.income,
          payDay,
        },
      }));
    },
    onSuccess: () => {
      toast.success("Configuracion guardada");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["proyecciones"] });
      qc.invalidateQueries({ queryKey: ["alertas"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.invalidateQueries({ queryKey: ["calendario-financiero"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cards = useMemo(() => {
    const map = new Map<string, { tarjeta: string }>();
    (data?.tarjetas ?? []).forEach((card: any) => {
      if (card.tarjeta) map.set(card.tarjeta, { tarjeta: card.tarjeta });
    });
    return Array.from(map.values());
  }, [data?.tarjetas]);

  const cash = getMonthlyCashflow({
    profile,
    movimientos: data?.movimientos,
    ingresos: data?.ingresos,
    gastosFijos: data?.fijos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    preferences,
  });
  const emergency = getEmergencyFundSummary(cash, preferences);

  const updatePreferences = (next: (prev: FinancialPreferences) => FinancialPreferences) => {
    setPreferences(next);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuracion</h1>
          <p className="text-sm text-muted-foreground mt-1">Datos simples para que la app entienda mejor tus cobros, pagos y objetivos.</p>
        </div>
        <Button onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending}>
          <Save className="size-4" />
          Guardar
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard label="Objetivo de ahorro" value={`${profileForm.savingTarget || 0}%`} detail="Se usa en dashboard, alertas e insights." icon={<Target className="size-5" />} />
        <SummaryCard label="Fondo recomendado" value={formatMoney(emergency.recommended, currency)} detail={`${emergency.targetMonths} meses de gastos estimados.`} icon={<Shield className="size-5" />} />
        <SummaryCard label="Fondo actual" value={formatMoney(emergency.current, currency)} detail={`Cubre ${emergency.coveredMonths.toFixed(1)} meses.`} icon={<Wallet className="size-5" />} />
      </div>

      <Card className="p-5 space-y-4">
        <SectionTitle icon={<Wallet className="size-5" />} title="Ingresos" detail="¿Cuando cobras normalmente? Esto ayuda a proyectar tu liquidez con mas precision." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Tipo de fecha de cobro">
            <Select
              value={preferences.income.payDateMode}
              onValueChange={(value) => updatePreferences((prev) => ({
                ...prev,
                income: { ...prev.income, payDateMode: value as PayDateMode },
              }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_day">Dia fijo del mes</SelectItem>
                <SelectItem value="first_business_day">Primer dia habil del mes</SelectItem>
                <SelectItem value="second_business_day">Segundo dia habil del mes</SelectItem>
                <SelectItem value="third_business_day">Tercer dia habil del mes</SelectItem>
                <SelectItem value="last_business_day">Ultimo dia habil del mes</SelectItem>
                <SelectItem value="variable">Personalizado / variable</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{payDateModeLabel(preferences.income.payDateMode)}</p>
          </Field>
          {preferences.income.payDateMode === "fixed_day" ? (
            <Field label="Dia de cobro">
              <IntegerInput value={profileForm.payDay} onChange={(e) => setProfileForm({ ...profileForm, payDay: e.target.value })} placeholder="1 a 31" />
            </Field>
          ) : preferences.income.payDateMode === "variable" ? (
            <div className="rounded-md border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
              Si tu fecha cambia mucho, carga cada ingreso manualmente cuando lo sepas.
            </div>
          ) : null}
          <Field label="Frecuencia de cobro">
            <Select value={preferences.income.frequency} onValueChange={(value) => updatePreferences((prev) => ({ ...prev, income: { ...prev.income, frequency: value as IncomeFrequency } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="quincenal">Quincenal</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Esto indica cada cuanto suele entrar ese ingreso.</p>
          </Field>
          <Field label="Sueldo o ingreso principal">
            <DecimalInput value={profileForm.salary} onChange={(e) => setProfileForm({ ...profileForm, salary: e.target.value })} placeholder="Ej: 1500000" />
          </Field>
          <Field label="Objetivo de ahorro (%)">
            <IntegerInput value={profileForm.savingTarget} onChange={(e) => setProfileForm({ ...profileForm, savingTarget: e.target.value })} />
          </Field>
        </div>

        {(data?.ingresos?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Ingresos cargados</div>
            <div className="grid gap-3">
              {data?.ingresos.map((income: any) => {
                const item = preferences.incomeSettings[income.id] ?? {};
                return (
                  <div key={income.id} className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-[1fr_120px_160px]">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{income.concepto}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {income.tipo ?? "Ingreso"} · {formatMoney(Number(income.monto), currency)} · {income.fecha_cobro}
                      </div>
                    </div>
                    <IntegerInput
                      aria-label={`Dia de cobro de ${income.concepto}`}
                      value={item.payDay ? String(item.payDay) : ""}
                      placeholder="Dia"
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
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
          <p className="text-sm text-muted-foreground">Primero carga un ingreso en la seccion Ingresos. Despues vas a poder ajustar cada uno si hace falta.</p>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <SectionTitle icon={<CreditCard className="size-5" />} title="Tarjetas" detail="Esto permite ubicar mejor tus pagos de tarjeta en el calendario financiero." />
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">Primero carga una compra en cuotas o una tarjeta. Cuando exista, vas a poder definir cierre y vencimiento.</p>
        ) : (
          <div className="grid gap-3">
            {cards.map((card) => {
              const item = preferences.cardSettings[card.tarjeta] ?? {};
              return (
                <div key={card.tarjeta} className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-[1fr_130px_130px]">
                  <div>
                    <div className="font-medium">{card.tarjeta}</div>
                    <div className="text-xs text-muted-foreground">Fechas habituales de esta tarjeta.</div>
                  </div>
                  <Field label="Dia de cierre">
                    <IntegerInput
                      value={item.closingDay ? String(item.closingDay) : ""}
                      placeholder="Dia"
                      onChange={(e) => updatePreferences((prev) => ({
                        ...prev,
                        cardSettings: {
                          ...prev.cardSettings,
                          [card.tarjeta]: {
                            ...prev.cardSettings[card.tarjeta],
                            closingDay: e.target.value ? clampDay(e.target.value) : undefined,
                          },
                        },
                      }))}
                    />
                  </Field>
                  <Field label="Dia de vencimiento">
                    <IntegerInput
                      value={item.dueDay ? String(item.dueDay) : ""}
                      placeholder="Dia"
                      onChange={(e) => updatePreferences((prev) => ({
                        ...prev,
                        cardSettings: {
                          ...prev.cardSettings,
                          [card.tarjeta]: {
                            ...prev.cardSettings[card.tarjeta],
                            dueDay: e.target.value ? clampDay(e.target.value) : undefined,
                          },
                        },
                      }))}
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <SectionTitle icon={<Receipt className="size-5" />} title="Gastos recurrentes" detail="Ubicamos alquiler, servicios y suscripciones en la fecha en que suelen debitarse." />
        {(data?.fijos?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">Primero carga gastos fijos como alquiler, internet o gimnasio. Despues los vas a poder ordenar por fecha.</p>
        ) : (
          <div className="grid gap-3">
            {data?.fijos.map((expense: any) => {
              const item = preferences.recurringSettings[expense.id] ?? {};
              const frequency = item.frequency ?? "mensual";
              return (
                <div key={expense.id} className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-[1fr_130px_160px]">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{expense.gasto}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {expense.categoria ?? "Gasto fijo"} · {formatMoney(Number(expense.monto_mensual), currency)}
                    </div>
                  </div>
                  <Field label="¿Que dia suele debitarse?">
                    <IntegerInput
                      value={item.debitDay ? String(item.debitDay) : ""}
                      placeholder="Dia"
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
                  <Field label="¿Cada cuanto se repite?">
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
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 space-y-4">
          <SectionTitle icon={<Shield className="size-5" />} title="Fondo de emergencia" detail="Compara tu fondo actual contra tus gastos estimados." />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meses objetivo">
              <Select
                value={String(preferences.emergencyFund.months)}
                onValueChange={(value) => updatePreferences((prev) => ({
                  ...prev,
                  emergencyFund: { ...prev.emergencyFund, months: Number(value) as 3 | 6 | 12 },
                }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fondo actual">
              <DecimalInput
                value={preferences.emergencyFund.current ? String(preferences.emergencyFund.current) : ""}
                placeholder="Ej: 500000"
                onChange={(e) => updatePreferences((prev) => ({
                  ...prev,
                  emergencyFund: {
                    ...prev.emergencyFund,
                    current: parseSoftAmount(e.target.value),
                  },
                }))}
              />
            </Field>
          </div>
          <div className="rounded-md border border-border/70 p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Falta para tu objetivo</span>
              <span className="num font-semibold">{formatMoney(emergency.gap, currency)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <SectionTitle icon={<Target className="size-5" />} title="Perfil financiero" detail="Define que tan temprano queres que la app te avise." />
          <Select
            value={preferences.riskProfile}
            onValueChange={(value) => updatePreferences((prev) => ({ ...prev, riskProfile: value as FinancialPreferences["riskProfile"] }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="conservador">Conservador</SelectItem>
              <SelectItem value="equilibrado">Equilibrado</SelectItem>
              <SelectItem value="agresivo">Agresivo</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div><Badge variant="secondary">{preferences.riskProfile}</Badge></div>
            <p><span className="font-medium text-foreground">Conservador:</span> alerta antes.</p>
            <p><span className="font-medium text-foreground">Equilibrado:</span> balanceado.</p>
            <p><span className="font-medium text-foreground">Agresivo:</span> tolera mas variacion.</p>
            <p>Ingreso principal: {incomeFrequencyLabel(preferences.income.frequency)}.</p>
            <p>Gastos recurrentes configurados: {Object.values(preferences.recurringSettings).filter((x) => x.frequency || x.debitDay).length}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="num text-2xl font-bold mt-2">{value}</div>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="text-sm text-muted-foreground mt-3">{detail}</p>
    </Card>
  );
}

function parseSoftAmount(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const parsed = parseNumberInput(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
