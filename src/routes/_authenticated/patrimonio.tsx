import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/finance";
import { getDolares } from "@/lib/quotes.functions";
import { computeBalance, type Activo, type Compra, type Venta, type Dividendo } from "@/lib/portfolio";

export const Route = createFileRoute("/_authenticated/patrimonio")({
  head: () => ({ meta: [{ title: "Patrimonio · Plata" }] }),
  component: Patrimonio,
});

function Patrimonio() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";

  const fetchDolares = useServerFn(getDolares);

  const { data } = useQuery({
    queryKey: ["patrimonio", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [activos, compras, ventas, dividendos, inm, pres] = await Promise.all([
        supabase.from("inversiones_activos").select("*").eq("activo", true),
        supabase.from("inversiones_compras").select("*"),
        supabase.from("inversiones_ventas").select("*"),
        supabase.from("inversiones_dividendos").select("*"),
        supabase.from("inmuebles").select("valor_estimado,deuda_asociada,moneda").eq("activo", true),
        supabase.from("prestamos").select("cuota_mensual,cuotas_totales,cuotas_pagadas").eq("activo", true),
      ]);
      return {
        invActivos: (activos.data ?? []) as Activo[],
        invCompras: (compras.data ?? []) as Compra[],
        invVentas: (ventas.data ?? []) as Venta[],
        invDividendos: (dividendos.data ?? []) as Dividendo[],
        inmuebles: inm.data ?? [],
        prestamos: pres.data ?? [],
      };
    },
  });

  const { data: dolar } = useQuery({
    queryKey: ["dolares"],
    queryFn: () => fetchDolares(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const tc = dolar?.mep ?? dolar?.ccl ?? dolar?.blue ?? 1000;

  const totals = useMemo(() => {
    const inversiones = data
      ? computeBalance(data.invActivos, data.invCompras, data.invVentas, data.invDividendos, tc).reduce((s, r) => s + r.valorARS, 0)
      : 0;
    const inmuebles = (data?.inmuebles ?? []).reduce((s: number, i: any) => s + Number(i.valor_estimado || 0), 0);
    const deudasInm = (data?.inmuebles ?? []).reduce((s: number, i: any) => s + Number(i.deuda_asociada || 0), 0);
    const deudasPres = (data?.prestamos ?? []).reduce((s: number, p: any) => s + (Number(p.cuota_mensual || 0) * Math.max(0, Number(p.cuotas_totales || 0) - Number(p.cuotas_pagadas || 0))), 0);
    const deudas = deudasInm + deudasPres;
    return { inversiones, inmuebles, deudas, neto: inversiones + inmuebles - deudas };
  }, [data, tc]);

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
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Inversiones</div><div className="num text-2xl font-bold mt-2">{formatMoney(totals.inversiones, currency)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Inmuebles</div><div className="num text-2xl font-bold mt-2">{formatMoney(totals.inmuebles, currency)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground uppercase">Deudas</div><div className="num text-2xl font-bold mt-2 text-destructive">{formatMoney(totals.deudas, currency)}</div></Card>
        <Card className="p-5 border-primary/40"><div className="text-xs text-muted-foreground uppercase">Patrimonio neto</div><div className={`num text-2xl font-bold mt-2 ${totals.neto >= 0 ? "text-success" : "text-destructive"}`}>{formatMoney(totals.neto, currency)}</div></Card>
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
                <Tooltip formatter={(v: any) => formatMoney(Number(v), currency)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
