import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as ConceptCombo } from "./concept-combo-B5drMKEx.mjs";
import { a as useQuery, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { c as categoriasQuery, a as categoryNamesFor } from "./categories-D2fchIjA.mjs";
import { f as formatMoney } from "./finance-Ea2ALQRw.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { D as DecimalInput, b as parsePositiveNumberInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-VpbuoPd_.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { P as Plus, l as Trash2 } from "../_libs/lucide-react.mjs";
import "./input-C0QjszdI.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
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
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
function GastosFijosPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const {
    data: cats
  } = useQuery(categoriasQuery(user?.id));
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    gasto: "",
    monto_mensual: "",
    categoria: "",
    medio: ""
  });
  const {
    data: items
  } = useQuery({
    queryKey: ["gastos-fijos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("gastos_fijos").select("*").eq("activo", true).order("monto_mensual", {
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
      } = await supabase.from("tarjetas_cuotas").select("*").eq("activo", true);
      if (error) throw error;
      return data ?? [];
    }
  });
  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      if (!form.gasto.trim()) throw new Error("Falta nombre");
      const monto = parsePositiveNumberInput(form.monto_mensual, "Monto mensual");
      const {
        error
      } = await supabase.from("gastos_fijos").insert({
        user_id: user.id,
        gasto: form.gasto.trim().slice(0, 100),
        monto_mensual: monto,
        categoria: form.categoria || null,
        medio: form.medio || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Gasto fijo agregado");
      qc.invalidateQueries({
        queryKey: ["gastos-fijos"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
      setOpen(false);
      setForm({
        gasto: "",
        monto_mensual: "",
        categoria: "",
        medio: ""
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async (id) => {
      await supabase.from("gastos_fijos").update({
        activo: false
      }).eq("id", id);
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({
        queryKey: ["gastos-fijos"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
    }
  });
  const totalFijos = (items ?? []).reduce((s, i) => s + Number(i.monto_mensual), 0);
  const totalCuotas = (cuotasActivas ?? []).filter((c) => c.cuota_actual <= c.cuotas_totales).reduce((s, c) => s + Number(c.valor_cuota), 0);
  const total = totalFijos + totalCuotas;
  const categoryOptions = categoryNamesFor(cats, "Gasto");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Gastos fijos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Servicios, alquiler y todo lo recurrente." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
        "Nuevo"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Total mensual" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-3xl font-bold mt-1", children: formatMoney(total, currency) }),
      totalCuotas > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
        "Incluye ",
        formatMoney(totalCuotas, currency),
        " de cuotas de tarjeta activas"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: !items?.length && !cuotasActivas?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-muted-foreground", children: "Sin gastos fijos cargados." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border", children: [
      (items ?? []).map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: i.gasto }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            i.categoria ?? "Sin categoría",
            i.medio ? ` · ${i.medio}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num font-semibold", children: formatMoney(Number(i.monto_mensual), currency) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive", onClick: () => del.mutate(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
      ] }, i.id)),
      (cuotasActivas ?? []).filter((c) => c.cuota_actual <= c.cuotas_totales).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: c.compra }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Tarjeta · ",
            c.tarjeta,
            " · cuota ",
            c.cuota_actual,
            "/",
            c.cuotas_totales
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num font-semibold", children: formatMoney(Number(c.valor_cuota), currency) })
      ] }, `cuota-${c.id}`))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nuevo gasto fijo" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gasto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ConceptCombo, { kind: "GastoFijo", value: form.gasto, onChange: (v) => setForm({
            ...form,
            gasto: v
          }), placeholder: "Alquiler, Netflix..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto mensual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.monto_mensual, onChange: (e) => setForm({
            ...form,
            monto_mensual: e.target.value
          }), placeholder: "Ej: 35000" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Categoría" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.categoria, onValueChange: (v) => setForm({
              ...form,
              categoria: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sin categoría" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categoryOptions.map((nombre) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: nombre, children: nombre }, nombre)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.medio, onValueChange: (v) => setForm({
              ...form,
              medio: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Débito", children: "Débito" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Crédito", children: "Crédito" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Transferencia", children: "Transferencia" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Efectivo", children: "Efectivo" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => add.mutate(), disabled: add.isPending, children: "Guardar" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  GastosFijosPage as component
};
