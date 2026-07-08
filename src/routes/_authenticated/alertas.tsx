import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, TrendingDown, Wallet, CircleCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, todayISO } from "@/lib/finance";
import { buildUpcomingEvents, daysUntil, detectUnusualSpending, getMonthlyCashflow } from "@/lib/financial-centers";
import { riskProfileSettings, useFinancialPreferences } from "@/lib/financial-preferences";
import { financialDataQuery } from "@/lib/supabase-queries";

export const Route = createFileRoute("/_authenticated/alertas")({
  head: () => ({ meta: [{ title: "Alertas · Plata" }] }),
  component: AlertasPage,
});

type Alert = {
  title: string;
  message: string;
  tone: "destructive" | "warning" | "default";
  icon: typeof AlertTriangle;
};

function AlertasPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const currency = profile?.currency ?? "ARS";

  const { data, isLoading } = useQuery(financialDataQuery(user?.id));

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
  });
  const unusual = detectUnusualSpending(data?.movimientos, profile, preferences);
  const sensitivity = riskProfileSettings(preferences.riskProfile);

  const alerts: Alert[] = [];

  // buildUpcomingEvents descarta eventos con fecha pasada (solo mira "proximos
  // N dias"), asi que un vencimiento manual ya vencido y no pagado -el caso
  // mas urgente- no generaba ninguna alerta acá aunque sí aparecía como
  // "vencido" en la pantalla de Vencimientos.
  const todayIso = todayISO();
  (data?.vencimientos ?? [])
    .filter((v: any) => !v.pagado && v.fecha < todayIso)
    .slice(0, 4)
    .forEach((v: any) => {
      alerts.push({
        title: "Pago vencido",
        message: `${v.concepto} venció el ${v.fecha} y todavía no está marcado como pagado (${formatMoney(Number(v.monto), currency)}).`,
        tone: "destructive",
        icon: CalendarClock,
      });
    });

  upcoming
    .filter((event) => event.type !== "cobro" && daysUntil(event.date) <= sensitivity.alertDays)
    .slice(0, 4)
    .forEach((event) => {
      const days = daysUntil(event.date);
      alerts.push({
        title: days <= 1 ? "Pago muy próximo" : "Pago próximo",
        message: `${event.title} vence ${days <= 0 ? "hoy" : `en ${days} días`} por ${formatMoney(event.amount, currency)}.`,
        tone: days <= 1 ? "destructive" : "warning",
        icon: CalendarClock,
      });
    });

  const nextIncome = upcoming.find((event) => event.type === "cobro");
  if (nextIncome) {
    // cash.disponible ya descuenta las cuotas de tarjeta/prestamo y los
    // gastos fijos pendientes de TODO el mes financiero (getMonthlyCashflow).
    // Sumar de nuevo esos mismos eventos (type "cuota"/"prestamo"/"gasto_fijo")
    // acá duplicaba el descuento. Los unicos eventos que no estan reflejados
    // en cash.disponible son los vencimientos manuales, asi que son los
    // unicos que hay que restar para esta alerta especifica.
    const paymentsBeforeIncome = upcoming
      .filter((event) => event.type === "vencimiento" && event.date <= nextIncome.date)
      .reduce((sum, event) => sum + Number(event.amount), 0);
    const remainingBeforeIncome = cash.disponible - paymentsBeforeIncome;
    if (paymentsBeforeIncome > 0 && cash.ingresos > 0 && remainingBeforeIncome < cash.ingresos * sensitivity.liquidityRatio) {
      alerts.push({
        title: "Liquidez antes del proximo cobro",
        message: `Antes de ${nextIncome.title.toLowerCase()} tenes pagos por ${formatMoney(paymentsBeforeIncome, currency)}. Disponible estimado: ${formatMoney(remainingBeforeIncome, currency)}.`,
        tone: remainingBeforeIncome < 0 ? "destructive" : "warning",
        icon: Wallet,
      });
    }
  }

  unusual.slice(0, 3).forEach((item) => {
    alerts.push({
      title: "Gasto inusual",
      message: `${item.categoria} está por encima de tu patrón: ${formatMoney(item.monto, currency)} este mes.`,
      tone: "warning",
      icon: TrendingDown,
    });
  });

  if (cash.ingresoBase > 0 && cash.ingresoRegistrado <= 0) {
    alerts.push({
      title: "Ingreso faltante",
      message: `Todavía no registraste el sueldo de ${cash.mes}. Proyectamos ${formatMoney(cash.ingresoBase, currency)} como referencia.`,
      tone: "warning",
      icon: Wallet,
    });
  }

  if (cash.ingresos > 0 && cash.ahorroEstimado < cash.objetivoAhorro) {
    alerts.push({
      title: "Ahorro debajo del objetivo",
      message: `Tu ahorro estimado es ${formatMoney(cash.ahorroEstimado, currency)} y el objetivo es ${formatMoney(cash.objetivoAhorro, currency)}.`,
      tone: cash.ahorroEstimado < 0 ? "destructive" : "warning",
      icon: AlertTriangle,
    });
  }

  if (cash.disponible < 0 || (cash.ingresos > 0 && cash.disponible / cash.ingresos < sensitivity.liquidityRatio)) {
    alerts.push({
      title: "Liquidez baja",
      message: `Disponible estimado: ${formatMoney(cash.disponible, currency)} para ${cash.mes}.`,
      tone: cash.disponible < 0 ? "destructive" : "warning",
      icon: Wallet,
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
        <p className="text-sm text-muted-foreground mt-1">Advertencias financieras simples según tus datos actuales.</p>
      </header>

      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Estado del mes</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Metric label="Ingresos" value={formatMoney(cash.ingresos, currency)} />
          <Metric label="Gastos estimados" value={formatMoney(cash.gastos, currency)} />
          <Metric label="Disponible" value={formatMoney(cash.disponible, currency)} tone={cash.disponible < 0 ? "text-destructive" : "text-success"} />
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-10 text-center text-muted-foreground">Cargando alertas...</Card>
      ) : alerts.length === 0 ? (
        <Card className="p-10 text-center">
          <CircleCheck className="size-10 mx-auto text-success mb-3" />
          <p className="font-medium">Todavía no hay alertas</p>
          <p className="text-sm text-muted-foreground mt-1">Cuando detectemos vencimientos, gastos inusuales o liquidez baja, van a aparecer acá.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <Card key={`${alert.title}-${index}`} className={`p-4 ${alert.tone === "destructive" ? "border-destructive/40 bg-destructive/5" : alert.tone === "warning" ? "border-warning/40 bg-warning/5" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${alert.tone === "destructive" ? "text-destructive" : alert.tone === "warning" ? "text-warning" : "text-primary"}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold">{alert.title}</h2>
                      <Badge variant={alert.tone === "destructive" ? "destructive" : "secondary"}>{alert.tone === "destructive" ? "Urgente" : "Atención"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`num text-xl font-bold mt-1 ${tone}`}>{value}</div>
    </div>
  );
}
