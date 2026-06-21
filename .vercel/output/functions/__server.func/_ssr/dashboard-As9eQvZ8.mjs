import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { P as Progress } from "./progress-BRG1z6ZI.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { c as currentFinancialMonth, l as listFinancialMonths, i as installmentForFinancialMonth, s as smartMessage, f as formatMoney, b as formatCompact, d as financialScore } from "./finance-Ea2ALQRw.mjs";
import { u as useServerFn } from "./createSsrRpc-CflJmRts.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { c as getDolares } from "./quotes.functions-C3guMtfB.mjs";
import { a as getSavingTargetPercent } from "./financial-centers-BQNd3GNL.mjs";
import "../_libs/seroval.mjs";
import { n as TrendingUp, q as TrendingDown, W as Wallet, S as Sparkles, j as TriangleAlert, D as DollarSign, R as RefreshCw } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar } from "../_libs/recharts.mjs";
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
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./server-BjmrHUg4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
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
function formatARS(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}
function DolarWidget() {
  const fetchFn = useServerFn(getDolares);
  const { data, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["dolares"],
    queryFn: () => fetchFn(),
    staleTime: 5 * 60 * 1e3,
    refetchOnWindowFocus: false
  });
  const items = [
    { label: "Oficial", value: data?.oficial },
    { label: "Blue", value: data?.blue, accent: true },
    { label: "MEP", value: data?.mep },
    { label: "CCL", value: data?.ccl },
    { label: "Cripto", value: data?.cripto },
    { label: "Tarjeta", value: data?.tarjeta }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "size-5 text-success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Cotización del dólar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => refetch(), disabled: isFetching, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-4 ${isFetching ? "animate-spin" : ""}` }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg border ${it.accent ? "border-primary/40 bg-primary/5" : "border-border bg-card/40"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: it.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-lg font-bold mt-1", children: formatARS(it.value) })
    ] }, it.label)) }),
    dataUpdatedAt > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [
      "Actualizado: ",
      new Date(dataUpdatedAt).toLocaleTimeString("es-AR")
    ] })
  ] });
}
function Dashboard() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const payDay = profile?.pay_day ?? 1;
  const mes = currentFinancialMonth(payDay);
  const currency = profile?.currency ?? "ARS";
  const meses6 = listFinancialMonths(payDay, 5, 0);
  const {
    data: movs
  } = useQuery({
    queryKey: ["dashboard", user?.id, meses6.join(",")],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("movimientos").select("tipo, monto, categoria, mes_financiero, descripcion, fecha, medio, es_cuota, cuota_origen_id, tarjeta").in("mes_financiero", meses6).eq("activo", true);
      if (error) throw error;
      return data ?? [];
    }
  });
  const {
    data: cuotasActivas
  } = useQuery({
    queryKey: ["tarjetas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("tarjetas_cuotas").select("id, tarjeta, compra, valor_cuota, cuota_actual, cuotas_totales, inicio").eq("activo", true);
      if (error) throw error;
      return data ?? [];
    }
  });
  const {
    data: gastosFijos
  } = useQuery({
    queryKey: ["gastos-fijos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("gastos_fijos").select("id, gasto, monto_mensual, categoria, medio").eq("activo", true);
      if (error) throw error;
      return data ?? [];
    }
  });
  const {
    ingresos,
    gastos,
    balance,
    topCats,
    serie,
    anomalias
  } = reactExports.useMemo(() => {
    const movsConCuotas = [...movs ?? []];
    (cuotasActivas ?? []).forEach((c) => {
      meses6.forEach((m) => {
        const cuotaDelMes = installmentForFinancialMonth({
          inicio: c.inicio,
          cuotaActual: Number(c.cuota_actual),
          cuotasTotales: Number(c.cuotas_totales),
          mesFinanciero: m
        });
        if (!cuotaDelMes) return;
        const pagoTarjetaDelMes = movsConCuotas.some((mov) => {
          if (mov.tipo !== "Gasto" || mov.mes_financiero !== m) return false;
          if (mov.tarjeta !== c.tarjeta) return false;
          return (mov.descripcion ?? "").toLowerCase().startsWith("pago tarjeta");
        });
        if (pagoTarjetaDelMes) return;
        const yaExiste = movsConCuotas.some((mov) => {
          if (!mov.es_cuota) return false;
          if (mov.mes_financiero !== m) return false;
          if (mov.cuota_origen_id === c.id) return true;
          return mov.tarjeta === c.tarjeta && (mov.descripcion ?? "").toLowerCase().includes(c.compra.toLowerCase());
        });
        if (yaExiste) return;
        movsConCuotas.push({
          tipo: "Gasto",
          monto: Number(c.valor_cuota),
          categoria: "Tarjeta",
          mes_financiero: m,
          descripcion: `${c.compra} (cuota ${cuotaDelMes}/${c.cuotas_totales})`,
          fecha: c.inicio,
          medio: "Crédito",
          es_cuota: true,
          cuota_origen_id: c.id,
          tarjeta: c.tarjeta
        });
      });
    });
    (gastosFijos ?? []).forEach((g) => {
      const yaExiste = movsConCuotas.some((mov) => {
        if (mov.tipo !== "Gasto" || mov.mes_financiero !== mes) return false;
        return (mov.descripcion ?? "").toLowerCase() === g.gasto.toLowerCase() && Number(mov.monto) === Number(g.monto_mensual);
      });
      if (yaExiste) return;
      movsConCuotas.push({
        tipo: "Gasto",
        monto: Number(g.monto_mensual),
        categoria: g.categoria ?? "Fijo",
        mes_financiero: mes,
        descripcion: g.gasto,
        fecha: mes,
        es_cuota: false,
        cuota_origen_id: null,
        tarjeta: null,
        medio: g.medio
      });
    });
    const enMes = movsConCuotas.filter((m) => m.mes_financiero === mes);
    const ingresos2 = enMes.filter((m) => m.tipo === "Ingreso").reduce((s, m) => s + Number(m.monto), 0);
    const gastos2 = enMes.filter((m) => m.tipo === "Gasto").reduce((s, m) => s + Number(m.monto), 0);
    const catMap = /* @__PURE__ */ new Map();
    enMes.filter((m) => m.tipo === "Gasto").forEach((m) => {
      const k = m.categoria ?? "Sin categoría";
      catMap.set(k, (catMap.get(k) ?? 0) + Number(m.monto));
    });
    const topCats2 = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const serie2 = meses6.map((m) => {
      const items = movsConCuotas.filter((x) => x.mes_financiero === m);
      return {
        mes: m.split(" ")[0],
        ingresos: items.filter((x) => x.tipo === "Ingreso").reduce((s, x) => s + Number(x.monto), 0),
        gastos: items.filter((x) => x.tipo === "Gasto").reduce((s, x) => s + Number(x.monto), 0)
      };
    });
    const anomalias2 = [];
    const previos = movsConCuotas.filter((m) => m.mes_financiero !== mes && m.tipo === "Gasto");
    const promPorCat = /* @__PURE__ */ new Map();
    const countPorCat = /* @__PURE__ */ new Map();
    previos.forEach((m) => {
      const k = m.categoria ?? "Sin categoría";
      promPorCat.set(k, (promPorCat.get(k) ?? 0) + Number(m.monto));
      countPorCat.set(k, (countPorCat.get(k) ?? 0) + 1);
    });
    enMes.filter((m) => m.tipo === "Gasto").forEach((m) => {
      const k = m.categoria ?? "Sin categoría";
      const c = countPorCat.get(k) ?? 0;
      if (c < 3) return;
      const prom = (promPorCat.get(k) ?? 0) / c;
      if (Number(m.monto) > prom * 2.5 && Number(m.monto) > 5e3) {
        anomalias2.push({
          desc: m.descripcion ?? "(sin desc)",
          cat: k,
          monto: Number(m.monto)
        });
      }
    });
    return {
      ingresos: ingresos2,
      gastos: gastos2,
      balance: ingresos2 - gastos2,
      topCats: topCats2,
      serie: serie2,
      anomalias: anomalias2.slice(0, 3)
    };
  }, [movs, cuotasActivas, gastosFijos, mes, meses6]);
  const overdraft = Number(profile?.overdraft_allowed ?? 0);
  const score = financialScore(ingresos, gastos, overdraft);
  const mensaje = smartMessage(ingresos, gastos, overdraft, payDay);
  const ahorroPct = ingresos > 0 ? balance / ingresos * 100 : 0;
  const ahorroObjetivo = getSavingTargetPercent(profile);
  const topMax = topCats[0]?.[1] ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Hola",
        profile?.display_name ? `, ${profile.display_name}` : "",
        " 👋"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold tracking-tight mt-1", children: [
        "Tu resumen de ",
        mes
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Ingresos", value: formatMoney(ingresos, currency), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-5" }), tone: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Gastos", value: formatMoney(gastos, currency), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-5" }), tone: "destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Balance", value: formatMoney(balance, currency), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5" }), tone: balance >= 0 ? "success" : "destructive", subtitle: `${ahorroPct >= 0 ? "+" : ""}${ahorroPct.toFixed(0)}% de ahorro · objetivo ${ahorroObjetivo}%` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5", style: {
      boxShadow: "var(--shadow-card)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-16 rounded-full grid place-items-center font-bold text-2xl ${score.tone === "success" ? "bg-success/20 text-success" : score.tone === "warning" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}`, children: score.score }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Score financiero" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: score.tone === "success" ? "default" : "secondary", children: score.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: score.score, className: "mt-2 h-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-3 flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 mt-0.5 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: mensaje })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-4", children: "Últimos 6 meses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: serie, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", stroke: "var(--muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 12, tickFormatter: (v) => formatCompact(v, currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12
          }, formatter: (v) => formatMoney(Number(v), currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "ingresos", fill: "var(--success)", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "gastos", fill: "var(--destructive)", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-4", children: "Top categorías de gasto" }),
        topCats.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Sin gastos este mes." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: topCats.map(([cat, monto]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cat }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-medium", children: formatMoney(monto, currency) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-muted/30 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: {
            width: `${topMax > 0 ? monto / topMax * 100 : 0}%`,
            background: "var(--gradient-primary)"
          } }) })
        ] }, cat)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DolarWidget, {}),
    anomalias.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 border-warning/40 bg-warning/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-5 text-warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Gastos fuera de tu patrón" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm", children: anomalias.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: a.desc }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "· ",
            a.cat
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold text-warning", children: formatMoney(a.monto, currency) })
      ] }, i)) })
    ] })
  ] });
}
function KpiCard({
  label,
  value,
  icon,
  tone,
  subtitle
}) {
  const toneClass = {
    success: "text-success",
    destructive: "text-destructive",
    warning: "text-warning"
  }[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-card", style: {
    boxShadow: "var(--shadow-card)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: toneClass, children: icon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-3xl font-bold mt-3 tracking-tight", children: value }),
    subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs mt-1 ${toneClass}`, children: subtitle })
  ] });
}
export {
  Dashboard as component
};
