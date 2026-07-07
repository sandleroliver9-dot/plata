import { ConceptCombo } from "@/components/app/concept-combo";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { categoriasQuery } from "@/lib/queries";
import { formatMoney } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryNamesFor } from "@/lib/categories";
import { parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/gastos-fijos")({
  head: () => ({ meta: [{ title: "Gastos fijos · Plata" }] }),
  component: GastosFijosPage,
});

function GastosFijosPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: cats } = useQuery(categoriasQuery(user?.id));
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ gasto: "", monto_mensual: "", categoria: "", medio: "" });

  const { data: items } = useQuery({
    queryKey: ["gastos-fijos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("gastos_fijos").select("*").eq("activo", true).order("monto_mensual", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cuotasActivas } = useQuery({
    queryKey: ["tarjetas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("tarjetas_cuotas").select("*").eq("activo", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      if (!form.gasto.trim()) throw new Error("Falta nombre");
      const monto = parsePositiveNumberInput(form.monto_mensual, "Monto mensual");
      const { error } = await supabase.from("gastos_fijos").insert({
        user_id: user.id,
        gasto: form.gasto.trim().slice(0, 100),
        monto_mensual: monto,
        categoria: form.categoria || null,
        medio: form.medio || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Gasto fijo agregado");
      qc.invalidateQueries({ queryKey: ["gastos-fijos"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setForm({ gasto: "", monto_mensual: "", categoria: "", medio: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gastos_fijos").update({ activo: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({ queryKey: ["gastos-fijos"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalFijos = (items ?? []).reduce((s, i) => s + Number(i.monto_mensual), 0);
  const totalCuotas = (cuotasActivas ?? []).filter(c => c.cuota_actual <= c.cuotas_totales).reduce((s, c) => s + Number(c.valor_cuota), 0);
  const total = totalFijos + totalCuotas;
  const categoryOptions = categoryNamesFor(cats, "Gasto");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos fijos</h1>
          <p className="text-sm text-muted-foreground mt-1">Servicios, alquiler y todo lo recurrente.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2" />Nuevo</Button>
      </header>

      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Total mensual</div>
        <div className="num text-3xl font-bold mt-1">{formatMoney(total, currency)}</div>
        {totalCuotas > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            Incluye {formatMoney(totalCuotas, currency)} de cuotas de tarjeta activas
          </div>
        )}
      </Card>

      <Card>
        {!items?.length && !cuotasActivas?.length ? (
          <div className="p-10 text-center text-muted-foreground">Sin gastos fijos cargados.</div>
        ) : (
          <div className="divide-y divide-border">
            {(items ?? []).map(i => (
              <div key={i.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{i.gasto}</div>
                  <div className="text-xs text-muted-foreground">{i.categoria ?? "Sin categoría"}{i.medio ? ` · ${i.medio}` : ""}</div>
                </div>
                <div className="num font-semibold">{formatMoney(Number(i.monto_mensual), currency)}</div>
                <ConfirmDeleteButton
                  title="¿Eliminar este gasto fijo?"
                  description={`${i.gasto} (${formatMoney(Number(i.monto_mensual), currency)}/mes) se va a borrar.`}
                  onConfirm={() => del.mutate(i.id)}
                />
              </div>
            ))}
            {(cuotasActivas ?? []).filter(c => c.cuota_actual <= c.cuotas_totales).map(c => (
              <div key={`cuota-${c.id}`} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.compra}</div>
                  <div className="text-xs text-muted-foreground">Tarjeta · {c.tarjeta} · cuota {c.cuota_actual}/{c.cuotas_totales}</div>
                </div>
                <div className="num font-semibold">{formatMoney(Number(c.valor_cuota), currency)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo gasto fijo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Gasto</Label><ConceptCombo kind="GastoFijo" value={form.gasto} onChange={(v) => setForm({ ...form, gasto: v })} placeholder="Alquiler, Netflix..." /></div>
            <div><Label>Monto mensual</Label><DecimalInput value={form.monto_mensual} onChange={(e) => setForm({ ...form, monto_mensual: e.target.value })} placeholder="Ej: 35000" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
                  <SelectContent>{categoryOptions.map((nombre) => <SelectItem key={nombre} value={nombre}>{nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Medio</Label>
                <Select value={form.medio} onValueChange={(v) => setForm({ ...form, medio: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
