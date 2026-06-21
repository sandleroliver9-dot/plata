import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { O as Outlet, e as useRouterState, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { R as Root, T as Trigger, P as Portal, C as Content, a as Close, b as Title, O as Overlay, D as Description } from "../_libs/radix-ui__react-dialog.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { a as VisuallyHidden } from "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./use-auth-Bus89o6f.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-VpbuoPd_.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beb9ZPEo.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { u as useProfile } from "./use-profile-BAbU3GwQ.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { I as IntegerInput, D as DecimalInput, p as parseIntegerInput, a as parseOptionalNumberInput } from "./number-input-CrLHP9OF.mjs";
import { P as Progress } from "./progress-BRG1z6ZI.mjs";
import { L as LogOut, M as Menu, a as MessageCircle, S as Sparkles, D as DollarSign, C as Calendar, W as Wallet, b as Check, c as LayoutDashboard, A as ArrowLeftRight, d as CreditCard, B as Building2, e as ChartLine, T as Target, f as Bell, g as Lightbulb, h as CalendarDays, i as Settings, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/radix-ui__react-progress.mjs";
const Sheet = Root;
const SheetTrigger = Trigger;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
function SubTabs({ tabs }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-1 bg-muted/30 rounded-lg overflow-x-auto -mx-1", children: tabs.map((t) => {
    const active = pathname === t.to;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: t.to,
        className: cn(
          "px-4 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
          active ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
        ),
        children: t.label
      },
      t.to
    );
  }) });
}
const FLUJO_TABS = [
  { to: "/movimientos", label: "Movimientos" },
  { to: "/ingresos", label: "Ingresos" },
  { to: "/gastos-fijos", label: "Gastos fijos" }
];
const CREDITO_TABS = [
  { to: "/tarjetas", label: "Tarjetas y cuotas" },
  { to: "/prestamo", label: "Préstamos" }
];
const navGroups = [
  { items: [{ to: "/dashboard", label: "Resumen", icon: LayoutDashboard }] },
  {
    label: "Día a día",
    items: [
      { to: "/movimientos", label: "Flujo de caja", icon: ArrowLeftRight, match: ["/movimientos", "/ingresos", "/gastos-fijos"] },
      { to: "/tarjetas", label: "Crédito y cuotas", icon: CreditCard, match: ["/tarjetas", "/prestamo"] }
    ]
  },
  {
    label: "Patrimonio",
    items: [
      { to: "/inmuebles", label: "Inmuebles", icon: Building2 },
      { to: "/inversiones", label: "Inversiones", icon: ChartLine },
      { to: "/proyecciones", label: "Proyecciones", icon: Sparkles },
      { to: "/metas", label: "Metas", icon: Target }
    ]
  },
  {
    label: "Control",
    items: [
      { to: "/alertas", label: "Alertas", icon: Bell },
      { to: "/insights", label: "Insights", icon: Lightbulb },
      { to: "/calendario-financiero", label: "Calendario", icon: CalendarDays }
    ]
  },
  { items: [{ to: "/configuracion", label: "Configuración", icon: Settings }] }
];
function AppShell({ children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const NavList = ({ onNavigate }) => /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto p-3 space-y-4", children: navGroups.map((group, gi) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    group.label && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40", children: group.label }),
    group.items.map((item) => {
      const matches = item.match ?? [item.to];
      const active = matches.some((m) => pathname === m || pathname.startsWith(m + "/"));
      const Icon = item.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: item.to,
          onClick: onNavigate,
          className: cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }),
            item.label
          ]
        },
        item.to
      );
    })
  ] }, gi)) });
  const Brand = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-16 flex items-center gap-3 px-5 border-b border-sidebar-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl grid place-items-center", style: { background: "var(--gradient-primary)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5 text-primary-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight text-lg", children: "Plata" })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex w-full bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Brand, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavList, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-t border-sidebar-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "w-full justify-start text-sidebar-foreground/70", onClick: signOut, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4 mr-2" }),
        "Cerrar sesión"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 min-w-0 overflow-x-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden h-14 flex items-center justify-between px-4 border-b border-border bg-sidebar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: mobileOpen, onOpenChange: setMobileOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", "aria-label": "Abrir menú", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "left", className: "p-0 w-72 bg-sidebar border-sidebar-border flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(VisuallyHidden, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Menú" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Brand, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(NavList, { onNavigate: () => setMobileOpen(false) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-t border-sidebar-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "w-full justify-start text-sidebar-foreground/70", onClick: signOut, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4 mr-2" }),
                " Cerrar sesión"
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 rounded-lg", style: { background: "var(--gradient-primary)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Plata" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: signOut, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-8 max-w-7xl mx-auto space-y-4", children: [
        FLUJO_TABS.some((t) => t.to === pathname) && /* @__PURE__ */ jsxRuntimeExports.jsx(SubTabs, { tabs: FLUJO_TABS }),
        CREDITO_TABS.some((t) => t.to === pathname) && /* @__PURE__ */ jsxRuntimeExports.jsx(SubTabs, { tabs: CREDITO_TABS }),
        children
      ] })
    ] })
  ] });
}
function FeedbackWidget() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = reactExports.useState(false);
  const [tipo, setTipo] = reactExports.useState("sugerencia");
  const [severidad, setSeveridad] = reactExports.useState("media");
  const [mensaje, setMensaje] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  async function submit() {
    if (!user || !mensaje.trim()) return;
    if (mensaje.length > 2e3) {
      toast.error("Máximo 2000 caracteres");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      tipo,
      severidad,
      mensaje: mensaje.trim(),
      pagina: pathname
    });
    setSubmitting(false);
    if (error) {
      toast.error("No pude enviar tu feedback");
      return;
    }
    toast.success("¡Gracias! Tu feedback se envió.");
    setMensaje("");
    setOpen(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        onClick: () => setOpen(true),
        size: "sm",
        className: "fixed bottom-4 right-4 z-40 shadow-lg rounded-full h-12 w-12 p-0 md:h-auto md:w-auto md:px-4 md:py-2",
        style: { background: "var(--gradient-primary)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-5 md:mr-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: "Feedback" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enviar feedback" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Contanos qué encontraste, qué te gustaría o qué falla." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipo, onValueChange: setTipo, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bug", children: "🐞 Bug" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sugerencia", children: "💡 Sugerencia" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "otro", children: "💬 Otro" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Severidad" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: severidad, onValueChange: setSeveridad, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "baja", children: "Baja" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "media", children: "Media" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alta", children: "Alta" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mensaje" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: mensaje,
              onChange: (e) => setMensaje(e.target.value),
              rows: 5,
              maxLength: 2e3,
              placeholder: "Describí lo más claro posible..."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            mensaje.length,
            "/2000 · Página: ",
            pathname
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: submitting || !mensaje.trim(), children: submitting ? "Enviando..." : "Enviar" })
        ] })
      ] })
    ] }) })
  ] });
}
function OnboardingWizard() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [step, setStep] = reactExports.useState(0);
  const [form, setForm] = reactExports.useState({ display_name: "", currency: "ARS", pay_day: "1", salary: "" });
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_done) {
      setForm({
        display_name: profile.display_name ?? "",
        currency: profile.currency ?? "ARS",
        pay_day: String(profile.pay_day ?? 1),
        salary: String(profile.salary ?? "")
      });
      setOpen(true);
    }
  }, [isLoading, profile]);
  async function finish() {
    if (!user) return;
    let payDay;
    let salary;
    try {
      payDay = parseIntegerInput(form.pay_day, "Dia de cobro", 1);
      salary = parseOptionalNumberInput(form.salary, 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa los numeros");
      return;
    }
    if (payDay < 1 || payDay > 31) {
      toast.error("El dia de cobro tiene que estar entre 1 y 31");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name || null,
      currency: form.currency,
      pay_day: payDay,
      salary,
      onboarding_done: true
    }).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["profile"] });
    setOpen(false);
    toast.success("¡Listo! Bienvenido a Plata 🎉");
  }
  const steps = [
    {
      icon: Sparkles,
      title: "Hola 👋",
      desc: "Vamos a configurar tu cuenta en 30 segundos.",
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "¿Cómo te llamamos?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.display_name, onChange: (e) => setForm({ ...form, display_name: e.target.value }), placeholder: "Tu nombre", autoFocus: true })
      ] })
    },
    {
      icon: DollarSign,
      title: "Tu moneda",
      desc: "Vas a poder cargar gastos en otras monedas también.",
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moneda principal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.currency, onValueChange: (v) => setForm({ ...form, currency: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ARS", children: "🇦🇷 ARS — Peso argentino" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "USD", children: "🇺🇸 USD — Dólar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "EUR", children: "🇪🇺 EUR — Euro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "UYU", children: "🇺🇾 UYU — Peso uruguayo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "MXN", children: "🇲🇽 MXN — Peso mexicano" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "BRL", children: "🇧🇷 BRL — Real" })
          ] })
        ] })
      ] })
    },
    {
      icon: Calendar,
      title: "Tu día de cobro",
      desc: "Lo usamos para calcular tu 'mes financiero' (no calendario). Ej: cobrás el 5 → el mes financiero va del 5 al 4.",
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Día del mes que cobrás" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IntegerInput, { value: form.pay_day, onChange: (e) => setForm({ ...form, pay_day: e.target.value }) })
      ] })
    },
    {
      icon: Wallet,
      title: "Tu sueldo (opcional)",
      desc: "Lo precargamos como ingreso recurrente. Podés cambiarlo cuando quieras.",
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Sueldo mensual (",
          form.currency,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DecimalInput, { value: form.salary, onChange: (e) => setForm({ ...form, salary: e.target.value }), placeholder: "Dejalo vacío si preferís" })
      ] })
    }
  ];
  const cur = steps[step];
  const Icon = cur.icon;
  const pct = (step + 1) / steps.length * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: () => {
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", onPointerDownOutside: (e) => e.preventDefault(), onEscapeKeyDown: (e) => e.preventDefault(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-xl grid place-items-center mb-3", style: { background: "var(--gradient-primary)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-6 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: cur.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: cur.desc })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4", children: cur.body }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: pct, className: "h-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground text-center", children: [
      "Paso ",
      step + 1,
      " de ",
      steps.length
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4", children: [
      step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setStep(step - 1), children: "Atrás" }),
      step < steps.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "flex-1", onClick: () => setStep(step + 1), children: "Siguiente" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1", onClick: finish, disabled: saving, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 mr-2" }),
        " Listo, empezar"
      ] })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(FeedbackWidget, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(OnboardingWizard, {})
] });
export {
  SplitComponent as component
};
