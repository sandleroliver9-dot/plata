import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { Plus, Building2, Home } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatMoney, resolveTC } from "@/lib/finance";
import { getDolares } from "@/lib/quotes.functions";
import { parseOptionalNumberInput, parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/inmuebles")({
  head: () => ({ meta: [{ title: "Inmuebles · Platium" }] }),
  component: Inmuebles,
});

type I = {
  id: string; propiedad: string; tipo: string | null; pais: string | null; ciudad: string | null;
  moneda: string; valor_estimado: number; deuda_asociada: number; alquilado: boolean; renta_mensual: number | null;
};

const TIPOS = ["Casa", "Departamento", "PH", "Terreno", "Local", "Oficina", "Cochera", "Otro"];

function Inmuebles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchDolares = useServerFn(getDolares);

  const { data: list } = useQuery({
    queryKey: ["inmuebles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("inmuebles").select("*").eq("activo", true).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as I[];
    },
  });

  const { data: dolar } = useQuery({
    queryKey: ["dolares"],
    queryFn: () => fetchDolares(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { tc, isFallback: tcIsFallback } = resolveTC(dolar);

  // Cada inmueble puede estar cargado en USD o ARS: convertimos todo a USD
  // (moneda de referencia del portafolio inmobiliario) antes de sumar, para
  // no mezclar unidades distintas en un mismo total.
  const toUSD = (monto: number, moneda: string) => (moneda === "ARS" ? monto / tc : monto);

  const totals = useMemo(() => {
    const arr = list ?? [];
    const valor = arr.reduce((s, i) => s + toUSD(Number(i.valor_estimado || 0), i.moneda), 0);
    const deuda = arr.reduce((s, i) => s + toUSD(Number(i.deuda_asociada || 0), i.moneda), 0);
    const renta = arr.filter(i => i.alquilado).reduce((s, i) => s + toUSD(Number(i.renta_mensual || 0), i.moneda), 0);
    return { valor, deuda, renta, neto: valor - deuda };
  }, [list, tc]);

  async function del(id: string) {
    const { error } = await supabase.from("inmuebles").update({ activo: false }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["inmuebles"] });
    toast.success("Eliminado");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inmuebles</h1>
          <p className="text-muted-foreground text-sm">Cargá cualquier propiedad que tengas: donde vivís, una que alquiles, una casa de fin de semana. Todas suman a tu patrimonio, no hace falta que generen renta.</p>
          {tcIsFallback && (
            <p className="text-xs text-warning mt-1">
              No se pudo obtener la cotización del dólar del día: los totales en USD usan un tipo de cambio de referencia y pueden no ser exactos.
            </p>
          )}
        </div>
        <NewI userId={user?.id} onCreated={() => qc.invalidateQueries({ queryKey: ["inmuebles"] })} />
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Valor total</div><div className="num text-2xl font-bold mt-2">{formatMoney(totals.valor, "USD")}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Deuda</div><div className="num text-2xl font-bold mt-2 text-destructive">{formatMoney(totals.deuda, "USD")}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Equity</div><div className="num text-2xl font-bold mt-2 text-success">{formatMoney(totals.neto, "USD")}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Renta mensual</div><div className="num text-2xl font-bold mt-2">{formatMoney(totals.renta, "USD")}</div></Card>
      </div>

      {(list ?? []).length === 0 ? (
        <Card className="p-10 text-center">
          <Building2 className="size-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Todavía no cargaste ninguna propiedad</p>
          <p className="text-sm text-muted-foreground mt-1">No tiene que ser una inversión: tu casa, un depto, lo que tengas — todo cuenta para tu patrimonio.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(list ?? []).map((i) => (
            <Card key={i.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold flex items-center gap-2"><Home className="size-4 text-primary" />{i.propiedad}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[i.tipo, i.ciudad, i.pais].filter(Boolean).join(" · ") || "Sin datos"}
                  </p>
                </div>
                <ConfirmDeleteButton
                  size="sm"
                  title="¿Eliminar este inmueble?"
                  description={`${i.propiedad} se va a borrar de tu portafolio.`}
                  onConfirm={() => del(i.id)}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Valor</span><span className="num font-medium">{formatMoney(Number(i.valor_estimado), i.moneda)}</span></div>
                {Number(i.deuda_asociada) > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Deuda</span><span className="num text-destructive">{formatMoney(Number(i.deuda_asociada), i.moneda)}</span></div>
                )}
                <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Equity</span><span className="num font-semibold text-success">{formatMoney(Number(i.valor_estimado) - Number(i.deuda_asociada), i.moneda)}</span></div>
                {i.alquilado && (
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="secondary">Alquilado</Badge>
                    <span className="num text-sm">{formatMoney(Number(i.renta_mensual || 0), i.moneda)}/mes</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NewI({ userId, onCreated }: { userId?: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    propiedad: "", tipo: "Departamento", pais: "Argentina", ciudad: "",
    moneda: "USD", valor_estimado: "", deuda_asociada: "0",
    alquilado: false, renta_mensual: "0",
  });

  async function save() {
    if (!userId || !form.propiedad || !form.valor_estimado) { toast.error("Faltan campos"); return; }
    let valorEstimado: number;
    let deudaAsociada: number;
    let rentaMensual: number;
    try {
      valorEstimado = parsePositiveNumberInput(form.valor_estimado, "Valor estimado");
      deudaAsociada = parseOptionalNumberInput(form.deuda_asociada, 0);
      rentaMensual = form.alquilado ? parseOptionalNumberInput(form.renta_mensual, 0) : 0;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa los numeros");
      return;
    }
    const { error } = await supabase.from("inmuebles").insert({
      user_id: userId,
      propiedad: form.propiedad,
      tipo: form.tipo,
      pais: form.pais || null,
      ciudad: form.ciudad || null,
      moneda: form.moneda,
      valor_estimado: valorEstimado,
      deuda_asociada: deudaAsociada,
      alquilado: form.alquilado,
      renta_mensual: rentaMensual,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Inmueble agregado");
    setOpen(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="size-4 mr-2" />Nuevo</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nuevo inmueble</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Propiedad *</Label><Input value={form.propiedad} onChange={(e) => setForm({ ...form, propiedad: e.target.value })} placeholder="Depto Palermo, Casa Tigre..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Moneda</Label>
              <Select value={form.moneda} onValueChange={(v) => setForm({ ...form, moneda: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="ARS">ARS</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>País</Label><Input value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} /></div>
            <div><Label>Ciudad</Label><Input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Valor estimado *</Label><DecimalInput value={form.valor_estimado} onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })} placeholder="Ej: 120000" /></div>
            <div><Label>Deuda asociada</Label><DecimalInput value={form.deuda_asociada} onChange={(e) => setForm({ ...form, deuda_asociada: e.target.value })} /></div>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <Label htmlFor="alq">¿Está alquilado?</Label>
            <Switch id="alq" checked={form.alquilado} onCheckedChange={(v) => setForm({ ...form, alquilado: v })} />
          </div>
          {form.alquilado && (
            <div><Label>Renta mensual</Label><DecimalInput value={form.renta_mensual} onChange={(e) => setForm({ ...form, renta_mensual: e.target.value })} /></div>
          )}
        </div>
        <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
