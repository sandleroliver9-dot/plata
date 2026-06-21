import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { u as useFinancialPreferences, g as getMonthlyCashflow, b as buildUpcomingEvents, j as detectUnusualSpending, r as riskProfileSettings, d as daysUntil } from "./financial-centers-BQNd3GNL.mjs";
import { k as CalendarClock, W as Wallet, q as TrendingDown, j as TriangleAlert, m as CircleCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
function AlertasPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id);
  const currency = profile?.currency ?? "ARS";
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["alertas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [movimientos, ingresos, fijos, tarjetas, prestamos, vencimientos] = await Promise.all([supabase.from("movimientos").select("*").eq("activo", true).order("fecha", {
        ascending: false
      }).limit(200), supabase.from("ingresos").select("id,concepto,monto,fecha_cobro,tipo,activo").eq("activo", true).order("fecha_cobro", {
        ascending: false
      }).limit(80), supabase.from("gastos_fijos").select("*").eq("activo", true), supabase.from("tarjetas_cuotas").select("*").eq("activo", true), supabase.from("prestamos").select("*").eq("activo", true), supabase.from("vencimientos").select("*").order("fecha", {
        ascending: true
      })]);
      return {
        movimientos: movimientos.data ?? [],
        ingresos: ingresos.data ?? [],
        fijos: fijos.data ?? [],
        tarjetas: tarjetas.data ?? [],
        prestamos: prestamos.data ?? [],
        vencimientos: vencimientos.data ?? []
      };
    }
  });
  const cash = getMonthlyCashflow({
    profile,
    movimientos: data?.movimientos,
    ingresos: data?.ingresos,
    gastosFijos: data?.fijos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    preferences
  });
  const upcoming = buildUpcomingEvents({
    profile,
    ingresos: data?.ingresos,
    vencimientos: data?.vencimientos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    gastosFijos: data?.fijos,
    horizonDays: 30,
    preferences
  });
  const unusual = detectUnusualSpending(data?.movimientos, profile, preferences);
  const sensitivity = riskProfileSettings(preferences.riskProfile);
  const alerts = [];
  upcoming.filter((event) => event.type !== "cobro" && daysUntil(event.date) <= sensitivity.alertDays).slice(0, 4).forEach((event) => {
    const days = daysUntil(event.date);
    alerts.push({
      title: days <= 1 ? "Pago muy próximo" : "Pago próximo",
      message: `${event.title} vence ${days <= 0 ? "hoy" : `en ${days} días`} por ${formatMoney(event.amount, currency)}.`,
      tone: days <= 1 ? "destructive" : "warning",
      icon: CalendarClock
    });
  });
  const nextIncome = upcoming.find((event) => event.type === "cobro");
  if (nextIncome) {
    const paymentsBeforeIncome = upcoming.filter((event) => event.type !== "cobro" && event.date <= nextIncome.date).reduce((sum, event) => sum + Number(event.amount), 0);
    const remainingBeforeIncome = cash.disponible - paymentsBeforeIncome;
    if (paymentsBeforeIncome > 0 && cash.ingresos > 0 && remainingBeforeIncome < cash.ingresos * sensitivity.liquidityRatio) {
      alerts.push({
        title: "Liquidez antes del proximo cobro",
        message: `Antes de ${nextIncome.title.toLowerCase()} tenes pagos por ${formatMoney(paymentsBeforeIncome, currency)}. Disponible estimado: ${formatMoney(remainingBeforeIncome, currency)}.`,
        tone: remainingBeforeIncome < 0 ? "destructive" : "warning",
        icon: Wallet
      });
    }
  }
  unusual.slice(0, 3).forEach((item) => {
    alerts.push({
      title: "Gasto inusual",
      message: `${item.categoria} está por encima de tu patrón: ${formatMoney(item.monto, currency)} este mes.`,
      tone: "warning",
      icon: TrendingDown
    });
  });
  if (cash.ingresoBase > 0 && cash.ingresoRegistrado <= 0) {
    alerts.push({
      title: "Ingreso faltante",
      message: `Todavía no registraste el sueldo de ${cash.mes}. Proyectamos ${formatMoney(cash.ingresoBase, currency)} como referencia.`,
      tone: "warning",
      icon: Wallet
    });
  }
  if (cash.ingresos > 0 && cash.ahorroEstimado < cash.objetivoAhorro) {
    alerts.push({
      title: "Ahorro debajo del objetivo",
      message: `Tu ahorro estimado es ${formatMoney(cash.ahorroEstimado, currency)} y el objetivo es ${formatMoney(cash.objetivoAhorro, currency)}.`,
      tone: cash.ahorroEstimado < 0 ? "destructive" : "warning",
      icon: TriangleAlert
    });
  }
  if (cash.disponible < 0 || cash.ingresos > 0 && cash.disponible / cash.ingresos < sensitivity.liquidityRatio) {
    alerts.push({
      title: "Liquidez baja",
      message: `Disponible estimado: ${formatMoney(cash.disponible, currency)} para ${cash.mes}.`,
      tone: cash.disponible < 0 ? "destructive" : "warning",
      icon: Wallet
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Alertas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Advertencias financieras simples según tus datos actuales." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Estado del mes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Ingresos", value: formatMoney(cash.ingresos, currency) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Gastos estimados", value: formatMoney(cash.gastos, currency) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Disponible", value: formatMoney(cash.disponible, currency), tone: cash.disponible < 0 ? "text-destructive" : "text-success" })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-muted-foreground", children: "Cargando alertas..." }) : alerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-10 mx-auto text-success mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Todavía no hay alertas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cuando detectemos vencimientos, gastos inusuales o liquidez baja, van a aparecer acá." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: alerts.map((alert, index) => {
      const Icon = alert.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `p-4 ${alert.tone === "destructive" ? "border-destructive/40 bg-destructive/5" : alert.tone === "warning" ? "border-warning/40 bg-warning/5" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 ${alert.tone === "destructive" ? "text-destructive" : alert.tone === "warning" ? "text-warning" : "text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: alert.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: alert.tone === "destructive" ? "destructive" : "secondary", children: alert.tone === "destructive" ? "Urgente" : "Atención" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: alert.message })
        ] })
      ] }) }, `${alert.title}-${index}`);
    }) })
  ] });
}
function Metric({
  label,
  value,
  tone = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-xl font-bold mt-1 ${tone}`, children: value })
  ] });
}
export {
  AlertasPage as component
};
