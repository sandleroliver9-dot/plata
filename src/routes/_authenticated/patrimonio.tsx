import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/finance";
import { financialDataQuery, usePortfolioValue } from "@/lib/supabase-queries";

export const Route = createFileRoute("/_authenticated/patrimonio")({
  head: () => ({ meta: [{ title: "Patrimonio · Plata" }] }),
  component: Patrimonio,
});

function Patrimonio() {
  const { user } = useAuth();

  // Esta pantalla siempre calcula y muestra en ARS: usePortfolioValue ya
  // convierte inversiones a ARS con el TC del dia, e inmuebles/deudas se
  // convierten a ARS mas abajo. Formatear con profile.currency (que puede
  // ser "USD") mostraria pesos rotulados como si fueran dolares.
  const displayCurrency = "ARS";

  const { data } = useQuery(financialDataQuery(user?.id));
  const { valorARS: inversionesValor, tc } = usePortfolioValue(user?.id);

  // Cada inmueble puede estar cargado en USD o ARS: convertimos a ARS (moneda
  // de referencia de esta pantalla) antes de sumar, para no mezclar unidades.
  const toARS = (monto: number, moneda: string | undefined) => (moneda === "USD" ? monto * tc : monto);

  const totals = useMemo(() => {
    const inversiones = inversionesValor;
    const inmuebles = (data?.inmuebles ?? []).reduce((s: number, i: any) => s + toARS(Number(i.valor_estimado || 0), i.moneda), 0);
    const deudasInm = (data?.inmuebles ?? []).reduce((s: number, i: any) => s + toARS(Number(i.deuda_asociada || 0), i.moneda), 0);
    const deudasPres = (data?.prestamos ?? []).reduce((s: number, p: any) => s + (Number(p.cuota_mensual || 0) * Math.max(0, Number(p.cuotas_totales || 0) - Number(p.cuotas_pagadas || 0))), 0);
    // Cuotas de tarjeta restantes (incluyendo la actual): antes no se restaban
    // del patrimonio neto, que quedaba inflado en exactamente esa deuda.
    const deudasTar = (data?.tarjetas ?? []).reduce((s: number, t: any) => s + (Number(t.valor_cuota || 0) * Math.max(0, Number(t.cuotas_totales || 0) - Number(t.cuota_actual || 0) + 1)), 0);
    const deudas = deudasInm + deudasPres + deudasTar;
    return { inversiones, inmuebles, deudas, neto: inversiones + inmuebles - deudas };
  }, [data, inversionesValor, tc]);

  const pieData = [
    { name: "Inversiones", value: totals.inversiones, color: "var(--primary)" },
    { name: "Inmuebles", value: totals.inmuebles, color: "var(--success)" },
  ].filter(x => x.value > 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Patrimonio neto</h1>
        <p className="text-muted-foreground text-sm">Activos menos pasivos.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Inversiones</div><div className="num text-2xl font-bold mt-2">{formatMoney(totals.inversiones, displayCurrency)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Inmuebles</div><div className="num text-2xl font-bold mt-2">{formatMoney(totals.inmuebles, displayCurrency)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Deudas</div><div className="num text-2xl font-bold mt-2 text-destructive">{formatMoney(totals.deudas, displayCurrency)}</div></Card>
        <Card className="p-5 border-primary/40"><div className="text-xs text-muted-foreground uppercase">Patrimonio neto</div><div className={`num text-2xl font-bold mt-2 ${totals.neto >= 0 ? "text-success" : "text-destructive"}`}>{formatMoney(totals.neto, displayCurrency)}</div></Card>
      </div>

      {pieData.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Distribución de activos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatMoney(Number(v), displayCurrency)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
