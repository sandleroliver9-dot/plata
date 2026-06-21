import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { t as todayISO, f as formatMoney, c as currentFinancialMonth, a as financialMonth } from "./finance-Ea2ALQRw.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { D as DecimalInput, I as IntegerInput, b as parsePositiveNumberInput, p as parseIntegerInput } from "./number-input-CrLHP9OF.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-VpbuoPd_.mjs";
import { P as Plus, m as CircleCheck, l as Trash2 } from "../_libs/lucide-react.mjs";
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
const TARJETA_OPTIONS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Naranja",
  "Naranja X",
  "Cabal",
  "Diners Club",
  "Argencard",
  "Cencosud",
  "Carrefour",
  "Nativa",
  "Patagonia 365",
  "Galicia Visa",
  "Galicia Mastercard",
  "Macro Visa",
  "Macro Mastercard",
  "Santander Visa",
  "Santander Mastercard",
  "BBVA Visa",
  "BBVA Mastercard",
  "BNA+",
  "Mercado Crédito",
  "Otra"
];
function TarjetaCombo({
  value,
  onChange,
  placeholder = "Elegí o escribí..."
}) {
  const id = reactExports.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        list: id,
        value,
        maxLength: 50,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        autoComplete: "off"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id, children: TARJETA_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o }, o)) })
  ] });
}
function nextMonthISO(date) {
  const d = /* @__PURE__ */ new Date(`${date}T00:00:00`);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
}
function TarjetasPage() {
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
    tarjeta: "",
    compra: "",
    valor_cuota: "",
    cuotas_totales: "1",
    cuota_actual: "1",
    inicio: todayISO()
  });
  const {
    data: items
  } = useQuery({
    queryKey: ["tarjetas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("tarjetas_cuotas").select("*").eq("activo", true).order("inicio", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      if (!form.tarjeta.trim() || !form.compra.trim()) throw new Error("Faltan datos");
      const valor = parsePositiveNumberInput(form.valor_cuota, "Valor de cuota");
      const totales = parseIntegerInput(form.cuotas_totales, "Cuotas totales");
      const actual = parseIntegerInput(form.cuota_actual, "Cuota actual");
      if (totales < 1) throw new Error("Cuotas totales invalidas");
      if (actual < 1 || actual > totales) throw new Error("La cuota actual tiene que estar entre 1 y el total");
      const tarjeta = form.tarjeta.trim().slice(0, 50);
      const compra = form.compra.trim().slice(0, 100);
      const primeraCuotaFecha = nextMonthISO(form.inicio);
      const {
        data: cuota,
        error
      } = await supabase.from("tarjetas_cuotas").insert({
        user_id: user.id,
        tarjeta,
        compra,
        valor_cuota: valor,
        cuotas_totales: totales,
        cuota_actual: actual,
        inicio: primeraCuotaFecha
      }).select("id").single();
      if (error) throw error;
      const mes = financialMonth(/* @__PURE__ */ new Date(`${primeraCuotaFecha}T00:00:00`), payDay);
      const {
        error: e2
      } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: "Gasto",
        descripcion: `${compra} (cuota ${actual}/${totales})`,
        monto: valor,
        fecha: primeraCuotaFecha,
        mes_financiero: mes,
        categoria: "Tarjeta",
        medio: "Crédito",
        tarjeta,
        es_cuota: true,
        cuota_origen_id: cuota?.id ?? null
      });
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Compra agregada");
      qc.invalidateQueries({
        queryKey: ["tarjetas"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
      setOpen(false);
      setForm({
        tarjeta: "",
        compra: "",
        valor_cuota: "",
        cuotas_totales: "1",
        cuota_actual: "1",
        inicio: todayISO()
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async (id) => {
      await supabase.from("tarjetas_cuotas").update({
        activo: false
      }).eq("id", id);
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({
        queryKey: ["tarjetas"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
      qc.invalidateQueries({
        queryKey: ["vencimientos-auto"]
      });
    }
  });
  const pagar = useMutation({
    mutationFn: async (tarjeta) => {
      if (!user) throw new Error();
      const pendientes = (items ?? []).filter((i) => i.tarjeta === tarjeta && i.cuota_actual <= i.cuotas_totales);
      const total = pendientes.reduce((s, i) => s + Number(i.valor_cuota), 0);
      if (total <= 0) throw new Error("Sin cuotas pendientes");
      const fecha = todayISO();
      const mes = currentFinancialMonth(payDay);
      const proximoMes = nextMonthISO(fecha);
      const {
        error: e1
      } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: "Gasto",
        descripcion: `Pago tarjeta ${tarjeta}`,
        monto: total,
        fecha,
        mes_financiero: mes,
        categoria: "Tarjeta",
        medio: "Crédito",
        tarjeta,
        es_cuota: true
      });
      if (e1) throw e1;
      for (const c of pendientes) {
        const next = c.cuota_actual + 1;
        await supabase.from("tarjetas_cuotas").update({
          cuota_actual: next,
          activo: next <= c.cuotas_totales,
          inicio: proximoMes
        }).eq("id", c.id);
      }
    },
    onSuccess: (_d, tarjeta) => {
      toast.success(`Pago de ${tarjeta} registrado`);
      qc.invalidateQueries({
        queryKey: ["tarjetas"]
      });
      qc.invalidateQueries({
        queryKey: ["movimientos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
      qc.invalidateQueries({
        queryKey: ["vencimientos-auto"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const grupos = /* @__PURE__ */ new Map();
  (items ?? []).forEach((i) => {
    const arr = grupos.get(i.tarjeta) ?? [];
    arr.push(i);
    grupos.set(i.tarjeta, arr);
  });
  const totalMes = (items ?? []).filter((i) => i.cuota_actual <= i.cuotas_totales).reduce((s, i) => s + Number(i.valor_cuota), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Tarjetas y cuotas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Resumen y cuotas activas." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
        "Nueva compra"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Cuotas activas este mes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num text-3xl font-bold mt-1", children: formatMoney(totalMes, currency) })
    ] }),
    grupos.size === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-muted-foreground", children: "Sin compras en cuotas cargadas." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: Array.from(grupos.entries()).map(([tarjeta, lista]) => {
      const totalTarjeta = lista.filter((i) => i.cuota_actual <= i.cuotas_totales).reduce((s, i) => s + Number(i.valor_cuota), 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: tarjeta }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Próximo pago: ",
              formatMoney(totalTarjeta, currency)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => pagar.mutate(tarjeta), disabled: pagar.isPending || totalTarjeta <= 0, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 mr-2" }),
            "Registrar pago"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: lista.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: i.compra }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Cuota ",
              i.cuota_actual,
              "/",
              i.cuotas_totales,
              i.cuota_actual > i.cuotas_totales && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-2 text-xs", children: "Pagada" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "num font-semibold", children: formatMoney(Number(i.valor_cuota), currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive", onClick: () => del.mutate(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] }, i.id)) })
      ] }, tarjeta);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nueva compra en cuotas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Se descontará una cuota cada mes hasta completarse." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tarjeta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TarjetaCombo, { value: form.tarjeta, onChange: (v) => setForm({
              ...form,
              tarjeta: v
            }), placeholder: "Visa, Mastercard..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inicio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.inicio, onChange: (e) => setForm({
              ...form,
              inicio: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Compra" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.compra, maxLength: 100, onChange: (e) => setForm({
            ...form,
            compra: e.target.value
          }), placeholder: "Heladera, viaje..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valor cuota" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.valor_cuota, onChange: (e) => setForm({
              ...form,
              valor_cuota: e.target.value
            }), placeholder: "Ej: 12500,50" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuota actual" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: form.cuota_actual, onChange: (e) => setForm({
              ...form,
              cuota_actual: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuotas totales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: form.cuotas_totales, onChange: (e) => setForm({
              ...form,
              cuotas_totales: e.target.value
            }) })
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
  TarjetasPage as component
};
