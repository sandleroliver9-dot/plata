import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TerminosContent, PrivacidadContent } from "@/components/app/legal-content";
import { toast } from "sonner";
import { passwordIssue, PASSWORD_RULES } from "@/lib/password";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Ingresar · Platium" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalOpen, setLegalOpen] = useState<"terminos" | "privacidad" | null>(null);

  const pwChecks = PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(password) }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("plata_preview_mode");
    window.localStorage.removeItem("plata_preview_store_v2");
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" && s) navigate({ to: "/dashboard", replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const issue = passwordIssue(password);
    if (issue) {
      toast.error(issue);
      return;
    }
    if (!acceptedTerms) {
      toast.error("Tenés que aceptar los Términos y Condiciones y la Política de Privacidad para crear la cuenta.");
      return;
    }
    setFormLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
    });
    setFormLoading(false);
    if (error) {
      const weakPassword = error.message.toLowerCase().includes("weak") || error.message.toLowerCase().includes("password");
      return toast.error(weakPassword ? "Usá una contraseña más fuerte, por ejemplo Platium2026!" : error.message);
    }
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    toast.info("Cuenta creada. Supabase está pidiendo confirmar el email antes de entrar.");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setFormLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        return toast.error("Ese usuario existe, pero Supabase todavía pide confirmar el email.");
      }
      return toast.error(error.message);
    }
    if (data.session) navigate({ to: "/dashboard", replace: true });
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      toast.error("Ingresá tu email para enviarte el link de recuperación");
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
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
    if (tab === "signup" && !acceptedTerms) {
      toast.error("Tenés que aceptar los Términos y Condiciones y la Política de Privacidad para crear la cuenta.");
      return;
    }
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
    // En éxito, signInWithOAuth redirige el navegador a Google: no hace falta
    // apagar el loading, la página se va a ir de acá.
  }

  // Apple exige (guideline 4.8) ofrecer "Sign in with Apple" con la misma
  // prominencia que cualquier otro login social de terceros — por eso este
  // botón es un calco del de Google, no una alternativa secundaria. Requiere
  // el provider "apple" habilitado en Supabase Auth (Service ID + private
  // key de Apple Developer), configuración pendiente del lado de Oliver.
  async function handleApple() {
    if (appleLoading) return;
    if (tab === "signup" && !acceptedTerms) {
      toast.error("Tenés que aceptar los Términos y Condiciones y la Política de Privacidad para crear la cuenta.");
      return;
    }
    setAppleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast.error(error.message);
      setAppleLoading(false);
    }
  }

  const inputClass = "h-[45px] rounded-[11px] border-0 bg-[#d9d9d9] px-4 text-[13px] text-[#111] placeholder:text-[#70706a] focus-visible:ring-2 focus-visible:ring-[#20376b] font-plus-jakarta";
  const labelClass = "text-[13px] font-normal text-[#111] font-plus-jakarta";
  const providerButtonClass = "w-full h-[45px] rounded-[11px] bg-[#20376b] text-[13px] font-normal text-white shadow-none hover:bg-[#20376b]/90 font-plus-jakarta";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 text-[#111]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/brand/platium-logo.png" alt="Platium" className="h-[107px] w-auto" />
          <p className="text-[16px] text-[#20376b] mt-1 font-plus-jakarta">Tu copiloto financiero</p>
        </div>

        <div className="border border-[#20376b] rounded-[23px] bg-white p-[30px]">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full h-8 bg-[#d9d9d9] rounded-[11px] p-0.5 mb-6">
              <TabsTrigger
                value="signin"
                className="rounded-[9px] text-[13px] font-plus-jakarta data-[state=active]:bg-[#20376b] data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:text-[#8e8e88]"
              >
                Ingresar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-[9px] text-[13px] font-plus-jakarta data-[state=active]:bg-[#20376b] data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:text-[#8e8e88]"
              >
                Crear cuenta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in" className={labelClass}>Email</Label>
                  <Input id="email-in" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-in" className={labelClass}>Contraseña</Label>
                  <PasswordInput id="pw-in" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className={inputClass} />
                </div>
                <Button type="submit" className="w-full h-[34px] rounded-[11px] bg-[#c7dbf1] text-[13px] font-normal text-[#111] shadow-none hover:bg-[#c7dbf1]/80 font-plus-jakarta" disabled={formLoading}>Ingresar</Button>
                <button type="button" onClick={handleForgotPassword} disabled={resetLoading} className="w-full text-center text-[13px] text-[#111] font-plus-jakarta hover:underline">
                  {resetLoading ? "Enviando..." : "Olvidé mi contraseña"}
                </button>
                {resetEmailSent && (
                  <p className="text-xs text-center text-[#70706a] font-plus-jakarta">
                    Revisá tu email. Te enviamos un link para cambiar la contraseña.
                  </p>
                )}
                <div className="space-y-2 pt-2">
                  <Button type="button" className={providerButtonClass} onClick={handleGoogle} disabled={googleLoading}>
                    <svg viewBox="0 0 24 24" className="size-4 mr-2"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    {googleLoading ? "Abriendo Google..." : "Continuar con Google"}
                  </Button>
                  <Button type="button" className={providerButtonClass} onClick={handleApple} disabled={appleLoading}>
                    <svg viewBox="0 0 24 24" className="size-4 mr-2" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.119 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.02-2.717c.837-1.013 1.4-2.428 1.245-3.831-1.207.052-2.662.805-3.532 1.817-.78.897-1.464 2.338-1.284 3.714 1.337.104 2.714-.68 3.571-1.7z"/></svg>
                    {appleLoading ? "Abriendo Apple..." : "Continuar con Apple"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-up" className={labelClass}>Nombre</Label>
                  <Input id="name-up" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up" className={labelClass}>Email</Label>
                  <Input id="email-up" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-up" className={labelClass}>Contraseña</Label>
                  <PasswordInput id="pw-up" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" className={inputClass} />
                  {password ? (
                    <ul className="text-xs space-y-0.5 mt-1 font-plus-jakarta">
                      {pwChecks.map((c) => (
                        <li key={c.label} className={`flex items-center gap-1.5 ${c.ok ? "text-success" : "text-[#70706a]"}`}>
                          {c.ok ? <Check className="size-3" /> : <X className="size-3" />}
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#70706a] font-plus-jakarta">Usá 8+ caracteres con mayúscula, número y símbolo. Ej: Platium2026!</p>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="accept-terms"
                    checked={acceptedTerms}
                    onCheckedChange={(v) => setAcceptedTerms(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="accept-terms" className="text-xs font-normal text-[#70706a] leading-relaxed cursor-pointer font-plus-jakarta">
                    Acepto los{" "}
                    <button type="button" onClick={() => setLegalOpen("terminos")} className="text-[#20376b] hover:underline">Términos y Condiciones</button>{" "}
                    y la{" "}
                    <button type="button" onClick={() => setLegalOpen("privacidad")} className="text-[#20376b] hover:underline">Política de Privacidad</button>.
                  </Label>
                </div>
                <Button type="submit" className="w-full h-[34px] rounded-[11px] bg-[#c7dbf1] text-[13px] font-normal text-[#111] shadow-none hover:bg-[#c7dbf1]/80 font-plus-jakarta" disabled={formLoading || !acceptedTerms}>Crear cuenta</Button>
                <div className="space-y-2 pt-2">
                  <Button type="button" className={providerButtonClass} onClick={handleGoogle} disabled={googleLoading || !acceptedTerms}>
                    <svg viewBox="0 0 24 24" className="size-4 mr-2"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    {googleLoading ? "Abriendo Google..." : "Continuar con Google"}
                  </Button>
                  <Button type="button" className={providerButtonClass} onClick={handleApple} disabled={appleLoading || !acceptedTerms}>
                    <svg viewBox="0 0 24 24" className="size-4 mr-2" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.119 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.02-2.717c.837-1.013 1.4-2.428 1.245-3.831-1.207.052-2.662.805-3.532 1.817-.78.897-1.464 2.338-1.284 3.714 1.337.104 2.714-.68 3.571-1.7z"/></svg>
                    {appleLoading ? "Abriendo Apple..." : "Continuar con Apple"}
                  </Button>
                  {!acceptedTerms && (
                    <p className="text-xs text-center text-[#70706a] font-plus-jakarta">
                      Tildá el checkbox de arriba para poder continuar.
                    </p>
                  )}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={legalOpen !== null} onOpenChange={(open) => !open && setLegalOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{legalOpen === "terminos" ? "Términos y Condiciones" : "Política de Privacidad"}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 -mr-2">
            {legalOpen === "terminos" ? <TerminosContent /> : <PrivacidadContent />}
          </div>
          <Button type="button" className="w-full" onClick={() => setLegalOpen(null)}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
