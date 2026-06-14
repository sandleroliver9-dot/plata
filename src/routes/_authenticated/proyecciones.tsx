import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/finance";
import { getInflacion } from "@/lib/quotes.functions";
import { updateSavingTarget } from "@/lib/profile.functions";
import { buildUpcomingEvents, parseISODate } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/proyecciones")({
  head: () => ({ meta: [{ title: "Proyecciones · Plata" }] }),
  component: ProyeccionesPage,
});

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function monthLabel(d: Date) {
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function ProyeccionesPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id);
  const currency = profile?.currency ?? "ARS";
  const overdraft = Number(profile?.overdraft_allowed ?? 0);
  const salary = Number(profile?.salary ?? 0);

  const qc = useQueryClient();
  const [ahorroPct, setAhorroPct] = useState<number>(() => Number(profile?.saving_target ?? 20));
  const [inflacionPct, setInflacionPct] = useState(0);
  const [inflacionTouched, setInflacionTouched] = useState(false);

  // Sincronizar slider cuando llega el perfil (primera carga)
  useEffect(() => {
    if (profile?.saving_target !== undefined && profile?.saving_target !== null) {
      setAhorroPct(Number(profile.saving_target));
    }
  }, [profile?.saving_target]);

  // Guardar objetivo de ahorro 1s después de que el usuario deja de mover el slider
  useEffect(() => {
    const saved = Number(profile?.saving_target ?? 20);
    if (ahorroPct === saved) return;
    const t = setTimeout(() => {
      updateTargetMutation.mutate(ahorroPct);
    }, 1000);
    return () => clearTimeout(t);
  }, [ahorroPct, profile?.saving_target]);

  const fetchInflacion = useServerFn(getInflacion);
  const { data: infl } = useQuery({
    queryKey: ["inflacion-ar"],
    queryFn: () => fetchInflacion(),
    staleTime: 1000 * 60 * 60 * 6,
  });

  const saveTarget = useServerFn(updateSavingTarget);
  const updateTargetMutation = useMutation({
    mutationFn: (savingTarget: number) => saveTarget({ data: { savingTarget } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  // Auto-prefill slider with promedio 3 meses cuando llega el dato (si el usuario no lo tocó)
  useEffect(() => {
    if (!inflacionTouched && infl?.promedio3m) {
      setInflacionPct(Number(infl.promedio3m.toFixed(1)));
    }
  }, [infl, inflacionTouched]);

  const { data } = useQuery({
    queryKey: ["proyecciones", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [fijos, cuotas, prest, ingExtra] = await Promise.all([
        supabase.from("gastos_fijos").select("*").eq("activo", true),
        supabase.from("tarjetas_cuotas").select("*").eq("activo", true),
        supabase.from("prestamos").select("*").eq("activo", true),
        supabase.from("ingresos").select("id,concepto,monto,fecha_cobro,tipo,activo").eq("activo", true).order("fecha_cobro", { ascending: false }).limit(80),
      ]);
      return {
        fijos: fijos.data ?? [],
        cuotas: cuotas.data ?? [],
        prestamos: prest.data ?? [],
        ingresos: ingExtra.data ?? [],
      };
    },
  });

  const rows = useMemo(() => {
    if (!data) return [];
    const totalFijos = data.fijos.reduce((s, f: any) => s + Number(f.monto_mensual), 0);
    const sueldoCargado = data.ingresos
      .filter((i: any) => String(i.tipo ?? "").toLowerCase() === "sueldo")
      .sort((a: any, b: any) => String(b.fecha_cobro).localeCompare(String(a.fecha_cobro)))[0];
    const sueldoMensual = Number(sueldoCargado?.monto ?? 0) > 0 ? Number(sueldoCargado.monto) : salary;
    // promedio mensual de "extras" (no Sueldo) en últimos 3 meses con datos
    const now = new Date();
    const extras3m = data.ingresos.filter((i: any) => {
      const d = new Date(i.fecha_cobro);
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      return monthsAgo >= 0 && monthsAgo < 3 && String(i.tipo ?? "").toLowerCase() !== "sueldo";
    });
    const extrasProm = extras3m.length ? extras3m.reduce((s, i: any) => s + Number(i.monto), 0) / 3 : 0;
    now.setHours(0, 0, 0, 0);
    const events = buildUpcomingEvents({
      profile,
      ingresos: data.ingresos,
      tarjetas: data.cuotas,
      prestamos: data.prestamos,
      gastosFijos: data.fijos,
      horizonDays: 370,
      preferences,
    });

    const out: Array<{
      mes: string;
      sueldo: number;
      extras: number;
      ingresos: number;
      gastosFijos: number;
      cuotas: number;
      total: number;
      disponible: number;
      objetivo: number;
      final: number;
      estado: "ok" | "ajustado" | "rojo";
      mensaje: string;
    }> = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const infFactor = Math.pow(1 + inflacionPct / 100, i);

      // Sueldo + extras proyectados, ambos ajustados por inflación
      let sueldo = sueldoMensual * infFactor;
      let extras = extrasProm * infFactor;
      let ingresos = sueldo + extras;
      let gastosFijos = totalFijos * infFactor;

      // Cuotas de tarjeta activas que aún corren en este mes
      const cuotasTar = data.cuotas.reduce((s: number, c: any) => {
        const ini = new Date(c.inicio);
        const monthsFromIni = (d.getFullYear() - ini.getFullYear()) * 12 + (d.getMonth() - ini.getMonth());
        const cuotaEnMes = (Number(c.cuota_actual) || 1) + monthsFromIni - 0;
        if (cuotaEnMes >= 1 && cuotaEnMes <= Number(c.cuotas_totales)) return s + Number(c.valor_cuota);
        return s;
      }, 0);

      const cuotasPre = data.prestamos.reduce((s: number, p: any) => {
        const restantes = Number(p.cuotas_totales) - Number(p.cuotas_pagadas);
        return i < restantes ? s + Number(p.cuota_mensual) : s;
      }, 0);

      let cuotas = cuotasTar + cuotasPre;
      const monthEvents = events.filter((event) => {
        const eventDate = parseISODate(event.date);
        return Boolean(eventDate && eventDate >= d && eventDate < end);
      });
      if (monthEvents.length > 0) {
        const sueldoRaw = monthEvents
          .filter((event) => event.type === "cobro" && event.title.toLowerCase().includes("sueldo"))
          .reduce((s, event) => s + Number(event.amount), 0);
        const ingresosRaw = monthEvents
          .filter((event) => event.type === "cobro")
          .reduce((s, event) => s + Number(event.amount), 0);
        const gastosFijosRaw = monthEvents
          .filter((event) => event.type === "gasto_fijo")
          .reduce((s, event) => s + Number(event.amount), 0);
        const pagosProgramados = monthEvents
          .filter((event) => event.type === "cuota" || event.type === "prestamo" || event.type === "vencimiento")
          .reduce((s, event) => s + Number(event.amount), 0);

        sueldo = sueldoRaw * infFactor;
        extras = Math.max(0, ingresosRaw - sueldoRaw) * infFactor;
        ingresos = sueldo + extras;
        gastosFijos = gastosFijosRaw * infFactor;
        cuotas = pagosProgramados;
      }
      const total = gastosFijos + cuotas;
      const disponible = ingresos - total;
      const objetivo = Math.max(0, (ingresos * ahorroPct) / 100);
      const final = disponible - objetivo;

      let estado: "ok" | "ajustado" | "rojo" = "ok";
      let mensaje = "";
      if (disponible < -overdraft) {
        estado = "rojo";
        mensaje = `Te excedés del descubierto en ${formatMoney(Math.abs(disponible + overdraft), currency)}.`;
      } else if (final < 0) {
        estado = "ajustado";
        mensaje = `Cubrís gastos pero no alcanza para el objetivo de ahorro.`;
      } else {
        mensaje = `Podés ahorrar ${formatMoney(final, currency)} este mes.`;
      }

      out.push({
        mes: monthLabel(d),
        sueldo,
        extras,
        ingresos,
        gastosFijos,
        cuotas,
        total,
        disponible,
        objetivo,
        final,
        estado,
        mensaje,
      });
    }
    return out;
  }, [data, profile, preferences, salary, ahorroPct, inflacionPct, overdraft, currency]);

  const chartData = rows.map((r) => ({
    mes: r.mes.split(" ")[0],
    Ingresos: Math.round(r.ingresos),
    Gastos: Math.round(r.total),
    Ahorro: Math.round(Math.max(0, r.final)),
  }));

  const sumAhorro = rows.reduce((s, r) => s + Math.max(0, r.final), 0);
  const sueldoProyectado = rows[0]?.sueldo ?? 0;
  const extrasProyectados = rows[0]?.extras ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Proyecciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Mira como evolucionan tus proximos 12 meses segun fechas de cobro, vencimientos, gastos recurrentes y cuotas.</p>
      </header>

      <Card className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Objetivo de ahorro: {ahorroPct}%</Label>
          <Slider value={[ahorroPct]} onValueChange={(v) => setAhorroPct(v[0])} min={0} max={60} step={5} className="mt-3" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            Inflación mensual estimada: {inflacionPct}%
            {infl?.ultimoMes && (
              <span className="inline-flex items-center gap-1 text-success normal-case tracking-normal">
                <TrendingUp className="size-3" /> INDEC último: {Number(infl.ultimoMes.valor).toFixed(1)}%
              </span>
            )}
          </Label>
          <Slider value={[inflacionPct]} onValueChange={(v) => { setInflacionPct(v[0]); setInflacionTouched(true); }} min={0} max={15} step={0.1} className="mt-3" />
          {infl?.promedio3m ? (
            <p className="text-[11px] text-muted-foreground mt-2">Auto: promedio 3 meses INDEC ({infl.promedio3m.toFixed(1)}%). Movelo si querés.</p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5 grid gap-4 md:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Sueldo mensual proyectado</div>
          <div className="num text-2xl font-bold mt-1 text-success">{formatMoney(sueldoProyectado, currency)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Extras promedio</div>
          <div className="num text-2xl font-bold mt-1">{formatMoney(extrasProyectados, currency)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Ahorro proyectado 12 meses</div>
          <div className="num text-2xl font-bold mt-1 text-success">{formatMoney(sumAhorro, currency)}</div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip formatter={(v: number) => formatMoney(v, currency)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Ingresos" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ahorro" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.mes} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <div className="font-medium capitalize">{r.mes}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.mensaje}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ingresos</div>
                <div className="num text-sm font-semibold text-success">{formatMoney(r.ingresos, currency)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Gastos</div>
                <div className="num text-sm font-semibold">{formatMoney(r.total, currency)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Disponible</div>
                <div className={`num text-sm font-semibold ${r.disponible < 0 ? "text-destructive" : ""}`}>{formatMoney(r.disponible, currency)}</div>
              </div>
              <Badge variant={r.estado === "ok" ? "default" : r.estado === "ajustado" ? "secondary" : "destructive"}>
                {r.estado === "ok" ? "Podés ahorrar" : r.estado === "ajustado" ? "Mes ajustado" : "Sobregirado"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
