import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { f as formatMoney, c as currentFinancialMonth, t as todayISO } from "./finance-Ea2ALQRw.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { D as DecimalInput, I as IntegerInput, p as parseIntegerInput, b as parsePositiveNumberInput, a as parseOptionalNumberInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { P as Progress } from "./progress-BRG1z6ZI.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-VpbuoPd_.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { P as Plus, m as CircleCheck, l as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
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
const TASA_TIPOS = [{
  value: "anual",
  label: "Anual (TNA)",
  short: "anual"
}, {
  value: "mensual",
  label: "Mensual (TEM)",
  short: "mensual"
}, {
  value: "efectiva_anual",
  label: "Efectiva anual (TEA)",
  short: "ef. anual"
}, {
  value: "cft",
  label: "CFT (Costo Financiero Total)",
  short: "CFT"
}, {
  value: "total",
  label: "Total del préstamo",
  short: "total"
}];
function PrestamoPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    descripcion: "",
    cuota_mensual: "",
    cuotas_totales: "12",
    cuotas_pagadas: "0",
    tasa: "",
    tasa_tipo: "anual",
    dia_pago: ""
  });
  const {
    data: items
  } = useQuery({
    queryKey: ["prestamos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("prestamos").select("*").eq("activo", true).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      if (!form.descripcion.trim()) throw new Error("Falta descripción");
      const totales = parseIntegerInput(form.cuotas_totales, "Cantidad de cuotas");
      if (totales <= 0) throw new Error("Cantidad de cuotas invalida");
      const cuota = parsePositiveNumberInput(form.cuota_mensual, "Cuota mensual");
      const pagadas = parseIntegerInput(form.cuotas_pagadas, "Cuotas pagadas", 0);
      if (pagadas < 0 || pagadas > totales) throw new Error("Cuotas pagadas invalidas");
      const dia = form.dia_pago ? parseIntegerInput(form.dia_pago, "Dia de pago") : null;
      if (dia !== null && (dia < 1 || dia > 31)) throw new Error("Dia de pago invalido");
      const {
        error
      } = await supabase.from("prestamos").insert({
        user_id: user.id,
        descripcion: form.descripcion.trim().slice(0, 100),
        cuota_mensual: cuota,
        cuotas_totales: totales,
        cuotas_pagadas: pagadas,
        tasa: form.tasa ? parseOptionalNumberInput(form.tasa, 0) : null,
        tasa_tipo: form.tasa_tipo,
        dia_pago: dia,
        inicio: todayISO()
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Préstamo agregado");
      qc.invalidateQueries({
        queryKey: ["prestamos"]
      });
      setOpen(false);
      setForm({
        descripcion: "",
        cuota_mensual: "",
        cuotas_totales: "12",
        cuotas_pagadas: "0",
        tasa: "",
        tasa_tipo: "anual",
        dia_pago: ""
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async (id) => {
      await supabase.from("prestamos").update({
        activo: false
      }).eq("id", id);
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({
        queryKey: ["prestamos"]
      });
    }
  });
  const pagarCuota = useMutation({
    mutationFn: async (p) => {
      if (!user) throw new Error();
      if (p.cuotas_pagadas >= p.cuotas_totales) throw new Error("Préstamo completo");
      const {
        error: e1
      } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: "Gasto",
        descripcion: `Cuota préstamo ${p.descripcion}`,
        monto: Number(p.cuota_mensual),
        fecha: todayISO(),
        mes_financiero: currentFinancialMonth(payDay),
        categoria: "Préstamo"
      });
      if (e1) throw e1;
      const next = p.cuotas_pagadas + 1;
      await supabase.from("prestamos").update({
        cuotas_pagadas: next,
        activo: next < p.cuotas_totales
      }).eq("id", p.id);
    },
    onSuccess: () => {
      toast.success("Cuota registrada");
      qc.invalidateQueries({
        queryKey: ["prestamos"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Préstamos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Llevá el control de cuotas y saldo restante." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
        "Nuevo"
      ] })
    ] }),
    !items?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-muted-foreground", children: "Sin préstamos activos." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: items.map((p) => {
      const pct = p.cuotas_totales > 0 ? p.cuotas_pagadas / p.cuotas_totales * 100 : 0;
      const restante = (p.cuotas_totales - p.cuotas_pagadas) * Number(p.cuota_mensual);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: p.descripcion }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              p.cuotas_pagadas,
              "/",
              p.cuotas_totales,
              " cuotas · ",
              formatMoney(Number(p.cuota_mensual), currency),
              "/mes",
              p.tasa ? ` · ${Number(p.tasa)}% ${TASA_TIPOS.find((t) => t.value === p.tasa_tipo)?.short ?? "anual"}` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => pagarCuota.mutate(p), disabled: pagarCuota.isPending, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 mr-1" }),
              "Pagar cuota"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => del.mutate(p.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: pct, className: "mt-4 h-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            pct.toFixed(0),
            "% pagado"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "num font-medium", children: [
            "Restante: ",
            formatMoney(restante, currency)
          ] })
        ] })
      ] }, p.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nuevo préstamo" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descripción" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.descripcion, maxLength: 100, onChange: (e) => setForm({
            ...form,
            descripcion: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuota mensual" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.cuota_mensual, onChange: (e) => setForm({
              ...form,
              cuota_mensual: e.target.value
            }), placeholder: "Ej: 45000" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tasa %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.tasa, onChange: (e) => setForm({
              ...form,
              tasa: e.target.value
            }), placeholder: "Ej: 12,5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo de tasa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tasa_tipo, onValueChange: (v) => setForm({
            ...form,
            tasa_tipo: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TASA_TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuotas totales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: form.cuotas_totales, onChange: (e) => setForm({
              ...form,
              cuotas_totales: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuotas pagadas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: form.cuotas_pagadas, onChange: (e) => setForm({
              ...form,
              cuotas_pagadas: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Día de pago mensual (opcional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { placeholder: "Ej: 10", value: form.dia_pago, onChange: (e) => setForm({
            ...form,
            dia_pago: e.target.value
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Se usa para mostrar la cuota en Vencimientos." })
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
  PrestamoPage as component
};
