import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Shield, Wallet, CreditCard, Receipt, Target, RefreshCw, Bell } from "lucide-react";
import { toast } from "sonner";
import { financialDataQuery, useDolarTC } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DecimalInput, IntegerInput } from "@/components/ui/number-input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { recalculateFinancialMonths } from "@/lib/maintenance.functions";
import { updateNotificationPreferences, savePushSubscription, deletePushSubscription } from "@/lib/notifications.functions";
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";
import { PLATIUM_CARD, PLATIUM_PAGE_TITLE, PLATIUM_PAGE_SUBTITLE, PLATIUM_LABEL, PLATIUM_BUTTON_PRIMARY, PLATIUM_BUTTON_OUTLINE, PLATIUM_INPUT } from "@/components/app/platium-ui";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const Route = createFileRoute("/_authenticated/configuracion")({
  head: () => ({ meta: [{ title: "Configuracion · Platium" }] }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [preferences, setPreferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
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

  const { data } = useQuery(financialDataQuery(user?.id));
  const { tc } = useDolarTC();

  const saveProfile = useServerFn(updateFinancialProfile);
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const payDay = clampDay(parseIntegerInput(profileForm.payDay, "Dia de cobro", 1));
      const salary = parseOptionalNumberInput(profileForm.salary, 0, "Sueldo");
      const savingTarget = Math.max(0, Math.min(80, parseIntegerInput(profileForm.savingTarget, "Objetivo de ahorro", 20)));
      await saveProfile({
        data: {
          payDay,
          salary,
          savingTarget,
          payDateMode: preferences.income.payDateMode,
          incomeFrequency: preferences.income.frequency,
        },
      });
      // No hace falta actualizar `preferences.income.payDay` a mano acá: al
      // invalidar el perfil (abajo) se vuelve a traer desde la cuenta, ya
      // corregido, y el efecto de sincronización de useFinancialPreferences
      // lo refleja automáticamente.
    },
    onSuccess: () => {
      toast.success("Configuracion guardada");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      qc.invalidateQueries({ queryKey: ["financial-data", user?.id] });
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const recalculateMonths = useServerFn(recalculateFinancialMonths);
  const recalculateMonthsMutation = useMutation({
    mutationFn: () => recalculateMonths({}),
    onSuccess: ({ corrected }) => {
      if (corrected === 0) {
        toast.success("Todo estaba bien: no había nada para corregir.");
      } else {
        toast.success(`Se corrigieron ${corrected} movimiento${corrected === 1 ? "" : "s"}/ingreso${corrected === 1 ? "" : "s"}.`);
      }
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["financial-data", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

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
    tc,
  });
  const emergency = getEmergencyFundSummary(cash, preferences);

  const updatePreferences = (next: (prev: FinancialPreferences) => FinancialPreferences) => {
    setPreferences(next);
  };

  return (
    <div className="space-y-6 font-plus-jakarta">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className={PLATIUM_PAGE_TITLE}>Configuración</h1>
          <p className={`${PLATIUM_PAGE_SUBTITLE} mt-1`}>Datos simples para que la app entienda mejor tus cobros, pagos y objetivos.</p>
        </div>
        <Button className={PLATIUM_BUTTON_PRIMARY} onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending}>
          <Save className="size-4" />
          Guardar
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard label="Objetivo de ahorro" value={`${profileForm.savingTarget || 0}%`} detail="Se usa en dashboard, alertas e insights." icon={<Target className="size-5" />} />
        <SummaryCard label="Fondo recomendado" value={formatMoney(emergency.recommended, currency)} detail={`${emergency.targetMonths} meses de gastos estimados.`} icon={<Shield className="size-5" />} />
        <SummaryCard label="Fondo actual" value={formatMoney(emergency.current, currency)} detail={`Cubre ${emergency.coveredMonths.toFixed(1)} meses.`} icon={<Wallet className="size-5" />} />
      </div>

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
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
              <SelectTrigger className={PLATIUM_INPUT}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_day">Dia fijo del mes</SelectItem>
                <SelectItem value="first_business_day">Primer dia habil del mes</SelectItem>
                <SelectItem value="second_business_day">Segundo dia habil del mes</SelectItem>
                <SelectItem value="third_business_day">Tercer dia habil del mes</SelectItem>
                <SelectItem value="last_business_day">Ultimo dia habil del mes</SelectItem>
                <SelectItem value="variable">Personalizado / variable</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#70706a]">{payDateModeLabel(preferences.income.payDateMode)}</p>
          </Field>
          {preferences.income.payDateMode === "fixed_day" ? (
            <Field label="Dia de cobro">
              <IntegerInput className={PLATIUM_INPUT} value={profileForm.payDay} onChange={(e) => setProfileForm({ ...profileForm, payDay: e.target.value })} placeholder="1 a 31" />
            </Field>
          ) : preferences.income.payDateMode === "variable" ? (
            <div className="rounded-md border border-[#d9d9d9] bg-[#f5f5f4] p-3 text-sm text-[#70706a]">
              Si tu fecha cambia mucho, carga cada ingreso manualmente cuando lo sepas.
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
            <p className="text-xs text-[#70706a]">Esto indica cada cuanto suele entrar ese ingreso.</p>
          </Field>
          <Field label="Sueldo o ingreso principal">
            <DecimalInput className={PLATIUM_INPUT} value={profileForm.salary} onChange={(e) => setProfileForm({ ...profileForm, salary: e.target.value })} placeholder="Ej: 1500000" />
          </Field>
          <Field label="Objetivo de ahorro (%)">
            <IntegerInput className={PLATIUM_INPUT} value={profileForm.savingTarget} onChange={(e) => setProfileForm({ ...profileForm, savingTarget: e.target.value })} />
          </Field>
        </div>

        {(data?.ingresos?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#70706a]">Ingresos cargados</div>
            <div className="grid gap-3">
              {data?.ingresos.map((income: any) => {
                const item = preferences.incomeSettings[income.id] ?? {};
                return (
                  <div key={income.id} className="grid gap-3 rounded-md border border-[#d9d9d9] p-3 md:grid-cols-[1fr_120px_160px]">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{income.concepto}</div>
                      <div className="text-xs text-[#70706a] mt-0.5">
                        {income.tipo ?? "Ingreso"} · {formatMoney(Number(income.monto), currency)} · {income.fecha_cobro}
                      </div>
                    </div>
                    <IntegerInput className={PLATIUM_INPUT}
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
          <p className="text-sm text-[#70706a]">Primero carga un ingreso en la seccion Ingresos. Despues vas a poder ajustar cada uno si hace falta.</p>
        )}
      </div>

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        <SectionTitle icon={<CreditCard className="size-5" />} title="Tarjetas" detail="Esto permite ubicar mejor tus pagos de tarjeta en el calendario financiero." />
        {cards.length === 0 ? (
          <p className="text-sm text-[#70706a]">Primero carga una compra en cuotas o una tarjeta. Cuando exista, vas a poder definir cierre y vencimiento.</p>
        ) : (
          <div className="grid gap-3">
            {cards.map((card) => {
              const item = preferences.cardSettings[card.tarjeta] ?? {};
              return (
                <div key={card.tarjeta} className="grid gap-3 rounded-md border border-[#d9d9d9] p-3 md:grid-cols-[1fr_130px_130px]">
                  <div>
                    <div className="font-medium">{card.tarjeta}</div>
                    <div className="text-xs text-[#70706a]">Fechas habituales de esta tarjeta.</div>
                  </div>
                  <Field label="Dia de cierre">
                    <IntegerInput className={PLATIUM_INPUT}
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
                    <IntegerInput className={PLATIUM_INPUT}
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
      </div>

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        <SectionTitle icon={<Receipt className="size-5" />} title="Gastos recurrentes" detail="Ubicamos alquiler, servicios y suscripciones en la fecha en que suelen debitarse." />
        {(data?.fijos?.length ?? 0) === 0 ? (
          <p className="text-sm text-[#70706a]">Primero carga gastos fijos como alquiler, internet o gimnasio. Despues los vas a poder ordenar por fecha.</p>
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
                  <Field label="¿Que dia suele debitarse?">
                    <IntegerInput className={PLATIUM_INPUT}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
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
                  emergencyFund: {
                    ...prev.emergencyFund,
                    current: parseSoftAmount(e.target.value),
                  },
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

        <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
          <SectionTitle icon={<Target className="size-5" />} title="Perfil financiero" detail="Define que tan temprano queres que la app te avise." />
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
            <p><span className="font-medium text-[#111]">Agresivo:</span> tolera mas variacion.</p>
            <p>Ingreso principal: {incomeFrequencyLabel(preferences.income.frequency)}.</p>
            <p>Gastos recurrentes configurados: {Object.values(preferences.recurringSettings).filter((x) => x.frequency || x.debitDay).length}</p>
          </div>
        </div>

        <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
          <SectionTitle icon={<Bell className="size-5" />} title="Notificaciones" detail="Te avisamos cuando tenés vencimientos próximos, por email y/o notificación push del navegador." />
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

        <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
          <SectionTitle icon={<RefreshCw className="size-5" />} title="Corregir meses viejos" detail="Si algún movimiento o ingreso quedó etiquetado con el mes que no corresponde (por ejemplo, después de cambiar tu día de cobro), esto lo recalcula." />
          <Button
            className={PLATIUM_BUTTON_OUTLINE}
            onClick={() => recalculateMonthsMutation.mutate()}
            disabled={recalculateMonthsMutation.isPending}
          >
            <RefreshCw className="size-4 mr-2" />
            {recalculateMonthsMutation.isPending ? "Corrigiendo..." : "Recalcular meses financieros"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-center text-[#70706a] pt-2 font-plus-jakarta">
        <Link to="/terminos" className="hover:text-[#20376b] hover:underline">Términos y Condiciones</Link>
        {" · "}
        <Link to="/privacidad" className="hover:text-[#20376b] hover:underline">Política de Privacidad</Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-[#70706a]">{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#20376b]">{icon}</div>
      <div>
        <h2 className="font-semibold text-[13px] text-[#20376b]">{title}</h2>
        <p className="text-sm text-[#70706a] mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <div className={`${PLATIUM_CARD} p-5 font-plus-jakarta`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={PLATIUM_LABEL}>{label}</div>
          <div className="num text-2xl font-bold mt-2 text-[#20376b]">{value}</div>
        </div>
        <div className="text-[#20376b]">{icon}</div>
      </div>
      <p className="text-sm text-[#70706a] mt-3">{detail}</p>
    </div>
  );
}

function parseSoftAmount(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const parsed = parseNumberInput(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
