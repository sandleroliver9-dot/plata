/**
 * Utilidades de formato y cálculo financiero.
 */

const monthsEs = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatMoney(amount: number | string | null | undefined, currency = "ARS"): string {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n) || n === 0) return currency === "USD" ? "US$ 0" : "$ 0";
  const symbol = currency === "USD" ? "US$" : "$";
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(abs);
  return n < 0 ? `-${symbol} ${formatted}` : `${symbol} ${formatted}`;
}

export function formatCompact(amount: number, currency = "ARS"): string {
  const n = Number(amount ?? 0);
  const symbol = currency === "USD" ? "US$" : "$";
  if (Math.abs(n) >= 1_000_000) return `${symbol} ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${symbol} ${(n / 1_000).toFixed(1)}k`;
  return formatMoney(n, currency);
}

// Tipo de cambio de referencia cuando no hay cotizacion disponible (API de
// dolarapi.com caida o sin datos). Antes este numero estaba repetido en 3
// archivos distintos (patrimonio, inversiones, inmuebles) sin avisar al
// usuario que el valor mostrado podia estar desactualizado.
export const TC_FALLBACK = 1000;

export function resolveTC(dolar?: { mep?: number; ccl?: number; blue?: number } | null): { tc: number; isFallback: boolean } {
  const tc = dolar?.mep ?? dolar?.ccl ?? dolar?.blue;
  if (tc && tc > 0) return { tc, isFallback: false };
  return { tc: TC_FALLBACK, isFallback: true };
}

/**
 * Mes financiero: si el usuario cobra el dia 5, el periodo de "jun 2026"
 * va del 5 de junio al 4 de julio.
 */
export function financialMonth(date: Date, payDay = 1): string {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const safePayDay = Math.max(1, Math.min(daysInMonth, Number(payDay) || 1));
  const period = new Date(date.getFullYear(), date.getMonth(), 1);
  if (safePayDay > 1 && date.getDate() < safePayDay) {
    period.setMonth(period.getMonth() - 1);
  }
  return `${monthsEs[period.getMonth()]} ${period.getFullYear()}`;
}

export function currentFinancialMonth(payDay = 1): string {
  return financialMonth(new Date(), payDay);
}

export function listFinancialMonths(payDay = 1, monthsBack = 6, monthsForward = 0): string[] {
  const current = parseFinancialMonth(currentFinancialMonth(payDay)) ?? new Date();
  const out: string[] = [];
  for (let i = -monthsBack; i <= monthsForward; i++) {
    const d = new Date(current.getFullYear(), current.getMonth() + i, 1);
    // OJO: no volver a pasar `d` por financialMonth(). `d` ya es el primer día
    // del mes calendario en el que arranca ese período financiero (derivado de
    // `current`, que sí es correcto). Si se reevaluara con financialMonth(),
    // como el día 1 siempre es "antes" de cualquier payDay > 1, cada mes se
    // corría uno para atrás y el mes financiero ACTUAL terminaba excluido de
    // la lista para cualquier usuario que no cobre el día 1.
    out.push(`${monthsEs[d.getMonth()]} ${d.getFullYear()}`);
  }
  return out;
}

export function parseFinancialMonth(label: string): Date | null {
  const [month, year] = label.split(" ");
  const monthIndex = monthsEs.indexOf((month ?? "").toLowerCase());
  const fullYear = Number(year);
  if (monthIndex < 0 || !Number.isFinite(fullYear)) return null;
  return new Date(fullYear, monthIndex, 1);
}

/**
 * Rango de fechas calendario que cubre un "mes financiero" (ej: si cobrás el
 * 25, el período "jun 2026" va del 25 de junio al 24 de julio). Sirve para
 * aclarar en la UI que el mes financiero no coincide con el mes calendario
 * cuando payDay > 1, y así el usuario entienda por qué en julio puede seguir
 * viendo "jun 2026" (todavía no llegó su próximo cobro).
 */
export function financialPeriodRange(label: string, payDay = 1): { start: Date; end: Date } | null {
  const monthStart = parseFinancialMonth(label);
  if (!monthStart) return null;
  const daysInStartMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const safePayDay = Math.max(1, Math.min(daysInStartMonth, Number(payDay) || 1));
  const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), safePayDay);
  // El dia de pago se clampea contra CADA mes por separado (mismo patron que
  // safeDayInMonth en financial-preferences.ts): si el mes de inicio tiene 31
  // dias pero el siguiente solo 28/30, clampear una sola vez contra el mes de
  // inicio corria el `end` varios dias de mas (ej: payDay 31 en enero daba
  // "fin" el 2 de marzo en vez del 27 de febrero).
  const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
  const safePayDayNext = Math.max(1, Math.min(daysInNextMonth, Number(payDay) || 1));
  const end = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), safePayDayNext - 1);
  return { start, end };
}

export function formatFinancialPeriodRange(label: string, payDay = 1): string | null {
  const range = financialPeriodRange(label, payDay);
  if (!range) return null;
  const fmt = (d: Date) => `${d.getDate()} ${monthsEs[d.getMonth()]}`;
  return `${fmt(range.start)} al ${fmt(range.end)}`;
}

export function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

export function installmentForFinancialMonth({
  inicio,
  cuotaActual,
  cuotasTotales,
  mesFinanciero,
  payDay = 1,
}: {
  inicio: string | null | undefined;
  cuotaActual: number;
  cuotasTotales: number;
  mesFinanciero: string;
  payDay?: number;
}): number | null {
  const target = parseFinancialMonth(mesFinanciero);
  if (!target) return null;
  // El mes financiero de `inicio` no siempre coincide con su mes calendario:
  // si el usuario cobra el 10 y la primera cuota cae el dia 1 (como siempre
  // pasa, ver tarjetas.tsx), ese dia 1 pertenece al mes financiero ANTERIOR
  // (mismo criterio que financialMonth() aplica a cualquier otra fecha).
  // Asumir que el mes calendario de `inicio` es directamente el mes
  // financiero de la cuota 1 corria todo el cronograma un mes financiero
  // hacia adelante y hacia que la cuota 1 se contara dos veces: una vez como
  // el movimiento real (en el mes financiero anterior, correcto) y otra vez
  // como cuota sintetica "todavia no registrada" en el mes financiero
  // siguiente (incorrecto, ya estaba registrada).
  const startMonth = inicio ? parseFinancialMonth(financialMonth(new Date(`${inicio}T00:00:00`), payDay)) : target;
  if (!startMonth) return null;
  if (monthsBetween(startMonth, target) < 0) return null;
  const cuota = Number(cuotaActual || 1) + monthsBetween(startMonth, target);
  const total = Number(cuotasTotales || 0);
  if (cuota < 1 || cuota > total) return null;
  return cuota;
}

export function todayISO(): string {
  // toISOString() da la fecha en UTC: en Argentina (UTC-3), durante las
  // ultimas ~3 horas de cada dia local esto devolvia la fecha de MANANA.
  // Se arma la fecha local a mano, igual que isoLocal() en financial-centers.ts.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Score financiero 0-100 basado en tasa de ahorro y disciplina con descubierto.
 */
export function financialScore(ingresos: number, gastos: number, overdraft: number): { score: number; tone: "success" | "warning" | "destructive"; label: string } {
  if (ingresos <= 0) return { score: 0, tone: "destructive", label: "Sin datos" };
  const balance = ingresos - gastos;
  const ahorroPct = balance / ingresos;
  let score = Math.round(50 + ahorroPct * 100);
  if (balance < -overdraft) score -= 20;
  score = Math.max(0, Math.min(100, score));
  if (score >= 70) return { score, tone: "success", label: "Excelente" };
  if (score >= 40) return { score, tone: "warning", label: "A mejorar" };
  return { score, tone: "destructive", label: "Crítico" };
}

export function smartMessage(ingresos: number, gastos: number, overdraft: number, payDay: number): string {
  if (ingresos === 0 && gastos === 0) return "Empezá cargando tus ingresos y movimientos del mes para ver tu situación real.";
  const balance = ingresos - gastos;
  const ahorroPct = ingresos > 0 ? balance / ingresos : 0;
  const now = new Date();
  const day = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  // payDay puede ser 29/30/31 y no existir en el mes actual o el siguiente
  // (ej: 31 en febrero): clampear contra cada mes por separado, mismo patron
  // que safeDayInMonth, para no desalinearse con el resto de la app (que sí
  // clampea) en cuántos días faltan para el próximo cobro.
  const daysInNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate();
  const safePayDayThisMonth = Math.max(1, Math.min(daysInMonth, Number(payDay) || 1));
  const safePayDayNextMonth = Math.max(1, Math.min(daysInNextMonth, Number(payDay) || 1));
  const diasRestantes = safePayDayThisMonth > day
    ? safePayDayThisMonth - day
    : daysInMonth - day + safePayDayNextMonth;
  if (balance < -overdraft) return `Estás sobregirado por ${Math.abs(balance + overdraft).toFixed(0)}. Bajá gastos no esenciales este mes.`;
  if (balance < 0) return `Vas usando el descubierto. Te quedan ${diasRestantes} días hasta tu próximo cobro.`;
  if (ahorroPct >= 0.3) return `Muy bien: estás ahorrando ${(ahorroPct * 100).toFixed(0)}% de tus ingresos. Considerá invertir el excedente.`;
  if (ahorroPct >= 0.1) return `Vas bien, ahorrás ${(ahorroPct * 100).toFixed(0)}%. Podés apuntar a un 20%.`;
  return `Estás gastando casi todo lo que entra. Revisá tus gastos fijos y categorías más pesadas.`;
}
