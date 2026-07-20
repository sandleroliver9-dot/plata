import { appNow, formatMoney } from "@/lib/finance";
import { buildUpcomingEvents, parseISODate } from "@/lib/financial-centers";

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function monthLabel(d: Date) {
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

export type ProjectionRow = {
  mes: string;
  sueldo: number;
  extras: number;
  ingresos: number;
  gastosFijos: number;
  cuotas: number;
  total: number;
  disponible: number;
  objetivo: number;
  final: number;
  estado: "ok" | "ajustado" | "rojo";
  mensaje: string;
};

export type ProjectionFinancialData = {
  fijos: any[];
  ingresos: any[];
  vencimientos: any[];
  tarjetas: any[];
  prestamos: any[];
};

export function computeProjectionRows(params: {
  data: ProjectionFinancialData | undefined;
  profile: any;
  preferences: any;
  salary: number;
  ahorroPct: number;
  inflacionPct: number;
  overdraft: number;
  currency: string;
}): ProjectionRow[] {
  const { data, profile, preferences, salary, ahorroPct, inflacionPct, overdraft, currency } = params;
  if (!data) return [];

  const totalFijos = data.fijos.reduce((s, f: any) => s + Number(f.monto_mensual), 0);
  const sueldoCargado = data.ingresos
    .filter((i: any) => String(i.tipo ?? "").toLowerCase() === "sueldo")
    .sort((a: any, b: any) => String(b.fecha_cobro).localeCompare(String(a.fecha_cobro)))[0];
  const sueldoMensual = Number(sueldoCargado?.monto ?? 0) > 0 ? Number(sueldoCargado.monto) : salary;
  // promedio mensual de "extras" (no Sueldo) en últimos 3 meses con datos
  const now = appNow();
  const extras3m = data.ingresos.filter((i: any) => {
    // parseISODate interpreta "YYYY-MM-DD" en hora local: new Date(string)
    // la parsea como UTC medianoche, que en Argentina puede correr la
    // fecha un dia hacia atras y desalinear el conteo de "meses atras".
    const d = parseISODate(i.fecha_cobro) ?? new Date(i.fecha_cobro);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return monthsAgo >= 0 && monthsAgo < 3 && String(i.tipo ?? "").toLowerCase() !== "sueldo";
  });
  const extrasProm = extras3m.length ? extras3m.reduce((s, i: any) => s + Number(i.monto), 0) / 3 : 0;
  now.setHours(0, 0, 0, 0);
  const events = buildUpcomingEvents({
    profile,
    ingresos: data.ingresos,
    // Sin esto, los vencimientos manuales (ABL, expensas, seguro...)
    // quedaban completamente afuera de las proyecciones de los 12 meses:
    // ni el total de "Gastos" del mes ni el grafico los contaban, a
    // diferencia de Alertas/Insights/Calendario financiero, que si pasan
    // este mismo dato a buildUpcomingEvents.
    vencimientos: data.vencimientos,
    tarjetas: data.tarjetas,
    prestamos: data.prestamos,
    gastosFijos: data.fijos,
    horizonDays: 370,
    preferences,
  });

  const out: ProjectionRow[] = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const infFactor = Math.pow(1 + inflacionPct / 100, i);

    // Sueldo + extras proyectados, ambos ajustados por inflación
    let sueldo = sueldoMensual * infFactor;
    let extras = extrasProm * infFactor;
    let ingresos = sueldo + extras;
    let gastosFijos = totalFijos * infFactor;

    // Cuotas de tarjeta activas que aún corren en este mes
    const cuotasTar = data.tarjetas.reduce((s: number, c: any) => {
      const ini = new Date(c.inicio);
      const monthsFromIni = (d.getFullYear() - ini.getFullYear()) * 12 + (d.getMonth() - ini.getMonth());
      const cuotaEnMes = (Number(c.cuota_actual) || 1) + monthsFromIni - 0;
      if (cuotaEnMes >= 1 && cuotaEnMes <= Number(c.cuotas_totales)) return s + Number(c.valor_cuota);
      return s;
    }, 0);

    const cuotasPre = data.prestamos.reduce((s: number, p: any) => {
      const restantes = Number(p.cuotas_totales) - Number(p.cuotas_pagadas);
      return i < restantes ? s + Number(p.cuota_mensual) : s;
    }, 0);

    let cuotas = cuotasTar + cuotasPre;
    const monthEvents = events.filter((event) => {
      const eventDate = parseISODate(event.date);
      return Boolean(eventDate && eventDate >= d && eventDate < end);
    });
    if (monthEvents.length > 0) {
      const sueldoRaw = monthEvents
        .filter((event) => event.type === "cobro" && event.title.toLowerCase().includes("sueldo"))
        .reduce((s, event) => s + Number(event.amount), 0);
      const ingresosRaw = monthEvents
        .filter((event) => event.type === "cobro")
        .reduce((s, event) => s + Number(event.amount), 0);
      const gastosFijosRaw = monthEvents
        .filter((event) => event.type === "gasto_fijo")
        .reduce((s, event) => s + Number(event.amount), 0);
      const pagosProgramados = monthEvents
        .filter((event) => event.type === "cuota" || event.type === "prestamo" || event.type === "vencimiento")
        .reduce((s, event) => s + Number(event.amount), 0);

      sueldo = sueldoRaw * infFactor;
      extras = Math.max(0, ingresosRaw - sueldoRaw) * infFactor;
      ingresos = sueldo + extras;
      gastosFijos = gastosFijosRaw * infFactor;
      cuotas = pagosProgramados;
    }
    const total = gastosFijos + cuotas;
    const disponible = ingresos - total;
    const objetivo = Math.max(0, (ingresos * ahorroPct) / 100);
    const final = disponible - objetivo;

    let estado: "ok" | "ajustado" | "rojo" = "ok";
    let mensaje = "";
    if (disponible < -overdraft) {
      estado = "rojo";
      mensaje = `Te excedés del descubierto en ${formatMoney(Math.abs(disponible + overdraft), currency)}.`;
    } else if (final < 0) {
      estado = "ajustado";
      mensaje = `Cubrís gastos pero no alcanza para el objetivo de ahorro.`;
    } else {
      mensaje = `Podés ahorrar ${formatMoney(final, currency)} este mes.`;
    }

    out.push({
      mes: monthLabel(d),
      sueldo,
      extras,
      ingresos,
      gastosFijos,
      cuotas,
      total,
      disponible,
      objetivo,
      final,
      estado,
      mensaje,
    });
  }
  return out;
}
