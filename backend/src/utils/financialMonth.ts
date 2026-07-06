import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

const monthsEs = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Parsear "YYYY-MM-DD" como fecha local (no UTC), igual que financial-centers.ts
// en el frontend. Usar `new Date(string)` corre la fecha un dia en husos
// horarios negativos (ej: Argentina, UTC-3).
export const parseISODateLocal = (value: string): Date => {
  return new Date(`${value}T00:00:00`);
};

// Misma logica que src/lib/finance.ts (financialMonth), con clamp seguro del
// dia de cobro contra la cantidad real de dias del mes.
export const financialMonth = (date: Date, payDay = 1): string => {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const safePayDay = Math.max(1, Math.min(daysInMonth, Number(payDay) || 1));
  const period = new Date(date.getFullYear(), date.getMonth(), 1);
  if (safePayDay > 1 && date.getDate() < safePayDay) {
    period.setMonth(period.getMonth() - 1);
  }
  return `${monthsEs[period.getMonth()]} ${period.getFullYear()}`;
};

export const getUserPayDay = async (userId: string): Promise<number> => {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('profiles')
    .select('pay_day')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return Number(data?.pay_day ?? 1) || 1;
};

export const financialMonthForUser = async (userId: string, fechaISO: string): Promise<string> => {
  const payDay = await getUserPayDay(userId);
  return financialMonth(parseISODateLocal(fechaISO), payDay);
};
