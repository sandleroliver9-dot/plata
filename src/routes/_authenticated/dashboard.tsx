import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, Sparkles, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatCompact, currentCalendarMonthLabel, currentFinancialMonth, formatFinancialPeriodRange, installmentForFinancialMonth, listFinancialMonths, financialScore, smartMessage } from "@/lib/finance";
import { DolarWidget } from "@/components/app/dolar-widget";
import { getSavingTargetPercent, detectUnusualSpending, isCardInstallmentRecorded } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Resumen · Platium" }] }),
  component: Dashboard,
});

function Dashboard() {
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

  const { data: movs } = useQuery({
    queryKey: ["dashboard", user?.id, meses6.join(",")],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimientos")
        .select("tipo, monto, categoria, mes_financiero, descripcion, fecha, medio, es_cuota, cuota_origen_id, tarjeta")
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
        .select("id, gasto, monto_mensual, categoria, medio")
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
        .select("id, user_id, concepto, tipo, monto, fecha_cobro, mes_financiero, activo")
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


  const { ingresos, gastos, balance, topCats, serie, anomalias } = useMemo(() => {
    const movsConCuotas = [...(movs ?? [])];
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
      const monto = Number(ingreso.monto ?? 0);
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
      const yaExiste = movsConCuotas.some((mov) => {
        if (mov.tipo !== "Gasto" || mov.mes_financiero !== mes) return false;
        return (mov.descripcion ?? "").toLowerCase() === g.gasto.toLowerCase() && Number(mov.monto) === Number(g.monto_mensual);
      });
      if (yaExiste) return;
      movsConCuotas.push({
        tipo: "Gasto",
        monto: Number(g.monto_mensual),
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
    const anomalias = detectUnusualSpending(movsConCuotas, profile, preferences)
      .slice(0, 3)
      .map((u) => ({ cat: u.categoria, monto: u.monto }));

    return { ingresos, gastos, balance: ingresos - gastos, topCats, serie, anomalias };
  }, [movs, cuotasActivas, gastosFijos, ingresosCargados, mes, meses6, profile, preferences]);

  const overdraft = Number(profile?.overdraft_allowed ?? 0);
  const score = financialScore(ingresos, gastos, overdraft);
  const mensaje = smartMessage(ingresos, gastos, overdraft, payDay);
  const ahorroPct = ingresos > 0 ? (balance / ingresos) * 100 : 0;
  const ahorroObjetivo = getSavingTargetPercent(profile);
  const topMax = topCats[0]?.[1] ?? 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Hola{profile?.display_name ? `, ${profile.display_name}` : ""} 👋</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Tu resumen de {headerMes}</h1>
        {periodoRango && (
          <p className="text-xs text-muted-foreground mt-1">Incluye tus movimientos desde tu último cobro ({periodoRango}), hasta el próximo</p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Ingresos" value={formatMoney(ingresos, currency)} icon={<TrendingUp className="size-5" />} tone="success" />
        <KpiCard label="Gastos" value={formatMoney(gastos, currency)} icon={<TrendingDown className="size-5" />} tone="destructive" />
        <KpiCard label="Balance" value={formatMoney(balance, currency)} icon={<Wallet className="size-5" />} tone={balance >= 0 ? "success" : "destructive"} subtitle={`${ahorroPct >= 0 ? "+" : ""}${ahorroPct.toFixed(0)}% de ahorro · objetivo ${ahorroObjetivo}%`} />
      </div>

      <Card className="p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-4">
          <div className={`size-16 rounded-full grid place-items-center font-bold text-2xl ${score.tone === "success" ? "bg-success/20 text-success" : score.tone === "warning" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}`}>
            {score.score}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Score financiero</h3>
              <Badge variant={score.tone === "success" ? "default" : "secondary"}>{score.label}</Badge>
            </div>
            <Progress value={score.score} className="mt-2 h-2" />
            <p className="text-sm text-muted-foreground mt-3 flex items-start gap-2">
              <Sparkles className="size-4 mt-0.5 text-primary shrink-0" />
              <span>{mensaje}</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Últimos 6 meses</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => formatCompact(v, currency)} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => formatMoney(Number(v), currency)}
                />
                <Bar dataKey="ingresos" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Top categorías de gasto</h3>
          {topCats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin gastos este mes.</p>
          ) : (
            <div className="space-y-3">
              {topCats.map(([cat, monto]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat}</span>
                    <span className="num font-medium">{formatMoney(monto, currency)}</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${topMax > 0 ? (monto / topMax) * 100 : 0}%`, background: "var(--gradient-primary)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <DolarWidget />


      {anomalias.length > 0 && (
        <Card className="p-5 border-warning/40 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-5 text-warning" />
            <h3 className="font-semibold">Gastos fuera de tu patrón</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {anomalias.map((a, i) => (
              <li key={i} className="flex justify-between">
                <span className="font-medium">{a.cat}</span>
                <span className="num font-semibold text-warning">{formatMoney(a.monto, currency)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon, tone, subtitle }: { label: string; value: string; icon: React.ReactNode; tone: "success" | "destructive" | "warning"; subtitle?: string }) {
  const toneClass = { success: "text-success", destructive: "text-destructive", warning: "text-warning" }[tone];
  return (
    <Card className="p-5 bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span className={toneClass}>{icon}</span>
      </div>
      <div className="num text-3xl font-bold mt-3 tracking-tight">{value}</div>
      {subtitle && <div className={`text-xs mt-1 ${toneClass}`}>{subtitle}</div>}
    </Card>
  );
}
