const monthsEs = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function formatMoney(amount, currency = "ARS") {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n) || n === 0) return currency === "USD" ? "US$ 0" : "$ 0";
  const symbol = currency === "USD" ? "US$" : "$";
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(abs);
  return n < 0 ? `-${symbol} ${formatted}` : `${symbol} ${formatted}`;
}
function formatCompact(amount, currency = "ARS") {
  const n = Number(amount ?? 0);
  const symbol = currency === "USD" ? "US$" : "$";
  if (Math.abs(n) >= 1e6) return `${symbol} ${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${symbol} ${(n / 1e3).toFixed(1)}k`;
  return formatMoney(n, currency);
}
function financialMonth(date, payDay = 1) {
  const safePayDay = Math.max(1, Math.min(31, Number(payDay) || 1));
  const period = new Date(date.getFullYear(), date.getMonth(), 1);
  if (safePayDay > 1 && date.getDate() < safePayDay) {
    period.setMonth(period.getMonth() - 1);
  }
  return `${monthsEs[period.getMonth()]} ${period.getFullYear()}`;
}
function currentFinancialMonth(payDay = 1) {
  return financialMonth(/* @__PURE__ */ new Date(), payDay);
}
function listFinancialMonths(payDay = 1, monthsBack = 6, monthsForward = 0) {
  const current = parseFinancialMonth(currentFinancialMonth(payDay)) ?? /* @__PURE__ */ new Date();
  const out = [];
  for (let i = -monthsBack; i <= monthsForward; i++) {
    const d = new Date(current.getFullYear(), current.getMonth() + i, 1);
    out.push(financialMonth(d, payDay));
  }
  return out;
}
function parseFinancialMonth(label) {
  const [month, year] = label.split(" ");
  const monthIndex = monthsEs.indexOf((month ?? "").toLowerCase());
  const fullYear = Number(year);
  if (monthIndex < 0 || !Number.isFinite(fullYear)) return null;
  return new Date(fullYear, monthIndex, 1);
}
function monthsBetween(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}
function installmentForFinancialMonth({
  inicio,
  cuotaActual,
  cuotasTotales,
  mesFinanciero,
  referenceDate = /* @__PURE__ */ new Date()
}) {
  const target = parseFinancialMonth(mesFinanciero);
  if (!target) return null;
  const startDate = inicio ? /* @__PURE__ */ new Date(`${inicio}T00:00:00`) : target;
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  if (monthsBetween(startMonth, target) < 0) return null;
  const cuota = Number(cuotaActual || 1) + monthsBetween(startMonth, target);
  const total = Number(cuotasTotales || 0);
  if (cuota < 1 || cuota > total) return null;
  return cuota;
}
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function financialScore(ingresos, gastos, overdraft) {
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
function smartMessage(ingresos, gastos, overdraft, payDay) {
  if (ingresos === 0 && gastos === 0) return "Empezá cargando tus ingresos y movimientos del mes para ver tu situación real.";
  const balance = ingresos - gastos;
  const ahorroPct = ingresos > 0 ? balance / ingresos : 0;
  const day = (/* @__PURE__ */ new Date()).getDate();
  const diasRestantes = payDay > day ? payDay - day : 30 - day + payDay;
  if (balance < -overdraft) return `Estás sobregirado por ${Math.abs(balance + overdraft).toFixed(0)}. Bajá gastos no esenciales este mes.`;
  if (balance < 0) return `Vas usando el descubierto. Te quedan ${diasRestantes} días hasta tu próximo cobro.`;
  if (ahorroPct >= 0.3) return `Muy bien: estás ahorrando ${(ahorroPct * 100).toFixed(0)}% de tus ingresos. Considerá invertir el excedente.`;
  if (ahorroPct >= 0.1) return `Vas bien, ahorrás ${(ahorroPct * 100).toFixed(0)}%. Podés apuntar a un 20%.`;
  return `Estás gastando casi todo lo que entra. Revisá tus gastos fijos y categorías más pesadas.`;
}
export {
  financialMonth as a,
  formatCompact as b,
  currentFinancialMonth as c,
  financialScore as d,
  formatMoney as f,
  installmentForFinancialMonth as i,
  listFinancialMonths as l,
  smartMessage as s,
  todayISO as t
};
