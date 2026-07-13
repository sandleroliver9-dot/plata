import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2 } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney, currentFinancialMonth, todayISO } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DecimalInput, IntegerInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseIntegerInput, parseOptionalNumberInput, parsePositiveNumberInput } from "@/lib/number-input";

const TASA_TIPOS: { value: string; label: string; short: string }[] = [
  { value: "anual", label: "Anual (TNA)", short: "anual" },
  { value: "mensual", label: "Mensual (TEM)", short: "mensual" },
  { value: "efectiva_anual", label: "Efectiva anual (TEA)", short: "ef. anual" },
  { value: "cft", label: "CFT (Costo Financiero Total)", short: "CFT" },
  { value: "total", label: "Total del préstamo", short: "total" },
];

export const Route = createFileRoute("/_authenticated/prestamo")({
  head: () => ({ meta: [{ title: "Préstamos · Platium" }] }),
  component: PrestamoPage,
});

function PrestamoPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ descripcion: "", cuota_mensual: "", cuotas_totales: "12", cuotas_pagadas: "0", tasa: "", tasa_tipo: "anual", dia_pago: "" });

  const { data: items } = useQuery({
    queryKey: ["prestamos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("prestamos").select("*").eq("activo", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
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
      const { error } = await supabase.from("prestamos").insert({
        user_id: user.id,
        descripcion: form.descripcion.trim().slice(0, 100),
        cuota_mensual: cuota,
        cuotas_totales: totales,
        cuotas_pagadas: pagadas,
        tasa: form.tasa ? parseOptionalNumberInput(form.tasa, 0) : null,
        tasa_tipo: form.tasa_tipo,
        dia_pago: dia,
        inicio: todayISO(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Préstamo agregado");
      qc.invalidateQueries({ queryKey: ["prestamos"] });
      // El préstamo participa en estimateNetWorth (dashboard) y en el
      // calendario de próximos vencimientos: sin invalidar estos, quedaban
      // desactualizados hasta el próximo refetch natural.
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["vencimientos-auto"] });
      setOpen(false);
      setForm({ descripcion: "", cuota_mensual: "", cuotas_totales: "12", cuotas_pagadas: "0", tasa: "", tasa_tipo: "anual", dia_pago: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prestamos").update({ activo: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({ queryKey: ["prestamos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["vencimientos-auto"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pagarCuota = useMutation({
    mutationFn: async (p: any) => {
      if (!user) throw new Error();
      if (p.cuotas_pagadas >= p.cuotas_totales) throw new Error("Préstamo completo");
      const { error: e1 } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: "Gasto",
        descripcion: `Cuota préstamo ${p.descripcion}`,
        monto: Number(p.cuota_mensual),
        fecha: todayISO(),
        mes_financiero: currentFinancialMonth(payDay),
        categoria: "Préstamo",
        es_cuota: true,
        cuota_origen_id: p.id,
      });
      if (e1) throw e1;
      const next = p.cuotas_pagadas + 1;
      const { error: e2 } = await supabase.from("prestamos").update({
        cuotas_pagadas: next,
        activo: next < p.cuotas_totales,
      }).eq("id", p.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Cuota registrada");
      qc.invalidateQueries({ queryKey: ["prestamos"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["vencimientos-auto"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
          <p className="text-sm text-muted-foreground mt-1">Llevá el control de cuotas y saldo restante.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2" />Nuevo</Button>
      </header>

      {!items?.length ? (
        <Card className="p-10 text-center text-muted-foreground">Sin préstamos activos.</Card>
      ) : (
        <div className="space-y-4">
          {items.map(p => {
            const pct = p.cuotas_totales > 0 ? (p.cuotas_pagadas / p.cuotas_totales) * 100 : 0;
            const restante = (p.cuotas_totales - p.cuotas_pagadas) * Number(p.cuota_mensual);
            return (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold">{p.descripcion}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.cuotas_pagadas}/{p.cuotas_totales} cuotas · {formatMoney(Number(p.cuota_mensual), currency)}/mes
                      {p.tasa ? ` · ${Number(p.tasa)}% ${TASA_TIPOS.find(t => t.value === (p as any).tasa_tipo)?.short ?? "anual"}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => pagarCuota.mutate(p)} disabled={pagarCuota.isPending}>
                      <CheckCircle2 className="size-4 mr-1" />Pagar cuota
                    </Button>
                    <ConfirmDeleteButton
                      title="¿Eliminar este préstamo?"
                      description={`${p.descripcion} se va a borrar.`}
                      onConfirm={() => del.mutate(p.id)}
                    />
                  </div>
                </div>
                <Progress value={pct} className="mt-4 h-2" />
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-muted-foreground">{pct.toFixed(0)}% pagado</span>
                  <span className="num font-medium">Restante: {formatMoney(restante, currency)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo préstamo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descripción</Label><Input value={form.descripcion} maxLength={100} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cuota mensual</Label><DecimalInput value={form.cuota_mensual} onChange={(e) => setForm({ ...form, cuota_mensual: e.target.value })} placeholder="Ej: 45000" /></div>
              <div><Label>Tasa %</Label><DecimalInput value={form.tasa} onChange={(e) => setForm({ ...form, tasa: e.target.value })} placeholder="Ej: 12,5" /></div>
            </div>
            <div>
              <Label>Tipo de tasa</Label>
              <Select value={form.tasa_tipo} onValueChange={(v) => setForm({ ...form, tasa_tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASA_TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cuotas totales</Label><IntegerInput value={form.cuotas_totales} onChange={(e) => setForm({ ...form, cuotas_totales: e.target.value })} /></div>
              <div><Label>Cuotas pagadas</Label><IntegerInput value={form.cuotas_pagadas} onChange={(e) => setForm({ ...form, cuotas_pagadas: e.target.value })} /></div>
            </div>
            <div>
              <Label>Día de pago mensual (opcional)</Label>
              <IntegerInput placeholder="Ej: 10" value={form.dia_pago} onChange={(e) => setForm({ ...form, dia_pago: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Se usa para mostrar la cuota en Vencimientos.</p>
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
