import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Eye, EyeOff, Info, Sparkles, AlertTriangle, ChevronRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Progress } from "@/components/ui/progress";
import { formatMoney, formatCompact, convertAmount, currentCalendarMonthLabel, currentFinancialMonth, formatFinancialPeriodRange, installmentForFinancialMonth, listFinancialMonths, financialScore, smartMessage } from "@/lib/finance";
import { DolarWidget } from "@/components/app/dolar-widget";
import { getSavingTargetPercent, detectUnusualSpending, isCardInstallmentRecorded } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { useDolarTC } from "@/lib/supabase-queries";

const cardClass = "bg-white border border-[#d9d9d9] rounded-[11px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)] p-4";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Resumen · Platium" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const payDay = profile?.pay_day ?? 1;
  // `mes` sigue siendo el período financiero anclado al día de cobro (con el
  // que se agrupan y suman ingresos/gastos: eso NO cambia acá). Lo que cambia
  // es el título: mostrarle al usuario el nombre del período financiero (que
  // puede seguir siendo "mayo" en pleno junio, hasta el próximo cobro) leía
  // como que la app estaba atrasada. El saludo ahora siempre dice el mes
  // calendario real de hoy; el subtítulo aclara qué período de cobro se está
  // sumando por si no coincide.
  const mes = currentFinancialMonth(payDay);
  const headerMes = currentCalendarMonthLabel();
  const periodoRango = payDay > 1 && mes !== headerMes ? formatFinancialPeriodRange(mes, payDay) : null;
  const currency = profile?.currency ?? "ARS";
  const meses6 = listFinancialMonths(payDay, 5, 0);

  const { tc } = useDolarTC();

  const { data: movs } = useQuery({
    queryKey: ["dashboard", user?.id, meses6.join(",")],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimientos")
        .select("tipo, monto, moneda, categoria, mes_financiero, descripcion, fecha, medio, es_cuota, cuota_origen_id, tarjeta")
        .in("mes_financiero", meses6)
        .eq("activo", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cuotasActivas } = useQuery({
    queryKey: ["tarjetas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarjetas_cuotas")
        .select("id, tarjeta, compra, valor_cuota, cuota_actual, cuotas_totales, inicio")
        .eq("activo", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: gastosFijos } = useQuery({
    queryKey: ["gastos-fijos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gastos_fijos")
        .select("id, gasto, monto_mensual, categoria, medio, moneda")
        .eq("activo", true);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: ingresosCargados } = useQuery({
    queryKey: ["ingresos", user?.id, meses6.join(",")],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingresos")
        .select("id, user_id, concepto, tipo, monto, moneda, fecha_cobro, mes_financiero, activo")
        .eq("user_id", user!.id)
        .eq("activo", true)
        .in("mes_financiero", meses6);

      if (error) throw error;
      if (import.meta.env.DEV) {
        console.log("[dashboard] ingresosCargados", {
          userId: user!.id,
          mes,
          count: data?.length ?? 0,
          rows: data ?? [],
        });
      }
      return data ?? [];
    },
  });


  const { ingresos, gastos, balance, ingresosUSD, gastosUSD, topCats, serie, anomalias, pctIngresos, pctGastos, mesAnteriorLabel } = useMemo(() => {
    // Cualquier movimiento (Gasto o Ingreso) puede traer su propia `moneda`
    // (ej: sueldo en USD, un gasto en dólares) y se normaliza acá a
    // `currency` antes de sumar nada. convertAmount es un no-op cuando la
    // fila ya está en la moneda destino, así que esto es seguro para todo.
    // Importante: también pisamos `moneda` a `currency` acá, si no la fila
    // queda con `monto` ya convertido pero `moneda` todavía apuntando a la
    // original — y cualquier convertAmount() más adelante (ej. dentro de
    // detectUnusualSpending) la volvería a convertir por segunda vez.
    // montoOriginal/monedaOriginal se guardan aparte (sin tocar) para poder
    // mostrar el total "nativo" en USD más abajo: NO es el total convertido
    // a dólares (eso dolarizaría también lo que está en pesos), es la suma
    // de lo que el usuario efectivamente cargó en dólares.
    const movsConCuotas: any[] = (movs ?? []).map((m: any) =>
      ({ ...m, montoOriginal: Number(m.monto), monedaOriginal: m.moneda, monto: convertAmount(Number(m.monto), m.moneda, currency, tc), moneda: currency }),
    );
    (cuotasActivas ?? []).forEach((c) => {
      meses6.forEach((m) => {
        const cuotaDelMes = installmentForFinancialMonth({
          inicio: c.inicio,
          cuotaActual: Number(c.cuota_actual),
          cuotasTotales: Number(c.cuotas_totales),
          mesFinanciero: m,
          payDay,
        });
        if (!cuotaDelMes) return;
        if (isCardInstallmentRecorded(movsConCuotas, m, { tarjeta: c.tarjeta, compra: c.compra, cuotaOrigenId: c.id })) return;
        movsConCuotas.push({
          tipo: "Gasto",
          monto: Number(c.valor_cuota),
          categoria: "Tarjeta",
          mes_financiero: m,
          descripcion: `${c.compra} (cuota ${cuotaDelMes}/${c.cuotas_totales})`,
          fecha: c.inicio,
          medio: "Crédito",
          es_cuota: true,
          cuota_origen_id: c.id,
          tarjeta: c.tarjeta,
        });
      });
    });
    // Ingresos cargados: agregar al mes correspondiente
    (ingresosCargados ?? []).forEach((ingreso: any) => {
      const concepto = String(ingreso.concepto ?? "").toLowerCase();
      // movsConCuotas ya tiene sus "Ingreso" convertidos a `currency` (arriba):
      // comparar acá contra el monto ya convertido, no el crudo, para que el
      // chequeo de duplicado siga funcionando con monedas mixtas.
      const monto = convertAmount(Number(ingreso.monto ?? 0), ingreso.moneda, currency, tc);
      const mesIngreso = String(ingreso.mes_financiero ?? "");
      const yaExiste = movsConCuotas.some((mov) => {
        if (mov.tipo !== "Ingreso") return false;
        if (String(mov.mes_financiero ?? "") !== mesIngreso) return false;
        const mismoConcepto = String(mov.descripcion ?? "").toLowerCase() === concepto;
        const mismoMonto = Math.abs(Number(mov.monto ?? 0) - monto) < 0.01;
        return mismoConcepto && mismoMonto;
      });
      if (yaExiste) return;

      movsConCuotas.push({
        tipo: "Ingreso",
        monto,
        montoOriginal: Number(ingreso.monto ?? 0),
        monedaOriginal: ingreso.moneda,
        categoria: ingreso.tipo ?? "Ingreso",
        mes_financiero: ingreso.mes_financiero,
        descripcion: ingreso.concepto,
        fecha: ingreso.fecha_cobro,
        es_cuota: false,
        cuota_origen_id: null,
        tarjeta: null,
        medio: null,
      });
    });
    // Gastos fijos: agregar al mes actual
    (gastosFijos ?? []).forEach((g) => {
      // movsConCuotas ya tiene sus montos convertidos a `currency` (arriba):
      // comparar acá contra el monto ya convertido, no el crudo, para que el
      // chequeo de duplicado siga funcionando con monedas mixtas.
      const montoConvertido = convertAmount(Number(g.monto_mensual), (g as any).moneda, currency, tc);
      const yaExiste = movsConCuotas.some((mov) => {
        if (mov.tipo !== "Gasto" || mov.mes_financiero !== mes) return false;
        return (mov.descripcion ?? "").toLowerCase() === g.gasto.toLowerCase() && Number(mov.monto) === montoConvertido;
      });
      if (yaExiste) return;
      movsConCuotas.push({
        tipo: "Gasto",
        monto: montoConvertido,
        montoOriginal: Number(g.monto_mensual),
        monedaOriginal: (g as any).moneda,
        moneda: currency,
        categoria: g.categoria ?? "Fijo",
        mes_financiero: mes,
        descripcion: g.gasto,
        fecha: mes,
        es_cuota: false,
        cuota_origen_id: null,
        tarjeta: null,
        medio: g.medio,
      });
    });

    const enMes = movsConCuotas.filter(m => m.mes_financiero === mes);
    const ingresos = enMes.filter(m => m.tipo === "Ingreso").reduce((s, m) => s + Number(m.monto), 0);
    const gastos = enMes.filter(m => m.tipo === "Gasto").reduce((s, m) => s + Number(m.monto), 0);
    // Total nativo en USD: solo lo que se cargó en dólares, sin convertir
    // nada de lo que está en pesos. Da $0 si no hay nada cargado en USD.
    const ingresosUSD = enMes.filter(m => m.tipo === "Ingreso" && m.monedaOriginal === "USD").reduce((s, m) => s + Number(m.montoOriginal ?? 0), 0);
    const gastosUSD = enMes.filter(m => m.tipo === "Gasto" && m.monedaOriginal === "USD").reduce((s, m) => s + Number(m.montoOriginal ?? 0), 0);

    // Top categorías (mes)
    const catMap = new Map<string, number>();
    enMes.filter(m => m.tipo === "Gasto").forEach(m => {
      const k = m.categoria ?? "Sin categoría";
      catMap.set(k, (catMap.get(k) ?? 0) + Number(m.monto));
    });
    const topCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Serie 6 meses
    const serie = meses6.map(m => {
      const items = movsConCuotas.filter(x => x.mes_financiero === m);
      return {
        mes: m.split(" ")[0],
        ingresos: items.filter(x => x.tipo === "Ingreso").reduce((s, x) => s + Number(x.monto), 0),
        gastos: items.filter(x => x.tipo === "Gasto").reduce((s, x) => s + Number(x.monto), 0),
      };
    });

    // Gastos fuera de patron: misma logica centralizada que usa Alertas
    // (detectUnusualSpending), que compara el promedio MENSUAL historico por
    // categoria contra el total del mes actual. Antes esta pantalla tenia su
    // propia copia que promediaba por TRANSACCION individual (unidades
    // distintas), disparando falsos positivos en categorias con muchas
    // compras chicas.
    const anomalias = detectUnusualSpending(movsConCuotas, profile, preferences, tc)
      .slice(0, 3)
      .map((u) => ({ cat: u.categoria, monto: u.monto }));

    // Comparación vs. el mes anterior (sobre `currency`, el penúltimo punto de
    // `serie`): solo tiene sentido en la vista nativa ARS, igual que
    // `ahorroPct` más abajo — en USD no hay una serie histórica nativa armada.
    const prevIngresos = serie.length >= 2 ? serie[serie.length - 2].ingresos : 0;
    const prevGastos = serie.length >= 2 ? serie[serie.length - 2].gastos : 0;
    const pctIngresos = prevIngresos > 0 ? ((ingresos - prevIngresos) / prevIngresos) * 100 : null;
    const pctGastos = prevGastos > 0 ? ((gastos - prevGastos) / prevGastos) * 100 : null;
    const mesAnteriorLabel = meses6.length >= 2 ? meses6[meses6.length - 2] : null;

    return { ingresos, gastos, balance: ingresos - gastos, ingresosUSD, gastosUSD, topCats, serie, anomalias, pctIngresos, pctGastos, mesAnteriorLabel };
  }, [movs, cuotasActivas, gastosFijos, ingresosCargados, mes, meses6, profile, preferences, currency, tc]);

  const overdraft = Number(profile?.overdraft_allowed ?? 0);
  const score = financialScore(ingresos, gastos, overdraft);
  const mensaje = smartMessage(ingresos, gastos, overdraft, payDay);
  const ahorroPct = ingresos > 0 ? (balance / ingresos) * 100 : 0;
  const ahorroObjetivo = getSavingTargetPercent(profile);
  const topMax = topCats[0]?.[1] ?? 0;
  const balanceUSD = ingresosUSD - gastosUSD;

  // Toggle ARS/USD del balance: SIEMPRE nativo, nunca convertido — cambiar a
  // "USD" muestra lo que efectivamente está cargado en dólares (0 si no hay
  // nada), nunca el balance en pesos "traducido" a dólares. Ya nos pasamos
  // mostrando una conversión sin querer (ver dashboard.tsx history) y
  // confundía: parecía plata en dólares que el usuario no tiene.
  const [monedaVista, setMonedaVista] = useState<"ARS" | "USD">("ARS");
  const [hideBalance, setHideBalance] = useState(false);
  const vista = monedaVista === "ARS"
    ? { moneda: currency, ingresos, gastos, balance, subtitle: `${ahorroPct >= 0 ? "+" : ""}${ahorroPct.toFixed(0)}% de ahorro · objetivo ${ahorroObjetivo}%` }
    : { moneda: "USD", ingresos: ingresosUSD, gastos: gastosUSD, balance: balanceUSD, subtitle: undefined };

  // vs. mes anterior solo tiene sentido comparando contra una serie histórica
  // real (la vista ARS nativa); en USD no mostramos esta comparación.
  const pctIngresosVisible = monedaVista === "ARS" ? pctIngresos : null;
  const pctGastosVisible = monedaVista === "ARS" ? pctGastos : null;

  return (
    <div className="bg-white -m-4 p-4 pb-36 md:-m-8 md:p-8 min-h-full space-y-4 font-plus-jakarta">
      <header>
        <p className="text-[16px] text-[#20376b]">Hola{profile?.display_name ? `, ${profile.display_name}` : ""} 👋</p>
        <h1 className="text-[18px] font-bold text-[#20376b] mt-1">Tu resumen de {headerMes}</h1>
        {periodoRango && (
          <p className="text-xs text-[#8e8e88] mt-1">Incluye tus movimientos desde tu último cobro ({periodoRango}), hasta el próximo</p>
        )}
      </header>

      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-wider text-[#8e8e88] uppercase">Balance disponible</span>
          <button onClick={() => setHideBalance((v) => !v)} aria-label={hideBalance ? "Mostrar balance" : "Ocultar balance"}>
            {hideBalance ? <EyeOff className="size-4 text-[#8e8e88]" /> : <Eye className="size-4 text-[#8e8e88]" />}
          </button>
        </div>
        <div className="flex items-end justify-between mt-2 gap-3">
          <div className="min-w-0">
            <div className="num text-2xl font-bold text-[#20376b]">{hideBalance ? "••••••" : formatMoney(vista.balance, vista.moneda)}</div>
            {vista.subtitle && <div className={`text-xs mt-1 ${vista.balance >= 0 ? "text-success" : "text-destructive"}`}>{vista.subtitle}</div>}
          </div>
          <div className="flex flex-col rounded-[11px] overflow-hidden border border-[#d9d9d9] text-[11px] shrink-0">
            <button onClick={() => setMonedaVista("ARS")} className={`px-3 py-1 ${monedaVista === "ARS" ? "bg-[#20376b] text-white" : "text-[#8e8e88]"}`}>ARS</button>
            <button onClick={() => setMonedaVista("USD")} className={`px-3 py-1 ${monedaVista === "USD" ? "bg-[#20376b] text-white" : "text-[#8e8e88]"}`}>USD</button>
          </div>
        </div>
        {monedaVista === "USD" && ingresosUSD === 0 && gastosUSD === 0 && (
          <p className="text-xs text-[#8e8e88] mt-2">No tenés nada cargado en dólares este mes — por eso da $0, no es una conversión.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <div className="flex items-center justify-between text-[11px] tracking-wider text-[#8e8e88] uppercase">
            <span>Ingresos</span>
            <TrendingUp className="size-4 text-success" />
          </div>
          <div className="num text-xl font-bold text-[#20376b] mt-2">{formatMoney(vista.ingresos, vista.moneda)}</div>
          {pctIngresosVisible !== null && mesAnteriorLabel && (
            <div className={`text-xs mt-1 ${pctIngresosVisible >= 0 ? "text-success" : "text-destructive"}`}>
              {pctIngresosVisible >= 0 ? "+" : ""}{pctIngresosVisible.toFixed(0)}% vs. {mesAnteriorLabel}
            </div>
          )}
        </div>
        <div className={cardClass}>
          <div className="flex items-center justify-between text-[11px] tracking-wider text-[#8e8e88] uppercase">
            <span>Gastos</span>
            <TrendingDown className="size-4 text-destructive" />
          </div>
          <div className="num text-xl font-bold text-[#20376b] mt-2">{formatMoney(vista.gastos, vista.moneda)}</div>
          {pctGastosVisible !== null && mesAnteriorLabel && (
            <div className={`text-xs mt-1 ${pctGastosVisible <= 0 ? "text-success" : "text-destructive"}`}>
              {pctGastosVisible >= 0 ? "+" : ""}{pctGastosVisible.toFixed(0)}% vs. {mesAnteriorLabel}
            </div>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold text-[#20376b] uppercase tracking-wide">Evolución de ingresos y gastos</h3>
          <span className="text-xs text-[#8e8e88]">6 meses</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={serie}>
              <defs>
                <linearGradient id="ingresosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gastosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="mes" stroke="#8e8e88" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8e8e88" fontSize={11} tickFormatter={(v) => formatCompact(v, currency)} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #d9d9d9", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => formatMoney(Number(v), currency)}
              />
              <Area type="monotone" dataKey="ingresos" stroke="var(--success)" strokeWidth={2} fill="url(#ingresosGrad)" dot={{ r: 3 }} />
              <Area type="monotone" dataKey="gastos" stroke="var(--destructive)" strokeWidth={2} fill="url(#gastosGrad)" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 justify-center text-xs">
          <span className="flex items-center gap-1.5 text-[#8e8e88]"><span className="size-2 rounded-full bg-[var(--success)]" /> Ingresos</span>
          <span className="flex items-center gap-1.5 text-[#8e8e88]"><span className="size-2 rounded-full bg-[var(--destructive)]" /> Gastos</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <div className="flex items-center gap-1 text-[11px] tracking-wider text-[#8e8e88] uppercase mb-2">
            <span>Score financiero</span>
            <Info className="size-3" />
          </div>
          <div className="text-2xl font-bold text-[#20376b]">
            {score.score}<span className="text-sm text-[#8e8e88] font-normal"> / 100</span>
          </div>
          <Progress value={score.score} className="mt-2 h-1.5 bg-[#d9d9d9]" indicatorClassName="bg-[#20376b]" />
          <p className={`text-xs mt-2 flex items-start gap-1.5 ${score.tone === "success" ? "text-success" : score.tone === "warning" ? "text-warning" : "text-destructive"}`}>
            <Sparkles className="size-3.5 mt-0.5 shrink-0" />
            <span>{score.label}</span>
          </p>
        </div>

        <div className={cardClass}>
          <h3 className="text-[11px] tracking-wider text-[#8e8e88] uppercase mb-2">Top categorías de gasto</h3>
          {topCats.length === 0 ? (
            <p className="text-xs text-[#8e8e88] py-4 text-center">Sin gastos este mes.</p>
          ) : (
            <div className="space-y-2">
              {topCats.slice(0, 3).map(([cat, monto]) => (
                <div key={cat}>
                  <div className="flex justify-between text-[11px] text-[#111] gap-1">
                    <span className="truncate">{cat}</span>
                    <span className="num font-medium shrink-0">{formatMoney(monto, currency)}</span>
                  </div>
                  <div className="h-1.5 bg-[#d9d9d9] rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-[#20376b]" style={{ width: `${topMax > 0 ? (monto / topMax) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {topCats.length > 3 && (
            <button onClick={() => navigate({ to: "/movimientos" })} className="text-[11px] text-[#20376b] mt-2 flex items-center gap-0.5">
              Ver todas <ChevronRight className="size-3" />
            </button>
          )}
        </div>
      </div>

      <DolarWidget />

      {anomalias.length > 0 && (
        <div className="bg-white border border-warning/40 bg-warning/5 rounded-[11px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-5 text-warning" />
            <h3 className="font-semibold text-[#20376b]">Gastos fuera de tu patrón</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {anomalias.map((a, i) => (
              <li key={i} className="flex justify-between">
                <span className="font-medium text-[#20376b]">{a.cat}</span>
                <span className="num font-semibold text-warning">{formatMoney(a.monto, currency)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
