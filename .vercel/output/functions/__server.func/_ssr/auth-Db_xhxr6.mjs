import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [formLoading, setFormLoading] = reactExports.useState(false);
  const [googleLoading, setGoogleLoading] = reactExports.useState(false);
  const [resetLoading, setResetLoading] = reactExports.useState(false);
  const [resetEmailSent, setResetEmailSent] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("plata_preview_mode");
    window.localStorage.removeItem("plata_preview_store_v2");
  }, []);
  reactExports.useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" && s) navigate({
        to: "/dashboard",
        replace: true
      });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  async function handleSignUp(e) {
    e.preventDefault();
    setFormLoading(true);
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: name
        }
      }
    });
    setFormLoading(false);
    if (error) {
      const weakPassword = error.message.toLowerCase().includes("weak") || error.message.toLowerCase().includes("password");
      return toast.error(weakPassword ? "Usá una contraseña más fuerte, por ejemplo Plata2026!" : error.message);
    }
    if (data.session) {
      navigate({
        to: "/dashboard",
        replace: true
      });
      return;
    }
    toast.info("Cuenta creada. Supabase está pidiendo confirmar el email antes de entrar.");
  }
  async function handleSignIn(e) {
    e.preventDefault();
    setFormLoading(true);
    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setFormLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        return toast.error("Ese usuario existe, pero Supabase todavía pide confirmar el email.");
      }
      return toast.error(error.message);
    }
    if (data.session) navigate({
      to: "/dashboard",
      replace: true
    });
  }
  async function handleForgotPassword() {
    if (!email.trim()) {
      toast.error("Ingresá tu email para enviarte el link de recuperación");
      return;
    }
    setResetLoading(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setResetLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setResetEmailSent(true);
    toast.success("Te enviamos un email para recuperar tu contraseña");
  }
  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const supabaseUrl = String("https://dpvakayfasbnlbadkkmj.supabase.co").replace(/^["']|["']$/g, "");
      if (!supabaseUrl) {
        toast.error("Falta configurar Supabase para iniciar sesión con Google");
        return;
      }
      const params = new URLSearchParams({
        provider: "google",
        redirect_to: `${window.location.origin}/dashboard`,
        prompt: "select_account"
      });
      window.location.assign(`${supabaseUrl}/auth/v1/authorize?${params.toString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión con Google");
    } finally {
      setGoogleLoading(false);
    }
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Plata" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Tu fintech personal" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 bg-card border-border", style: {
        boxShadow: "var(--shadow-card)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "signin", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-2 w-full mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signin", children: "Ingresar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signup", children: "Crear cuenta" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signin", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email-in", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email-in", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoComplete: "email" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-in", children: "Contraseña" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pw-in", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, autoComplete: "current-password" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: formLoading, children: "Ingresar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", className: "w-full", onClick: handleForgotPassword, disabled: resetLoading, children: resetLoading ? "Enviando..." : "Olvidé mi contraseña" }),
            resetEmailSent && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-muted-foreground", children: "Revisá tu email. Te enviamos un link para cambiar la contraseña." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signup", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignUp, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name-up", children: "Nombre" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name-up", value: name, onChange: (e) => setName(e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email-up", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email-up", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoComplete: "email" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-up", children: "Contraseña" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pw-up", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 8, autoComplete: "new-password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Usá 8+ caracteres con mayúscula, número y símbolo. Ej: Plata2026!" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: formLoading, children: "Crear cuenta" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full border-t border-border" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-card px-2 text-muted-foreground", children: "o" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: handleGoogle, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", className: "size-4 mr-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
          ] }),
          googleLoading ? "Abriendo Google..." : "Continuar con Google"
        ] })
      ] })
    ] })
  ] });
}
export {
  AuthPage as component
};
