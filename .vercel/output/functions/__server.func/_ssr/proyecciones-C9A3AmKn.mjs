import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./createSsrRpc-CflJmRts.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Slider$1, a as SliderTrack, b as SliderRange, c as SliderThumb } from "../_libs/radix-ui__react-slider.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { g as getInflacion } from "./quotes.functions-C3guMtfB.mjs";
import { u as updateSavingTarget } from "./profile.functions-CBkB282-.mjs";
import { u as useFinancialPreferences, b as buildUpcomingEvents, p as parseISODate } from "./financial-centers-BQNd3GNL.mjs";
import "../_libs/seroval.mjs";
import { n as TrendingUp } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, a as Bar } from "../_libs/recharts.mjs";
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
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "./auth-middleware-DfWKUJS4.mjs";
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
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Slider$1,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SliderTrack, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRange, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Slider$1.displayName;
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function monthLabel(d) {
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}
function ProyeccionesPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id);
  const currency = profile?.currency ?? "ARS";
  const overdraft = Number(profile?.overdraft_allowed ?? 0);
  const salary = Number(profile?.salary ?? 0);
  const qc = useQueryClient();
  const [ahorroPct, setAhorroPct] = reactExports.useState(() => Number(profile?.saving_target ?? 20));
  const [inflacionPct, setInflacionPct] = reactExports.useState(0);
  const [inflacionTouched, setInflacionTouched] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (profile?.saving_target !== void 0 && profile?.saving_target !== null) {
      setAhorroPct(Number(profile.saving_target));
    }
  }, [profile?.saving_target]);
  reactExports.useEffect(() => {
    const saved = Number(profile?.saving_target ?? 20);
    if (ahorroPct === saved) return;
    const t = setTimeout(() => {
      updateTargetMutation.mutate(ahorroPct);
    }, 1e3);
    return () => clearTimeout(t);
  }, [ahorroPct, profile?.saving_target]);
  const fetchInflacion = useServerFn(getInflacion);
  const {
    data: infl
  } = useQuery({
    queryKey: ["inflacion-ar"],
    queryFn: () => fetchInflacion(),
    staleTime: 1e3 * 60 * 60 * 6
  });
  const saveTarget = useServerFn(updateSavingTarget);
  const updateTargetMutation = useMutation({
    mutationFn: (savingTarget) => saveTarget({
      data: {
        savingTarget
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["profile", user?.id]
      });
    }
  });
  reactExports.useEffect(() => {
    if (!inflacionTouched && infl?.promedio3m) {
      setInflacionPct(Number(infl.promedio3m.toFixed(1)));
    }
  }, [infl, inflacionTouched]);
  const {
    data
  } = useQuery({
    queryKey: ["proyecciones", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [fijos, cuotas, prest, ingExtra] = await Promise.all([supabase.from("gastos_fijos").select("*").eq("activo", true), supabase.from("tarjetas_cuotas").select("*").eq("activo", true), supabase.from("prestamos").select("*").eq("activo", true), supabase.from("ingresos").select("id,concepto,monto,fecha_cobro,tipo,activo").eq("activo", true).order("fecha_cobro", {
        ascending: false
      }).limit(80)]);
      return {
        fijos: fijos.data ?? [],
        cuotas: cuotas.data ?? [],
        prestamos: prest.data ?? [],
        ingresos: ingExtra.data ?? []
      };
    }
  });
  const rows = reactExports.useMemo(() => {
    if (!data) return [];
    const totalFijos = data.fijos.reduce((s, f) => s + Number(f.monto_mensual), 0);
    const sueldoCargado = data.ingresos.filter((i) => String(i.tipo ?? "").toLowerCase() === "sueldo").sort((a, b) => String(b.fecha_cobro).localeCompare(String(a.fecha_cobro)))[0];
    const sueldoMensual = Number(sueldoCargado?.monto ?? 0) > 0 ? Number(sueldoCargado.monto) : salary;
    const now = /* @__PURE__ */ new Date();
    const extras3m = data.ingresos.filter((i) => {
      const d = new Date(i.fecha_cobro);
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      return monthsAgo >= 0 && monthsAgo < 3 && String(i.tipo ?? "").toLowerCase() !== "sueldo";
    });
    const extrasProm = extras3m.length ? extras3m.reduce((s, i) => s + Number(i.monto), 0) / 3 : 0;
    now.setHours(0, 0, 0, 0);
    const events = buildUpcomingEvents({
      profile,
      ingresos: data.ingresos,
      tarjetas: data.cuotas,
      prestamos: data.prestamos,
      gastosFijos: data.fijos,
      horizonDays: 370,
      preferences
    });
    const out = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const infFactor = Math.pow(1 + inflacionPct / 100, i);
      let sueldo = sueldoMensual * infFactor;
      let extras = extrasProm * infFactor;
      let ingresos = sueldo + extras;
      let gastosFijos = totalFijos * infFactor;
      const cuotasTar = data.cuotas.reduce((s, c) => {
        const ini = new Date(c.inicio);
        const monthsFromIni = (d.getFullYear() - ini.getFullYear()) * 12 + (d.getMonth() - ini.getMonth());
        const cuotaEnMes = (Number(c.cuota_actual) || 1) + monthsFromIni - 0;
        if (cuotaEnMes >= 1 && cuotaEnMes <= Number(c.cuotas_totales)) return s + Number(c.valor_cuota);
        return s;
      }, 0);
      const cuotasPre = data.prestamos.reduce((s, p) => {
        const restantes = Number(p.cuotas_totales) - Number(p.cuotas_pagadas);
        return i < restantes ? s + Number(p.cuota_mensual) : s;
      }, 0);
      let cuotas = cuotasTar + cuotasPre;
      const monthEvents = events.filter((event) => {
        const eventDate = parseISODate(event.date);
        return Boolean(eventDate && eventDate >= d && eventDate < end);
      });
      if (monthEvents.length > 0) {
        const sueldoRaw = monthEvents.filter((event) => event.type === "cobro" && event.title.toLowerCase().includes("sueldo")).reduce((s, event) => s + Number(event.amount), 0);
        const ingresosRaw = monthEvents.filter((event) => event.type === "cobro").reduce((s, event) => s + Number(event.amount), 0);
        const gastosFijosRaw = monthEvents.filter((event) => event.type === "gasto_fijo").reduce((s, event) => s + Number(event.amount), 0);
        const pagosProgramados = monthEvents.filter((event) => event.type === "cuota" || event.type === "prestamo" || event.type === "vencimiento").reduce((s, event) => s + Number(event.amount), 0);
        sueldo = sueldoRaw * infFactor;
        extras = Math.max(0, ingresosRaw - sueldoRaw) * infFactor;
        ingresos = sueldo + extras;
        gastosFijos = gastosFijosRaw * infFactor;
        cuotas = pagosProgramados;
      }
      const total = gastosFijos + cuotas;
      const disponible = ingresos - total;
      const objetivo = Math.max(0, ingresos * ahorroPct / 100);
      const final = disponible - objetivo;
      let estado = "ok";
      let mensaje = "";
      if (disponible < -overdraft) {
        estado = "rojo";
        mensaje = `Te excedés del descubierto en ${formatMoney(Math.abs(disponible + overdraft), currency)}.`;
      } else if (final < 0) {
        estado = "ajustado";
        mensaje = `Cubrís gastos pero no alcanza para el objetivo de ahorro.`;
      } else {
        mensaje = `Podés ahorrar ${formatMoney(final, currency)} este mes.`;
      }
      out.push({
        mes: monthLabel(d),
        sueldo,
        extras,
        ingresos,
        gastosFijos,
        cuotas,
        total,
        disponible,
        objetivo,
        final,
        estado,
        mensaje
      });
    }
    return out;
  }, [data, profile, preferences, salary, ahorroPct, inflacionPct, overdraft, currency]);
  const chartData = rows.map((r) => ({
    mes: r.mes.split(" ")[0],
    Ingresos: Math.round(r.ingresos),
    Gastos: Math.round(r.total),
    Ahorro: Math.round(Math.max(0, r.final))
  }));
  const sumAhorro = rows.reduce((s, r) => s + Math.max(0, r.final), 0);
  const sueldoProyectado = rows[0]?.sueldo ?? 0;
  const extrasProyectados = rows[0]?.extras ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Proyecciones" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Mira como evolucionan tus proximos 12 meses segun fechas de cobro, vencimientos, gastos recurrentes y cuotas." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 grid grid-cols-1 md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: [
          "Objetivo de ahorro: ",
          ahorroPct,
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { value: [ahorroPct], onValueChange: (v) => setAhorroPct(v[0]), min: 0, max: 60, step: 5, className: "mt-3" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
          "Inflación mensual estimada: ",
          inflacionPct,
          "%",
          infl?.ultimoMes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-success normal-case tracking-normal", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3" }),
            " INDEC último: ",
            Number(infl.ultimoMes.valor).toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { value: [inflacionPct], onValueChange: (v) => {
          setInflacionPct(v[0]);
          setInflacionTouched(true);
        }, min: 0, max: 15, step: 0.1, className: "mt-3" }),
        infl?.promedio3m ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-2", children: [
          "Auto: promedio 3 meses INDEC (",
          infl.promedio3m.toFixed(1),
          "%). Movelo si querés."
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Sueldo mensual proyectado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-1 text-success", children: formatMoney(sueldoProyectado, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Extras promedio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-1", children: formatMoney(extrasProyectados, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Ahorro proyectado 12 meses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-1 text-success", children: formatMoney(sumAhorro, currency) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", tick: {
        fontSize: 11
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
        fontSize: 11
      }, tickFormatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : String(v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => formatMoney(v, currency), contentStyle: {
        background: "var(--card)",
        border: "1px solid var(--border)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: {
        fontSize: 12
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Ingresos", fill: "var(--success)", radius: [4, 4, 0, 0] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Gastos", fill: "var(--destructive)", radius: [4, 4, 0, 0] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Ahorro", fill: "var(--primary)", radius: [4, 4, 0, 0] })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium capitalize", children: r.mes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: r.mensaje })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Ingresos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-sm font-semibold text-success", children: formatMoney(r.ingresos, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Gastos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-sm font-semibold", children: formatMoney(r.total, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Disponible" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-sm font-semibold ${r.disponible < 0 ? "text-destructive" : ""}`, children: formatMoney(r.disponible, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.estado === "ok" ? "default" : r.estado === "ajustado" ? "secondary" : "destructive", children: r.estado === "ok" ? "Podés ahorrar" : r.estado === "ajustado" ? "Mes ajustado" : "Sobregirado" })
    ] }, r.mes)) }) })
  ] });
}
export {
  ProyeccionesPage as component
};
