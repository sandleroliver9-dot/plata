import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { passwordIssue } from "@/lib/password";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Restablecer contraseña · Plata" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const linkLooksLikeRecovery = useMemo(() => {
    if (typeof window === "undefined") return false;
    const hash = window.location.hash.toLowerCase();
    // Supabase puede mandar el link de recuperación con el token en el hash
    // (flujo implícito) o con `?code=` en la query (flujo PKCE, el que usan
    // los proyectos nuevos). Solo revisar el hash mostraba "enlace inválido"
    // en un link de PKCE válido que todavía no había terminado de procesarse.
    const search = window.location.search.toLowerCase();
    return hash.includes("type=recovery") || hash.includes("access_token=") || search.includes("code=");
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionValid(Boolean(session));
        setCheckingSession(false);
        if (!session) {
          setErrorMessage("El enlace es inválido o expiró. Pedí uno nuevo desde login.");
        } else {
          // getSession() (mas arriba) puede resolver ANTES de que Supabase
          // termine de procesar el intercambio de codigo PKCE en la URL, y en
          // ese caso marcaba error. Si despues este evento confirma una
          // sesion valida, hay que limpiar ese error viejo: sin esto quedaba
          // un "el enlace es invalido" pegado arriba del formulario que en
          // realidad si funcionaba.
          setErrorMessage(null);
        }
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setErrorMessage(error.message);
        setCheckingSession(false);
        return;
      }
      if (data.session) {
        setSessionValid(true);
        setCheckingSession(false);
        setErrorMessage(null);
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

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    const issue = passwordIssue(password);
    if (issue) {
      toast.error(issue);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
      return;
    }

    toast.success("Contraseña actualizada. Ya podés iniciar sesión.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, oklch(0.30 0.18 280 / 0.35), transparent 60%)" }} />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="size-14 rounded-2xl grid place-items-center mb-4" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Wallet className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Restablecer contraseña</h1>
          <p className="text-sm text-muted-foreground mt-1">Definí una nueva contraseña para tu cuenta</p>
        </div>

        <Card className="p-6 bg-card border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          {checkingSession ? (
            <p className="text-sm text-muted-foreground text-center">Validando enlace de recuperación...</p>
          ) : !sessionValid ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-destructive">{errorMessage ?? "No hay una sesión de recuperación válida."}</p>
              <Button className="w-full" onClick={() => navigate({ to: "/auth", replace: true })}>
                Volver a login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pw-new">Nueva contraseña</Label>
                <PasswordInput
                  id="pw-new"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">Usá 8+ caracteres con mayúscula, número y símbolo. Ej: Plata2026!</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-confirm">Repetir contraseña</Label>
                <PasswordInput
                  id="pw-confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Actualizando..." : "Guardar nueva contraseña"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
