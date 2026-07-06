import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Wallet, Calendar, DollarSign, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput, IntegerInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { parseIntegerInput, parseOptionalNumberInput } from "@/lib/number-input";
import { updateFinancialProfile } from "@/lib/profile.functions";

export function OnboardingWizard() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const saveFinancialProfile = useServerFn(updateFinancialProfile);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ display_name: "", currency: "ARS", pay_day: "1", salary: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_done) {
      setForm({
        display_name: profile.display_name ?? "",
        currency: profile.currency ?? "ARS",
        pay_day: String(profile.pay_day ?? 1),
        salary: String(profile.salary ?? ""),
      });
      setOpen(true);
    }
  }, [isLoading, profile]);

  async function finish() {
    if (!user) return;
    let payDay: number;
    let salary: number;
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
      onboarding_done: true,
    }).eq("id", user.id);
    if (error) { setSaving(false); toast.error(error.message); return; }
    try {
      // Reutiliza la misma sincronización de Configuración: guarda pay_day/salary
      // y crea el ingreso "Sueldo" correspondiente, para que el Dashboard lo vea
      // desde el primer momento en vez de recién después de pasar por Configuración.
      await saveFinancialProfile({
        data: { payDay, salary, savingTarget: Number(profile?.saving_target ?? 20) },
      });
    } catch (e) {
      setSaving(false);
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el sueldo");
      return;
    }
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["profile"] });
    setOpen(false);
    toast.success("¡Listo! Bienvenido a Plata 🎉");
  }

  const steps = [
    {
      icon: Sparkles, title: "Hola 👋", desc: "Vamos a configurar tu cuenta en 30 segundos.",
      body: (
        <div className="space-y-2">
          <Label>¿Cómo te llamamos?</Label>
          <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Tu nombre" autoFocus />
        </div>
      ),
    },
    {
      icon: DollarSign, title: "Tu moneda", desc: "Vas a poder cargar gastos en otras monedas también.",
      body: (
        <div className="space-y-2">
          <Label>Moneda principal</Label>
          <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">🇦🇷 ARS — Peso argentino</SelectItem>
              <SelectItem value="USD">🇺🇸 USD — Dólar</SelectItem>
              <SelectItem value="EUR">🇪🇺 EUR — Euro</SelectItem>
              <SelectItem value="UYU">🇺🇾 UYU — Peso uruguayo</SelectItem>
              <SelectItem value="MXN">🇲🇽 MXN — Peso mexicano</SelectItem>
              <SelectItem value="BRL">🇧🇷 BRL — Real</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      icon: Calendar, title: "Tu día de cobro", desc: "Lo usamos para calcular tu 'mes financiero' (no calendario). Ej: cobrás el 5 → el mes financiero va del 5 al 4.",
      body: (
        <div className="space-y-2">
          <Label>Día del mes que cobrás</Label>
          <IntegerInput value={form.pay_day} onChange={(e) => setForm({ ...form, pay_day: e.target.value })} />
        </div>
      ),
    },
    {
      icon: Wallet, title: "Tu sueldo (opcional)", desc: "Lo precargamos como ingreso recurrente. Podés cambiarlo cuando quieras.",
      body: (
        <div className="space-y-2">
          <Label>Sueldo mensual ({form.currency})</Label>
          <DecimalInput value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Dejalo vacío si preferís" />
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const Icon = cur.icon;
  const pct = ((step + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={() => { /* no close on outside click */ }}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="size-12 rounded-xl grid place-items-center mb-3" style={{ background: "var(--gradient-primary)" }}>
            <Icon className="size-6 text-primary-foreground" />
          </div>
          <DialogTitle>{cur.title}</DialogTitle>
          <DialogDescription>{cur.desc}</DialogDescription>
        </DialogHeader>

        <div className="py-4">{cur.body}</div>

        <Progress value={pct} className="h-1" />
        <div className="text-xs text-muted-foreground text-center">Paso {step + 1} de {steps.length}</div>

        <div className="flex gap-2 mt-4">
          {step > 0 && <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>Atrás</Button>}
          {step < steps.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep(step + 1)}>Siguiente</Button>
          ) : (
            <Button className="flex-1" onClick={finish} disabled={saving}>
              <Check className="size-4 mr-2" /> Listo, empezar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
