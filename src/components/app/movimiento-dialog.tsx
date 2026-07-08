import { ConceptCombo } from "@/components/app/concept-combo";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { categoriasQuery } from "@/lib/queries";
import { financialMonth, todayISO } from "@/lib/finance";
import { parseISODate } from "@/lib/financial-centers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryNamesFor } from "@/lib/categories";
import { parsePositiveNumberInput } from "@/lib/number-input";

export function MovimientoDialog({ open, onOpenChange, defaults }: { open: boolean; onOpenChange: (o: boolean) => void; defaults?: Partial<Form> }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const { data: cats } = useQuery(categoriasQuery(user?.id));

  const [form, setForm] = useState<Form>(initial());
  useEffect(() => {
    if (open) setForm({ ...initial(), ...defaults });
  }, [open]); // eslint-disable-line

  const categoryOptions = categoryNamesFor(cats, form.tipo === "Ingreso" ? "Ingreso" : "Gasto");

  const mut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("no user");
      if (!form.descripcion.trim()) throw new Error("Falta descripción");
      const monto = parsePositiveNumberInput(form.monto, "Monto");
      const fecha = form.fecha || todayISO();
      // new Date(fecha) parsea "YYYY-MM-DD" como UTC medianoche: en Argentina
      // (UTC-3) corria el mes financiero un dia para atras. Mismo bug que ya
      // se arreglo en ingresos.tsx.
      const mes_financiero = financialMonth(parseISODate(fecha) ?? new Date(fecha), profile?.pay_day ?? 1);
      const { error } = await supabase.from("movimientos").insert({
        user_id: user.id,
        tipo: form.tipo,
        descripcion: form.descripcion.trim().slice(0, 200),
        monto,
        fecha,
        mes_financiero,
        categoria: form.categoria || null,
        medio: form.medio || null,
        notas: form.notas.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Movimiento agregado");
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo movimiento</DialogTitle>
          <DialogDescription>Registrá un ingreso o gasto rápido.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Tabs value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v, categoria: "" })}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="Gasto">Gasto</TabsTrigger>
              <TabsTrigger value="Ingreso">Ingreso</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Monto</Label>
              <DecimalInput value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="Ej: 12500,50" />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Descripción</Label>
            <ConceptCombo kind={form.tipo === "Ingreso" ? "Ingreso" : "Gasto"} value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} maxLength={200} placeholder="Super, Uber, sueldo..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoría</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((nombre) => <SelectItem key={nombre} value={nombre}>{nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Medio</Label>
              <Select value={form.medio} onValueChange={(v) => setForm({ ...form, medio: v })}>
                <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Débito">Débito</SelectItem>
                  <SelectItem value="Crédito">Crédito</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="MercadoPago">MercadoPago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notas (opcional)</Label>
            <Textarea rows={2} maxLength={500} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Guardando..." : "Guardar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type Form = { tipo: string; monto: string; fecha: string; descripcion: string; categoria: string; medio: string; notas: string };
const initial = (): Form => ({ tipo: "Gasto", monto: "", fecha: todayISO(), descripcion: "", categoria: "", medio: "", notas: "" });
