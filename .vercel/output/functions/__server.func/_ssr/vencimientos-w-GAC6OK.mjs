import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { D as DecimalInput, b as parsePositiveNumberInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, f as DialogFooter } from "./dialog-VpbuoPd_.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { j as TriangleAlert, k as CalendarClock, b as Check, l as Trash2, P as Plus } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
function addMonths(date, n) {
  const d = new Date(date.getFullYear(), date.getMonth() + n, 1);
  const day = Math.min(date.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
  d.setDate(day);
  return d;
}
function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function Vencimientos() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [cursor, setCursor] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    return {
      y: d.getFullYear(),
      m: d.getMonth()
    };
  });
  const {
    data: manualVencs
  } = useQuery({
    queryKey: ["vencimientos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("vencimientos").select("*").order("fecha", {
        ascending: true
      });
      if (error) throw error;
      return (data ?? []).map((v) => ({
        ...v,
        origen: "manual"
      }));
    }
  });
  const {
    data: autoVencs
  } = useQuery({
    queryKey: ["vencimientos-auto", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [prestamos, tarjetas, gastos] = await Promise.all([supabase.from("prestamos").select("*").eq("activo", true), supabase.from("tarjetas_cuotas").select("*").eq("activo", true), supabase.from("gastos_fijos").select("*").eq("activo", true)]);
      const out = [];
      const hoy = /* @__PURE__ */ new Date();
      hoy.setHours(0, 0, 0, 0);
      const horizonteGastos = new Date(hoy);
      horizonteGastos.setMonth(horizonteGastos.getMonth() + 12);
      for (const p of prestamos.data ?? []) {
        if (!p.inicio) continue;
        const base = /* @__PURE__ */ new Date(p.inicio + "T00:00:00");
        if (p.dia_pago) base.setDate(p.dia_pago);
        const restantes = p.cuotas_totales - p.cuotas_pagadas;
        for (let i = 0; i < restantes; i++) {
          const fecha = addMonths(base, p.cuotas_pagadas + i);
          out.push({
            id: `prestamo-${p.id}-${p.cuotas_pagadas + i + 1}`,
            concepto: `${p.descripcion} (cuota ${p.cuotas_pagadas + i + 1}/${p.cuotas_totales})`,
            monto: Number(p.cuota_mensual),
            fecha: isoLocal(fecha),
            recurrente: false,
            pagado: false,
            origen: "prestamo"
          });
        }
      }
      for (const t of tarjetas.data ?? []) {
        const base = /* @__PURE__ */ new Date(t.inicio + "T00:00:00");
        const restantes = t.cuotas_totales - t.cuota_actual + 1;
        for (let i = 0; i < restantes; i++) {
          const fecha = addMonths(base, i);
          out.push({
            id: `tarjeta-${t.id}-${t.cuota_actual + i}`,
            concepto: `${t.tarjeta}: ${t.compra} (${t.cuota_actual + i}/${t.cuotas_totales})`,
            monto: Number(t.valor_cuota),
            fecha: isoLocal(fecha),
            recurrente: false,
            pagado: false,
            origen: "tarjeta"
          });
        }
      }
      for (const g of gastos.data ?? []) {
        const baseDay = g.inicio ? (/* @__PURE__ */ new Date(g.inicio + "T00:00:00")).getDate() : 1;
        const fin = g.fin ? /* @__PURE__ */ new Date(g.fin + "T00:00:00") : null;
        for (let i = 0; i < 12; i++) {
          const d = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
          const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
          d.setDate(Math.min(baseDay, dim));
          if (fin && d > fin) break;
          if (d > horizonteGastos) break;
          out.push({
            id: `gasto-${g.id}-${d.getFullYear()}${d.getMonth()}`,
            concepto: g.gasto,
            monto: Number(g.monto_mensual),
            fecha: isoLocal(d),
            recurrente: true,
            pagado: false,
            origen: "gasto_fijo"
          });
        }
      }
      return out;
    }
  });
  const vencs = reactExports.useMemo(() => {
    return [...manualVencs ?? [], ...autoVencs ?? []].sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [manualVencs, autoVencs]);
  const {
    proximos,
    totalMes,
    vencidos
  } = reactExports.useMemo(() => {
    const hoy = /* @__PURE__ */ new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30 = new Date(hoy);
    en30.setDate(en30.getDate() + 30);
    const proximos2 = vencs.filter((v) => !v.pagado && /* @__PURE__ */ new Date(v.fecha + "T00:00:00") >= hoy && /* @__PURE__ */ new Date(v.fecha + "T00:00:00") <= en30);
    const vencidos2 = vencs.filter((v) => !v.pagado && /* @__PURE__ */ new Date(v.fecha + "T00:00:00") < hoy && v.origen === "manual");
    const totalMes2 = proximos2.reduce((s, v) => s + Number(v.monto), 0);
    return {
      proximos: proximos2,
      totalMes: totalMes2,
      vencidos: vencidos2
    };
  }, [vencs]);
  const grupos = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const v of autoVencs ?? []) {
      const parts = v.id.split("-");
      const key = `${parts[0]}-${parts[1]}`;
      const nombre = v.concepto.replace(/\s*\([^)]*\)\s*$/, "");
      if (!map.has(key)) map.set(key, {
        key,
        origen: v.origen,
        nombre,
        cuotaMonto: Number(v.monto),
        items: []
      });
      map.get(key).items.push(v);
    }
    return Array.from(map.values()).map((g) => {
      const sorted = g.items.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
      return {
        ...g,
        primera: sorted[0],
        ultima: sorted[sorted.length - 1],
        cantidad: sorted.length
      };
    }).sort((a, b) => a.primera.fecha.localeCompare(b.primera.fecha));
  }, [autoVencs]);
  const manualPend = reactExports.useMemo(() => [...vencidos, ...proximos].filter((v) => v.origen === "manual"), [vencidos, proximos]);
  const monthGrid = reactExports.useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push({
      date: null,
      items: []
    });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor.y, cursor.m, d);
      const iso = isoLocal(date);
      const items = vencs.filter((v) => v.fecha === iso);
      cells.push({
        date,
        items
      });
    }
    return cells;
  }, [vencs, cursor]);
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric"
  });
  const today = isoLocal(/* @__PURE__ */ new Date());
  async function togglePagado(v) {
    const {
      error
    } = await supabase.from("vencimientos").update({
      pagado: !v.pagado
    }).eq("id", v.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["vencimientos"]
    });
  }
  async function del(id) {
    const {
      error
    } = await supabase.from("vencimientos").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["vencimientos"]
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Vencimientos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Calendario de pagos próximos." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NewV, { userId: user?.id, onCreated: () => qc.invalidateQueries({
        queryKey: ["vencimientos"]
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Compromisos activos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: grupos.length + manualPend.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "Tarjetas, préstamos y fijos" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Total mensual estimado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: formatMoney(grupos.reduce((s, g) => s + g.cuotaMonto, 0), currency) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "Suma de cuotas activas" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-5 ${vencidos.length > 0 ? "border-destructive/40 bg-destructive/5" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase", children: [
          vencidos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4 text-destructive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Manuales vencidos" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-2xl font-bold mt-2 ${vencidos.length > 0 ? "text-destructive" : ""}`, children: vencidos.length })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold capitalize", children: monthName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setCursor((c) => {
            const m = c.m - 1;
            return m < 0 ? {
              y: c.y - 1,
              m: 11
            } : {
              y: c.y,
              m
            };
          }), children: "‹" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setCursor(() => {
            const d = /* @__PURE__ */ new Date();
            return {
              y: d.getFullYear(),
              m: d.getMonth()
            };
          }), children: "Hoy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setCursor((c) => {
            const m = c.m + 1;
            return m > 11 ? {
              y: c.y + 1,
              m: 0
            } : {
              y: c.y,
              m
            };
          }), children: "›" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-1", children: ["D", "L", "M", "X", "J", "V", "S"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center font-medium", children: d }, d)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: monthGrid.map((cell, i) => {
        const iso = cell.date ? isoLocal(cell.date) : void 0;
        const isToday = iso === today;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `min-h-16 rounded-md border p-1 text-xs ${cell.date ? "bg-card/40" : "opacity-30"} ${isToday ? "border-primary bg-primary/10" : "border-border"}`, children: [
          cell.date && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: cell.date.getDate() }),
          cell.items.slice(0, 2).map((it) => {
            const color = it.pagado ? "bg-success/20 text-success line-through" : it.origen === "prestamo" ? "bg-purple-500/20 text-purple-400" : it.origen === "tarjeta" ? "bg-blue-500/20 text-blue-400" : it.origen === "gasto_fijo" ? "bg-orange-500/20 text-orange-400" : "bg-warning/20 text-warning";
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `truncate mt-0.5 rounded px-1 ${color}`, children: it.concepto }, it.id);
          }),
          cell.items.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground mt-0.5", children: [
            "+",
            cell.items.length - 2
          ] })
        ] }, i);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "size-4" }),
        " Próximos vencimientos"
      ] }),
      grupos.length === 0 && manualPend.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "Sin vencimientos pendientes 🎉" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "divide-y divide-border", children: [
        grupos.map((g) => {
          const origenLabel = g.origen === "prestamo" ? "Préstamo" : g.origen === "tarjeta" ? "Tarjeta" : "Gasto fijo";
          const primeraD = /* @__PURE__ */ new Date(g.primera.fecha + "T00:00:00");
          const ultimaD = /* @__PURE__ */ new Date(g.ultima.fecha + "T00:00:00");
          const fmt = (d) => d.toLocaleDateString("es-AR", {
            day: "numeric",
            month: "short",
            year: "2-digit"
          });
          const esRecurrente = g.origen === "gasto_fijo";
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: g.nombre }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: origenLabel })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: esRecurrente ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Próximo: ",
                fmt(primeraD),
                " · mensual"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                g.cantidad,
                " cuotas restantes · próxima ",
                fmt(primeraD),
                " · termina ",
                fmt(ultimaD)
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num font-semibold", children: formatMoney(g.cuotaMonto, currency) }),
              !esRecurrente && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground num", children: [
                "Total: ",
                formatMoney(g.cuotaMonto * g.cantidad, currency)
              ] })
            ] })
          ] }) }, g.key);
        }),
        manualPend.map((v) => {
          const d = /* @__PURE__ */ new Date(v.fecha + "T00:00:00");
          const dias = Math.ceil((d.getTime() - (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0)) / 864e5);
          const vencido = dias < 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-3 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${v.pagado ? "line-through text-muted-foreground" : ""}`, children: v.concepto }),
                v.recurrente && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Recurrente" }),
                vencido && !v.pagado && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "Vencido" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                d.toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short"
                }),
                " · ",
                vencido ? `hace ${Math.abs(dias)} días` : dias === 0 ? "hoy" : `en ${dias} días`
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold whitespace-nowrap", children: formatMoney(Number(v.monto), currency) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: v.pagado ? "secondary" : "default", onClick: () => togglePagado(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => del(v.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
          ] }, v.id);
        })
      ] })
    ] })
  ] });
}
function NewV({
  userId,
  onCreated
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    concepto: "",
    monto: "",
    fecha: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    recurrente: false
  });
  async function save() {
    if (!userId || !form.concepto || !form.monto) {
      toast.error("Faltan campos");
      return;
    }
    let monto;
    try {
      monto = parsePositiveNumberInput(form.monto, "Monto");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa el monto");
      return;
    }
    const {
      error
    } = await supabase.from("vencimientos").insert({
      user_id: userId,
      concepto: form.concepto,
      monto,
      fecha: form.fecha,
      recurrente: form.recurrente,
      pagado: false
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Vencimiento agregado");
    setOpen(false);
    setForm({
      concepto: "",
      monto: "",
      fecha: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      recurrente: false
    });
    onCreated();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
      "Nuevo"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nuevo vencimiento" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Concepto *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.concepto, onChange: (e) => setForm({
            ...form,
            concepto: e.target.value
          }), placeholder: "ABL, expensas, seguro..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.monto, onChange: (e) => setForm({
              ...form,
              monto: e.target.value
            }), placeholder: "Ej: 25000" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fecha, onChange: (e) => setForm({
              ...form,
              fecha: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rec", children: "Recurrente mensual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "rec", checked: form.recurrente, onCheckedChange: (v) => setForm({
            ...form,
            recurrente: v
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Guardar" }) })
    ] })
  ] });
}
export {
  Vencimientos as component
};
