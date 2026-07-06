import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CircleDollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/finance";
import { buildUpcomingEvents, daysUntil, type CalendarEvent } from "@/lib/financial-centers";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { financialDataQuery } from "@/lib/supabase-queries";

export const Route = createFileRoute("/_authenticated/calendario-financiero")({
  head: () => ({ meta: [{ title: "Calendario financiero · Plata" }] }),
  component: CalendarioFinancieroPage,
});

function CalendarioFinancieroPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const currency = profile?.currency ?? "ARS";

  const { data, isLoading } = useQuery(financialDataQuery(user?.id));

  const events = buildUpcomingEvents({
    profile,
    ingresos: data?.ingresos,
    vencimientos: data?.vencimientos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    gastosFijos: data?.fijos,
    horizonDays: 90,
    preferences,
  });

  const grouped = events.reduce((map, event) => {
    const list = map.get(event.date) ?? [];
    list.push(event);
    map.set(event.date, list);
    return map;
  }, new Map<string, CalendarEvent[]>());

  const dates = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Calendario financiero</h1>
        <p className="text-sm text-muted-foreground mt-1">Próximos cobros, vencimientos, cuotas y pagos importantes.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Próximos 90 días</div>
          <div className="num text-2xl font-bold mt-2">{events.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Pagos</div>
          <div className="num text-2xl font-bold mt-2">{events.filter((e) => e.type !== "cobro").length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Cobros previstos</div>
          <div className="num text-2xl font-bold mt-2">{events.filter((e) => e.type === "cobro").length}</div>
        </Card>
      </div>

      {isLoading ? (
        <Card className="p-10 text-center text-muted-foreground">Cargando calendario...</Card>
      ) : events.length === 0 ? (
        <Card className="p-10 text-center">
          <CalendarDays className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Cargá vencimientos para ver tu calendario financiero</p>
          <p className="text-sm text-muted-foreground mt-1">También van a aparecer cuotas, préstamos, gastos fijos y fecha de cobro cuando estén cargados.</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {dates.map((date) => {
              const dayEvents = grouped.get(date) ?? [];
              return (
                <div key={date} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="font-semibold capitalize">{formatDate(date)}</div>
                      <div className="text-xs text-muted-foreground">{relativeDate(date)}</div>
                    </div>
                    <Badge variant="secondary">{dayEvents.length} items</Badge>
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 rounded-md border border-border/70 p-3">
                        <div className={`size-9 rounded-md grid place-items-center ${event.type === "cobro" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>
                          {event.type === "cobro" ? <CircleDollarSign className="size-5" /> : <CalendarDays className="size-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.detail ?? eventLabel(event.type)}</div>
                        </div>
                        <div className={`num font-semibold whitespace-nowrap ${event.type === "cobro" ? "text-success" : ""}`}>
                          {event.type === "cobro" ? "+" : "-"}{formatMoney(event.amount, currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function formatDate(dateISO: string) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function relativeDate(dateISO: string) {
  const days = daysUntil(dateISO);
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}

function eventLabel(type: CalendarEvent["type"]) {
  if (type === "cobro") return "Cobro";
  if (type === "cuota") return "Cuota";
  if (type === "prestamo") return "Préstamo";
  if (type === "gasto_fijo") return "Gasto fijo";
  return "Vencimiento";
}
