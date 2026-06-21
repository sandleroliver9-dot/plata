import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { u as useFinancialPreferences, g as getMonthlyCashflow, b as buildUpcomingEvents, e as estimateNetWorth, a as getSavingTargetPercent, c as getEmergencyFundSummary, d as daysUntil } from "./financial-centers-BQNd3GNL.mjs";
import { n as TrendingUp, W as Wallet, k as CalendarClock, B as Building2, g as Lightbulb } from "../_libs/lucide-react.mjs";
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
function InsightsPage() {
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
    queryKey: ["insights", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [movimientos, ingresos, fijos, tarjetas, prestamos, vencimientos, inversiones, inmuebles] = await Promise.all([supabase.from("movimientos").select("*").eq("activo", true).order("fecha", {
        ascending: false
      }).limit(200), supabase.from("ingresos").select("id,concepto,monto,fecha_cobro,tipo,activo").eq("activo", true).order("fecha_cobro", {
        ascending: false
      }).limit(80), supabase.from("gastos_fijos").select("*").eq("activo", true), supabase.from("tarjetas_cuotas").select("*").eq("activo", true), supabase.from("prestamos").select("*").eq("activo", true), supabase.from("vencimientos").select("*").order("fecha", {
        ascending: true
      }), supabase.from("inversiones").select("cantidad,valor_actual,precio_compra,moneda").eq("activo", true), supabase.from("inmuebles").select("valor_estimado,deuda_asociada,moneda").eq("activo", true)]);
      return {
        movimientos: movimientos.data ?? [],
        ingresos: ingresos.data ?? [],
        fijos: fijos.data ?? [],
        tarjetas: tarjetas.data ?? [],
        prestamos: prestamos.data ?? [],
        vencimientos: vencimientos.data ?? [],
        inversiones: inversiones.data ?? [],
        inmuebles: inmuebles.data ?? []
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
  }).filter((event) => event.type !== "cobro");
  const allUpcoming = buildUpcomingEvents({
    profile,
    ingresos: data?.ingresos,
    vencimientos: data?.vencimientos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    gastosFijos: data?.fijos,
    horizonDays: 30,
    preferences
  });
  const netWorth = estimateNetWorth({
    inversiones: data?.inversiones,
    inmuebles: data?.inmuebles,
    prestamos: data?.prestamos
  });
  const fixedRatio = cash.ingresos > 0 ? cash.gastosFijos / cash.ingresos * 100 : 0;
  const savings = cash.ingresos - cash.gastos;
  const liquidityRatio = cash.ingresos > 0 ? cash.disponible / cash.ingresos : 0;
  const liquidityLabel = cash.disponible < 0 ? "riesgo" : liquidityRatio < 0.1 ? "atención" : "bueno";
  const savingTarget = getSavingTargetPercent(profile);
  const emergency = getEmergencyFundSummary(cash, preferences);
  const nextIncome = allUpcoming.find((event) => event.type === "cobro");
  const nextWeekPayments = upcoming.filter((event) => daysUntil(event.date) <= 7).reduce((sum, event) => sum + event.amount, 0);
  const nextMonthPayments = upcoming.reduce((sum, event) => sum + event.amount, 0);
  const weeklyConcentration = nextMonthPayments > 0 ? nextWeekPayments / nextMonthPayments * 100 : 0;
  const insights = [{
    title: "Gastos fijos sobre ingresos",
    value: cash.ingresos > 0 ? `${fixedRatio.toFixed(0)}%` : "Sin ingresos",
    message: cash.ingresos > 0 ? `Tus gastos fijos representan ${fixedRatio.toFixed(0)}% de tus ingresos estimados de ${cash.mes}.` : "Cargá un ingreso o sueldo para calcular este indicador.",
    icon: TrendingUp,
    tone: fixedRatio > 50 ? "warning" : "success"
  }, {
    title: "Ahorro estimado",
    value: formatMoney(savings, currency),
    message: savings >= cash.objetivoAhorro ? `Tu ahorro estimado esta alineado con tu objetivo del ${savingTarget}%.` : `Estas ahorrando menos que tu objetivo del ${savingTarget}%.`,
    icon: Wallet,
    tone: savings < 0 ? "destructive" : savings < cash.objetivoAhorro ? "warning" : "success"
  }, {
    title: "Fondo de emergencia",
    value: `${emergency.coveredMonths.toFixed(1)} meses`,
    message: `Tu fondo recomendado es ${formatMoney(emergency.recommended, currency)} para cubrir ${emergency.targetMonths} meses.`,
    icon: Wallet,
    tone: emergency.coveredMonths >= emergency.targetMonths ? "success" : emergency.coveredMonths >= emergency.targetMonths / 2 ? "warning" : "destructive"
  }, {
    title: "Proxima semana",
    value: nextMonthPayments > 0 ? `${weeklyConcentration.toFixed(0)}%` : "Sin pagos",
    message: nextMonthPayments > 0 ? `Tu proxima semana concentra el ${weeklyConcentration.toFixed(0)}% de los gastos programados a 30 dias.` : "No hay gastos programados para medir concentracion semanal.",
    icon: CalendarClock,
    tone: weeklyConcentration > 35 ? "warning" : "success"
  }, {
    title: "Proximo cobro",
    value: nextIncome ? formatDate(nextIncome.date) : "Sin fecha",
    message: nextIncome ? `Tu proxima fecha de cobro es ${formatDate(nextIncome.date)} por ${formatMoney(nextIncome.amount, currency)}.` : "Configura tu frecuencia de ingresos para ver la proxima fecha de cobro.",
    icon: CalendarClock,
    tone: nextIncome ? "success" : "warning"
  }, {
    title: "Vencimientos próximos",
    value: String(upcoming.length),
    message: upcoming.length === 0 ? "No tenés vencimientos próximos cargados para los próximos 30 días." : `Tenés ${upcoming.length} pagos próximos en los próximos 30 días.`,
    icon: CalendarClock,
    tone: upcoming.length > 5 ? "warning" : "success"
  }, {
    title: "Patrimonio estimado",
    value: formatMoney(netWorth, currency),
    message: "Suma inmuebles e inversiones, descontando deuda pendiente de préstamos.",
    icon: Building2,
    tone: netWorth < 0 ? "destructive" : "success"
  }, {
    title: "Liquidez",
    value: liquidityLabel,
    message: `Tu disponible estimado para ${cash.mes} es ${formatMoney(cash.disponible, currency)}.`,
    icon: Lightbulb,
    tone: liquidityLabel === "riesgo" ? "destructive" : liquidityLabel === "atención" ? "warning" : "success"
  }];
  const hasAnyData = Boolean(data && (data.movimientos.length || data.ingresos.length || data.fijos.length || data.tarjetas.length || data.prestamos.length || data.inmuebles.length || data.inversiones.length));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Mensajes automáticos simples generados con tus datos actuales." })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-muted-foreground", children: "Calculando insights..." }) : !hasAnyData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "size-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Todavía no hay insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Cargá ingresos, gastos o vencimientos para empezar a ver lecturas automáticas." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: insights.map((insight) => {
      const Icon = insight.icon;
      const toneClass = insight.tone === "destructive" ? "text-destructive" : insight.tone === "warning" ? "text-warning" : "text-success";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: insight.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-2xl font-bold mt-2 ${toneClass}`, children: insight.value })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-5 ${toneClass}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-3", children: insight.message }),
        insight.tone && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "mt-4", variant: insight.tone === "destructive" ? "destructive" : "secondary", children: insight.tone === "success" ? "Bien" : insight.tone === "warning" ? "Atención" : "Riesgo" })
      ] }, insight.title);
    }) })
  ] });
}
function formatDate(dateISO) {
  return (/* @__PURE__ */ new Date(`${dateISO}T00:00:00`)).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long"
  });
}
export {
  InsightsPage as component
};
