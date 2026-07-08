import { useCallback, useEffect, useRef, useState } from "react";
import { currentFinancialMonth } from "./finance";

export type IncomeFrequency = "mensual" | "quincenal" | "semanal" | "variable";
export type PayDateMode = "fixed_day" | "first_business_day" | "second_business_day" | "third_business_day" | "last_business_day" | "variable";
export type RecurringFrequency = "mensual" | "quincenal" | "semanal" | "anual";
export type FinancialProfileType = "conservador" | "equilibrado" | "agresivo";

export type IncomePreference = {
  payDay?: number;
  frequency?: IncomeFrequency;
};

export type CardPreference = {
  closingDay?: number;
  dueDay?: number;
};

export type RecurringPreference = {
  debitDay?: number;
  frequency?: RecurringFrequency;
};

export type FinancialPreferences = {
  version: 1;
  income: {
    payDateMode: PayDateMode;
    payDay?: number;
    frequency: IncomeFrequency;
  };
  incomeSettings: Record<string, IncomePreference>;
  cardSettings: Record<string, CardPreference>;
  recurringSettings: Record<string, RecurringPreference>;
  emergencyFund: {
    months: 3 | 6 | 12;
    current: number;
  };
  riskProfile: FinancialProfileType;
};

export const DEFAULT_FINANCIAL_PREFERENCES: FinancialPreferences = {
  version: 1,
  income: {
    payDateMode: "fixed_day",
    frequency: "mensual",
  },
  incomeSettings: {},
  cardSettings: {},
  recurringSettings: {},
  emergencyFund: {
    months: 6,
    current: 0,
  },
  riskProfile: "equilibrado",
};

const STORAGE_PREFIX = "plata.financial-preferences";

function keyFor(userId?: string | null) {
  return `${STORAGE_PREFIX}.${userId || "local"}`;
}

function numberOrUndefined(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function clampDay(value: unknown, fallback = 1) {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(31, parsed));
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Clampea contra los dias reales de ESE mes especifico (no solo [1,31]).
 * `new Date(year, month, 31)` en febrero desborda a marzo si no se hace esto:
 * es el mismo bug de "dia de cobro 31" que ya se arreglo una vez en
 * financialMonth() y volvio a aparecer en los call-sites que construian la
 * fecha de cobro sin pasar por este clamp.
 */
export function safeDayInMonth(year: number, month: number, day: unknown) {
  return Math.min(clampDay(day), lastDayOfMonth(year, month));
}

export function normalizePayDateMode(value: unknown): PayDateMode {
  if (
    value === "first_business_day" ||
    value === "second_business_day" ||
    value === "third_business_day" ||
    value === "last_business_day" ||
    value === "variable"
  ) {
    return value;
  }
  return "fixed_day";
}

function normalizeIncomeFrequency(value: unknown): IncomeFrequency {
  return value === "quincenal" || value === "semanal" || value === "variable" ? value : "mensual";
}

function normalizeRecurringFrequency(value: unknown): RecurringFrequency {
  return value === "quincenal" || value === "semanal" || value === "anual" ? value : "mensual";
}

function normalizeRiskProfile(value: unknown): FinancialProfileType {
  return value === "conservador" || value === "agresivo" ? value : "equilibrado";
}

export function normalizeFinancialPreferences(input: unknown): FinancialPreferences {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, any>;
  const emergencyMonths = Number(raw.emergencyFund?.months);
  const normalized: FinancialPreferences = {
    ...DEFAULT_FINANCIAL_PREFERENCES,
    income: {
      payDateMode: normalizePayDateMode(raw.income?.payDateMode),
      payDay: raw.income?.payDay ? clampDay(raw.income.payDay) : undefined,
      frequency: normalizeIncomeFrequency(raw.income?.frequency),
    },
    incomeSettings: {},
    cardSettings: {},
    recurringSettings: {},
    emergencyFund: {
      months: emergencyMonths === 3 || emergencyMonths === 12 ? emergencyMonths : 6,
      current: Math.max(0, numberOrUndefined(raw.emergencyFund?.current) ?? 0),
    },
    riskProfile: normalizeRiskProfile(raw.riskProfile),
  };

  Object.entries(raw.incomeSettings ?? {}).forEach(([id, value]) => {
    const item = value as Record<string, any>;
    normalized.incomeSettings[id] = {
      payDay: item.payDay ? clampDay(item.payDay) : undefined,
      frequency: item.frequency ? normalizeIncomeFrequency(item.frequency) : undefined,
    };
  });

  Object.entries(raw.cardSettings ?? {}).forEach(([id, value]) => {
    const item = value as Record<string, any>;
    normalized.cardSettings[id] = {
      closingDay: item.closingDay ? clampDay(item.closingDay) : undefined,
      dueDay: item.dueDay ? clampDay(item.dueDay) : undefined,
    };
  });

  Object.entries(raw.recurringSettings ?? {}).forEach(([id, value]) => {
    const item = value as Record<string, any>;
    normalized.recurringSettings[id] = {
      debitDay: item.debitDay ? clampDay(item.debitDay) : undefined,
      frequency: item.frequency ? normalizeRecurringFrequency(item.frequency) : undefined,
    };
  });

  return normalized;
}

export function loadFinancialPreferences(userId?: string | null): FinancialPreferences {
  if (typeof window === "undefined") return DEFAULT_FINANCIAL_PREFERENCES;
  try {
    const stored = window.localStorage.getItem(keyFor(userId));
    return normalizeFinancialPreferences(stored ? JSON.parse(stored) : null);
  } catch {
    return DEFAULT_FINANCIAL_PREFERENCES;
  }
}

export function saveFinancialPreferences(userId: string | null | undefined, preferences: FinancialPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(userId), JSON.stringify(normalizeFinancialPreferences(preferences)));
  window.dispatchEvent(new CustomEvent("plata:financial-preferences", { detail: { userId } }));
}

/**
 * `payDateMode`/`payDay` del perfil (Supabase) son la fuente de verdad de la
 * cuenta. Antes esta función solo leía/escribía en localStorage, así que el
 * "tipo de fecha de cobro" quedaba pegado al navegador: no viajaba entre
 * dispositivos y podía quedar desincronizado del pay_day real, haciendo que
 * distintas pantallas calcularan un mes financiero distinto entre sí. Pasar
 * `profileIncome` (desde useProfile) sincroniza el valor local con la cuenta
 * cada vez que el perfil cambia.
 */
export function useFinancialPreferences(
  userId?: string | null,
  profileIncome?: { payDateMode?: string | null; payDay?: number | null },
) {
  const [preferences, setPreferencesState] = useState<FinancialPreferences>(() => loadFinancialPreferences(userId));

  useEffect(() => {
    setPreferencesState(loadFinancialPreferences(userId));
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = () => setPreferencesState(loadFinancialPreferences(userId));
    window.addEventListener("storage", onStorage);
    window.addEventListener("plata:financial-preferences", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("plata:financial-preferences", onStorage);
    };
  }, [userId]);

  useEffect(() => {
    if (!profileIncome || !profileIncome.payDateMode) return;
    const nextMode = normalizePayDateMode(profileIncome.payDateMode);
    const nextDay = profileIncome.payDay ?? undefined;
    setPreferencesState((prev) => {
      if (prev.income.payDateMode === nextMode && prev.income.payDay === nextDay) return prev;
      const resolved = normalizeFinancialPreferences({
        ...prev,
        income: { ...prev.income, payDateMode: nextMode, payDay: nextDay },
      });
      saveFinancialPreferences(userId, resolved);
      return resolved;
    });
  }, [userId, profileIncome?.payDateMode, profileIncome?.payDay]);

  const setPreferences = useCallback((next: FinancialPreferences | ((prev: FinancialPreferences) => FinancialPreferences)) => {
    setPreferencesState((prev) => {
      const resolved = normalizeFinancialPreferences(typeof next === "function" ? next(prev) : next);
      saveFinancialPreferences(userId, resolved);
      return resolved;
    });
  }, [userId]);

  return [preferences, setPreferences] as const;
}

export function incomeFrequencyLabel(value: IncomeFrequency) {
  if (value === "quincenal") return "Quincenal";
  if (value === "semanal") return "Semanal";
  if (value === "variable") return "Variable";
  return "Mensual";
}

export function payDateModeLabel(value: PayDateMode) {
  if (value === "first_business_day") return "Primer dia habil del mes";
  if (value === "second_business_day") return "Segundo dia habil del mes";
  if (value === "third_business_day") return "Tercer dia habil del mes";
  if (value === "last_business_day") return "Ultimo dia habil del mes";
  if (value === "variable") return "Personalizado / variable";
  return "Dia fijo del mes";
}

export function isBusinessDay(date: Date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export function getNthBusinessDay(year: number, month: number, n: number) {
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

export function getLastBusinessDay(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = lastDay; day >= 1; day--) {
    const date = new Date(year, month, day);
    if (isBusinessDay(date)) return date;
  }
  return new Date(year, month, lastDay);
}

export function getPayDateForMonth(year: number, month: number, preferences: FinancialPreferences | FinancialPreferences["income"]) {
  const income = "income" in preferences ? preferences.income : preferences;
  if (income.payDateMode === "first_business_day") return getNthBusinessDay(year, month, 1);
  if (income.payDateMode === "second_business_day") return getNthBusinessDay(year, month, 2);
  if (income.payDateMode === "third_business_day") return getNthBusinessDay(year, month, 3);
  if (income.payDateMode === "last_business_day") return getLastBusinessDay(year, month);
  return new Date(year, month, safeDayInMonth(year, month, income.payDay ?? 1));
}

export function recurringFrequencyLabel(value: RecurringFrequency) {
  if (value === "quincenal") return "Quincenal";
  if (value === "semanal") return "Semanal";
  if (value === "anual") return "Anual";
  return "Mensual";
}

export function riskProfileSettings(profile: FinancialProfileType) {
  if (profile === "conservador") {
    return { alertDays: 10, liquidityRatio: 0.2, unusualMultiplier: 2 };
  }
  if (profile === "agresivo") {
    return { alertDays: 4, liquidityRatio: 0.05, unusualMultiplier: 3 };
  }
  return { alertDays: 7, liquidityRatio: 0.1, unusualMultiplier: 2.5 };
}

/**
 * Selector de "mes financiero" con default = mes actual, que se resincroniza
 * si `payDay` cambia (ej: el perfil todavia no habia cargado y usaba el
 * fallback payDay=1) siempre que el usuario no haya elegido otro mes a mano.
 * Sin esto, ingresos.tsx/movimientos.tsx fijaban el mes inicial con el
 * fallback y se quedaban mostrando el mes financiero equivocado hasta que el
 * usuario tocaba el selector.
 */
export function useDefaultFinancialMonth(payDay: number): [string, (mes: string) => void] {
  const mesActual = currentFinancialMonth(payDay);
  const [mes, setMes] = useState(mesActual);
  const prevMesActual = useRef(mesActual);
  useEffect(() => {
    if (mes === prevMesActual.current && mesActual !== prevMesActual.current) {
      setMes(mesActual);
    }
    prevMesActual.current = mesActual;
  }, [mesActual, mes]);
  return [mes, setMes];
}
