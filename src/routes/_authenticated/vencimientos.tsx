import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Plus, Check, AlertTriangle, CalendarDays, CircleDollarSign, List, LayoutGrid, ChevronRight } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { appNow, formatMoney, todayISO } from "@/lib/finance";
import { parsePositiveNumberInput } from "@/lib/number-input";
import { buildUpcomingEvents, daysUntil, type CalendarEvent } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { financialDataQuery, useDolarTC } from "@/lib/supabase-queries";
import { PLATIUM_CARD, PLATIUM_PAGE_TITLE, PLATIUM_PAGE_SUBTITLE, PLATIUM_BUTTON_PRIMARY, PLATIUM_BUTTON_OUTLINE } from "@/components/app/platium-ui";

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
  const [newOpen, setNewOpen] = useState(false);
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

  const upcoming = useMemo(() => events.filter((event) => event.type !== "cobro"), [events]);

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
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <header>
        <h1 className={PLATIUM_PAGE_TITLE}>Vencimientos</h1>
        <p className={`${PLATIUM_PAGE_SUBTITLE} mt-1`}>Organizá tus próximos pagos y cobros.</p>
      </header>

      <div className={`${PLATIUM_CARD} p-5 grid grid-cols-3 divide-x divide-[#d9d9d9]`}>
        <div className="text-center px-1">
          <div className="text-[11px] text-[#70706a] whitespace-nowrap">Pendientes</div>
          <div className="num text-xl font-bold mt-2 text-[#20376b]">{pendientes.length}</div>
        </div>
        <div className="text-center px-1">
          <div className="text-[11px] text-[#70706a] whitespace-nowrap">Monto pendiente</div>
          <div className="num text-xl font-bold mt-2 text-[#20376b]">{formatMoney(totalPendiente, currency)}</div>
        </div>
        <div className="text-center px-1">
          <div className="flex items-center justify-center gap-1">
            {vencidos.length > 0 && <AlertTriangle className="size-3.5 text-[#c7272b] shrink-0" />}
            <span className="text-[11px] text-[#70706a] whitespace-nowrap">Vencidos</span>
          </div>
          <div className={`num text-xl font-bold mt-2 ${vencidos.length > 0 ? "text-[#c7272b]" : "text-[#20376b]"}`}>{vencidos.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className={view === "calendario" ? "h-[34px] rounded-[11px] bg-[#20376b] text-[13px] font-normal text-white shadow-none hover:bg-[#20376b]/90 font-plus-jakarta" : PLATIUM_BUTTON_PRIMARY}
          onClick={() => setView("calendario")}
        >
          <LayoutGrid className="size-4 mr-2" /> Calendario
        </Button>
        <Button
          size="sm"
          className={view === "lista" ? "h-[34px] rounded-[11px] bg-[#20376b] text-[13px] font-normal text-white shadow-none hover:bg-[#20376b]/90 font-plus-jakarta" : PLATIUM_BUTTON_PRIMARY}
          onClick={() => setView("lista")}
        >
          <List className="size-4 mr-2" /> Lista
        </Button>
        <Button size="sm" className={PLATIUM_BUTTON_PRIMARY} onClick={() => setNewOpen(true)}>
          <Plus className="size-4 mr-2" /> Nuevo
        </Button>
      </div>

      {view === "calendario" ? (
        <>
          <div className={`${PLATIUM_CARD} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold capitalize text-[13px] text-[#20376b]">{monthName}</h3>
              <div className="flex gap-1">
                <Button size="sm" className={PLATIUM_BUTTON_OUTLINE} onClick={() => setCursor(c => { const m = c.m - 1; return m < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m }; })}>‹</Button>
                <Button size="sm" className={PLATIUM_BUTTON_OUTLINE} onClick={() => setCursor(() => { const d = appNow(); return { y: d.getFullYear(), m: d.getMonth() }; })}>Hoy</Button>
                <Button size="sm" className={PLATIUM_BUTTON_OUTLINE} onClick={() => setCursor(c => { const m = c.m + 1; return m > 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m }; })}>›</Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-[#70706a] mb-1">
              {["D", "L", "M", "X", "J", "V", "S"].map(d => <div key={d} className="text-center font-medium">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((cell, i) => {
                const iso = cell.date ? isoLocal(cell.date) : undefined;
                const isToday = iso === today;
                return (
                  <div key={i} className={`min-h-16 rounded-md border p-1 text-xs ${cell.date ? "bg-white" : "opacity-30"} ${isToday ? "border-[#20376b] bg-[#eaf2fa]" : "border-[#d9d9d9]"}`}>
                    {cell.date && <div className="font-semibold text-[#111]">{cell.date.getDate()}</div>}
                    {cell.events.slice(0, 2).map(ev => {
                      const color = ev.type === "cobro" ? "bg-success/20 text-success" : "bg-[#20376b]/10 text-[#20376b]";
                      return <div key={ev.id} className={`truncate mt-0.5 rounded px-1 ${color}`}>{ev.title}</div>;
                    })}
                    {cell.events.length > 2 && <div className="text-[#70706a] mt-0.5">+{cell.events.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${PLATIUM_CARD} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[13px] text-[#20376b]">Próximos vencimientos</h3>
              {upcoming.length > 0 && (
                <button onClick={() => setView("lista")} className="text-xs text-[#20376b] flex items-center gap-0.5">
                  Ver todos <ChevronRight className="size-3" />
                </button>
              )}
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-[#70706a] text-center py-4">No tenés nada próximo para mostrar.</p>
            ) : (
              <div className="divide-y divide-[#d9d9d9]">
                {upcoming.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-3">
                    <div className="w-11 shrink-0 rounded-md bg-[#f5f5f4] text-center py-1">
                      <div className="text-sm font-bold text-[#111] leading-none">{dayOfMonth(event.date)}</div>
                      <div className="text-[9px] uppercase text-[#70706a] mt-0.5">{monthAbbrev(event.date)}</div>
                    </div>
                    <div className={`size-9 rounded-md grid place-items-center shrink-0 ${event.type === "cobro" ? "bg-success/15 text-success" : "bg-[#20376b]/10 text-[#20376b]"}`}>
                      {event.type === "cobro" ? <CircleDollarSign className="size-5" /> : <CalendarDays className="size-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-[13px] text-[#111]">{event.title}</div>
                      <div className="text-xs text-[#70706a]">• {event.detail ?? eventLabel(event.type)}</div>
                    </div>
                    <div className="num font-semibold whitespace-nowrap text-[#111]">
                      -{formatMoney(event.amount, currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={PLATIUM_CARD}>
          {groupedDates.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays className="size-10 mx-auto text-[#8e8e88] mb-3" />
              <p className="font-medium text-[13px] text-[#111]">Todavía no hay nada próximo para mostrar</p>
              <p className="text-sm text-[#70706a] mt-1">Cuotas, préstamos, gastos fijos, cobros y los vencimientos que cargues acá van a aparecer en esta lista.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#d9d9d9]">
              {groupedDates.map((date) => {
                const dayEvents = grouped.get(date) ?? [];
                return (
                  <div key={date} className="p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold capitalize text-[13px] text-[#20376b]">{formatDate(date)}</div>
                        <div className="text-xs text-[#70706a]">{relativeDate(date)}</div>
                      </div>
                      <Badge variant="secondary">{dayEvents.length} items</Badge>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.map((event) => {
                        const rawId = event.type === "vencimiento" ? event.id.replace(/^vencimiento-/, "") : null;
                        return (
                          <div key={event.id} className="flex items-center gap-3 rounded-md border border-[#d9d9d9] p-3">
                            <div className={`size-9 rounded-md grid place-items-center ${event.type === "cobro" ? "bg-success/15 text-success" : "bg-[#20376b]/10 text-[#20376b]"}`}>
                              {event.type === "cobro" ? <CircleDollarSign className="size-5" /> : <CalendarDays className="size-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-[13px] text-[#111]">{event.title}</div>
                              <div className="text-xs text-[#70706a]">{event.detail ?? eventLabel(event.type)}</div>
                            </div>
                            <div className={`num font-semibold whitespace-nowrap ${event.type === "cobro" ? "text-success" : "text-[#111]"}`}>
                              {event.type === "cobro" ? "+" : "-"}{formatMoney(event.amount, currency)}
                            </div>
                            {rawId && (
                              <div className="flex gap-1 shrink-0">
                                <Button size="sm" className={PLATIUM_BUTTON_PRIMARY} onClick={() => marcarPagado(rawId)}>
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
        </div>
      )}
      <NewV userId={user?.id} open={newOpen} onOpenChange={setNewOpen} onCreated={() => qc.invalidateQueries({ queryKey: ["financial-data", user?.id] })} />
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

function dayOfMonth(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).getDate();
}

function monthAbbrev(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("es-AR", { month: "short" }).replace(".", "").toUpperCase();
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

function NewV({ userId, open, onOpenChange, onCreated }: { userId?: string; open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
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
    onOpenChange(false);
    setForm({ concepto: "", monto: "", fecha: todayISO(), recurrente: false });
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo vencimiento</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Concepto *</Label><Input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="ABL, expensas, seguro..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0"><Label>Monto *</Label><DecimalInput value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="Ej: 25000" /></div>
            <div className="min-w-0"><Label>Fecha *</Label><Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
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
