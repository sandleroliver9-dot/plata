import { TarjetaCombo } from "@/components/app/tarjeta-combo";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2 } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney, currentFinancialMonth, financialMonth, todayISO } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DecimalInput, IntegerInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { parseIntegerInput, parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/tarjetas")({
  head: () => ({ meta: [{ title: "Tarjetas y cuotas · Plata" }] }),
  component: TarjetasPage,
});

function nextMonthISO(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
}

function TarjetasPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tarjeta: "", compra: "", valor_cuota: "", cuotas_totales: "1", cuota_actual: "1", inicio: todayISO() });

  const { data: items } = useQuery({
    queryKey: ["tarjetas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("tarjetas_cuotas").select("*").eq("activo", true).order("inicio", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
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
      // El pago con tarjeta se refleja al mes siguiente de la compra
      const primeraCuotaFecha = nextMonthISO(form.inicio);
      const { data: cuota, error } = await supabase.from("tarjetas_cuotas").insert({
        user_id: user.id,
        tarjeta,
        compra,
        valor_cuota: valor,
        cuotas_totales: totales,
        cuota_actual: actual,
        inicio: primeraCuotaFecha,
      }).select("id").single();
      if (error) throw error;
      const mes = financialMonth(new Date(`${primeraCuotaFecha}T00:00:00`), payDay);
      const { error: e2 } = await supabase.from("movimientos").insert({
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
        cuota_origen_id: cuota?.id ?? null,
      });
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Compra agregada");
      qc.invalidateQueries({ queryKey: ["tarjetas"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setForm({ tarjeta: "", compra: "", valor_cuota: "", cuotas_totales: "1", cuota_actual: "1", inicio: todayISO() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tarjetas_cuotas").update({ activo: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({ queryKey: ["tarjetas"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["vencimientos-auto"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Pago de tarjeta: agrupa por tarjeta, suma cuotas pendientes, crea movimiento gasto y avanza cuota_actual
  const pagar = useMutation({
    mutationFn: async (tarjeta: string) => {
      if (!user) throw new Error();
      const pendientes = (items ?? []).filter(i => i.tarjeta === tarjeta && i.cuota_actual <= i.cuotas_totales);
      const total = pendientes.reduce((s, i) => s + Number(i.valor_cuota), 0);
      if (total <= 0) throw new Error("Sin cuotas pendientes");
      const fecha = todayISO();
      const mes = currentFinancialMonth(payDay);
      const proximoMes = nextMonthISO(fecha);
      const { error: e1 } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: "Gasto",
        descripcion: `Pago tarjeta ${tarjeta}`,
        monto: total,
        fecha,
        mes_financiero: mes,
        categoria: "Tarjeta",
        medio: "Crédito",
        tarjeta,
        es_cuota: true,
      });
      if (e1) throw e1;
      for (const c of pendientes) {
        const next = c.cuota_actual + 1;
        const { error: e3 } = await supabase.from("tarjetas_cuotas").update({
          cuota_actual: next,
          activo: next <= c.cuotas_totales,
          inicio: proximoMes,
        }).eq("id", c.id);
        // Si una cuota falla a mitad de camino, el movimiento "Pago tarjeta"
        // ya se insertó (cobrando el total) pero no todas las cuotas
        // avanzaron. Cortar acá evita que el usuario crea que el pago quedó
        // registrado bien cuando en realidad falló a la mitad.
        if (e3) throw e3;
      }
    },
    onSuccess: (_d, tarjeta) => {
      toast.success(`Pago de ${tarjeta} registrado`);
      qc.invalidateQueries({ queryKey: ["tarjetas"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["vencimientos-auto"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Agrupar por tarjeta
  const grupos = new Map<string, typeof items>();
  (items ?? []).forEach(i => {
    const arr = grupos.get(i.tarjeta) ?? [];
    arr.push(i);
    grupos.set(i.tarjeta, arr as any);
  });

  const totalMes = (items ?? []).filter(i => i.cuota_actual <= i.cuotas_totales).reduce((s, i) => s + Number(i.valor_cuota), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarjetas y cuotas</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen y cuotas activas.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2" />Nueva compra</Button>
      </header>

      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Cuotas activas este mes</div>
        <div className="num text-3xl font-bold mt-1">{formatMoney(totalMes, currency)}</div>
      </Card>

      {grupos.size === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Sin compras en cuotas cargadas.</Card>
      ) : (
        <div className="space-y-4">
          {Array.from(grupos.entries()).map(([tarjeta, lista]) => {
            const totalTarjeta = (lista as any[]).filter(i => i.cuota_actual <= i.cuotas_totales).reduce((s, i) => s + Number(i.valor_cuota), 0);
            return (
              <Card key={tarjeta}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <div className="font-semibold">{tarjeta}</div>
                    <div className="text-xs text-muted-foreground">Próximo pago: {formatMoney(totalTarjeta, currency)}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => pagar.mutate(tarjeta)} disabled={pagar.isPending || totalTarjeta <= 0}>
                    <CheckCircle2 className="size-4 mr-2" />Registrar pago
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {(lista as any[]).map(i => (
                    <div key={i.id} className="flex items-center gap-3 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{i.compra}</div>
                        <div className="text-xs text-muted-foreground">
                          Cuota {i.cuota_actual}/{i.cuotas_totales}
                          {i.cuota_actual > i.cuotas_totales && <Badge variant="secondary" className="ml-2 text-xs">Pagada</Badge>}
                        </div>
                      </div>
                      <div className="num font-semibold">{formatMoney(Number(i.valor_cuota), currency)}</div>
                      <ConfirmDeleteButton
                        title="¿Eliminar esta compra en cuotas?"
                        description={`${i.compra} (cuota ${i.cuota_actual}/${i.cuotas_totales}) se va a borrar.`}
                        onConfirm={() => del.mutate(i.id)}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva compra en cuotas</DialogTitle>
            <DialogDescription>Se descontará una cuota cada mes hasta completarse.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tarjeta</Label><TarjetaCombo value={form.tarjeta} onChange={(v) => setForm({ ...form, tarjeta: v })} placeholder="Visa, Mastercard..." /></div>
              <div><Label>Inicio</Label><Input type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} /></div>
            </div>
            <div><Label>Compra</Label><Input value={form.compra} maxLength={100} onChange={(e) => setForm({ ...form, compra: e.target.value })} placeholder="Heladera, viaje..." /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Valor cuota</Label><DecimalInput value={form.valor_cuota} onChange={(e) => setForm({ ...form, valor_cuota: e.target.value })} placeholder="Ej: 12500,50" /></div>
              <div><Label>Cuota actual</Label><IntegerInput value={form.cuota_actual} onChange={(e) => setForm({ ...form, cuota_actual: e.target.value })} /></div>
              <div><Label>Cuotas totales</Label><IntegerInput value={form.cuotas_totales} onChange={(e) => setForm({ ...form, cuotas_totales: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => add.mutate()} disabled={add.isPending}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
