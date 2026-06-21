import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { W as Wallet } from "../_libs/lucide-react.mjs";
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
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [checkingSession, setCheckingSession] = reactExports.useState(true);
  const [sessionValid, setSessionValid] = reactExports.useState(false);
  const [errorMessage, setErrorMessage] = reactExports.useState(null);
  const linkLooksLikeRecovery = reactExports.useMemo(() => {
    if (typeof window === "undefined") return false;
    const hash = window.location.hash.toLowerCase();
    return hash.includes("type=recovery") || hash.includes("access_token=");
  }, []);
  reactExports.useEffect(() => {
    let mounted = true;
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionValid(Boolean(session));
        setCheckingSession(false);
        if (!session) {
          setErrorMessage("El enlace es inválido o expiró. Pedí uno nuevo desde login.");
        }
      }
    });
    supabase.auth.getSession().then(({
      data,
      error
    }) => {
      if (!mounted) return;
      if (error) {
        setErrorMessage(error.message);
        setCheckingSession(false);
        return;
      }
      if (data.session) {
        setSessionValid(true);
        setCheckingSession(false);
        return;
      }
      setSessionValid(false);
      setCheckingSession(false);
      if (linkLooksLikeRecovery) {
        setErrorMessage("El enlace de recuperación es inválido o expiró. Pedí uno nuevo.");
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [linkLooksLikeRecovery]);
  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Contraseña actualizada. Ya podés iniciar sesión.");
    navigate({
      to: "/auth",
      replace: true
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10", style: {
      background: "radial-gradient(ellipse at top, oklch(0.30 0.18 280 / 0.35), transparent 60%)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-2xl grid place-items-center mb-4", style: {
          background: "var(--gradient-primary)",
          boxShadow: "var(--shadow-glow)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-7 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Restablecer contraseña" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Definí una nueva contraseña para tu cuenta" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 bg-card border-border", style: {
        boxShadow: "var(--shadow-card)"
      }, children: checkingSession ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Validando enlace de recuperación..." }) : !sessionValid ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-center text-destructive", children: errorMessage ?? "No hay una sesión de recuperación válida." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => navigate({
          to: "/auth",
          replace: true
        }), children: "Volver a login" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleUpdatePassword, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-new", children: "Nueva contraseña" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pw-new", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 8, autoComplete: "new-password" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-confirm", children: "Repetir contraseña" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pw-confirm", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, minLength: 8, autoComplete: "new-password" })
        ] }),
        errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errorMessage }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Actualizando..." : "Guardar nueva contraseña" })
      ] }) })
    ] })
  ] });
}
export {
  ResetPasswordPage as component
};
