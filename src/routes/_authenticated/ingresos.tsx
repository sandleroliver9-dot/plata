import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, TrendingUp } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/app/confirm-delete-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney, convertAmount, listFinancialMonths, financialMonth, currentFinancialMonth, nextFinancialMonth, financialPeriodRange, toISODate, todayISO } from "@/lib/finance";
import { parseISODate } from "@/lib/financial-centers";
import { useDefaultFinancialMonth } from "@/lib/financial-preferences";
import { useDolarTC } from "@/lib/supabase-queries";
import { getInflacion } from "@/lib/quotes.functions";
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
  head: () => ({ meta: [{ title: "Ingresos · Platium" }] }),
  component: IngresosPage,
});

function IngresosPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const currency = profile?.currency ?? "ARS";
  const payDay = profile?.pay_day ?? 1;
  const [mes, setMes] = useDefaultFinancialMonth(payDay);
  const meses = listFinancialMonths(payDay, 12, 1);
  const { tc } = useDolarTC();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ concepto: "", monto: "", fecha_cobro: todayISO(), tipo: "Sueldo", moneda: currency });

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

  // Historial de sueldo independiente del filtro de mes de arriba: no pisa
  // ninguna fila existente (a diferencia de updateFinancialProfile, que
  // actualiza en el lugar el Sueldo "canónico" para no reintroducir el bug de
  // duplicación ya resuelto) — cada "Registrar" de acá abajo inserta una fila
  // nueva por período, así se puede ver la evolución real mes a mes.
  const { data: sueldoHistorial } = useQuery({
    queryKey: ["ingresos-sueldo-historial", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingresos")
        .select("id, monto, moneda, fecha_cobro, mes_financiero")
        .eq("activo", true)
        .eq("tipo", "Sueldo")
        .order("fecha_cobro", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const fetchInflacion = useServerFn(getInflacion);
  const { data: infl } = useQuery({
    queryKey: ["inflacion-ar"],
    queryFn: () => fetchInflacion(),
    staleTime: 1000 * 60 * 60 * 6,
  });

  const ultimoSueldo = sueldoHistorial?.[0];
  const [monedaSueldo, setMonedaSueldo] = useState(currency);
  const [monedaSueldoTouched, setMonedaSueldoTouched] = useState(false);
  // Convertido a `monedaSueldo` (no siempre la misma que la del último
  // sueldo cargado): si el usuario cambia la moneda de la sugerencia a mano,
  // el número base tiene que seguirla para que el ajuste por inflación no
  // quede mezclando monedas.
  const baseSueldo = ultimoSueldo
    ? convertAmount(Number(ultimoSueldo.monto), ultimoSueldo.moneda, monedaSueldo, tc)
    : convertAmount(Number(profile?.salary ?? 0), currency, monedaSueldo, tc);
  // Siempre el período siguiente al último registrado (no al de "hoy"): si el
  // usuario se adelantó varios períodos, la sugerencia sigue avanzando en vez
  // de quedar pegada sugiriendo un período que ya cargó.
  const targetLabel = ultimoSueldo ? nextFinancialMonth(ultimoSueldo.mes_financiero, payDay) : currentFinancialMonth(payDay);
  const inflacionPct = infl?.promedio3m ? Number(infl.promedio3m.toFixed(1)) : 0;
  const sugeridoRaw = baseSueldo > 0 ? Math.round(baseSueldo * (1 + inflacionPct / 100)) : 0;

  const [sugerenciaTexto, setSugerenciaTexto] = useState("");
  const [sugerenciaTouched, setSugerenciaTouched] = useState(false);

  useEffect(() => {
    if (!sugerenciaTouched && sugeridoRaw > 0) {
      setSugerenciaTexto(String(sugeridoRaw));
    }
  }, [sugeridoRaw, sugerenciaTouched]);

  // Sigue la moneda del último sueldo registrado (ej: si cobra en USD, la
  // sugerencia del próximo período arranca también en USD), salvo que el
  // usuario haya elegido otra a mano.
  useEffect(() => {
    if (!monedaSueldoTouched) {
      setMonedaSueldo(ultimoSueldo?.moneda || currency);
    }
  }, [ultimoSueldo?.moneda, currency, monedaSueldoTouched]);

  const registrarSueldo = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      const monto = parsePositiveNumberInput(sugerenciaTexto, "Sueldo");
      const fechaCobro = toISODate(financialPeriodRange(targetLabel, payDay)?.start ?? new Date());
      const ajuste = baseSueldo > 0 ? Math.round((monto - baseSueldo) * 100) / 100 : null;
      const existing = (sueldoHistorial ?? []).find((h) => h.mes_financiero === targetLabel);
      if (existing) {
        // Ya hay un Sueldo activo para este período (ej: se corrige un
        // número ya cargado): se actualiza esa fila en vez de duplicarla.
        const { error: updIngresoError } = await supabase
          .from("ingresos")
          .update({ monto, fecha_cobro: fechaCobro, ajuste_esperado: ajuste, moneda: monedaSueldo })
          .eq("id", existing.id);
        if (updIngresoError) throw updIngresoError;
        const { error: updMovError } = await supabase
          .from("movimientos")
          .update({ monto, fecha: fechaCobro, moneda: monedaSueldo })
          .eq("ingreso_id", existing.id);
        if (updMovError) throw updMovError;
      } else {
        const { error } = await supabase.rpc("create_income_with_movement", {
          p_user_id: user.id,
          p_concepto: "Sueldo",
          p_monto: monto,
          p_fecha_cobro: fechaCobro,
          p_mes_financiero: targetLabel,
          p_tipo: "Sueldo",
          p_ajuste_esperado: ajuste,
          p_moneda: monedaSueldo,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`Sueldo de ${targetLabel} registrado`);
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["ingresos-sueldo-historial"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["financial-data"] });
      setSugerenciaTouched(false);
    },
    onError: (e: Error) => toast.error(e.message),
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
      // RPC atomica (ver migracion create_income_with_movement_rpc): antes
      // esto eran dos inserts separados (ingresos + movimientos) sin
      // transaccion, asi que si el segundo fallaba quedaba el ingreso
      // huerfano sin su movimiento espejo.
      const { error } = await supabase.rpc("create_income_with_movement", {
        p_user_id: user.id,
        p_concepto: form.concepto.trim().slice(0, 100),
        p_monto: monto,
        p_fecha_cobro: form.fecha_cobro,
        p_mes_financiero: mesIngreso,
        p_tipo: form.tipo,
        p_moneda: form.moneda,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ingreso registrado");
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setForm({ concepto: "", monto: "", fecha_cobro: todayISO(), tipo: "Sueldo", moneda: currency });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (item: { id: string }) => {
      if (!user) throw new Error();
      // RPC atomica (misma razon que create_income_with_movement): antes eran
      // dos updates separados sin transaccion.
      const { error } = await supabase.rpc("delete_income_with_movement", {
        p_user_id: user.id,
        p_ingreso_id: item.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Eliminado");
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const total = (items ?? []).reduce((s, i) => s + convertAmount(Number(i.monto), (i as any).moneda, currency, tc), 0);

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

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="size-4" />Sueldo</div>
          {ultimoSueldo && (
            <div className="text-xs text-muted-foreground">
              Último: <span className="num font-medium text-foreground">{formatMoney(Number(ultimoSueldo.monto), ultimoSueldo.moneda || currency)}</span> ({ultimoSueldo.mes_financiero})
            </div>
          )}
        </div>

        {(sueldoHistorial?.length ?? 0) > 1 && (
          <div className="flex flex-wrap gap-2">
            {sueldoHistorial!.slice().reverse().map((h) => (
              <div key={h.id} className="text-[11px] px-2 py-1 rounded-md bg-muted text-muted-foreground">
                {h.mes_financiero}: <span className="num text-foreground">{formatMoney(Number(h.monto), h.moneda || currency)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end pt-2 border-t border-border">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sugerencia para {targetLabel}</Label>
            <DecimalInput
              value={sugerenciaTexto}
              onChange={(e) => { setSugerenciaTexto(e.target.value); setSugerenciaTouched(true); }}
              placeholder="Monto del sueldo"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {baseSueldo > 0 && inflacionPct > 0
                ? `Auto: +${inflacionPct}% por inflación (prom. 3 meses INDEC). Cambialo si querés.`
                : "Cargá el monto para registrarlo como sueldo de este período."}
            </p>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Moneda</Label>
            <Select value={monedaSueldo} onValueChange={(v) => { setMonedaSueldo(v); setMonedaSueldoTouched(true); }}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => registrarSueldo.mutate()}
            disabled={registrarSueldo.isPending || !sugerenciaTexto.trim()}
          >
            {registrarSueldo.isPending ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </Card>

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
                    {(i as any).moneda && (i as any).moneda !== currency && <Badge variant="outline" className="text-xs">{(i as any).moneda}</Badge>}
                  </div>
                </div>
                <div className="num font-semibold text-success">{formatMoney(Number(i.monto), (i as any).moneda || currency)}</div>
                <ConfirmDeleteButton
                  title="¿Eliminar este ingreso?"
                  description={`${i.concepto} por ${formatMoney(Number(i.monto), (i as any).moneda || currency)} se va a borrar.`}
                  onConfirm={() => del.mutate({ id: i.id })}
                />
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
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Label>Monto</Label><DecimalInput value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="Ej: 500000" /></div>
              <div>
                <Label>Moneda</Label>
                <Select value={form.moneda} onValueChange={(v) => setForm({ ...form, moneda: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">ARS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Fecha de cobro</Label><Input type="date" value={form.fecha_cobro} onChange={(e) => setForm({ ...form, fecha_cobro: e.target.value })} /></div>
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
