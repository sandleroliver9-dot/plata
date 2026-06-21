import { c as currentFinancialMonth, i as installmentForFinancialMonth } from "./finance-Ea2ALQRw.mjs";
import { r as reactExports } from "../_libs/react.mjs";
const DEFAULT_FINANCIAL_PREFERENCES = {
  version: 1,
  income: {
    payDateMode: "fixed_day",
    frequency: "mensual"
  },
  incomeSettings: {},
  cardSettings: {},
  recurringSettings: {},
  emergencyFund: {
    months: 6,
    current: 0
  },
  riskProfile: "equilibrado"
};
const STORAGE_PREFIX = "plata.financial-preferences";
function keyFor(userId) {
  return `${STORAGE_PREFIX}.${userId || "local"}`;
}
function numberOrUndefined(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : void 0;
}
function clampDay(value, fallback = 1) {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(31, parsed));
}
function normalizePayDateMode(value) {
  if (value === "first_business_day" || value === "second_business_day" || value === "third_business_day" || value === "last_business_day" || value === "variable") {
    return value;
  }
  return "fixed_day";
}
function normalizeIncomeFrequency(value) {
  return value === "quincenal" || value === "semanal" || value === "variable" ? value : "mensual";
}
function normalizeRecurringFrequency(value) {
  return value === "quincenal" || value === "semanal" || value === "anual" ? value : "mensual";
}
function normalizeRiskProfile(value) {
  return value === "conservador" || value === "agresivo" ? value : "equilibrado";
}
function normalizeFinancialPreferences(input) {
  const raw = input && typeof input === "object" ? input : {};
  const emergencyMonths = Number(raw.emergencyFund?.months);
  const normalized = {
    ...DEFAULT_FINANCIAL_PREFERENCES,
    income: {
      payDateMode: normalizePayDateMode(raw.income?.payDateMode),
      payDay: raw.income?.payDay ? clampDay(raw.income.payDay) : void 0,
      frequency: normalizeIncomeFrequency(raw.income?.frequency)
    },
    incomeSettings: {},
    cardSettings: {},
    recurringSettings: {},
    emergencyFund: {
      months: emergencyMonths === 3 || emergencyMonths === 12 ? emergencyMonths : 6,
      current: Math.max(0, numberOrUndefined(raw.emergencyFund?.current) ?? 0)
    },
    riskProfile: normalizeRiskProfile(raw.riskProfile)
  };
  Object.entries(raw.incomeSettings ?? {}).forEach(([id, value]) => {
    const item = value;
    normalized.incomeSettings[id] = {
      payDay: item.payDay ? clampDay(item.payDay) : void 0,
      frequency: item.frequency ? normalizeIncomeFrequency(item.frequency) : void 0
    };
  });
  Object.entries(raw.cardSettings ?? {}).forEach(([id, value]) => {
    const item = value;
    normalized.cardSettings[id] = {
      closingDay: item.closingDay ? clampDay(item.closingDay) : void 0,
      dueDay: item.dueDay ? clampDay(item.dueDay) : void 0
    };
  });
  Object.entries(raw.recurringSettings ?? {}).forEach(([id, value]) => {
    const item = value;
    normalized.recurringSettings[id] = {
      debitDay: item.debitDay ? clampDay(item.debitDay) : void 0,
      frequency: item.frequency ? normalizeRecurringFrequency(item.frequency) : void 0
    };
  });
  return normalized;
}
function loadFinancialPreferences(userId) {
  if (typeof window === "undefined") return DEFAULT_FINANCIAL_PREFERENCES;
  try {
    const stored = window.localStorage.getItem(keyFor(userId));
    return normalizeFinancialPreferences(stored ? JSON.parse(stored) : null);
  } catch {
    return DEFAULT_FINANCIAL_PREFERENCES;
  }
}
function saveFinancialPreferences(userId, preferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(userId), JSON.stringify(normalizeFinancialPreferences(preferences)));
  window.dispatchEvent(new CustomEvent("plata:financial-preferences", { detail: { userId } }));
}
function useFinancialPreferences(userId) {
  const [preferences, setPreferencesState] = reactExports.useState(() => loadFinancialPreferences(userId));
  reactExports.useEffect(() => {
    setPreferencesState(loadFinancialPreferences(userId));
  }, [userId]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = () => setPreferencesState(loadFinancialPreferences(userId));
    window.addEventListener("storage", onStorage);
    window.addEventListener("plata:financial-preferences", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("plata:financial-preferences", onStorage);
    };
  }, [userId]);
  const setPreferences = reactExports.useCallback((next) => {
    setPreferencesState((prev) => {
      const resolved = normalizeFinancialPreferences(typeof next === "function" ? next(prev) : next);
      saveFinancialPreferences(userId, resolved);
      return resolved;
    });
  }, [userId]);
  return [preferences, setPreferences];
}
function incomeFrequencyLabel(value) {
  if (value === "quincenal") return "Quincenal";
  if (value === "semanal") return "Semanal";
  if (value === "variable") return "Variable";
  return "Mensual";
}
function payDateModeLabel(value) {
  if (value === "first_business_day") return "Primer dia habil del mes";
  if (value === "second_business_day") return "Segundo dia habil del mes";
  if (value === "third_business_day") return "Tercer dia habil del mes";
  if (value === "last_business_day") return "Ultimo dia habil del mes";
  if (value === "variable") return "Personalizado / variable";
  return "Dia fijo del mes";
}
function isBusinessDay(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}
function getNthBusinessDay(year, month, n) {
  let found = 0;
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    if (!isBusinessDay(date)) continue;
    found += 1;
    if (found === n) return date;
  }
  return new Date(year, month, lastDay);
}
function getLastBusinessDay(year, month) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = lastDay; day >= 1; day--) {
    const date = new Date(year, month, day);
    if (isBusinessDay(date)) return date;
  }
  return new Date(year, month, lastDay);
}
function getPayDateForMonth(year, month, preferences) {
  const income = "income" in preferences ? preferences.income : preferences;
  if (income.payDateMode === "first_business_day") return getNthBusinessDay(year, month, 1);
  if (income.payDateMode === "second_business_day") return getNthBusinessDay(year, month, 2);
  if (income.payDateMode === "third_business_day") return getNthBusinessDay(year, month, 3);
  if (income.payDateMode === "last_business_day") return getLastBusinessDay(year, month);
  return new Date(year, month, clampDay(income.payDay ?? 1));
}
function recurringFrequencyLabel(value) {
  if (value === "quincenal") return "Quincenal";
  if (value === "semanal") return "Semanal";
  if (value === "anual") return "Anual";
  return "Mensual";
}
function riskProfileSettings(profile) {
  if (profile === "conservador") {
    return { alertDays: 10, liquidityRatio: 0.2, unusualMultiplier: 2 };
  }
  if (profile === "agresivo") {
    return { alertDays: 4, liquidityRatio: 0.05, unusualMultiplier: 3 };
  }
  return { alertDays: 7, liquidityRatio: 0.1, unusualMultiplier: 2.5 };
}
const DAY_MS = 864e5;
function isoLocal(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function parseISODate(value) {
  if (!value) return null;
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
function addMonths(date, n) {
  const next = new Date(date.getFullYear(), date.getMonth() + n, 1);
  const day = Math.min(date.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
  next.setDate(day);
  return next;
}
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function maxDate(a, b) {
  return a > b ? a : b;
}
function lastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function dateWithDay(year, month, day) {
  return new Date(year, month, Math.min(clampDay(day), lastDayOfMonth(year, month)));
}
function daysUntil(dateISO) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const date = parseISODate(dateISO);
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.ceil((date.getTime() - today.getTime()) / DAY_MS);
}
function getSavingTargetPercent(profile) {
  return Math.max(0, Math.min(80, Number(profile?.saving_target ?? 20)));
}
function getBaseMonthlyIncome(profile, ingresos = []) {
  const lastSalary = ingresos.filter((i) => String(i.tipo ?? "").toLowerCase() === "sueldo" && Number(i.monto) > 0).sort((a, b) => String(b.fecha_cobro).localeCompare(String(a.fecha_cobro)))[0];
  const fromIncome = Number(lastSalary?.monto ?? 0);
  const fromProfile = Number(profile?.salary ?? 0);
  return fromIncome > 0 ? fromIncome : Math.max(0, fromProfile);
}
function hasSimilarMovement(movs, descripcion, monto, mes) {
  const desc = descripcion.toLowerCase();
  return movs.some((mov) => {
    if (mov.tipo !== "Gasto" || mov.mes_financiero !== mes) return false;
    const sameAmount = Math.abs(Number(mov.monto) - monto) < 0.01;
    const movDesc = String(mov.descripcion ?? "").toLowerCase();
    return sameAmount && (movDesc === desc || movDesc.includes(desc) || desc.includes(movDesc));
  });
}
function incomeEventAmount(monthlyAmount, frequency) {
  if (frequency === "semanal") return monthlyAmount / 4.33;
  if (frequency === "quincenal") return monthlyAmount / 2;
  return monthlyAmount;
}
function recurringMonthlyMultiplier(frequency) {
  if (frequency === "semanal") return 4.33;
  if (frequency === "quincenal") return 2;
  if (frequency === "anual") return 1 / 12;
  return 1;
}
function normalizePrefs(preferences) {
  return preferences ?? DEFAULT_FINANCIAL_PREFERENCES;
}
function buildRecurringDates({
  day,
  frequency,
  horizonDays,
  startDate
}) {
  if (frequency === "variable") return [];
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + horizonDays * DAY_MS);
  const windowStart = startDate ? maxDate(today, startDate) : today;
  const safeDay = clampDay(day);
  const dates = [];
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
  horizonDays
}) {
  if (frequency === "variable" || preferences.income.payDateMode === "variable") return [];
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + horizonDays * DAY_MS);
  const dates = [];
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
function addUnique(events, event) {
  const exists = events.some((e) => e.type === event.type && e.date === event.date && e.title === event.title && Math.abs(e.amount - event.amount) < 0.01);
  if (!exists) events.push(event);
}
function getMonthlyCashflow({
  profile,
  movimientos = [],
  ingresos = [],
  gastosFijos = [],
  tarjetas = [],
  prestamos = [],
  preferences
}) {
  const prefs = normalizePrefs(preferences);
  const incomePrefs = {
    ...prefs,
    income: { ...prefs.income, payDay: prefs.income.payDay ?? Number(profile?.pay_day ?? 1) }
  };
  const payDay = getPayDateForMonth((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), incomePrefs).getDate();
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
      mesFinanciero: mes
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
    ingresoRegistrado
  };
}
function buildUpcomingEvents({
  profile,
  ingresos = [],
  vencimientos = [],
  tarjetas = [],
  prestamos = [],
  gastosFijos = [],
  horizonDays = 90,
  preferences
}) {
  const prefs = normalizePrefs(preferences);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + horizonDays * DAY_MS);
  const events = [];
  const addIfInRange = (event) => {
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
      detail: v.recurrente ? "Recurrente" : "Manual"
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
      const detail = cardPref.closingDay ? `Cuota ${cuota}/${total} · cierra dia ${cardPref.closingDay}` : `Cuota ${cuota}/${total}`;
      addIfInRange({
        id: `tarjeta-${c.id}-${cuota}`,
        date: isoLocal(date),
        title: `${c.tarjeta ?? "Tarjeta"}: ${c.compra ?? "Compra"}`,
        amount: Number(c.valor_cuota ?? 0),
        type: "cuota",
        detail
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
        detail: `Cuota ${cuota}/${total}`
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
      startDate: start
    });
    dates.forEach((date, index) => {
      addIfInRange({
        id: `gasto-fijo-${g.id}-${isoLocal(date)}-${index}`,
        date: isoLocal(date),
        title: String(g.gasto ?? "Gasto fijo"),
        amount: Number(g.monto_mensual ?? 0),
        type: "gasto_fijo",
        detail: `${g.categoria ?? "Gasto fijo"} · ${recurringFrequencyLabel(frequency)}`
      });
    });
  }
  const income = getBaseMonthlyIncome(profile, ingresos);
  if (income > 0) {
    const incomePrefs = {
      ...prefs,
      income: { ...prefs.income, payDay: prefs.income.payDay ?? Number(profile?.pay_day ?? 1) }
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
        detail: frequency === "variable" ? "Ingreso variable" : `Ingreso ${frequency}`
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
        detail: ingreso.tipo ?? "Ingreso cargado"
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
        detail: `Ingreso ${pref.frequency}`
      });
    });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
function detectUnusualSpending(movimientos = [], profile, preferences) {
  const prefs = normalizePrefs(preferences);
  const incomePrefs = {
    ...prefs,
    income: { ...prefs.income, payDay: prefs.income.payDay ?? Number(profile?.pay_day ?? 1) }
  };
  const payDay = getPayDateForMonth((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), incomePrefs).getDate();
  const current = currentFinancialMonth(payDay);
  const currentRows = movimientos.filter((m) => m.tipo === "Gasto" && m.mes_financiero === current);
  const previousRows = movimientos.filter((m) => m.tipo === "Gasto" && m.mes_financiero !== current);
  const currentByCat = /* @__PURE__ */ new Map();
  const previousByCat = /* @__PURE__ */ new Map();
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
  return Array.from(currentByCat.entries()).map(([categoria, monto]) => {
    const prev = previousByCat.get(categoria);
    const promedio = prev && prev.count >= 3 ? prev.total / prev.count : 0;
    return { categoria, monto, promedio };
  }).filter((item) => item.promedio > 0 && item.monto > item.promedio * sensitivity.unusualMultiplier && item.monto > 5e3).sort((a, b) => b.monto - a.monto);
}
function estimateNetWorth({
  inversiones = [],
  inmuebles = [],
  prestamos = []
}) {
  const inv = inversiones.reduce((s, i) => s + Number(i.cantidad ?? 0) * Number(i.valor_actual ?? i.precio_compra ?? 0), 0);
  const inm = inmuebles.reduce((s, i) => s + Number(i.valor_estimado ?? 0) - Number(i.deuda_asociada ?? 0), 0);
  const deudaPrestamos = prestamos.reduce((s, p) => {
    const restantes = Math.max(0, Number(p.cuotas_totales ?? 0) - Number(p.cuotas_pagadas ?? 0));
    return s + restantes * Number(p.cuota_mensual ?? 0);
  }, 0);
  return inv + inm - deudaPrestamos;
}
function getEmergencyFundSummary(cash, preferences) {
  const prefs = normalizePrefs(preferences);
  const monthlyNeed = Math.max(0, cash.gastos);
  const recommended = monthlyNeed * prefs.emergencyFund.months;
  const current = Math.max(0, Number(prefs.emergencyFund.current ?? 0));
  return {
    targetMonths: prefs.emergencyFund.months,
    current,
    recommended,
    gap: Math.max(0, recommended - current),
    coveredMonths: monthlyNeed > 0 ? current / monthlyNeed : 0
  };
}
export {
  getSavingTargetPercent as a,
  buildUpcomingEvents as b,
  getEmergencyFundSummary as c,
  daysUntil as d,
  estimateNetWorth as e,
  payDateModeLabel as f,
  getMonthlyCashflow as g,
  clampDay as h,
  incomeFrequencyLabel as i,
  detectUnusualSpending as j,
  parseISODate as p,
  riskProfileSettings as r,
  useFinancialPreferences as u
};
