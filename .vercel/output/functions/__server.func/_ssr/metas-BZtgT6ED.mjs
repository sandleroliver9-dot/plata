import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { D as DecimalInput, b as parsePositiveNumberInput, a as parseOptionalNumberInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { P as Progress } from "./progress-BRG1z6ZI.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, f as DialogFooter } from "./dialog-VpbuoPd_.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { T as Target, l as Trash2, P as Plus } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
function Metas() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const defaultCurrency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const {
    data: metas
  } = useQuery({
    queryKey: ["metas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("metas").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  async function addProgress(m) {
    const v = prompt(`¿Cuánto sumar a "${m.meta}"?`);
    if (!v) return;
    let monto;
    try {
      monto = parsePositiveNumberInput(v, "Monto");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa el monto");
      return;
    }
    const {
      error
    } = await supabase.from("metas").update({
      ahorrado: Number(m.ahorrado) + monto
    }).eq("id", m.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Progreso actualizado");
    qc.invalidateQueries({
      queryKey: ["metas"]
    });
  }
  async function del(id) {
    if (!confirm("¿Eliminar esta meta?")) return;
    const {
      error
    } = await supabase.from("metas").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["metas"]
    });
    toast.success("Eliminada");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Metas de ahorro" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Definí objetivos y seguí tu progreso." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NewMeta, { userId: user?.id, defaultCurrency, onCreated: () => qc.invalidateQueries({
        queryKey: ["metas"]
      }) })
    ] }),
    (metas ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-12 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Aún no tenés metas. Creá la primera para empezar." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: (metas ?? []).map((m) => {
      const pct = Math.min(100, Number(m.ahorrado) / Number(m.objetivo) * 100);
      const falta = Math.max(0, Number(m.objetivo) - Number(m.ahorrado));
      const dias = m.fecha_objetivo ? Math.ceil((new Date(m.fecha_objetivo).getTime() - Date.now()) / 864e5) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg", children: m.meta }),
            dias !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: dias > 0 ? `${dias} días restantes` : dias === 0 ? "Hoy es el día" : "Fecha vencida" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => del(m.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num font-medium", children: formatMoney(Number(m.ahorrado), m.moneda) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground num", children: [
              "de ",
              formatMoney(Number(m.objetivo), m.moneda)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: pct, className: "h-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: pct >= 100 ? "text-success font-semibold" : "text-muted-foreground", children: [
              pct.toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "Falta: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "num", children: formatMoney(falta, m.moneda) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full mt-4", onClick: () => addProgress(m), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
          " Sumar ahorro"
        ] })
      ] }, m.id);
    }) })
  ] });
}
function NewMeta({
  userId,
  defaultCurrency,
  onCreated
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    meta: "",
    moneda: defaultCurrency,
    objetivo: "",
    ahorrado: "0",
    fecha_objetivo: ""
  });
  async function save() {
    if (!userId) return;
    if (!form.meta || !form.objetivo) {
      toast.error("Faltan campos");
      return;
    }
    let objetivo;
    let ahorrado;
    try {
      objetivo = parsePositiveNumberInput(form.objetivo, "Objetivo");
      ahorrado = parseOptionalNumberInput(form.ahorrado, 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa los numeros");
      return;
    }
    const {
      error
    } = await supabase.from("metas").insert({
      user_id: userId,
      meta: form.meta,
      moneda: form.moneda,
      objetivo,
      ahorrado,
      fecha_objetivo: form.fecha_objetivo || null
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Meta creada");
    setOpen(false);
    setForm({
      meta: "",
      moneda: defaultCurrency,
      objetivo: "",
      ahorrado: "0",
      fecha_objetivo: ""
    });
    onCreated();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
      "Nueva meta"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nueva meta de ahorro" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.meta, onChange: (e) => setForm({
            ...form,
            meta: e.target.value
          }), placeholder: "Viaje, Auto, Casa..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moneda" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.moneda, onValueChange: (v) => setForm({
              ...form,
              moneda: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ARS", children: "ARS" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "USD", children: "USD" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Objetivo *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.objetivo, onChange: (e) => setForm({
              ...form,
              objetivo: e.target.value
            }), placeholder: "Ej: 1000000" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ya ahorrado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.ahorrado, onChange: (e) => setForm({
              ...form,
              ahorrado: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha objetivo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fecha_objetivo, onChange: (e) => setForm({
              ...form,
              fecha_objetivo: e.target.value
            }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Crear meta" }) })
    ] })
  ] });
}
export {
  Metas as component
};
