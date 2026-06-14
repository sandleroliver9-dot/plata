import { currentFinancialMonth, installmentForFinancialMonth } from "@/lib/finance";
import {
  DEFAULT_FINANCIAL_PREFERENCES,
  clampDay,
  getPayDateForMonth,
  recurringFrequencyLabel,
  riskProfileSettings,
  type FinancialPreferences,
  type IncomeFrequency,
  type RecurringFrequency,
} from "@/lib/financial-preferences";

type Row = Record<string, any>;

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: "cobro" | "vencimiento" | "cuota" | "prestamo" | "gasto_fijo";
  detail?: string;
};

export type CashflowSummary = {
  mes: string;
  ingresos: number;
  gastos: number;
  gastosFijos: number;
  cuotas: number;
  disponible: number;
  objetivoAhorro: number;
  ahorroEstimado: number;
  ingresoBase: number;
  ingresoRegistrado: number;
};

export type EmergencyFundSummary = {
  targetMonths: number;
  current: number;
  recommended: number;
  gap: number;
  coveredMonths: number;
};

const DAY_MS = 86_400_000;

export function isoLocal(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseISODate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addMonths(date: Date, n: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + n, 1);
  const day = Math.min(date.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
  next.setDate(day);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function maxDate(a: Date, b: Date) {
  return a > b ? a : b;
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function dateWithDay(year: number, month: number, day: number) {
  return new Date(year, month, Math.min(clampDay(day), lastDayOfMonth(year, month)));
}

export function daysUntil(dateISO: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = parseISODate(dateISO);
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.ceil((date.getTime() - today.getTime()) / DAY_MS);
}

export function getSavingTargetPercent(profile: Row | null | undefined) {
  return Math.max(0, Math.min(80, Number(profile?.saving_target ?? 20)));
}

export function getBaseMonthlyIncome(profile: Row | null | undefined, ingresos: Row[] = []) {
  const lastSalary = ingresos
    .filter((i) => String(i.tipo ?? "").toLowerCase() === "sueldo" && Number(i.monto) > 0)
    .sort((a, b) => String(b.fecha_cobro).localeCompare(String(a.fecha_cobro)))[0];
  const fromIncome = Number(lastSalary?.monto ?? 0);
  const fromProfile = Number(profile?.salary ?? 0);
  return fromIncome > 0 ? fromIncome : Math.max(0, fromProfile);
}

function hasSimilarMovement(movs: Row[], descripcion: string, monto: number, mes: string) {
  const desc = descripcion.toLowerCase();
  return movs.some((mov) => {
    if (mov.tipo !== "Gasto" || mov.mes_financiero !== mes) return false;
    const sameAmount = Math.abs(Number(mov.monto) - monto) < 0.01;
    const movDesc = String(mov.descripcion ?? "").toLowerCase();
    return sameAmount && (movDesc === desc || movDesc.includes(desc) || desc.includes(movDesc));
  });
}

function incomeEventAmount(monthlyAmount: number, frequency: IncomeFrequency) {
  if (frequency === "semanal") return monthlyAmount / 4.33;
  if (frequency === "quincenal") return monthlyAmount / 2;
  return monthlyAmount;
}

function recurringMonthlyMultiplier(frequency: RecurringFrequency | undefined) {
  if (frequency === "semanal") return 4.33;
  if (frequency === "quincenal") return 2;
  if (frequency === "anual") return 1 / 12;
  return 1;
}

function normalizePrefs(preferences?: FinancialPreferences | null) {
  return preferences ?? DEFAULT_FINANCIAL_PREFERENCES;
}

function buildRecurringDates({
  day,
  frequency,
  horizonDays,
  startDate,
}: {
  day: number;
  frequency: IncomeFrequency | RecurringFrequency;
  horizonDays: number;
  startDate?: Date | null;
}) {
  if (frequency === "variable") return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + horizonDays * DAY_MS);
  const windowStart = startDate ? maxDate(today, startDate) : today;
  const safeDay = clampDay(day);
  const dates: Date[] = [];

  if (frequency === "semanal") {
    let date = startDate ? new Date(startDate) : dateWithDay(today.getFullYear(), today.getMonth(), safeDay);
    date.setHours(0, 0, 0, 0);
    while (date < windowStart) date = addDays(date, 7);
    while (date <= horizon) {
      dates.push(new Date(date));
      date = addDays(date, 7);
    }
    return dates;
  }

  if (frequency === "anual") {
    const month = startDate?.getMonth() ?? today.getMonth();
    for (let year = windowStart.getFullYear(); year <= horizon.getFullYear() + 1; year++) {
      const date = dateWithDay(year, month, safeDay);
      if (date >= windowStart && date <= horizon) dates.push(date);
    }
    return dates;
  }

  const monthCount = Math.ceil(horizonDays / 28) + 2;
  for (let i = 0; i < monthCount; i++) {
    const monthDate = new Date(windowStart.getFullYear(), windowStart.getMonth() + i, 1);
    const first = dateWithDay(monthDate.getFullYear(), monthDate.getMonth(), safeDay);
    if (first >= windowStart && first <= horizon) dates.push(first);

    if (frequency === "quincenal") {
      const secondDay = Math.min(safeDay + 15, lastDayOfMonth(monthDate.getFullYear(), monthDate.getMonth()));
      const second = dateWithDay(monthDate.getFullYear(), monthDate.getMonth(), secondDay);
      if (second.getTime() !== first.getTime() && second >= windowStart && second <= horizon) dates.push(second);
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function buildIncomeDates({
  preferences,
  frequency,
  horizonDays,
}: {
  preferences: FinancialPreferences;
  frequency: IncomeFrequency;
  horizonDays: number;
}) {
  if (frequency === "variable" || preferences.income.payDateMode === "variable") return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + horizonDays * DAY_MS);
  const dates: Date[] = [];

  if (frequency === "semanal") {
    let date = getPayDateForMonth(today.getFullYear(), today.getMonth(), preferences);
    date.setHours(0, 0, 0, 0);
    while (date < today) date = addDays(date, 7);
    while (date <= horizon) {
      dates.push(new Date(date));
      date = addDays(date, 7);
    }
    return dates;
  }

  const monthCount = Math.ceil(horizonDays / 28) + 2;
  for (let i = 0; i < monthCount; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const first = getPayDateForMonth(monthDate.getFullYear(), monthDate.getMonth(), preferences);
    first.setHours(0, 0, 0, 0);
    if (first >= today && first <= horizon) dates.push(first);

    if (frequency === "quincenal") {
      const second = addDays(first, 15);
      if (second >= today && second <= horizon) dates.push(second);
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function addUnique(events: CalendarEvent[], event: CalendarEvent) {
  const exists = events.some((e) => (
    e.type === event.type &&
    e.date === event.date &&
    e.title === event.title &&
    Math.abs(e.amount - event.amount) < 0.01
  ));
  if (!exists) events.push(event);
}

export function getMonthlyCashflow({
  profile,
  movimientos = [],
  ingresos = [],
  gastosFijos = [],
  tarjetas = [],
  prestamos = [],
  preferences,
}: {
  profile?: Row | null;
  movimientos?: Row[];
  ingresos?: Row[];
  gastosFijos?: Row[];
  tarjetas?: Row[];
  prestamos?: Row[];
  preferences?: FinancialPreferences | null;
}): CashflowSummary {
  const prefs = normalizePrefs(preferences);
  const incomePrefs: FinancialPreferences = {
    ...prefs,
    income: { ...prefs.income, payDay: prefs.income.payDay ?? Number(profile?.pay_day ?? 1) },
  };
  const payDay = getPayDateForMonth(new Date().getFullYear(), new Date().getMonth(), incomePrefs).getDate();
  const mes = currentFinancialMonth(payDay);
  const movsMes = movimientos.filter((m) => m.mes_financiero === mes);
  const ingresoBase = getBaseMonthlyIncome(profile, ingresos);
  const ingresoRegistrado = movsMes.filter((m) => m.tipo === "Ingreso").reduce((s, m) => s + Number(m.monto), 0);
  const ingresosMes = ingresoRegistrado > 0 ? ingresoRegistrado : ingresoBase;
  const gastosRegistrados = movsMes.filter((m) => m.tipo === "Gasto").reduce((s, m) => s + Number(m.monto), 0);

  const gastosFijosPendientes = gastosFijos.reduce((s, g) => {
    const pref = prefs.recurringSettings[String(g.id)] ?? {};
    const monto = Number(g.monto_mensual ?? 0) * recurringMonthlyMultiplier(pref.frequency);
    if (monto <= 0 || hasSimilarMovement(movsMes, String(g.gasto ?? ""), monto, mes)) return s;
    return s + monto;
  }, 0);

  const cuotasTarjeta = tarjetas.reduce((s, c) => {
    const cuotaDelMes = installmentForFinancialMonth({
      inicio: c.inicio,
      cuotaActual: Number(c.cuota_actual ?? 1),
      cuotasTotales: Number(c.cuotas_totales ?? 0),
      mesFinanciero: mes,
    });
    if (!cuotaDelMes) return s;
    const monto = Number(c.valor_cuota ?? 0);
    const desc = `${c.compra ?? ""}`;
    if (monto <= 0 || hasSimilarMovement(movsMes, desc, monto, mes)) return s;
    return s + monto;
  }, 0);

  const cuotasPrestamos = prestamos.reduce((s, p) => {
    const restantes = Number(p.cuotas_totales ?? 0) - Number(p.cuotas_pagadas ?? 0);
    const monto = Number(p.cuota_mensual ?? 0);
    if (restantes <= 0 || monto <= 0 || hasSimilarMovement(movsMes, String(p.descripcion ?? ""), monto, mes)) return s;
    return s + monto;
  }, 0);

  const cuotas = cuotasTarjeta + cuotasPrestamos;
  const gastosFijosEstimados = gastosFijosPendientes;
  const gastos = gastosRegistrados + gastosFijosEstimados + cuotas;
  const disponible = ingresosMes - gastos;
  const objetivoAhorro = Math.max(0, ingresosMes * (getSavingTargetPercent(profile) / 100));

  return {
    mes,
    ingresos: ingresosMes,
    gastos,
    gastosFijos: gastosFijosEstimados,
    cuotas,
    disponible,
    objetivoAhorro,
    ahorroEstimado: disponible,
    ingresoBase,
    ingresoRegistrado,
  };
}

export function buildUpcomingEvents({
  profile,
  ingresos = [],
  vencimientos = [],
  tarjetas = [],
  prestamos = [],
  gastosFijos = [],
  horizonDays = 90,
  preferences,
}: {
  profile?: Row | null;
  ingresos?: Row[];
  vencimientos?: Row[];
  tarjetas?: Row[];
  prestamos?: Row[];
  gastosFijos?: Row[];
  horizonDays?: number;
  preferences?: FinancialPreferences | null;
}): CalendarEvent[] {
  const prefs = normalizePrefs(preferences);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + horizonDays * DAY_MS);
  const events: CalendarEvent[] = [];
  const addIfInRange = (event: CalendarEvent) => {
    const date = parseISODate(event.date);
    if (!date || date < today || date > horizon) return;
    addUnique(events, event);
  };

  for (const v of vencimientos) {
    if (v.pagado) continue;
    addIfInRange({
      id: `vencimiento-${v.id}`,
      date: v.fecha,
      title: String(v.concepto ?? "Vencimiento"),
      amount: Number(v.monto ?? 0),
      type: "vencimiento",
      detail: v.recurrente ? "Recurrente" : "Manual",
    });
  }

  for (const c of tarjetas) {
    const base = parseISODate(c.inicio);
    if (!base) continue;
    const actual = Number(c.cuota_actual ?? 1);
    const total = Number(c.cuotas_totales ?? 0);
    const cardPref = prefs.cardSettings[String(c.tarjeta)] ?? prefs.cardSettings[String(c.id)] ?? {};
    const dueDay = cardPref.dueDay ? clampDay(cardPref.dueDay) : base.getDate();
    for (let cuota = actual; cuota <= total; cuota++) {
      const offset = cuota - actual;
      const date = dateWithDay(base.getFullYear(), base.getMonth() + offset, dueDay);
      const detail = cardPref.closingDay
        ? `Cuota ${cuota}/${total} · cierra dia ${cardPref.closingDay}`
        : `Cuota ${cuota}/${total}`;
      addIfInRange({
        id: `tarjeta-${c.id}-${cuota}`,
        date: isoLocal(date),
        title: `${c.tarjeta ?? "Tarjeta"}: ${c.compra ?? "Compra"}`,
        amount: Number(c.valor_cuota ?? 0),
        type: "cuota",
        detail,
      });
    }
  }

  for (const p of prestamos) {
    const total = Number(p.cuotas_totales ?? 0);
    const pagadas = Number(p.cuotas_pagadas ?? 0);
    const restantes = total - pagadas;
    if (restantes <= 0) continue;
    const base = parseISODate(p.inicio) ?? today;
    if (p.dia_pago) base.setDate(Math.min(Number(p.dia_pago), 28));
    for (let i = 0; i < restantes; i++) {
      const cuota = pagadas + i + 1;
      const date = addMonths(base, pagadas + i);
      addIfInRange({
        id: `prestamo-${p.id}-${cuota}`,
        date: isoLocal(date),
        title: `Prestamo: ${p.descripcion ?? "Cuota"}`,
        amount: Number(p.cuota_mensual ?? 0),
        type: "prestamo",
        detail: `Cuota ${cuota}/${total}`,
      });
    }
  }

  for (const g of gastosFijos) {
    const start = parseISODate(g.inicio);
    const pref = prefs.recurringSettings[String(g.id)] ?? {};
    const frequency = pref.frequency ?? "mensual";
    const debitDay = pref.debitDay ?? start?.getDate() ?? 1;
    const dates = buildRecurringDates({
      day: debitDay,
      frequency,
      horizonDays,
      startDate: start,
    });
    dates.forEach((date, index) => {
      addIfInRange({
        id: `gasto-fijo-${g.id}-${isoLocal(date)}-${index}`,
        date: isoLocal(date),
        title: String(g.gasto ?? "Gasto fijo"),
        amount: Number(g.monto_mensual ?? 0),
        type: "gasto_fijo",
        detail: `${g.categoria ?? "Gasto fijo"} · ${recurringFrequencyLabel(frequency)}`,
      });
    });
  }

  const income = getBaseMonthlyIncome(profile, ingresos);
  if (income > 0) {
    const incomePrefs: FinancialPreferences = {
      ...prefs,
      income: { ...prefs.income, payDay: prefs.income.payDay ?? Number(profile?.pay_day ?? 1) },
    };
    const frequency = prefs.income.frequency;
    const amount = incomeEventAmount(income, frequency);
    buildIncomeDates({ preferences: incomePrefs, frequency, horizonDays }).forEach((date, index) => {
      addIfInRange({
        id: `cobro-principal-${isoLocal(date)}-${index}`,
        date: isoLocal(date),
        title: "Cobro de sueldo",
        amount,
        type: "cobro",
        detail: frequency === "variable" ? "Ingreso variable" : `Ingreso ${frequency}`,
      });
    });
  }

  const incomeRows = [...ingresos].sort((a, b) => String(b.fecha_cobro).localeCompare(String(a.fecha_cobro)));
  for (const ingreso of incomeRows) {
    const date = parseISODate(ingreso.fecha_cobro);
    const isSalary = String(ingreso.tipo ?? "").toLowerCase() === "sueldo";
    const pref = prefs.incomeSettings[String(ingreso.id)];

    if (date && date >= today && date <= horizon) {
      addIfInRange({
        id: `ingreso-${ingreso.id}`,
        date: ingreso.fecha_cobro,
        title: String(ingreso.concepto ?? (isSalary ? "Sueldo" : "Ingreso")),
        amount: Number(ingreso.monto ?? 0),
        type: "cobro",
        detail: ingreso.tipo ?? "Ingreso cargado",
      });
    }

    if (!pref?.frequency || pref.frequency === "variable" || isSalary) continue;
    const payDay = pref.payDay ?? date?.getDate() ?? prefs.income.payDay ?? Number(profile?.pay_day ?? 1);
    const amount = incomeEventAmount(Number(ingreso.monto ?? 0), pref.frequency);
    buildRecurringDates({ day: payDay, frequency: pref.frequency, horizonDays, startDate: date }).forEach((nextDate, index) => {
      addIfInRange({
        id: `ingreso-recurrente-${ingreso.id}-${isoLocal(nextDate)}-${index}`,
        date: isoLocal(nextDate),
        title: String(ingreso.concepto ?? "Ingreso"),
        amount,
        type: "cobro",
        detail: `Ingreso ${pref.frequency}`,
      });
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function detectUnusualSpending(movimientos: Row[] = [], profile?: Row | null, preferences?: FinancialPreferences | null) {
  const prefs = normalizePrefs(preferences);
  const incomePrefs: FinancialPreferences = {
    ...prefs,
    income: { ...prefs.income, payDay: prefs.income.payDay ?? Number(profile?.pay_day ?? 1) },
  };
  const payDay = getPayDateForMonth(new Date().getFullYear(), new Date().getMonth(), incomePrefs).getDate();
  const current = currentFinancialMonth(payDay);
  const currentRows = movimientos.filter((m) => m.tipo === "Gasto" && m.mes_financiero === current);
  const previousRows = movimientos.filter((m) => m.tipo === "Gasto" && m.mes_financiero !== current);
  const currentByCat = new Map<string, number>();
  const previousByCat = new Map<string, { total: number; count: number }>();
  const sensitivity = riskProfileSettings(prefs.riskProfile);

  currentRows.forEach((m) => {
    const cat = String(m.categoria ?? "Sin categoria");
    currentByCat.set(cat, (currentByCat.get(cat) ?? 0) + Number(m.monto ?? 0));
  });
  previousRows.forEach((m) => {
    const cat = String(m.categoria ?? "Sin categoria");
    const prev = previousByCat.get(cat) ?? { total: 0, count: 0 };
    previousByCat.set(cat, { total: prev.total + Number(m.monto ?? 0), count: prev.count + 1 });
  });

  return Array.from(currentByCat.entries())
    .map(([categoria, monto]) => {
      const prev = previousByCat.get(categoria);
      const promedio = prev && prev.count >= 3 ? prev.total / prev.count : 0;
      return { categoria, monto, promedio };
    })
    .filter((item) => item.promedio > 0 && item.monto > item.promedio * sensitivity.unusualMultiplier && item.monto > 5000)
    .sort((a, b) => b.monto - a.monto);
}

export function estimateNetWorth({
  inversiones = [],
  inmuebles = [],
  prestamos = [],
}: {
  inversiones?: Row[];
  inmuebles?: Row[];
  prestamos?: Row[];
}) {
  const inv = inversiones.reduce((s, i) => s + Number(i.cantidad ?? 0) * Number(i.valor_actual ?? i.precio_compra ?? 0), 0);
  const inm = inmuebles.reduce((s, i) => s + Number(i.valor_estimado ?? 0) - Number(i.deuda_asociada ?? 0), 0);
  const deudaPrestamos = prestamos.reduce((s, p) => {
    const restantes = Math.max(0, Number(p.cuotas_totales ?? 0) - Number(p.cuotas_pagadas ?? 0));
    return s + restantes * Number(p.cuota_mensual ?? 0);
  }, 0);
  return inv + inm - deudaPrestamos;
}

export function getEmergencyFundSummary(cash: CashflowSummary, preferences?: FinancialPreferences | null): EmergencyFundSummary {
  const prefs = normalizePrefs(preferences);
  const monthlyNeed = Math.max(0, cash.gastos);
  const recommended = monthlyNeed * prefs.emergencyFund.months;
  const current = Math.max(0, Number(prefs.emergencyFund.current ?? 0));
  return {
    targetMonths: prefs.emergencyFund.months,
    current,
    recommended,
    gap: Math.max(0, recommended - current),
    coveredMonths: monthlyNeed > 0 ? current / monthlyNeed : 0,
  };
}
