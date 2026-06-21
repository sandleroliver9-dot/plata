import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { u as useFinancialPreferences, b as buildUpcomingEvents, d as daysUntil } from "./financial-centers-BQNd3GNL.mjs";
import { h as CalendarDays, w as CircleDollarSign } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
function CalendarioFinancieroPage() {
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
    queryKey: ["calendario-financiero", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [ingresos, fijos, tarjetas, prestamos, vencimientos] = await Promise.all([supabase.from("ingresos").select("id,concepto,monto,fecha_cobro,tipo,activo").eq("activo", true).order("fecha_cobro", {
        ascending: false
      }).limit(80), supabase.from("gastos_fijos").select("*").eq("activo", true), supabase.from("tarjetas_cuotas").select("*").eq("activo", true), supabase.from("prestamos").select("*").eq("activo", true), supabase.from("vencimientos").select("*").order("fecha", {
        ascending: true
      })]);
      return {
        ingresos: ingresos.data ?? [],
        fijos: fijos.data ?? [],
        tarjetas: tarjetas.data ?? [],
        prestamos: prestamos.data ?? [],
        vencimientos: vencimientos.data ?? []
      };
    }
  });
  const events = buildUpcomingEvents({
    profile,
    ingresos: data?.ingresos,
    vencimientos: data?.vencimientos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    gastosFijos: data?.fijos,
    horizonDays: 90,
    preferences
  });
  const grouped = events.reduce((map, event) => {
    const list = map.get(event.date) ?? [];
    list.push(event);
    map.set(event.date, list);
    return map;
  }, /* @__PURE__ */ new Map());
  const dates = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Calendario financiero" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Próximos cobros, vencimientos, cuotas y pagos importantes." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Próximos 90 días" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: events.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Pagos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: events.filter((e) => e.type !== "cobro").length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Cobros previstos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: events.filter((e) => e.type === "cobro").length })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-muted-foreground", children: "Cargando calendario..." }) : events.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "size-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Cargá vencimientos para ver tu calendario financiero" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "También van a aparecer cuotas, préstamos, gastos fijos y fecha de cobro cuando estén cargados." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: dates.map((date) => {
      const dayEvents = grouped.get(date) ?? [];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold capitalize", children: formatDate(date) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: relativeDate(date) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            dayEvents.length,
            " items"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: dayEvents.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-md border border-border/70 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-9 rounded-md grid place-items-center ${event.type === "cobro" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`, children: event.type === "cobro" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDollarSign, { className: "size-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: event.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: event.detail ?? eventLabel(event.type) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `num font-semibold whitespace-nowrap ${event.type === "cobro" ? "text-success" : ""}`, children: [
            event.type === "cobro" ? "+" : "-",
            formatMoney(event.amount, currency)
          ] })
        ] }, event.id)) })
      ] }, date);
    }) }) })
  ] });
}
function formatDate(dateISO) {
  return (/* @__PURE__ */ new Date(`${dateISO}T00:00:00`)).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}
function relativeDate(dateISO) {
  const days = daysUntil(dateISO);
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}
function eventLabel(type) {
  if (type === "cobro") return "Cobro";
  if (type === "cuota") return "Cuota";
  if (type === "prestamo") return "Préstamo";
  if (type === "gasto_fijo") return "Gasto fijo";
  return "Vencimiento";
}
export {
  CalendarioFinancieroPage as component
};
