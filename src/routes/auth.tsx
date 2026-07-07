import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { passwordIssue } from "@/lib/password";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Ingresar · Plata" }] }),
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
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

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
    setFormLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
    });
    setFormLoading(false);
    if (error) {
      const weakPassword = error.message.toLowerCase().includes("weak") || error.message.toLowerCase().includes("password");
      return toast.error(weakPassword ? "Usá una contraseña más fuerte, por ejemplo Plata2026!" : error.message);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, oklch(0.30 0.18 280 / 0.35), transparent 60%)" }} />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="size-14 rounded-2xl grid place-items-center mb-4" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Wallet className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Plata</h1>
          <p className="text-sm text-muted-foreground mt-1">Tu fintech personal</p>
        </div>

        <Card className="p-6 bg-card border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Ingresar</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">Email</Label>
                  <Input id="email-in" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-in">Contraseña</Label>
                  <Input id="pw-in" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>Ingresar</Button>
                <Button type="button" variant="ghost" className="w-full" onClick={handleForgotPassword} disabled={resetLoading}>
                  {resetLoading ? "Enviando..." : "Olvidé mi contraseña"}
                </Button>
                {resetEmailSent && (
                  <p className="text-xs text-center text-muted-foreground">
                    Revisá tu email. Te enviamos un link para cambiar la contraseña.
                  </p>
                )}
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-up">Nombre</Label>
                  <Input id="name-up" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">Email</Label>
                  <Input id="email-up" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-up">Contraseña</Label>
                  <Input id="pw-up" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                  <p className="text-xs text-muted-foreground">Usá 8+ caracteres con mayúscula, número y símbolo. Ej: Plata2026!</p>
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>Crear cuenta</Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
            <svg viewBox="0 0 24 24" className="size-4 mr-2"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {googleLoading ? "Abriendo Google..." : "Continuar con Google"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
