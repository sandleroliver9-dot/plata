import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Plus, Check, AlertTriangle, CalendarDays, CircleDollarSign, List, LayoutGrid } from "lucide-react";
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
import { buildUpcomingEvents, daysUntil, type CalendarEvent } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { financialDataQuery, useDolarTC } from "@/lib/supabase-queries";

export const Route = createFileRoute("/_authenticated/vencimientos")({
  head: () => ({ meta: [{ title: "Vencimientos · Platium" }] }),
  component: Vencimientos,
});

// Vencimientos junta en una sola pantalla los pagos puntuales que el usuario
// anota a mano (ABL, seguro, expensas...) con todo lo que ya se calcula solo:
// cuotas de tarjeta, préstamos, gastos fijos y próximos cobros. Antes esto
// vivía repartido entre esta pantalla y "Calendario financiero" (mismos datos,
// dos lugares distintos) — la vista Lista de acá es esa vista de calendario,
// fusionada.
type V = { id: string; concepto: string; monto: number; fecha: string; recurrente: boolean; pagado: boolean };

function isoLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Vencimientos() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const qc = useQueryClient();
  const [view, setView] = useState<"calendario" | "lista">("calendario");
  const [cursor, setCursor] = useState(() => {
    const d = appNow();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const { data } = useQuery(financialDataQuery(user?.id));
  const items = (data?.vencimientos ?? []) as V[];
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const { tc } = useDolarTC();

  const events = buildUpcomingEvents({
    profile,
    ingresos: data?.ingresos,
    vencimientos: data?.vencimientos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    gastosFijos: data?.fijos,
    horizonDays: 90,
    preferences,
    tc,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);
  const groupedDates = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

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
    const cells: Array<{ date: Date | null; events: CalendarEvent[] }> = [];
    for (let i = 0; i < startDay; i++) cells.push({ date: null, events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor.y, cursor.m, d);
      const iso = isoLocal(date);
      cells.push({ date, events: grouped.get(iso) ?? [] });
    }
    return cells;
  }, [grouped, cursor]);

  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const today = todayISO();

  async function marcarPagado(id: string) {
    const { error } = await supabase.from("vencimientos").update({ pagado: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["financial-data", user?.id] });
  }
  async function del(id: string) {
    const { error } = await supabase.from("vencimientos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["financial-data", user?.id] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vencimientos</h1>
          <p className="text-muted-foreground text-sm">Lo que anotás a mano (ABL, seguro, expensas...) más cuotas, préstamos, gastos fijos y próximos cobros, todo junto.</p>
        </div>
        <NewV userId={user?.id} onCreated={() => qc.invalidateQueries({ queryKey: ["financial-data", user?.id] })} />
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

      <div className="inline-flex rounded-lg border border-border p-1 gap-1">
        <Button size="sm" variant={view === "calendario" ? "default" : "ghost"} onClick={() => setView("calendario")}>
          <LayoutGrid className="size-4 mr-2" /> Calendario
        </Button>
        <Button size="sm" variant={view === "lista" ? "default" : "ghost"} onClick={() => setView("lista")}>
          <List className="size-4 mr-2" /> Lista
        </Button>
      </div>

      {view === "calendario" ? (
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
                  {cell.events.slice(0, 2).map(ev => {
                    const color = ev.type === "cobro" ? "bg-success/20 text-success" : "bg-primary/10 text-primary";
                    return <div key={ev.id} className={`truncate mt-0.5 rounded px-1 ${color}`}>{ev.title}</div>;
                  })}
                  {cell.events.length > 2 && <div className="text-muted-foreground mt-0.5">+{cell.events.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card>
          {groupedDates.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays className="size-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Todavía no hay nada próximo para mostrar</p>
              <p className="text-sm text-muted-foreground mt-1">Cuotas, préstamos, gastos fijos, cobros y los vencimientos que cargues acá van a aparecer en esta lista.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {groupedDates.map((date) => {
                const dayEvents = grouped.get(date) ?? [];
                return (
                  <div key={date} className="p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold capitalize">{formatDate(date)}</div>
                        <div className="text-xs text-muted-foreground">{relativeDate(date)}</div>
                      </div>
                      <Badge variant="secondary">{dayEvents.length} items</Badge>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.map((event) => {
                        const rawId = event.type === "vencimiento" ? event.id.replace(/^vencimiento-/, "") : null;
                        return (
                          <div key={event.id} className="flex items-center gap-3 rounded-md border border-border/70 p-3">
                            <div className={`size-9 rounded-md grid place-items-center ${event.type === "cobro" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>
                              {event.type === "cobro" ? <CircleDollarSign className="size-5" /> : <CalendarDays className="size-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-xs text-muted-foreground">{event.detail ?? eventLabel(event.type)}</div>
                            </div>
                            <div className={`num font-semibold whitespace-nowrap ${event.type === "cobro" ? "text-success" : ""}`}>
                              {event.type === "cobro" ? "+" : "-"}{formatMoney(event.amount, currency)}
                            </div>
                            {rawId && (
                              <div className="flex gap-1 shrink-0">
                                <Button size="sm" onClick={() => marcarPagado(rawId)}>
                                  <Check className="size-4" />
                                </Button>
                                <ConfirmDeleteButton
                                  size="sm"
                                  title="¿Eliminar este vencimiento?"
                                  description={`${event.title} se va a borrar.`}
                                  onConfirm={() => del(rawId)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function formatDate(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function relativeDate(dateISO: string) {
  const days = daysUntil(dateISO);
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}

function eventLabel(type: CalendarEvent["type"]) {
  if (type === "cobro") return "Cobro";
  if (type === "cuota") return "Cuota";
  if (type === "prestamo") return "Préstamo";
  if (type === "gasto_fijo") return "Gasto fijo";
  return "Vencimiento";
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
