import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { financialMonth, parseFinancialMonth } from "@/lib/finance";
import {
  getLastBusinessDay,
  getNthBusinessDay,
  normalizePayDateMode,
  safeDayInMonth,
  type PayDateMode,
} from "@/lib/financial-preferences";

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function resolveSalaryPayDate(payDay: number, payDateMode: PayDateMode, referenceDate = new Date()) {
  // Anclamos el cálculo al mes calendario donde arrancó el período financiero
  // ACTUAL (no el mes calendario de "hoy"): si todavía no llegó el día de cobro
  // de este mes, el período financiero vigente empezó el mes anterior, y el
  // sueldo debe quedar fechado ahí para no desaparecer del mes en curso.
  const currentPeriodStart = parseFinancialMonth(financialMonth(referenceDate, payDay)) ?? referenceDate;
  const year = currentPeriodStart.getFullYear();
  const month = currentPeriodStart.getMonth();
  if (payDateMode === "first_business_day") return getNthBusinessDay(year, month, 1);
  if (payDateMode === "second_business_day") return getNthBusinessDay(year, month, 2);
  if (payDateMode === "third_business_day") return getNthBusinessDay(year, month, 3);
  if (payDateMode === "last_business_day") return getLastBusinessDay(year, month);
  return new Date(year, month, safeDayInMonth(year, month, payDay));
}

/**
 * Resuelve la fecha de cobro y el "pay_day" numérico a persistir. Para modos
 * que no son "día fijo", el día efectivo se deriva de la fecha real resuelta
 * (nunca del número crudo que llega del formulario, que puede quedar
 * desactualizado en esos modos y romper el cálculo de mes financiero en toda
 * la app).
 */
export function resolveEffectivePayDay(rawPayDay: number, payDateMode: PayDateMode, referenceDate = new Date()) {
  const payDate = resolveSalaryPayDate(rawPayDay, payDateMode, referenceDate);
  const payDay = payDateMode === "fixed_day" ? rawPayDay : payDate.getDate();
  return { payDate, payDay };
}

export const updateSavingTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { savingTarget: number }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ saving_target: data.savingTarget })
      .eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const updateFinancialProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { payDay: number; salary: number; savingTarget: number; payDateMode?: PayDateMode; incomeFrequency?: "mensual" | "quincenal" | "semanal" | "variable" }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const rawPayDay = Math.max(1, Math.min(31, Math.round(Number(data.payDay) || 1)));
    const salary = Math.max(0, Number(data.salary) || 0);
    const savingTarget = Math.max(0, Math.min(80, Math.round(Number(data.savingTarget) || 0)));
    const payDateMode = normalizePayDateMode(data.payDateMode);

    const { payDate, payDay } = resolveEffectivePayDay(rawPayDay, payDateMode);

    const { error } = await supabase
      .from("profiles")
      .update({
        pay_day: payDay,
        pay_date_mode: payDateMode,
        salary,
        saving_target: savingTarget,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;

    if (salary > 0) {
      const fechaCobro = toISODate(payDate);
      const mesFinanciero = financialMonth(payDate, payDay);

      // Solo se filtra por tipo="Sueldo" + mes_financiero, sin exigir
      // concepto="Sueldo" exacto: el usuario puede haber cargado el sueldo de
      // ese mes a mano con otro texto (ej. "Sueldo julio") vía ConceptCombo.
      // Si el match también exigía el concepto literal, esa fila no se
      // encontraba y quedaba un duplicado cada vez que se guardaba
      // Configuración.
      const { data: existingRows, error: findError } = await supabase
        .from("ingresos")
        .select("id")
        .eq("user_id", userId)
        .eq("activo", true)
        .eq("mes_financiero", mesFinanciero)
        .eq("tipo", "Sueldo")
        .order("created_at", { ascending: false })
        .limit(1);
      if (findError) throw findError;

      const existing = (existingRows ?? [])[0];
      if (existing?.id) {
        const { error: updateIncomeError } = await supabase
          .from("ingresos")
          .update({
            monto: salary,
            fecha_cobro: fechaCobro,
            mes_financiero: mesFinanciero,
            activo: true,
          })
          .eq("id", existing.id)
          .eq("user_id", userId);
        if (updateIncomeError) throw updateIncomeError;
      } else {
        const { error: createIncomeError } = await supabase
          .from("ingresos")
          .insert({
            user_id: userId,
            concepto: "Sueldo",
            tipo: "Sueldo",
            monto: salary,
            fecha_cobro: fechaCobro,
            mes_financiero: mesFinanciero,
            activo: true,
          });
        if (createIncomeError) throw createIncomeError;
      }
    }

    return { ok: true };
  });
