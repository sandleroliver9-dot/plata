import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
  .inputValidator((data: { payDay: number; salary: number; savingTarget: number }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payDay = Math.max(1, Math.min(31, Math.round(Number(data.payDay) || 1)));
    const salary = Math.max(0, Number(data.salary) || 0);
    const savingTarget = Math.max(0, Math.min(80, Math.round(Number(data.savingTarget) || 0)));
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
    return { ok: true };
  });
