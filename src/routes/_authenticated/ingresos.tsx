import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney, currentFinancialMonth, listFinancialMonths, financialMonth, todayISO } from "@/lib/finance";
import { parseISODate } from "@/lib/financial-centers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConceptCombo } from "@/components/app/concept-combo";
import { parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/ingresos")({
  head: () => ({ meta: [{ title: "Ingresos · Plata" }] }),
  component: IngresosPage,
});

function IngresosPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const [mes, setMes] = useState(currentFinancialMonth(payDay));
  const meses = listFinancialMonths(payDay, 12, 1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ concepto: "", monto: "", fecha_cobro: todayISO(), tipo: "Sueldo" });

  const { data: items } = useQuery({
    queryKey: ["ingresos", user?.id, mes],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingresos")
        .select("*")
        .eq("activo", true)
        .eq("mes_financiero", mes)
        .order("fecha_cobro", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      if (!form.concepto.trim()) throw new Error("Falta concepto");
      const monto = parsePositiveNumberInput(form.monto, "Monto");
      // parseISODate interpreta "YYYY-MM-DD" en hora local, no UTC: con
      // `new Date(string)` un ingreso cargado justo el dia de cobro podia
      // correrse un dia hacia atras en husos horarios negativos (Argentina).
      const mesIngreso = financialMonth(parseISODate(form.fecha_cobro) ?? new Date(form.fecha_cobro), payDay);
      const { data: ingreso, error } = await supabase
        .from("ingresos")
        .insert({
          user_id: user.id,
          concepto: form.concepto.trim().slice(0, 100),
          monto,
          fecha_cobro: form.fecha_cobro,
          mes_financiero: mesIngreso,
          tipo: form.tipo,
        })
        .select("id")
        .single();
      if (error) throw error;
      // También crea movimiento para que impacte en dashboard, vinculado por
      // ingreso_id (no por heurística de descripcion+monto+fecha) para poder
      // borrarlo con certeza si se borra el ingreso.
      const { error: movError } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: "Ingreso",
        descripcion: form.concepto.trim().slice(0, 100),
        monto,
        fecha: form.fecha_cobro,
        mes_financiero: mesIngreso,
        categoria: form.tipo === "Sueldo" ? "Sueldo" : "Extra",
        ingreso_id: ingreso.id,
      });
      if (movError) throw movError;
    },
    onSuccess: () => {
      toast.success("Ingreso registrado");
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setForm({ concepto: "", monto: "", fecha_cobro: todayISO(), tipo: "Sueldo" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (item: { id: string }) => {
      const { error } = await supabase.from("ingresos").update({ activo: false }).eq("id", item.id);
      if (error) throw error;
      // Vinculado por ingreso_id (FK real): ya no hace falta adivinar cual
      // movimiento es por descripcion+monto+fecha, lo que podia borrar el
      // movimiento equivocado si habia otro similar el mismo dia.
      const { error: movError } = await supabase.from("movimientos").update({ activo: false }).eq("ingreso_id", item.id);
      if (movError) throw movError;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const total = (items ?? []).reduce((s, i) => s + Number(i.monto), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ingresos</h1>
          <p className="text-sm text-muted-foreground mt-1">Sueldos, freelance, extras y bonos.</p>
        </div>
        <div className="flex gap-2">
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{meses.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2" />Nuevo</Button>
        </div>
      </header>

      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Total {mes}</div>
        <div className="num text-3xl font-bold mt-1 text-success">{formatMoney(total, currency)}</div>
      </Card>

      <Card>
        {!items?.length ? (
          <div className="p-10 text-center text-muted-foreground">Sin ingresos en {mes}.</div>
        ) : (
          <div className="divide-y divide-border">
            {items.map(i => (
              <div key={i.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{i.concepto}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{i.fecha_cobro}</span>
                    {i.tipo && <Badge variant="secondary" className="text-xs">{i.tipo}</Badge>}
                  </div>
                </div>
                <div className="num font-semibold text-success">{formatMoney(Number(i.monto), currency)}</div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => del.mutate({ id: i.id })}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo ingreso</DialogTitle>
            <DialogDescription>También se registra como movimiento en el resumen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Concepto</Label><ConceptCombo kind="Ingreso" value={form.concepto} onChange={(v) => setForm({ ...form, concepto: v })} placeholder="Sueldo, bono, freelance..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Monto</Label><DecimalInput value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="Ej: 500000" /></div>
              <div><Label>Fecha de cobro</Label><Input type="date" value={form.fecha_cobro} onChange={(e) => setForm({ ...form, fecha_cobro: e.target.value })} /></div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sueldo">Sueldo</SelectItem>
                  <SelectItem value="Bono">Bono</SelectItem>
                  <SelectItem value="Aguinaldo">Aguinaldo</SelectItem>
                  <SelectItem value="Extra">Extra</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
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
