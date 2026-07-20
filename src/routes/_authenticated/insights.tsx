import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Lightbulb, TrendingUp, Wallet, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/finance";
import { buildUpcomingEvents, daysUntil, estimateNetWorth, getEmergencyFundSummary, getMonthlyCashflow, getSavingTargetPercent } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { financialDataQuery, usePortfolioValue } from "@/lib/supabase-queries";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights · Platium" }] }),
  component: InsightsPage,
});

type Insight = {
  title: string;
  value: string;
  message: string;
  icon: typeof Lightbulb;
  tone?: "success" | "warning" | "destructive";
};

function InsightsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const currency = profile?.currency ?? "ARS";

  const { data, isLoading } = useQuery(financialDataQuery(user?.id));
  const { valorARS: inversionesValor, tc, hasActivos, warnings: portfolioWarnings } = usePortfolioValue(user?.id);

  const cash = getMonthlyCashflow({
    profile,
    movimientos: data?.movimientos,
    ingresos: data?.ingresos,
    gastosFijos: data?.fijos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    preferences,
  });
  const upcoming = buildUpcomingEvents({
    profile,
    ingresos: data?.ingresos,
    vencimientos: data?.vencimientos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    gastosFijos: data?.fijos,
    horizonDays: 30,
    preferences,
  }).filter((event) => event.type !== "cobro");
  const allUpcoming = buildUpcomingEvents({
    profile,
    ingresos: data?.ingresos,
    vencimientos: data?.vencimientos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    gastosFijos: data?.fijos,
    horizonDays: 30,
    preferences,
  });
  const netWorth = estimateNetWorth({
    inversionesValor,
    inmuebles: data?.inmuebles,
    prestamos: data?.prestamos,
    tarjetas: data?.tarjetas,
    tc,
  });

  const fixedRatio = cash.ingresos > 0 ? (cash.gastosFijos / cash.ingresos) * 100 : 0;
  const savings = cash.ingresos - cash.gastos;
  const liquidityRatio = cash.ingresos > 0 ? cash.disponible / cash.ingresos : 0;
  const liquidityLabel = cash.disponible < 0 ? "riesgo" : liquidityRatio < 0.1 ? "atención" : "bueno";

  const savingTarget = getSavingTargetPercent(profile);
  const emergency = getEmergencyFundSummary(cash, preferences);
  const nextIncome = allUpcoming.find((event) => event.type === "cobro");
  const nextWeekPayments = upcoming.filter((event) => daysUntil(event.date) <= 7).reduce((sum, event) => sum + event.amount, 0);
  const nextMonthPayments = upcoming.reduce((sum, event) => sum + event.amount, 0);
  const weeklyConcentration = nextMonthPayments > 0 ? (nextWeekPayments / nextMonthPayments) * 100 : 0;

  const insights: Insight[] = [
    {
      title: "Gastos fijos",
      value: cash.ingresos > 0 ? `${fixedRatio.toFixed(0)}%` : "Sin ingresos",
      message: cash.ingresos > 0
        ? `De cada $100 que entran, $${fixedRatio.toFixed(0)} ya están comprometidos en gastos fijos (alquiler, servicios, etc.) de ${cash.mes}.`
        : "Cargá un ingreso o sueldo para ver este dato.",
      icon: TrendingUp,
      tone: fixedRatio > 50 ? "warning" : "success",
    },
    {
      title: "Lo que estás ahorrando",
      value: formatMoney(savings, currency),
      message: savings >= cash.objetivoAhorro
        ? `Vas bien: estás llegando a tu objetivo de ahorrar el ${savingTarget}%.`
        : `Todavía no llegás a tu objetivo de ahorrar el ${savingTarget}%.`,
      icon: Wallet,
      tone: savings < 0 ? "destructive" : savings < cash.objetivoAhorro ? "warning" : "success",
    },
    {
      title: "Colchón para imprevistos",
      value: `${emergency.coveredMonths.toFixed(1)} meses`,
      message: `Si dejaras de cobrar hoy, tenés para bancarte ${emergency.coveredMonths.toFixed(1)} meses. Te recomendamos tener guardado ${formatMoney(emergency.recommended, currency)} (para cubrir ${emergency.targetMonths} meses).`,
      icon: Wallet,
      tone: emergency.coveredMonths >= emergency.targetMonths ? "success" : emergency.coveredMonths >= emergency.targetMonths / 2 ? "warning" : "destructive",
    },
    {
      title: "Semana que viene",
      value: nextMonthPayments > 0 ? `${weeklyConcentration.toFixed(0)}%` : "Sin pagos",
      message: nextMonthPayments > 0
        ? `De todo lo que tenés para pagar en los próximos 30 días, el ${weeklyConcentration.toFixed(0)}% se te junta en los próximos 7.`
        : "No tenés pagos programados para los próximos 30 días.",
      icon: CalendarClock,
      tone: weeklyConcentration > 35 ? "warning" : "success",
    },
    {
      title: "Tu próximo cobro",
      value: nextIncome ? formatDate(nextIncome.date) : "Sin fecha",
      message: nextIncome
        ? `Cobrás el ${formatDate(nextIncome.date)}, por ${formatMoney(nextIncome.amount, currency)}.`
        : "Configurá cada cuánto cobrás para ver la próxima fecha.",
      icon: CalendarClock,
      tone: nextIncome ? "success" : "warning",
    },
    {
      title: "Pagos que se vienen",
      value: String(upcoming.length),
      message: upcoming.length === 0
        ? "No tenés ningún pago pendiente en los próximos 30 días."
        : `Tenés ${upcoming.length} pago${upcoming.length === 1 ? "" : "s"} pendiente${upcoming.length === 1 ? "" : "s"} en los próximos 30 días.`,
      icon: CalendarClock,
      tone: upcoming.length > 5 ? "warning" : "success",
    },
    {
      title: "Tu patrimonio",
      value: formatMoney(netWorth, currency),
      message: "Todo lo que tenés (propiedades e inversiones) menos lo que debés de préstamos.",
      icon: Building2,
      tone: netWorth < 0 ? "destructive" : "success",
    },
    {
      title: "Plata disponible",
      value: liquidityLabel,
      message: `Esto es lo que te queda libre para gastar en ${cash.mes}: ${formatMoney(cash.disponible, currency)}.`,
      icon: Lightbulb,
      tone: liquidityLabel === "riesgo" ? "destructive" : liquidityLabel === "atención" ? "warning" : "success",
    },
  ];

  const hasAnyData = Boolean(data && (
    data.movimientos.length || data.ingresos.length || data.fijos.length || data.tarjetas.length || data.prestamos.length || data.inmuebles.length || hasActivos
  ));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Mensajes automáticos simples generados con tus datos actuales.</p>
        {portfolioWarnings.length > 0 && (
          <p className="text-xs text-warning mt-1">
            {portfolioWarnings.length === 1 ? "Hay una venta" : `Hay ${portfolioWarnings.length} ventas`} de inversiones sin compra que la respalde — el valor de Inversiones puede estar desactualizado.
          </p>
        )}
      </header>

      {isLoading ? (
        <Card className="p-10 text-center text-muted-foreground">Calculando insights...</Card>
      ) : !hasAnyData ? (
        <Card className="p-10 text-center">
          <Lightbulb className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Todavía no hay insights</p>
          <p className="text-sm text-muted-foreground mt-1">Cargá ingresos, gastos o vencimientos para empezar a ver lecturas automáticas.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((insight) => {
            const Icon = insight.icon;
            const toneClass = insight.tone === "destructive" ? "text-destructive" : insight.tone === "warning" ? "text-warning" : "text-success";
            return (
              <Card key={insight.title} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{insight.title}</div>
                    <div className={`num text-2xl font-bold mt-2 ${toneClass}`}>{insight.value}</div>
                  </div>
                  <Icon className={`size-5 ${toneClass}`} />
                </div>
                <p className="text-sm text-muted-foreground mt-3">{insight.message}</p>
                {insight.tone && (
                  <Badge className="mt-4" variant={insight.tone === "destructive" ? "destructive" : "secondary"}>
                    {insight.tone === "success" ? "Bien" : insight.tone === "warning" ? "Atención" : "Riesgo"}
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  });
}
