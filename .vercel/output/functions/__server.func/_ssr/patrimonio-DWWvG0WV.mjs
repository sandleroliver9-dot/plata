import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { R as ResponsiveContainer, P as PieChart, b as Pie, c as Cell, T as Tooltip, L as Legend } from "../_libs/recharts.mjs";
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
import "../_libs/lodash.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
function Patrimonio() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const {
    data
  } = useQuery({
    queryKey: ["patrimonio", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [inv, inm, pres] = await Promise.all([supabase.from("inversiones").select("cantidad,valor_actual,precio_compra,moneda").eq("activo", true), supabase.from("inmuebles").select("valor_estimado,deuda_asociada,moneda").eq("activo", true), supabase.from("prestamos").select("cuota_mensual,cuotas_totales,cuotas_pagadas").eq("activo", true)]);
      return {
        inversiones: inv.data ?? [],
        inmuebles: inm.data ?? [],
        prestamos: pres.data ?? []
      };
    }
  });
  const totals = reactExports.useMemo(() => {
    const inversiones = (data?.inversiones ?? []).reduce((s, i) => s + Number(i.cantidad) * Number(i.valor_actual || i.precio_compra), 0);
    const inmuebles = (data?.inmuebles ?? []).reduce((s, i) => s + Number(i.valor_estimado || 0), 0);
    const deudasInm = (data?.inmuebles ?? []).reduce((s, i) => s + Number(i.deuda_asociada || 0), 0);
    const deudasPres = (data?.prestamos ?? []).reduce((s, p) => s + Number(p.cuota_mensual || 0) * Math.max(0, Number(p.cuotas_totales || 0) - Number(p.cuotas_pagadas || 0)), 0);
    const deudas = deudasInm + deudasPres;
    return {
      inversiones,
      inmuebles,
      deudas,
      neto: inversiones + inmuebles - deudas
    };
  }, [data]);
  const pieData = [{
    name: "Inversiones",
    value: totals.inversiones,
    color: "var(--primary)"
  }, {
    name: "Inmuebles",
    value: totals.inmuebles,
    color: "var(--success)"
  }].filter((x) => x.value > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Patrimonio neto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Activos menos pasivos." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Inversiones" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: formatMoney(totals.inversiones, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Inmuebles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: formatMoney(totals.inmuebles, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Deudas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2 text-destructive", children: formatMoney(totals.deudas, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 border-primary/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Patrimonio neto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-2xl font-bold mt-2 ${totals.neto >= 0 ? "text-success" : "text-destructive"}`, children: formatMoney(totals.neto, currency) })
      ] })
    ] }),
    pieData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-4", children: "Distribución de activos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: pieData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 100, label: true, children: pieData.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: e.color }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => formatMoney(Number(v), currency), contentStyle: {
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
      ] }) }) })
    ] })
  ] });
}
export {
  Patrimonio as component
};
