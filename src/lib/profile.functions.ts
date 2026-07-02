import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { financialMonth } from "@/lib/finance";

type PayDateMode = "fixed_day" | "first_business_day" | "second_business_day" | "third_business_day" | "last_business_day" | "variable";

function isBusinessDay(date: Date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function getNthBusinessDay(year: number, month: number, n: number) {
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

function getLastBusinessDay(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = lastDay; day >= 1; day--) {
    const date = new Date(year, month, day);
    if (isBusinessDay(date)) return date;
  }
  return new Date(year, month, lastDay);
}

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizePayDateMode(value: unknown): PayDateMode {
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

function resolveSalaryPayDate(payDay: number, payDateMode: PayDateMode, referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  if (payDateMode === "first_business_day") return getNthBusinessDay(year, month, 1);
  if (payDateMode === "second_business_day") return getNthBusinessDay(year, month, 2);
  if (payDateMode === "third_business_day") return getNthBusinessDay(year, month, 3);
  if (payDateMode === "last_business_day") return getLastBusinessDay(year, month);
  return new Date(year, month, Math.max(1, Math.min(31, payDay)));
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
    const payDay = Math.max(1, Math.min(31, Math.round(Number(data.payDay) || 1)));
    const salary = Math.max(0, Number(data.salary) || 0);
    const savingTarget = Math.max(0, Math.min(80, Math.round(Number(data.savingTarget) || 0)));
    const payDateMode = normalizePayDateMode(data.payDateMode);
    const { error } = await supabase
      .from("profiles")
      .update({
        pay_day: payDay,
        salary,
        saving_target: savingTarget,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;

    if (salary > 0) {
      const payDate = resolveSalaryPayDate(payDay, payDateMode);
      const fechaCobro = toISODate(payDate);
      const mesFinanciero = financialMonth(payDate, payDay);

      const { data: existingRows, error: findError } = await supabase
        .from("ingresos")
        .select("id")
        .eq("user_id", userId)
        .eq("activo", true)
        .eq("mes_financiero", mesFinanciero)
        .eq("concepto", "Sueldo")
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
