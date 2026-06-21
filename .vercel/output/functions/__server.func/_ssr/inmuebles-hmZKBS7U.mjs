import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { D as DecimalInput, b as parsePositiveNumberInput, a as parseOptionalNumberInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, f as DialogFooter } from "./dialog-VpbuoPd_.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { B as Building2, H as House, l as Trash2, P as Plus } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
const TIPOS = ["Casa", "Departamento", "PH", "Terreno", "Local", "Oficina", "Cochera", "Otro"];
function Inmuebles() {
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const {
    data: list
  } = useQuery({
    queryKey: ["inmuebles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("inmuebles").select("*").eq("activo", true).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const totals = reactExports.useMemo(() => {
    const arr = list ?? [];
    const valor = arr.reduce((s, i) => s + Number(i.valor_estimado || 0), 0);
    const deuda = arr.reduce((s, i) => s + Number(i.deuda_asociada || 0), 0);
    const renta = arr.filter((i) => i.alquilado).reduce((s, i) => s + Number(i.renta_mensual || 0), 0);
    return {
      valor,
      deuda,
      renta,
      neto: valor - deuda
    };
  }, [list]);
  async function del(id) {
    if (!confirm("¿Eliminar este inmueble?")) return;
    const {
      error
    } = await supabase.from("inmuebles").update({
      activo: false
    }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["inmuebles"]
    });
    toast.success("Eliminado");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Inmuebles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Tu portafolio inmobiliario." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NewI, { userId: user?.id, onCreated: () => qc.invalidateQueries({
        queryKey: ["inmuebles"]
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Valor total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: formatMoney(totals.valor, "USD") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Deuda" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2 text-destructive", children: formatMoney(totals.deuda, "USD") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Equity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2 text-success", children: formatMoney(totals.neto, "USD") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Renta mensual" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-2xl font-bold mt-2", children: formatMoney(totals.renta, "USD") })
      ] })
    ] }),
    (list ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-12 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Aún no cargaste inmuebles." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: (list ?? []).map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "size-4 text-primary" }),
            i.propiedad
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: [i.tipo, i.ciudad, i.pais].filter(Boolean).join(" · ") || "Sin datos" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => del(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Valor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-medium", children: formatMoney(Number(i.valor_estimado), i.moneda) })
        ] }),
        Number(i.deuda_asociada) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Deuda" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num text-destructive", children: formatMoney(Number(i.deuda_asociada), i.moneda) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Equity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-semibold text-success", children: formatMoney(Number(i.valor_estimado) - Number(i.deuda_asociada), i.moneda) })
        ] }),
        i.alquilado && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Alquilado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "num text-sm", children: [
            formatMoney(Number(i.renta_mensual || 0), i.moneda),
            "/mes"
          ] })
        ] })
      ] })
    ] }, i.id)) })
  ] });
}
function NewI({
  userId,
  onCreated
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    propiedad: "",
    tipo: "Departamento",
    pais: "Argentina",
    ciudad: "",
    moneda: "USD",
    valor_estimado: "",
    deuda_asociada: "0",
    alquilado: false,
    renta_mensual: "0"
  });
  async function save() {
    if (!userId || !form.propiedad || !form.valor_estimado) {
      toast.error("Faltan campos");
      return;
    }
    let valorEstimado;
    let deudaAsociada;
    let rentaMensual;
    try {
      valorEstimado = parsePositiveNumberInput(form.valor_estimado, "Valor estimado");
      deudaAsociada = parseOptionalNumberInput(form.deuda_asociada, 0);
      rentaMensual = form.alquilado ? parseOptionalNumberInput(form.renta_mensual, 0) : 0;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa los numeros");
      return;
    }
    const {
      error
    } = await supabase.from("inmuebles").insert({
      user_id: userId,
      propiedad: form.propiedad,
      tipo: form.tipo,
      pais: form.pais || null,
      ciudad: form.ciudad || null,
      moneda: form.moneda,
      valor_estimado: valorEstimado,
      deuda_asociada: deudaAsociada,
      alquilado: form.alquilado,
      renta_mensual: rentaMensual
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Inmueble agregado");
    setOpen(false);
    onCreated();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
      "Nuevo"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nuevo inmueble" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Propiedad *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.propiedad, onChange: (e) => setForm({
            ...form,
            propiedad: e.target.value
          }), placeholder: "Depto Palermo, Casa Tigre..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tipo, onValueChange: (v) => setForm({
              ...form,
              tipo: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moneda" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.moneda, onValueChange: (v) => setForm({
              ...form,
              moneda: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "USD", children: "USD" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ARS", children: "ARS" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "País" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.pais, onChange: (e) => setForm({
              ...form,
              pais: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ciudad" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ciudad, onChange: (e) => setForm({
              ...form,
              ciudad: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valor estimado *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.valor_estimado, onChange: (e) => setForm({
              ...form,
              valor_estimado: e.target.value
            }), placeholder: "Ej: 120000" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deuda asociada" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.deuda_asociada, onChange: (e) => setForm({
              ...form,
              deuda_asociada: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "alq", children: "¿Está alquilado?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "alq", checked: form.alquilado, onCheckedChange: (v) => setForm({
            ...form,
            alquilado: v
          }) })
        ] }),
        form.alquilado && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Renta mensual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.renta_mensual, onChange: (e) => setForm({
            ...form,
            renta_mensual: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Guardar" }) })
    ] })
  ] });
}
export {
  Inmuebles as component
};
