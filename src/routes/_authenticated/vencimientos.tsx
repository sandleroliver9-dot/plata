import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Plus, Check, CalendarClock, AlertTriangle } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { appNow, formatMoney, todayISO } from "@/lib/finance";
import { parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/vencimientos")({
  head: () => ({ meta: [{ title: "Vencimientos · Platium" }] }),
  component: Vencimientos,
});

// Vencimientos es solo para pagos puntuales que el usuario ya sabe que se
// vienen (ABL, seguro, expensas...) y quiere que le recordemos: se cargan a
// mano acá. Las cuotas de tarjeta, préstamos y gastos fijos ya se calculan
// solas y se ven (junto con estos vencimientos manuales) en Calendario
// financiero — repetirlas acá era la misma info dos veces, con otro nombre.
type V = { id: string; concepto: string; monto: number; fecha: string; recurrente: boolean; pagado: boolean };

function isoLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Vencimientos() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [cursor, setCursor] = useState(() => {
    const d = appNow();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const { data: vencs } = useQuery({
    queryKey: ["vencimientos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("vencimientos").select("*").order("fecha", { ascending: true });
      if (error) throw error;
      return (data ?? []) as V[];
    },
  });
  const items = vencs ?? [];

  const { pendientes, totalPendiente, vencidos } = useMemo(() => {
    const hoy = appNow(); hoy.setHours(0, 0, 0, 0);
    const noPagados = items.filter(v => !v.pagado);
    const vencidos = noPagados.filter(v => new Date(v.fecha + "T00:00:00") < hoy);
    const proximos = noPagados.filter(v => new Date(v.fecha + "T00:00:00") >= hoy);
    const pendientes = [...vencidos, ...proximos];
    const totalPendiente = pendientes.reduce((s, v) => s + Number(v.monto), 0);
    return { pendientes, totalPendiente, vencidos };
  }, [items]);

  const monthGrid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells: Array<{ date: Date | null; items: V[] }> = [];
    for (let i = 0; i < startDay; i++) cells.push({ date: null, items: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor.y, cursor.m, d);
      const iso = isoLocal(date);
      const dayItems = items.filter(v => v.fecha === iso);
      cells.push({ date, items: dayItems });
    }
    return cells;
  }, [items, cursor]);

  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const today = todayISO();

  async function togglePagado(v: V) {
    const { error } = await supabase.from("vencimientos").update({ pagado: !v.pagado }).eq("id", v.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["vencimientos"] });
  }
  async function del(id: string) {
    const { error } = await supabase.from("vencimientos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["vencimientos"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vencimientos</h1>
          <p className="text-muted-foreground text-sm">Anotá tus pagos puntuales (ABL, seguro, expensas...) para que te avisemos antes de la fecha.</p>
        </div>
        <NewV userId={user?.id} onCreated={() => qc.invalidateQueries({ queryKey: ["vencimientos"] })} />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Pendientes</div>
          <div className="num text-2xl font-bold mt-2">{pendientes.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Monto pendiente</div>
          <div className="num text-2xl font-bold mt-2">{formatMoney(totalPendiente, currency)}</div>
        </Card>
        <Card className={`p-5 ${vencidos.length > 0 ? "border-destructive/40 bg-destructive/5" : ""}`}>
          <div className="flex items-center gap-2 text-xs uppercase">
            {vencidos.length > 0 && <AlertTriangle className="size-4 text-destructive" />}
            <span className="text-muted-foreground">Vencidos</span>
          </div>
          <div className={`num text-2xl font-bold mt-2 ${vencidos.length > 0 ? "text-destructive" : ""}`}>{vencidos.length}</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold capitalize">{monthName}</h3>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setCursor(c => { const m = c.m - 1; return m < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m }; })}>‹</Button>
            <Button size="sm" variant="outline" onClick={() => setCursor(() => { const d = appNow(); return { y: d.getFullYear(), m: d.getMonth() }; })}>Hoy</Button>
            <Button size="sm" variant="outline" onClick={() => setCursor(c => { const m = c.m + 1; return m > 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m }; })}>›</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-1">
          {["D", "L", "M", "X", "J", "V", "S"].map(d => <div key={d} className="text-center font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((cell, i) => {
            const iso = cell.date ? isoLocal(cell.date) : undefined;
            const isToday = iso === today;
            return (
              <div key={i} className={`min-h-16 rounded-md border p-1 text-xs ${cell.date ? "bg-card/40" : "opacity-30"} ${isToday ? "border-primary bg-primary/10" : "border-border"}`}>
                {cell.date && <div className="font-semibold">{cell.date.getDate()}</div>}
                {cell.items.slice(0, 2).map(it => {
                  const color = it.pagado ? "bg-success/20 text-success line-through" : "bg-warning/20 text-warning";
                  return <div key={it.id} className={`truncate mt-0.5 rounded px-1 ${color}`}>{it.concepto}</div>;
                })}
                {cell.items.length > 2 && <div className="text-muted-foreground mt-0.5">+{cell.items.length - 2}</div>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><CalendarClock className="size-4" /> Próximos vencimientos</h3>
        {pendientes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sin vencimientos pendientes 🎉</p>
        ) : (
          <ul className="divide-y divide-border">
            {pendientes.map(v => {
              const d = new Date(v.fecha + "T00:00:00");
              const dias = Math.ceil((d.getTime() - appNow().setHours(0,0,0,0)) / 86400000);
              const vencido = dias < 0;
              return (
                <li key={v.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${v.pagado ? "line-through text-muted-foreground" : ""}`}>{v.concepto}</span>
                      {v.recurrente && <Badge variant="outline" className="text-xs">Recurrente</Badge>}
                      {vencido && !v.pagado && <Badge variant="destructive" className="text-xs">Vencido</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · {vencido ? `hace ${Math.abs(dias)} días` : dias === 0 ? "hoy" : `en ${dias} días`}
                    </p>
                  </div>
                  <span className="num font-semibold whitespace-nowrap">{formatMoney(Number(v.monto), currency)}</span>
                  <Button size="sm" variant={v.pagado ? "secondary" : "default"} onClick={() => togglePagado(v)}>
                    <Check className="size-4" />
                  </Button>
                  <ConfirmDeleteButton
                    size="sm"
                    title="¿Eliminar este vencimiento?"
                    description={`${v.concepto} por ${formatMoney(Number(v.monto), currency)} se va a borrar.`}
                    onConfirm={() => del(v.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function NewV({ userId, onCreated }: { userId?: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ concepto: "", monto: "", fecha: todayISO(), recurrente: false });

  async function save() {
    if (!userId || !form.concepto || !form.monto) { toast.error("Faltan campos"); return; }
    let monto: number;
    try {
      monto = parsePositiveNumberInput(form.monto, "Monto");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revisa el monto");
      return;
    }
    const { error } = await supabase.from("vencimientos").insert({
      user_id: userId,
      concepto: form.concepto,
      monto,
      fecha: form.fecha,
      recurrente: form.recurrente,
      pagado: false,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Vencimiento agregado");
    setOpen(false);
    setForm({ concepto: "", monto: "", fecha: todayISO(), recurrente: false });
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="size-4 mr-2" />Nuevo</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo vencimiento</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Concepto *</Label><Input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="ABL, expensas, seguro..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Monto *</Label><DecimalInput value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="Ej: 25000" /></div>
            <div><Label>Fecha *</Label><Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="rec">Recurrente mensual</Label>
            <Switch id="rec" checked={form.recurrente} onCheckedChange={(v) => setForm({ ...form, recurrente: v })} />
          </div>
        </div>
        <DialogFooter><Button onClick={save}>Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
