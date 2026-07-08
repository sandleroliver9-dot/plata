import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getDolares } from "@/lib/quotes.functions";
import { computeBalance, type Activo, type Compra, type Venta, type Dividendo } from "@/lib/portfolio";
import { resolveTC } from "@/lib/finance";

/**
 * Datos base compartidos por Alertas, Insights, Proyecciones, Calendario financiero
 * y Configuración: todas leen el mismo puñado de tablas directo desde Supabase
 * (no pasan por el backend). Una sola query key evita que cada pantalla vuelva a
 * pedir lo mismo al navegar entre ellas.
 */
export const financialDataQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["financial-data", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [movimientos, ingresos, fijos, tarjetas, prestamos, vencimientos, inmuebles] = await Promise.all([
        supabase.from("movimientos").select("*").eq("activo", true).order("fecha", { ascending: false }).limit(200),
        supabase.from("ingresos").select("id,concepto,monto,fecha_cobro,tipo,activo").eq("activo", true).order("fecha_cobro", { ascending: false }).limit(80),
        supabase.from("gastos_fijos").select("*").eq("activo", true),
        supabase.from("tarjetas_cuotas").select("*").eq("activo", true),
        supabase.from("prestamos").select("*").eq("activo", true),
        supabase.from("vencimientos").select("*").order("fecha", { ascending: true }),
        supabase.from("inmuebles").select("valor_estimado,deuda_asociada,moneda").eq("activo", true),
      ]);
      return {
        movimientos: movimientos.data ?? [],
        ingresos: ingresos.data ?? [],
        fijos: fijos.data ?? [],
        tarjetas: tarjetas.data ?? [],
        prestamos: prestamos.data ?? [],
        vencimientos: vencimientos.data ?? [],
        inmuebles: inmuebles.data ?? [],
      };
    },
  });

const portfolioRawQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["portfolio-raw", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [activos, compras, ventas, dividendos] = await Promise.all([
        supabase.from("inversiones_activos").select("*").eq("activo", true),
        supabase.from("inversiones_compras").select("*"),
        supabase.from("inversiones_ventas").select("*"),
        supabase.from("inversiones_dividendos").select("*"),
      ]);
      return {
        activos: (activos.data ?? []) as Activo[],
        compras: (compras.data ?? []) as Compra[],
        ventas: (ventas.data ?? []) as Venta[],
        dividendos: (dividendos.data ?? []) as Dividendo[],
      };
    },
  });

/**
 * Valor actual de la cartera de inversiones, usado por Patrimonio e Insights.
 * Comparte la misma lógica de valuación (computeBalance) que la pantalla de Inversiones.
 */
export function usePortfolioValue(userId: string | undefined) {
  const fetchDolares = useServerFn(getDolares);

  const { data, isLoading } = useQuery(portfolioRawQuery(userId));

  const { data: dolar } = useQuery({
    queryKey: ["dolares"],
    queryFn: () => fetchDolares(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { tc, isFallback: tcIsFallback } = resolveTC(dolar);

  const { rows, warnings } = data
    ? computeBalance(data.activos, data.compras, data.ventas, data.dividendos, tc)
    : { rows: [], warnings: [] };
  const valorARS = rows.reduce((s, r) => s + r.valorARS, 0);
  const valorUSD = rows.reduce((s, r) => s + r.valorUSD, 0);

  return { rows, warnings, valorARS, valorUSD, tc, tcIsFallback, isLoading, hasActivos: (data?.activos.length ?? 0) > 0 };
}
