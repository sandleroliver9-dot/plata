import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { c as currentFinancialMonth, l as listFinancialMonths, t as todayISO, f as formatMoney, a as financialMonth } from "./finance-Ea2ALQRw.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { D as DecimalInput, b as parsePositiveNumberInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-VpbuoPd_.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { C as ConceptCombo } from "./concept-combo-B5drMKEx.mjs";
import { P as Plus, l as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
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
function IngresosPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const [mes, setMes] = reactExports.useState(currentFinancialMonth(payDay));
  const meses = listFinancialMonths(payDay, 12, 1);
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    concepto: "",
    monto: "",
    fecha_cobro: todayISO(),
    tipo: "Sueldo"
  });
  const {
    data: items
  } = useQuery({
    queryKey: ["ingresos", user?.id, mes],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("ingresos").select("*").eq("activo", true).eq("mes_financiero", mes).order("fecha_cobro", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      if (!form.concepto.trim()) throw new Error("Falta concepto");
      const monto = parsePositiveNumberInput(form.monto, "Monto");
      const mesIngreso = financialMonth(new Date(form.fecha_cobro), payDay);
      const {
        error
      } = await supabase.from("ingresos").insert({
        user_id: user.id,
        concepto: form.concepto.trim().slice(0, 100),
        monto,
        fecha_cobro: form.fecha_cobro,
        mes_financiero: mesIngreso,
        tipo: form.tipo
      });
      if (error) throw error;
      await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: "Ingreso",
        descripcion: form.concepto.trim().slice(0, 100),
        monto,
        fecha: form.fecha_cobro,
        mes_financiero: mesIngreso,
        categoria: form.tipo === "Sueldo" ? "Sueldo" : "Extra"
      });
    },
    onSuccess: () => {
      toast.success("Ingreso registrado");
      qc.invalidateQueries({
        queryKey: ["ingresos"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
      setOpen(false);
      setForm({
        concepto: "",
        monto: "",
        fecha_cobro: todayISO(),
        tipo: "Sueldo"
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async (item) => {
      await supabase.from("ingresos").update({
        activo: false
      }).eq("id", item.id);
      if (!user) return;
      const {
        data: mov
      } = await supabase.from("movimientos").select("id").eq("user_id", user.id).eq("tipo", "Ingreso").eq("descripcion", item.concepto).eq("monto", item.monto).eq("fecha", item.fecha_cobro).eq("activo", true).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle();
      if (mov?.id) {
        await supabase.from("movimientos").update({
          activo: false
        }).eq("id", mov.id);
      }
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({
        queryKey: ["ingresos"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
    }
  });
  const total = (items ?? []).reduce((s, i) => s + Number(i.monto), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Ingresos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Sueldos, freelance, extras y bonos." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mes, onValueChange: setMes, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: meses.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
          "Nuevo"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: [
        "Total ",
        mes
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-3xl font-bold mt-1 text-success", children: formatMoney(total, currency) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: !items?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 text-center text-muted-foreground", children: [
      "Sin ingresos en ",
      mes,
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: i.concepto }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-2 mt-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: i.fecha_cobro }),
          i.tipo && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: i.tipo })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num font-semibold text-success", children: formatMoney(Number(i.monto), currency) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive", onClick: () => del.mutate({
        id: i.id,
        concepto: i.concepto,
        monto: Number(i.monto),
        fecha_cobro: i.fecha_cobro
      }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
    ] }, i.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nuevo ingreso" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "También se registra como movimiento en el resumen." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Concepto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ConceptCombo, { kind: "Ingreso", value: form.concepto, onChange: (v) => setForm({
            ...form,
            concepto: v
          }), placeholder: "Sueldo, bono, freelance..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.monto, onChange: (e) => setForm({
              ...form,
              monto: e.target.value
            }), placeholder: "Ej: 500000" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha de cobro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fecha_cobro, onChange: (e) => setForm({
              ...form,
              fecha_cobro: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tipo, onValueChange: (v) => setForm({
            ...form,
            tipo: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Sueldo", children: "Sueldo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Bono", children: "Bono" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Aguinaldo", children: "Aguinaldo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Extra", children: "Extra" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Otro", children: "Otro" })
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
  IngresosPage as component
};
