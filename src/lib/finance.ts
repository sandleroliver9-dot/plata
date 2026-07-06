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

export function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

export function installmentForFinancialMonth({
  inicio,
  cuotaActual,
  cuotasTotales,
  mesFinanciero,
  referenceDate = new Date(),
}: {
  inicio: string | null | undefined;
  cuotaActual: number;
  cuotasTotales: number;
  mesFinanciero: string;
  referenceDate?: Date;
}): number | null {
  const target = parseFinancialMonth(mesFinanciero);
  if (!target) return null;
  const startDate = inicio ? new Date(`${inicio}T00:00:00`) : target;
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  if (monthsBetween(startMonth, target) < 0) return null;
  const cuota = Number(cuotaActual || 1) + monthsBetween(startMonth, target);
  const total = Number(cuotasTotales || 0);
  if (cuota < 1 || cuota > total) return null;
  return cuota;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
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
  const day = new Date().getDate();
  const diasRestantes = payDay > day ? payDay - day : 30 - day + payDay;
  if (balance < -overdraft) return `Estás sobregirado por ${Math.abs(balance + overdraft).toFixed(0)}. Bajá gastos no esenciales este mes.`;
  if (balance < 0) return `Vas usando el descubierto. Te quedan ${diasRestantes} días hasta tu próximo cobro.`;
  if (ahorroPct >= 0.3) return `Muy bien: estás ahorrando ${(ahorroPct * 100).toFixed(0)}% de tus ingresos. Considerá invertir el excedente.`;
  if (ahorroPct >= 0.1) return `Vas bien, ahorrás ${(ahorroPct * 100).toFixed(0)}%. Podés apuntar a un 20%.`;
  return `Estás gastando casi todo lo que entra. Revisá tus gastos fijos y categorías más pesadas.`;
}
