import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Target, Plus as PlusIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { toast } from "sonner";
import { formatMoney } from "@/lib/finance";
import { parseISODate } from "@/lib/financial-centers";
import { parseOptionalNumberInput, parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({ meta: [{ title: "Metas · Plata" }] }),
  component: Metas,
});

type Meta = { id: string; meta: string; moneda: string; objetivo: number; ahorrado: number; fecha_objetivo: string | null };

function Metas() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const defaultCurrency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [progressPending, setProgressPending] = useState<string | null>(null);

  const { data: metas } = useQuery({
    queryKey: ["metas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("metas").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Meta[];
    },
  });

  async function addProgress(m: Meta, monto: number) {
    // El incremento se calcula en el cliente (ahorrado + monto), no es un
    // update atomico en la base: dos envios rapidos seguidos (doble click)
    // partirian del mismo `m.ahorrado` y el segundo pisaria al primero en
    // vez de sumarse. Bloquear el boton mientras la meta tiene un guardado
    // en curso evita el caso mas comun (no cubre ediciones simultaneas desde
    // dos dispositivos distintos).
    if (progressPending) return;
    setProgressPending(m.id);
    try {
      const { error } = await supabase.from("metas").update({ ahorrado: Number(m.ahorrado) + monto }).eq("id", m.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Progreso actualizado");
      await qc.invalidateQueries({ queryKey: ["metas"] });
    } finally {
      setProgressPending(null);
    }
  }

  async function del(id: string) {
    const { error } = await supabase.from("metas").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["metas"] });
    toast.success("Eliminada");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de ahorro</h1>
          <p className="text-muted-foreground text-sm">Definí objetivos y seguí tu progreso.</p>
        </div>
        <NewMeta userId={user?.id} defaultCurrency={defaultCurrency} onCreated={() => qc.invalidateQueries({ queryKey: ["metas"] })} />
      </header>

      {(metas ?? []).length === 0 ? (
        <Card className="p-10 text-center">
          <Target className="size-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aún no tenés metas. Creá la primera para empezar.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(metas ?? []).map((m) => {
            const objetivo = Number(m.objetivo);
            const pct = objetivo > 0 ? Math.min(100, (Number(m.ahorrado) / objetivo) * 100) : 0;
            const falta = Math.max(0, objetivo - Number(m.ahorrado));
            // parseISODate interpreta "YYYY-MM-DD" en hora local: con
            // `new Date(string)` (UTC) los dias restantes se corrian en
            // husos horarios negativos (Argentina), igual que el bug ya
            // corregido en ingresos.tsx/movimiento-dialog.tsx.
            const fechaObjetivo = m.fecha_objetivo ? parseISODate(m.fecha_objetivo) : null;
            const dias = fechaObjetivo ? Math.ceil((fechaObjetivo.getTime() - Date.now()) / 86400000) : null;
            return (
              <Card key={m.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{m.meta}</h3>
                    {dias !== null && (
                      <p className="text-xs text-muted-foreground">
                        {dias > 0 ? `${dias} días restantes` : dias === 0 ? "Hoy es el día" : "Fecha vencida"}
                      </p>
                    )}
                  </div>
                  <ConfirmDeleteButton
                    size="sm"
                    title="¿Eliminar esta meta?"
                    description={`"${m.meta}" se va a borrar, junto con el progreso guardado.`}
                    onConfirm={() => del(m.id)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="num font-medium">{formatMoney(Number(m.ahorrado), m.moneda)}</span>
                    <span className="text-muted-foreground num">de {formatMoney(Number(m.objetivo), m.moneda)}</span>
                  </div>
                  <Progress value={pct} className="h-3" />
                  <div className="flex justify-between text-xs">
                    <span className={pct >= 100 ? "text-success font-semibold" : "text-muted-foreground"}>{pct.toFixed(1)}%</span>
                    <span className="text-muted-foreground">Falta: <span className="num">{formatMoney(falta, m.moneda)}</span></span>
                  </div>
                </div>
                <AddProgressDialog meta={m} onConfirm={(monto) => addProgress(m, monto)} pending={progressPending === m.id} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddProgressDialog({ meta, onConfirm, pending }: { meta: Meta; onConfirm: (monto: number) => void; pending: boolean }) {
  const [open, setOpen] = useState(false);
  const [monto, setMonto] = useState("");

  function save() {
    if (pending) return;
    let parsed: number;
    try {
      parsed = parsePositiveNumberInput(monto, "Monto");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisá el monto");
      return;
    }
    onConfirm(parsed);
    setOpen(false);
    setMonto("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setMonto(""); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-4" disabled={pending}>
          <PlusIcon className="size-4 mr-2" /> Sumar ahorro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Sumar ahorro a "{meta.meta}"</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Monto a sumar</Label>
            <DecimalInput value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej: 50000" autoFocus />
          </div>
        </div>
        <DialogFooter><Button onClick={save} disabled={pending}>Sumar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewMeta({ userId, defaultCurrency, onCreated }: { userId?: string; defaultCurrency: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ meta: "", moneda: defaultCurrency, objetivo: "", ahorrado: "0", fecha_objetivo: "" });

  async function save() {
    if (!userId) return;
    if (!form.meta || !form.objetivo) { toast.error("Faltan campos"); return; }
    let objetivo: number;
    let ahorrado: number;
    try {
      objetivo = parsePositiveNumberInput(form.objetivo, "Objetivo");
      ahorrado = parseOptionalNumberInput(form.ahorrado, 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa los numeros");
      return;
    }
    const { error } = await supabase.from("metas").insert({
      user_id: userId,
      meta: form.meta,
      moneda: form.moneda,
      objetivo,
      ahorrado,
      fecha_objetivo: form.fecha_objetivo || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Meta creada");
    setOpen(false);
    setForm({ meta: "", moneda: defaultCurrency, objetivo: "", ahorrado: "0", fecha_objetivo: "" });
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="size-4 mr-2" />Nueva meta</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva meta de ahorro</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Nombre *</Label><Input value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="Viaje, Auto, Casa..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Moneda</Label>
              <Select value={form.moneda} onValueChange={(v) => setForm({ ...form, moneda: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ARS">ARS</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Objetivo *</Label><DecimalInput value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="Ej: 1000000" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ya ahorrado</Label><DecimalInput value={form.ahorrado} onChange={(e) => setForm({ ...form, ahorrado: e.target.value })} /></div>
            <div><Label>Fecha objetivo</Label><Input type="date" value={form.fecha_objetivo} onChange={(e) => setForm({ ...form, fecha_objetivo: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter><Button onClick={save}>Crear meta</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
