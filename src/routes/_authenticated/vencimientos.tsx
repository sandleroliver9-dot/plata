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
import { appNow, formatMoney, financialMonth, todayISO } from "@/lib/finance";
import { hasSimilarMovement, isCardInstallmentRecorded, nextLoanInstallmentBase, resolveGastoFijoDebitDay } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { parsePositiveNumberInput } from "@/lib/number-input";

export const Route = createFileRoute("/_authenticated/vencimientos")({
  head: () => ({ meta: [{ title: "Vencimientos · Platium" }] }),
  component: Vencimientos,
});

type V = { id: string; concepto: string; monto: number; fecha: string; recurrente: boolean; pagado: boolean; origen?: "manual" | "prestamo" | "tarjeta" | "gasto_fijo" };

function addMonths(date: Date, n: number) {
  const d = new Date(date.getFullYear(), date.getMonth() + n, 1);
  const day = Math.min(date.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
  d.setDate(day);
  return d;
}
function isoLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Vencimientos() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const qc = useQueryClient();
  const [cursor, setCursor] = useState(() => {
    const d = appNow();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const { data: manualVencs } = useQuery({
    queryKey: ["vencimientos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("vencimientos").select("*").order("fecha", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((v: any) => ({ ...v, origen: "manual" as const })) as V[];
    },
  });

  const { data: autoVencs } = useQuery({
    // preferences.recurringSettings en la key: sin esto, cambiar el "dia de
    // debito" de un gasto fijo (en su alta o en Configuracion) no refrescaba
    // esta pantalla, que quedaba mostrando la fecha vieja hasta el proximo
    // refetch natural.
    queryKey: ["vencimientos-auto", user?.id, preferences.recurringSettings],
    enabled: !!user,
    queryFn: async () => {
      const [prestamos, tarjetas, gastos, movs] = await Promise.all([
        supabase.from("prestamos").select("*").eq("activo", true),
        supabase.from("tarjetas_cuotas").select("*").eq("activo", true),
        supabase.from("gastos_fijos").select("*").eq("activo", true),
        // El dedupe solo necesita movimientos recientes (la cuota generada
        // siempre es "de hoy en adelante"; si ya se pago sin actualizar el
        // contador, va a estar entre los mas recientes). Mismo limite que
        // financialDataQuery para no traer el historico completo del usuario
        // en cada refetch de esta pantalla.
        supabase.from("movimientos").select("tipo,descripcion,monto,mes_financiero,tarjeta,es_cuota,cuota_origen_id").eq("activo", true).eq("tipo", "Gasto").order("fecha", { ascending: false }).limit(200),
      ]);
      const movimientos = movs.data ?? [];
      const out: V[] = [];
      const hoy = appNow(); hoy.setHours(0, 0, 0, 0);
      const horizonteGastos = new Date(hoy); horizonteGastos.setMonth(horizonteGastos.getMonth() + 12);

      // Un vencimiento automatico no deberia seguir apareciendo como pendiente
      // si ya se registro el pago como movimiento (a diferencia de Dashboard y
      // Movimientos, que si dedupean contra movimientos reales, esta pantalla
      // no lo hacia). Misma logica compartida (isCardInstallmentRecorded) que
      // usan esas dos pantallas para el caso de tarjeta, con hasSimilarMovement
      // como ultimo recurso para prestamos/gastos fijos.
      const yaRegistrado = (
        fecha: Date,
        descripcionFallback: string,
        monto: number,
        opts?: { cuotaOrigenId?: string; tarjeta?: string },
      ) => {
        const mes = financialMonth(fecha, payDay);
        if (opts?.tarjeta) {
          if (isCardInstallmentRecorded(movimientos as any, mes, { tarjeta: opts.tarjeta, compra: descripcionFallback, cuotaOrigenId: opts.cuotaOrigenId })) return true;
        } else if (opts?.cuotaOrigenId) {
          const porId = movimientos.some((mov: any) => mov.es_cuota && mov.mes_financiero === mes && mov.cuota_origen_id === opts.cuotaOrigenId);
          if (porId) return true;
        }
        return hasSimilarMovement(movimientos as any, descripcionFallback, monto, mes);
      };

      for (const p of prestamos.data ?? []) {
        const restantes = p.cuotas_totales - p.cuotas_pagadas;
        if (restantes <= 0) continue;
        // Misma logica que buildUpcomingEvents (financial-centers.ts): la
        // proxima cuota es la primera fecha desde hoy con el dia configurado,
        // no "inicio + cuotas_pagadas meses". Antes esta pantalla tenia su
        // propia copia de este calculo, y el fix del bug se aplico aca pero
        // nunca en la funcion compartida (o viceversa) -- ahora usan la misma.
        const base = nextLoanInstallmentBase(p, hoy);
        for (let i = 0; i < restantes; i++) {
          const fecha = addMonths(base, i);
          if (yaRegistrado(fecha, p.descripcion, Number(p.cuota_mensual), { cuotaOrigenId: p.id })) continue;
          out.push({
            id: `prestamo-${p.id}-${p.cuotas_pagadas + i + 1}`,
            concepto: `${p.descripcion} (cuota ${p.cuotas_pagadas + i + 1}/${p.cuotas_totales})`,
            monto: Number(p.cuota_mensual), fecha: isoLocal(fecha),
            recurrente: false, pagado: false, origen: "prestamo",
          });
        }
      }
      for (const t of tarjetas.data ?? []) {
        const base = new Date(t.inicio + "T00:00:00");
        const restantes = t.cuotas_totales - t.cuota_actual + 1;
        for (let i = 0; i < restantes; i++) {
          const fecha = addMonths(base, i);
          if (yaRegistrado(fecha, t.compra, Number(t.valor_cuota), { cuotaOrigenId: t.id, tarjeta: t.tarjeta })) continue;
          out.push({
            id: `tarjeta-${t.id}-${t.cuota_actual + i}`,
            concepto: `${t.tarjeta}: ${t.compra} (${t.cuota_actual + i}/${t.cuotas_totales})`,
            monto: Number(t.valor_cuota), fecha: isoLocal(fecha),
            recurrente: false, pagado: false, origen: "tarjeta",
          });
        }
      }
      for (const g of gastos.data ?? []) {
        const baseDay = resolveGastoFijoDebitDay(g, preferences.recurringSettings);
        const fin = g.fin ? new Date(g.fin + "T00:00:00") : null;
        // Si la ocurrencia de este mes calendario ya paso (ej: se cobra/paga
        // el dia 5 y hoy es 20), arrancar desde el mes que viene: mismo
        // criterio de "proxima fecha desde hoy" que la rama de prestamos de
        // arriba. Sin esto, "Proximo: {fecha}" en la tarjeta del gasto fijo
        // podia mostrar una fecha ya pasada, sin ningun indicador de vencido.
        let monthOffset = 0;
        const primerDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const diasEsteMes = new Date(primerDelMes.getFullYear(), primerDelMes.getMonth() + 1, 0).getDate();
        primerDelMes.setDate(Math.min(baseDay, diasEsteMes));
        if (primerDelMes < hoy) monthOffset = 1;
        for (let i = 0; i < 12; i++) {
          const d = new Date(hoy.getFullYear(), hoy.getMonth() + monthOffset + i, 1);
          const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
          d.setDate(Math.min(baseDay, dim));
          if (fin && d > fin) break;
          if (d > horizonteGastos) break;
          if (yaRegistrado(d, g.gasto, Number(g.monto_mensual))) continue;
          out.push({
            id: `gasto-${g.id}-${d.getFullYear()}${d.getMonth()}`,
            concepto: g.gasto,
            monto: Number(g.monto_mensual), fecha: isoLocal(d),
            recurrente: true, pagado: false, origen: "gasto_fijo",
          });
        }
      }
      return out;
    },
  });

  const vencs = useMemo(() => {
    return [...(manualVencs ?? []), ...(autoVencs ?? [])].sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [manualVencs, autoVencs]);

  const { proximos, totalMes, vencidos } = useMemo(() => {
    const hoy = appNow(); hoy.setHours(0, 0, 0, 0);
    const en30 = new Date(hoy); en30.setDate(en30.getDate() + 30);
    const proximos = vencs.filter(v => !v.pagado && new Date(v.fecha + "T00:00:00") >= hoy && new Date(v.fecha + "T00:00:00") <= en30);
    const vencidos = vencs.filter(v => !v.pagado && new Date(v.fecha + "T00:00:00") < hoy && v.origen === "manual");
    const totalMes = proximos.reduce((s, v) => s + Number(v.monto), 0);
    return { proximos, totalMes, vencidos };
  }, [vencs]);

  const grupos = useMemo(() => {
    const map = new Map<string, { key: string; origen: string; nombre: string; cuotaMonto: number; items: V[] }>();
    for (const v of autoVencs ?? []) {
      const parts = v.id.split("-");
      const key = `${parts[0]}-${parts[1]}`;
      const nombre = v.concepto.replace(/\s*\([^)]*\)\s*$/, "");
      if (!map.has(key)) map.set(key, { key, origen: v.origen!, nombre, cuotaMonto: Number(v.monto), items: [] });
      map.get(key)!.items.push(v);
    }
    return Array.from(map.values()).map(g => {
      const sorted = g.items.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
      return { ...g, primera: sorted[0], ultima: sorted[sorted.length - 1], cantidad: sorted.length };
    }).sort((a, b) => a.primera.fecha.localeCompare(b.primera.fecha));
  }, [autoVencs]);

  const manualPend = useMemo(() => [...vencidos, ...proximos].filter(v => v.origen === "manual"), [vencidos, proximos]);

  const monthGrid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells: Array<{ date: Date | null; items: V[] }> = [];
    for (let i = 0; i < startDay; i++) cells.push({ date: null, items: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor.y, cursor.m, d);
      const iso = isoLocal(date);
      const items = vencs.filter(v => v.fecha === iso);
      cells.push({ date, items });
    }
    return cells;
  }, [vencs, cursor]);

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
          <p className="text-muted-foreground text-sm">Calendario de pagos próximos.</p>
        </div>
        <NewV userId={user?.id} onCreated={() => qc.invalidateQueries({ queryKey: ["vencimientos"] })} />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Compromisos activos</div>
          <div className="num text-2xl font-bold mt-2">{grupos.length + manualPend.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Tarjetas, préstamos y fijos</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase">Total mensual estimado</div>
          <div className="num text-2xl font-bold mt-2">{formatMoney(grupos.reduce((s, g) => s + g.cuotaMonto, 0), currency)}</div>
          <div className="text-sm text-muted-foreground mt-1">Suma de cuotas activas</div>
        </Card>
        <Card className={`p-5 ${vencidos.length > 0 ? "border-destructive/40 bg-destructive/5" : ""}`}>
          <div className="flex items-center gap-2 text-xs uppercase">
            {vencidos.length > 0 && <AlertTriangle className="size-4 text-destructive" />}
            <span className="text-muted-foreground">Manuales vencidos</span>
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
                  const color = it.pagado ? "bg-success/20 text-success line-through"
                    : it.origen === "prestamo" ? "bg-purple-500/20 text-purple-400"
                    : it.origen === "tarjeta" ? "bg-blue-500/20 text-blue-400"
                    : it.origen === "gasto_fijo" ? "bg-orange-500/20 text-orange-400"
                    : "bg-warning/20 text-warning";
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
        {grupos.length === 0 && manualPend.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sin vencimientos pendientes 🎉</p>
        ) : (
          <ul className="divide-y divide-border">
            {grupos.map(g => {
              const origenLabel = g.origen === "prestamo" ? "Préstamo" : g.origen === "tarjeta" ? "Tarjeta" : "Gasto fijo";
              const primeraD = new Date(g.primera.fecha + "T00:00:00");
              const ultimaD = new Date(g.ultima.fecha + "T00:00:00");
              const fmt = (d: Date) => d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "2-digit" });
              const esRecurrente = g.origen === "gasto_fijo";
              return (
                <li key={g.key} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{g.nombre}</span>
                        <Badge variant="secondary" className="text-xs">{origenLabel}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {esRecurrente ? (
                          <>Próximo: {fmt(primeraD)} · mensual</>
                        ) : (
                          <>
                            {g.cantidad} cuotas restantes · próxima {fmt(primeraD)} · termina {fmt(ultimaD)}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="num font-semibold">{formatMoney(g.cuotaMonto, currency)}</div>
                      {!esRecurrente && <div className="text-xs text-muted-foreground num">Total: {formatMoney(g.cuotaMonto * g.cantidad, currency)}</div>}
                    </div>
                  </div>
                </li>
              );
            })}
            {manualPend.map(v => {
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
