import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./createSsrRpc-CflJmRts.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { I as IntegerInput, D as DecimalInput, p as parseIntegerInput, a as parseOptionalNumberInput, c as parseNumberInput } from "./number-input-CrLHP9OF.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { u as useFinancialPreferences, g as getMonthlyCashflow, c as getEmergencyFundSummary, f as payDateModeLabel, i as incomeFrequencyLabel, h as clampDay } from "./financial-centers-BQNd3GNL.mjs";
import { a as updateFinancialProfile } from "./profile.functions-CBkB282-.mjs";
import "../_libs/seroval.mjs";
import { r as Save, T as Target, s as Shield, W as Wallet, d as CreditCard, t as Receipt } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./server-BjmrHUg4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./input-C0QjszdI.mjs";
import "./auth-middleware-DfWKUJS4.mjs";
function ConfiguracionPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [preferences, setPreferences] = useFinancialPreferences(user?.id);
  const [profileForm, setProfileForm] = reactExports.useState({
    payDay: String(profile?.pay_day ?? 1),
    salary: String(profile?.salary ?? ""),
    savingTarget: String(profile?.saving_target ?? 20)
  });
  reactExports.useEffect(() => {
    setProfileForm({
      payDay: String(profile?.pay_day ?? 1),
      salary: profile?.salary ? String(profile.salary) : "",
      savingTarget: String(profile?.saving_target ?? 20)
    });
  }, [profile?.pay_day, profile?.salary, profile?.saving_target]);
  const {
    data
  } = useQuery({
    queryKey: ["financial-settings-data", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [ingresos, fijos, tarjetas, prestamos, movimientos] = await Promise.all([supabase.from("ingresos").select("id,concepto,tipo,monto,fecha_cobro,activo").eq("activo", true).order("fecha_cobro", {
        ascending: false
      }).limit(80), supabase.from("gastos_fijos").select("*").eq("activo", true).order("monto_mensual", {
        ascending: false
      }), supabase.from("tarjetas_cuotas").select("*").eq("activo", true).order("tarjeta", {
        ascending: true
      }), supabase.from("prestamos").select("*").eq("activo", true), supabase.from("movimientos").select("*").eq("activo", true).order("fecha", {
        ascending: false
      }).limit(200)]);
      return {
        ingresos: ingresos.data ?? [],
        fijos: fijos.data ?? [],
        tarjetas: tarjetas.data ?? [],
        prestamos: prestamos.data ?? [],
        movimientos: movimientos.data ?? []
      };
    }
  });
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
          savingTarget
        }
      });
      setPreferences((prev) => ({
        ...prev,
        income: {
          ...prev.income,
          payDay
        }
      }));
    },
    onSuccess: () => {
      toast.success("Configuracion guardada");
      qc.invalidateQueries({
        queryKey: ["profile", user?.id]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
      qc.invalidateQueries({
        queryKey: ["proyecciones"]
      });
      qc.invalidateQueries({
        queryKey: ["alertas"]
      });
      qc.invalidateQueries({
        queryKey: ["insights"]
      });
      qc.invalidateQueries({
        queryKey: ["calendario-financiero"]
      });
    },
    onError: (error) => toast.error(error.message)
  });
  const cards = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    (data?.tarjetas ?? []).forEach((card) => {
      if (card.tarjeta) map.set(card.tarjeta, {
        tarjeta: card.tarjeta
      });
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
    preferences
  });
  const emergency = getEmergencyFundSummary(cash, preferences);
  const updatePreferences = (next) => {
    setPreferences(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Configuracion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Datos simples para que la app entienda mejor tus cobros, pagos y objetivos." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveProfileMutation.mutate(), disabled: saveProfileMutation.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4" }),
        "Guardar"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Objetivo de ahorro", value: `${profileForm.savingTarget || 0}%`, detail: "Se usa en dashboard, alertas e insights.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Fondo recomendado", value: formatMoney(emergency.recommended, currency), detail: `${emergency.targetMonths} meses de gastos estimados.`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Fondo actual", value: formatMoney(emergency.current, currency), detail: `Cubre ${emergency.coveredMonths.toFixed(1)} meses.`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5" }), title: "Ingresos", detail: "¿Cuando cobras normalmente? Esto ayuda a proyectar tu liquidez con mas precision." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Tipo de fecha de cobro", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: preferences.income.payDateMode, onValueChange: (value) => updatePreferences((prev) => ({
            ...prev,
            income: {
              ...prev.income,
              payDateMode: value
            }
          })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed_day", children: "Dia fijo del mes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "first_business_day", children: "Primer dia habil del mes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "second_business_day", children: "Segundo dia habil del mes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "third_business_day", children: "Tercer dia habil del mes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "last_business_day", children: "Ultimo dia habil del mes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "variable", children: "Personalizado / variable" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: payDateModeLabel(preferences.income.payDateMode) })
        ] }),
        preferences.income.payDateMode === "fixed_day" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dia de cobro", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: profileForm.payDay, onChange: (e) => setProfileForm({
          ...profileForm,
          payDay: e.target.value
        }), placeholder: "1 a 31" }) }) : preferences.income.payDateMode === "variable" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground", children: "Si tu fecha cambia mucho, carga cada ingreso manualmente cuando lo sepas." }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Frecuencia de cobro", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: preferences.income.frequency, onValueChange: (value) => updatePreferences((prev) => ({
            ...prev,
            income: {
              ...prev.income,
              frequency: value
            }
          })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mensual", children: "Mensual" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "quincenal", children: "Quincenal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "semanal", children: "Semanal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "variable", children: "Variable" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Esto indica cada cuanto suele entrar ese ingreso." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sueldo o ingreso principal", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: profileForm.salary, onChange: (e) => setProfileForm({
          ...profileForm,
          salary: e.target.value
        }), placeholder: "Ej: 1500000" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Objetivo de ahorro (%)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: profileForm.savingTarget, onChange: (e) => setProfileForm({
          ...profileForm,
          savingTarget: e.target.value
        }) }) })
      ] }),
      (data?.ingresos?.length ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Ingresos cargados" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: data?.ingresos.map((income) => {
          const item = preferences.incomeSettings[income.id] ?? {};
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-[1fr_120px_160px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: income.concepto }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                income.tipo ?? "Ingreso",
                " · ",
                formatMoney(Number(income.monto), currency),
                " · ",
                income.fecha_cobro
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { "aria-label": `Dia de cobro de ${income.concepto}`, value: item.payDay ? String(item.payDay) : "", placeholder: "Dia", onChange: (e) => updatePreferences((prev) => ({
              ...prev,
              incomeSettings: {
                ...prev.incomeSettings,
                [income.id]: {
                  ...prev.incomeSettings[income.id],
                  payDay: e.target.value ? clampDay(e.target.value) : void 0
                }
              }
            })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: item.frequency ?? "variable", onValueChange: (value) => updatePreferences((prev) => ({
              ...prev,
              incomeSettings: {
                ...prev.incomeSettings,
                [income.id]: {
                  ...prev.incomeSettings[income.id],
                  frequency: value
                }
              }
            })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mensual", children: "Mensual" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "quincenal", children: "Quincenal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "semanal", children: "Semanal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "variable", children: "Variable" })
              ] })
            ] })
          ] }, income.id);
        }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Primero carga un ingreso en la seccion Ingresos. Despues vas a poder ajustar cada uno si hace falta." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "size-5" }), title: "Tarjetas", detail: "Esto permite ubicar mejor tus pagos de tarjeta en el calendario financiero." }),
      cards.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Primero carga una compra en cuotas o una tarjeta. Cuando exista, vas a poder definir cierre y vencimiento." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: cards.map((card) => {
        const item = preferences.cardSettings[card.tarjeta] ?? {};
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-[1fr_130px_130px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: card.tarjeta }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Fechas habituales de esta tarjeta." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dia de cierre", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: item.closingDay ? String(item.closingDay) : "", placeholder: "Dia", onChange: (e) => updatePreferences((prev) => ({
            ...prev,
            cardSettings: {
              ...prev.cardSettings,
              [card.tarjeta]: {
                ...prev.cardSettings[card.tarjeta],
                closingDay: e.target.value ? clampDay(e.target.value) : void 0
              }
            }
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dia de vencimiento", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: item.dueDay ? String(item.dueDay) : "", placeholder: "Dia", onChange: (e) => updatePreferences((prev) => ({
            ...prev,
            cardSettings: {
              ...prev.cardSettings,
              [card.tarjeta]: {
                ...prev.cardSettings[card.tarjeta],
                dueDay: e.target.value ? clampDay(e.target.value) : void 0
              }
            }
          })) }) })
        ] }, card.tarjeta);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "size-5" }), title: "Gastos recurrentes", detail: "Ubicamos alquiler, servicios y suscripciones en la fecha en que suelen debitarse." }),
      (data?.fijos?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Primero carga gastos fijos como alquiler, internet o gimnasio. Despues los vas a poder ordenar por fecha." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: data?.fijos.map((expense) => {
        const item = preferences.recurringSettings[expense.id] ?? {};
        const frequency = item.frequency ?? "mensual";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-[1fr_130px_160px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: expense.gasto }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
              expense.categoria ?? "Gasto fijo",
              " · ",
              formatMoney(Number(expense.monto_mensual), currency)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "¿Que dia suele debitarse?", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: item.debitDay ? String(item.debitDay) : "", placeholder: "Dia", onChange: (e) => updatePreferences((prev) => ({
            ...prev,
            recurringSettings: {
              ...prev.recurringSettings,
              [expense.id]: {
                ...prev.recurringSettings[expense.id],
                debitDay: e.target.value ? clampDay(e.target.value) : void 0
              }
            }
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "¿Cada cuanto se repite?", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: frequency, onValueChange: (value) => updatePreferences((prev) => ({
            ...prev,
            recurringSettings: {
              ...prev.recurringSettings,
              [expense.id]: {
                ...prev.recurringSettings[expense.id],
                frequency: value
              }
            }
          })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mensual", children: "Mensual" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "quincenal", children: "Quincenal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "semanal", children: "Semanal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "anual", children: "Anual" })
            ] })
          ] }) })
        ] }, expense.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-5" }), title: "Fondo de emergencia", detail: "Compara tu fondo actual contra tus gastos estimados." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Meses objetivo", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(preferences.emergencyFund.months), onValueChange: (value) => updatePreferences((prev) => ({
            ...prev,
            emergencyFund: {
              ...prev.emergencyFund,
              months: Number(value)
            }
          })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 meses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "6", children: "6 meses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "12", children: "12 meses" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Fondo actual", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: preferences.emergencyFund.current ? String(preferences.emergencyFund.current) : "", placeholder: "Ej: 500000", onChange: (e) => updatePreferences((prev) => ({
            ...prev,
            emergencyFund: {
              ...prev.emergencyFund,
              current: parseSoftAmount(e.target.value)
            }
          })) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border/70 p-3 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Falta para tu objetivo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold", children: formatMoney(emergency.gap, currency) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-5" }), title: "Perfil financiero", detail: "Define que tan temprano queres que la app te avise." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: preferences.riskProfile, onValueChange: (value) => updatePreferences((prev) => ({
          ...prev,
          riskProfile: value
        })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "conservador", children: "Conservador" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "equilibrado", children: "Equilibrado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "agresivo", children: "Agresivo" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: preferences.riskProfile }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Conservador:" }),
            " alerta antes."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Equilibrado:" }),
            " balanceado."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Agresivo:" }),
            " tolera mas variacion."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Ingreso principal: ",
            incomeFrequencyLabel(preferences.income.frequency),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Gastos recurrentes configurados: ",
            Object.values(preferences.recurringSettings).filter((x) => x.frequency || x.debitDay).length
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
    children
  ] });
}
function SectionTitle({
  icon,
  title,
  detail
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-primary", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: detail })
    ] })
  ] });
}
function SummaryCard({
  label,
  value,
  detail,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: value })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary", children: icon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-3", children: detail })
  ] });
}
function parseSoftAmount(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const parsed = parseNumberInput(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
export {
  ConfiguracionPage as component
};
