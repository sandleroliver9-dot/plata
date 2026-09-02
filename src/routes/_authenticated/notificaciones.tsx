import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CalendarClock, TrendingDown, Wallet, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney, todayISO } from "@/lib/finance";
import { buildUpcomingEvents, computeSuggestedSalary, daysUntil, detectUnusualSpending, getMonthlyCashflow, hasSimilarMovement } from "@/lib/financial-centers";
import { riskProfileSettings, useFinancialPreferences } from "@/lib/financial-preferences";
import { getInflacion } from "@/lib/quotes.functions";
import { financialDataQuery, useDolarTC } from "@/lib/supabase-queries";

export const Route = createFileRoute("/_authenticated/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones · Platium" }] }),
  component: NotificacionesPage,
});

type Alert = {
  title: string;
  message: string;
  tone: "destructive" | "warning" | "default";
  icon: typeof AlertTriangle;
};

function NotificacionesPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const currency = profile?.currency ?? "ARS";

  const { data, isLoading } = useQuery(financialDataQuery(user?.id));
  const { tc } = useDolarTC();

  const fetchInflacion = useServerFn(getInflacion);
  const { data: infl } = useQuery({
    queryKey: ["inflacion-ar"],
    queryFn: () => fetchInflacion(),
    staleTime: 1000 * 60 * 60 * 6,
  });

  const cash = getMonthlyCashflow({
    profile,
    movimientos: data?.movimientos,
    ingresos: data?.ingresos,
    gastosFijos: data?.fijos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    preferences,
    tc,
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
    tc,
  });
  const unusual = detectUnusualSpending(data?.movimientos, profile, preferences, tc);
  const sensitivity = riskProfileSettings(preferences.riskProfile);

  // Total nativo en USD del mes de `cash`: solo lo cargado en dólares, sin
  // convertir lo que está en pesos. Da $0 si no hay nada en USD.
  const movsMesCash = (data?.movimientos ?? []).filter((m: any) => m.mes_financiero === cash.mes);
  const ingresosUSD = movsMesCash.filter((m: any) => m.tipo === "Ingreso" && m.moneda === "USD").reduce((s: number, m: any) => s + Number(m.monto ?? 0), 0);
  const gastosUSD = movsMesCash.filter((m: any) => m.tipo === "Gasto" && m.moneda === "USD").reduce((s: number, m: any) => s + Number(m.monto ?? 0), 0)
    + (data?.fijos ?? [])
      .filter((g: any) => g.moneda === "USD" && !hasSimilarMovement(movsMesCash, String(g.gasto ?? ""), Number(g.monto_mensual ?? 0), cash.mes))
      .reduce((s: number, g: any) => s + Number(g.monto_mensual ?? 0), 0);
  const disponibleUSD = ingresosUSD - gastosUSD;

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

  // El "Todavía no cobré" (abajo) marca esto en salary_reminder_dismissals
  // para el mes actual — se consulta acá para no seguir mostrando la tarjeta
  // (ni el cron seguir insistiendo por push/email, ver notifications.functions.ts)
  // una vez que el usuario ya dijo que no cobró.
  const { data: dismissRows } = useQuery({
    queryKey: ["salary-reminder-dismissal", user?.id, cash.mes],
    enabled: !!user && !!cash.mes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_reminder_dismissals")
        .select("mes_financiero")
        .eq("mes_financiero", cash.mes)
        .limit(1);
      if (error) throw error;
      return data ?? [];
    },
  });
  const dismissedThisMonth = (dismissRows?.length ?? 0) > 0;
  const ingresoFaltante = cash.ingresoBase > 0 && cash.ingresoRegistrado <= 0 && !dismissedThisMonth;

  const ultimoSueldo = (data?.ingresos ?? [])
    .filter((i: any) => String(i.tipo ?? "").toLowerCase() === "sueldo" && Number(i.monto) > 0)
    .sort((a: any, b: any) => String(b.fecha_cobro).localeCompare(String(a.fecha_cobro)))[0];
  const sugerido = computeSuggestedSalary({
    ultimoSueldo,
    profileSalary: profile?.salary,
    profileCurrency: profile?.currency,
    inflacionPct: infl?.promedio3m ?? 0,
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error();
      const { error } = await supabase
        .from("salary_reminder_dismissals")
        .upsert({ user_id: user.id, mes_financiero: cash.mes });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listo, no te vamos a insistir este mes.");
      qc.invalidateQueries({ queryKey: ["salary-reminder-dismissal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Advertencias financieras simples según tus datos actuales.</p>
      </header>

      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Estado del mes</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Metric label="Ingresos" value={formatMoney(cash.ingresos, currency)} />
          <Metric label="Gastos estimados" value={formatMoney(cash.gastos, currency)} />
          <Metric label="Disponible" value={formatMoney(cash.disponible, currency)} tone={cash.disponible < 0 ? "text-destructive" : "text-success"} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Metric label="Ingresos (USD)" value={formatMoney(ingresosUSD, "USD")} />
          <Metric label="Gastos estimados (USD)" value={formatMoney(gastosUSD, "USD")} />
          <Metric label="Disponible (USD)" value={formatMoney(disponibleUSD, "USD")} tone={disponibleUSD < 0 ? "text-destructive" : "text-success"} />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          "Gastos estimados" suma lo que ya registraste más las cuotas y gastos fijos pendientes de pago este mes: puede diferir del total de Movimientos, que solo cuenta lo ya registrado.
        </p>
      </Card>

      {isLoading ? (
        <Card className="p-10 text-center text-muted-foreground">Cargando alertas...</Card>
      ) : !ingresoFaltante && alerts.length === 0 ? (
        <Card className="p-10 text-center">
          <CircleCheck className="size-10 mx-auto text-success mb-3" />
          <p className="font-medium">Todavía no hay alertas</p>
          <p className="text-sm text-muted-foreground mt-1">Cuando detectemos vencimientos, gastos inusuales o liquidez baja, van a aparecer acá.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {ingresoFaltante && (
            <Card className="p-4 border-warning/40 bg-warning/5">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-warning"><Wallet className="size-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold">Todavía no cargaste el sueldo de {cash.mes}</h2>
                    <Badge variant="secondary">Atención</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sugerido
                      ? `Te sugerimos ${formatMoney(sugerido.monto, sugerido.moneda)} según tu último sueldo. Confirmalo o editalo en Ingresos.`
                      : "Cargalo en Ingresos para que el resto de la app calcule bien tu mes."}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button asChild size="sm">
                      <Link to="/ingresos">Cargar sueldo</Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => dismissMutation.mutate()} disabled={dismissMutation.isPending}>
                      Todavía no cobré
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
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
