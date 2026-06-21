import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { c as categoriasQuery, a as categoryNamesFor } from "./categories-D2fchIjA.mjs";
import { c as currentFinancialMonth, l as listFinancialMonths, i as installmentForFinancialMonth, f as formatMoney, t as todayISO, a as financialMonth } from "./finance-Ea2ALQRw.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { C as ConceptCombo } from "./concept-combo-B5drMKEx.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-VpbuoPd_.mjs";
import { b as parsePositiveNumberInput, D as DecimalInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-D_u1EXWn.mjs";
import { P as Papa } from "../_libs/papaparse.mjs";
import { U as Upload, P as Plus, o as Search, l as Trash2, F as FileText } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, P as PieChart, b as Pie, c as Cell, T as Tooltip } from "../_libs/recharts.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
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
function MovimientoDialog({ open, onOpenChange, defaults }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const { data: cats } = useQuery(categoriasQuery(user?.id));
  const [form, setForm] = reactExports.useState(initial());
  reactExports.useEffect(() => {
    if (open) setForm({ ...initial(), ...defaults });
  }, [open]);
  const categoryOptions = categoryNamesFor(cats, form.tipo === "Ingreso" ? "Ingreso" : "Gasto");
  const mut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("no user");
      if (!form.descripcion.trim()) throw new Error("Falta descripción");
      const monto = parsePositiveNumberInput(form.monto, "Monto");
      const fecha = form.fecha || todayISO();
      const mes_financiero = financialMonth(new Date(fecha), profile?.pay_day ?? 1);
      const { error } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: form.tipo,
        descripcion: form.descripcion.trim().slice(0, 200),
        monto,
        fecha,
        mes_financiero,
        categoria: form.categoria || null,
        medio: form.medio || null,
        notas: form.notas.trim() || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Movimiento agregado");
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nuevo movimiento" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Registrá un ingreso o gasto rápido." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: form.tipo, onValueChange: (v) => setForm({ ...form, tipo: v, categoria: "" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-2 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "Gasto", children: "Gasto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "Ingreso", children: "Ingreso" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.monto, onChange: (e) => setForm({ ...form, monto: e.target.value }), placeholder: "Ej: 12500,50" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fecha, onChange: (e) => setForm({ ...form, fecha: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descripción" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ConceptCombo, { kind: form.tipo === "Ingreso" ? "Ingreso" : "Gasto", value: form.descripcion, onChange: (v) => setForm({ ...form, descripcion: v }), maxLength: 200, placeholder: "Super, Uber, sueldo..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Categoría" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.categoria, onValueChange: (v) => setForm({ ...form, categoria: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sin categoría" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categoryOptions.map((nombre) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: nombre, children: nombre }, nombre)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.medio, onValueChange: (v) => setForm({ ...form, medio: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Cualquiera" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Efectivo", children: "Efectivo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Débito", children: "Débito" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Crédito", children: "Crédito" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Transferencia", children: "Transferencia" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "MercadoPago", children: "MercadoPago" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas (opcional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, maxLength: 500, value: form.notas, onChange: (e) => setForm({ ...form, notas: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, children: mut.isPending ? "Guardando..." : "Guardar" })
      ] })
    ] })
  ] }) });
}
const initial = () => ({ tipo: "Gasto", monto: "", fecha: todayISO(), descripcion: "", categoria: "", medio: "", notas: "" });
function parseImportAmount(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,-]/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : lastDot > -1 ? "." : "";
  const normalized = cleaned.replace(/[.,]/g, (ch) => ch === decimalSep ? "." : "").replace(/(?!^)-/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
function CsvImportDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [parsed, setParsed] = reactExports.useState([]);
  const [errors, setErrors] = reactExports.useState([]);
  const [filename, setFilename] = reactExports.useState("");
  function handleFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Archivo > 5MB");
      return;
    }
    setFilename(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = [];
        const errs = [];
        res.data.slice(0, 500).forEach((r, i) => {
          const fecha = (r.fecha || r.Fecha || r.date || "").toString().slice(0, 10);
          const descripcion = (r.descripcion || r.Descripcion || r.description || r.detalle || "").toString().trim().slice(0, 200);
          const montoParsed = parseImportAmount(r.monto || r.Monto || r.amount);
          const monto = Math.abs(Number(montoParsed));
          let tipo = (r.tipo || r.Tipo || "").toString();
          if (!tipo) tipo = Number(montoParsed ?? 0) < 0 ? "Gasto" : "Ingreso";
          tipo = tipo.toLowerCase().startsWith("i") ? "Ingreso" : "Gasto";
          if (!fecha || !descripcion || !Number.isFinite(monto) || monto <= 0) {
            errs.push(`Fila ${i + 2}: datos incompletos`);
            return;
          }
          rows.push({
            fecha,
            descripcion,
            monto,
            tipo,
            categoria: (r.categoria || r.Categoria || "").toString().trim() || void 0,
            medio: (r.medio || r.Medio || "").toString().trim() || void 0
          });
        });
        setParsed(rows);
        setErrors(errs.slice(0, 5));
      },
      error: () => toast.error("No pude leer el archivo")
    });
  }
  const mut = useMutation({
    mutationFn: async () => {
      if (!user || !parsed.length) return;
      const payDay = profile?.pay_day ?? 1;
      const batch = parsed.map((r) => ({
        user_id: user.id,
        tipo: r.tipo,
        descripcion: r.descripcion,
        monto: r.monto,
        fecha: r.fecha,
        mes_financiero: financialMonth(new Date(r.fecha), payDay),
        categoria: r.categoria ?? null,
        medio: r.medio ?? null
      }));
      const { error } = await supabase.from("movimientos").insert(batch);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Importé ${parsed.length} movimientos`);
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onOpenChange(false);
    },
    onError: () => toast.error("Falló la importación")
  });
  function reset() {
    setParsed([]);
    setErrors([]);
    setFilename("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (!o) reset();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Importar CSV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Columnas esperadas: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: "fecha, descripcion, monto, tipo, categoria, medio" }),
        ". Máx. 500 filas."
      ] })
    ] }),
    !parsed.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-8 mx-auto text-muted-foreground mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Seleccioná un archivo CSV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".csv", className: "hidden", onChange: (e) => e.target.files?.[0] && handleFile(e.target.files[0]) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: filename }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            parsed.length,
            " filas listas",
            errors.length ? ` · ${errors.length}+ errores` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: reset, children: "Cambiar" })
      ] }),
      errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-warning bg-warning/10 p-2 rounded", children: errors.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: e }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-60 overflow-y-auto border border-border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30 sticky top-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Fecha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Descripción" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Tipo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-right", children: "Monto" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: parsed.slice(0, 50).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: r.fecha }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 truncate max-w-[200px]", children: r.descripcion }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: r.tipo }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right num", children: r.monto.toFixed(2) })
          ] }, i)) })
        ] }),
        parsed.length > 50 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground p-2", children: [
          "+",
          parsed.length - 50,
          " filas más..."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, children: mut.isPending ? "Importando..." : `Importar ${parsed.length}` })
      ] })
    ] })
  ] }) });
}
function MovimientosPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const mesActual = currentFinancialMonth(payDay);
  const [openNew, setOpenNew] = reactExports.useState(false);
  const [openImport, setOpenImport] = reactExports.useState(false);
  const [mes, setMes] = reactExports.useState(mesActual);
  const [tipo, setTipo] = reactExports.useState("todos");
  const [search, setSearch] = reactExports.useState("");
  const meses = listFinancialMonths(payDay, 12, 1);
  const {
    data: movs,
    isLoading
  } = useQuery({
    queryKey: ["movimientos", user?.id, mes],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("movimientos").select("*").eq("mes_financiero", mes).eq("activo", true).order("fecha", {
        ascending: false
      });
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
    data: cats
  } = useQuery(categoriasQuery(user?.id));
  const movimientosConCuotas = reactExports.useMemo(() => {
    const base = movs ?? [];
    const cuotasComoMovimientos = (cuotasActivas ?? []).flatMap((c) => {
      const cuotaDelMes = installmentForFinancialMonth({
        inicio: c.inicio,
        cuotaActual: Number(c.cuota_actual),
        cuotasTotales: Number(c.cuotas_totales),
        mesFinanciero: mes
      });
      if (!cuotaDelMes) return [];
      const pagoTarjetaDelMes = base.some((m) => {
        if (m.tipo !== "Gasto" || m.tarjeta !== c.tarjeta) return false;
        return (m.descripcion ?? "").toLowerCase().startsWith("pago tarjeta");
      });
      if (pagoTarjetaDelMes) return [];
      const yaExiste = base.some((m) => {
        if (!m.es_cuota) return false;
        if (m.cuota_origen_id === c.id) return true;
        return m.tarjeta === c.tarjeta && (m.descripcion ?? "").toLowerCase().includes(c.compra.toLowerCase());
      });
      if (yaExiste) return [];
      return [{
        id: `cuota-${c.id}-${mes}`,
        tipo: "Gasto",
        descripcion: `${c.compra} (cuota ${cuotaDelMes}/${c.cuotas_totales})`,
        monto: Number(c.valor_cuota),
        fecha: c.inicio,
        mes_financiero: mes,
        categoria: "Tarjeta",
        medio: "Crédito",
        tarjeta: c.tarjeta,
        es_cuota: true,
        cuota_origen_id: c.id,
        activo: true
      }];
    });
    const fijosComoMovimientos = (gastosFijos ?? []).map((g) => ({
      id: `fijo-${g.id}-${mes}`,
      tipo: "Gasto",
      descripcion: g.gasto,
      monto: Number(g.monto_mensual),
      fecha: mes,
      mes_financiero: mes,
      categoria: g.categoria ?? "Fijo",
      medio: g.medio,
      tarjeta: null,
      es_cuota: false,
      cuota_origen_id: null,
      activo: true,
      es_fijo: true
    }));
    return [...base, ...cuotasComoMovimientos, ...fijosComoMovimientos];
  }, [movs, cuotasActivas, gastosFijos, mes]);
  const filtered = reactExports.useMemo(() => {
    return movimientosConCuotas.filter((m) => {
      if (tipo !== "todos" && m.tipo !== tipo) return false;
      if (search && !(m.descripcion ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [movimientosConCuotas, tipo, search]);
  const totales = reactExports.useMemo(() => {
    const ing = filtered.filter((m) => m.tipo === "Ingreso").reduce((s, m) => s + Number(m.monto), 0);
    const gas = filtered.filter((m) => m.tipo === "Gasto").reduce((s, m) => s + Number(m.monto), 0);
    return {
      ing,
      gas,
      balance: ing - gas
    };
  }, [filtered]);
  const catColor = (nombre) => cats?.find((c) => c.nombre === nombre)?.color ?? "#64748b";
  const gastosPorCategoria = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const m of movimientosConCuotas) {
      if (m.tipo !== "Gasto") continue;
      const k = m.categoria ?? "Sin categoría";
      map.set(k, (map.get(k) ?? 0) + Number(m.monto));
    }
    return Array.from(map, ([name, value]) => ({
      name,
      value,
      color: catColor(name)
    })).sort((a, b) => b.value - a.value);
  }, [movimientosConCuotas, cats]);
  const delMut = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("movimientos").update({
        activo: false
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Movimientos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Ingresos y gastos de cada mes financiero." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setOpenImport(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4 mr-2" }),
          "Importar CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpenNew(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
          "Nuevo"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "Ingresos", value: formatMoney(totales.ing, currency), tone: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "Gastos", value: formatMoney(totales.gas, currency), tone: "destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "Balance", value: formatMoney(totales.balance, currency), tone: totales.balance >= 0 ? "success" : "destructive" })
    ] }),
    gastosPorCategoria.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "En qué estás gastando" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: mes })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: gastosPorCategoria, dataKey: "value", nameKey: "name", innerRadius: 45, outerRadius: 80, paddingAngle: 2, children: gastosPorCategoria.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: e.color }, e.name)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => formatMoney(v, currency), contentStyle: {
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12
          } })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 max-h-56 overflow-auto pr-1", children: gastosPorCategoria.map((e) => {
          const pct = totales.gas > 0 ? e.value / totales.gas * 100 : 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2.5 rounded-full shrink-0", style: {
              background: e.color
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: e.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
              pct.toFixed(0),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-medium tabular-nums", children: formatMoney(e.value, currency) })
          ] }, e.name);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mes, onValueChange: setMes, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: meses.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipo, onValueChange: setTipo, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todos", children: "Todos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Ingreso", children: "Ingresos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Gasto", children: "Gastos" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar descripción...", className: "pl-9" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-muted-foreground", children: "Cargando..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No hay movimientos para este filtro." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", onClick: () => setOpenNew(true), children: "Agregar el primero →" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: filtered.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 hover:bg-muted/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full shrink-0", style: {
        background: catColor(m.categoria)
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: m.descripcion ?? "(sin descripción)" }),
          m.es_cuota && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Cuota" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex gap-2 flex-wrap mt-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m.fecha }),
          m.categoria && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· ",
            m.categoria
          ] }),
          m.medio && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· ",
            m.medio
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `num font-semibold whitespace-nowrap ${m.tipo === "Ingreso" ? "text-success" : "text-foreground"}`, children: [
        m.tipo === "Ingreso" ? "+" : "-",
        formatMoney(Number(m.monto), currency)
      ] }),
      !String(m.id).startsWith("cuota-") && !String(m.id).startsWith("fijo-") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive", onClick: () => delMut.mutate(m.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
    ] }, m.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MovimientoDialog, { open: openNew, onOpenChange: setOpenNew }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CsvImportDialog, { open: openImport, onOpenChange: setOpenImport })
  ] });
}
function MiniStat({
  label,
  value,
  tone
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `num text-xl font-bold mt-1 ${tone === "success" ? "text-success" : ""}`, children: value })
  ] });
}
export {
  MovimientosPage as component
};
