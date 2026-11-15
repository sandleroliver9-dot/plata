import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { formatMoney } from "@/lib/finance";
import { financialDataQuery, usePortfolioValue } from "@/lib/supabase-queries";
import { PLATIUM_CARD, PLATIUM_PAGE_TITLE, PLATIUM_PAGE_SUBTITLE, PLATIUM_LABEL } from "@/components/app/platium-ui";

export const Route = createFileRoute("/_authenticated/patrimonio")({
  head: () => ({ meta: [{ title: "Patrimonio · Platium" }] }),
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
  const { valorARS: inversionesValor, valorUSD: inversionesValorUSD, tc, tcIsFallback, warnings: portfolioWarnings } = usePortfolioValue(user?.id);

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
    // Nativo en USD: inversiones ya se trackean en dólares (valorUSD del
    // portfolio, no una conversión); inmuebles/deudas solo lo que esté
    // puntualmente cargado en USD, sin convertir lo que está en pesos.
    const inmueblesUSD = (data?.inmuebles ?? []).filter((i: any) => i.moneda === "USD").reduce((s: number, i: any) => s + Number(i.valor_estimado || 0), 0);
    const deudasUSD = (data?.inmuebles ?? []).filter((i: any) => i.moneda === "USD").reduce((s: number, i: any) => s + Number(i.deuda_asociada || 0), 0);
    return {
      inversiones, inmuebles, deudas, neto: inversiones + inmuebles - deudas,
      inversionesUSD: inversionesValorUSD, inmueblesUSD, deudasUSD, netoUSD: inversionesValorUSD + inmueblesUSD - deudasUSD,
    };
  }, [data, inversionesValor, inversionesValorUSD, tc]);

  const pieData = [
    { name: "Inversiones", value: totals.inversiones, color: "#20376b" },
    { name: "Inmuebles", value: totals.inmuebles, color: "#31a538" },
  ].filter(x => x.value > 0);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <header>
        <h1 className={PLATIUM_PAGE_TITLE}>Patrimonio neto</h1>
        <p className={`${PLATIUM_PAGE_SUBTITLE} mt-1`}>Activos menos pasivos.</p>
        {tcIsFallback && (
          <p className="text-xs text-warning mt-1">
            No se pudo obtener la cotización del dólar del día: los montos en inversiones usan un tipo de cambio de referencia y pueden no ser exactos.
          </p>
        )}
        {portfolioWarnings.length > 0 && (
          <p className="text-xs text-warning mt-1">
            {portfolioWarnings.length === 1 ? "Hay una venta" : `Hay ${portfolioWarnings.length} ventas`} de inversiones sin compra que la respalde — el total de Inversiones puede estar desactualizado. Revisalo en la sección Inversiones.
          </p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className={`${PLATIUM_CARD} p-5`}><div className={PLATIUM_LABEL}>Inversiones</div><div className="num text-2xl font-bold mt-2 text-[#20376b]">{formatMoney(totals.inversiones, displayCurrency)}</div></div>
        <div className={`${PLATIUM_CARD} p-5`}><div className={PLATIUM_LABEL}>Inmuebles</div><div className="num text-2xl font-bold mt-2 text-[#20376b]">{formatMoney(totals.inmuebles, displayCurrency)}</div></div>
        <div className={`${PLATIUM_CARD} p-5`}><div className={PLATIUM_LABEL}>Deudas</div><div className="num text-2xl font-bold mt-2 text-[#c7272b]">{formatMoney(totals.deudas, displayCurrency)}</div></div>
        <div className={`${PLATIUM_CARD} p-5 border-[#20376b]`}><div className={PLATIUM_LABEL}>Patrimonio neto</div><div className={`num text-2xl font-bold mt-2 ${totals.neto >= 0 ? "text-[#31a538]" : "text-[#c7272b]"}`}>{formatMoney(totals.neto, displayCurrency)}</div></div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className={`${PLATIUM_CARD} p-5`}><div className={PLATIUM_LABEL}>Inversiones (USD)</div><div className="num text-2xl font-bold mt-2 text-[#20376b]">{formatMoney(totals.inversionesUSD, "USD")}</div></div>
        <div className={`${PLATIUM_CARD} p-5`}><div className={PLATIUM_LABEL}>Inmuebles (USD)</div><div className="num text-2xl font-bold mt-2 text-[#20376b]">{formatMoney(totals.inmueblesUSD, "USD")}</div></div>
        <div className={`${PLATIUM_CARD} p-5`}><div className={PLATIUM_LABEL}>Deudas (USD)</div><div className="num text-2xl font-bold mt-2 text-[#c7272b]">{formatMoney(totals.deudasUSD, "USD")}</div></div>
        <div className={`${PLATIUM_CARD} p-5 border-[#20376b]`}><div className={PLATIUM_LABEL}>Patrimonio neto (USD)</div><div className={`num text-2xl font-bold mt-2 ${totals.netoUSD >= 0 ? "text-[#31a538]" : "text-[#c7272b]"}`}>{formatMoney(totals.netoUSD, "USD")}</div></div>
      </div>

      {pieData.length > 0 && (
        <div className={`${PLATIUM_CARD} p-5`}>
          <h3 className="font-semibold text-[13px] text-[#20376b] mb-4">Distribución de activos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatMoney(Number(v), displayCurrency)} contentStyle={{ background: "#fff", border: "1px solid #d9d9d9", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
