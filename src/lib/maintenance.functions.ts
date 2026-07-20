import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { financialMonth } from "@/lib/finance";
import { parseISODate } from "@/lib/financial-centers";

/**
 * Recalcula mes_financiero para todos los movimientos e ingresos del usuario
 * autenticado, usando la fórmula VIGENTE de financialMonth().
 *
 * Por qué existe: mes_financiero se calcula una sola vez, al guardar la fila,
 * y queda grabado tal cual — no se recalcula solo. Si más adelante se corrige
 * la fórmula de mes financiero (como pasó una vez ya en este proyecto), o el
 * usuario cambia su día de cobro, las filas viejas quedan con una etiqueta
 * desactualizada para siempre, sin que nada las arregle. Esta función le da
 * al usuario una forma de auto-repararlo, en vez de necesitar una
 * intervención manual por SQL cada vez.
 *
 * Solo toca `movimientos` e `ingresos`: son las únicas dos tablas que
 * persisten mes_financiero (gastos_fijos/tarjetas/préstamos calculan sus
 * fechas al vuelo, no guardan una etiqueta de mes).
 */
export const recalculateFinancialMonths = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("pay_day")
      .eq("id", userId)
      .single();
    if (profileError) throw profileError;
    const payDay = Number(profile?.pay_day) || 1;

    let corrected = 0;

    const { data: movimientos, error: movError } = await supabase
      .from("movimientos")
      .select("id, fecha, mes_financiero")
      .eq("user_id", userId)
      .eq("activo", true);
    if (movError) throw movError;

    for (const mov of movimientos ?? []) {
      const fecha = parseISODate(mov.fecha);
      if (!fecha) continue;
      const correcto = financialMonth(fecha, payDay);
      if (correcto !== mov.mes_financiero) {
        const { error } = await supabase
          .from("movimientos")
          .update({ mes_financiero: correcto })
          .eq("id", mov.id)
          .eq("user_id", userId);
        if (error) throw error;
        corrected++;
      }
    }

    const { data: ingresos, error: ingError } = await supabase
      .from("ingresos")
      .select("id, fecha_cobro, mes_financiero")
      .eq("user_id", userId)
      .eq("activo", true);
    if (ingError) throw ingError;

    for (const ing of ingresos ?? []) {
      const fecha = parseISODate(ing.fecha_cobro);
      if (!fecha) continue;
      const correcto = financialMonth(fecha, payDay);
      if (correcto !== ing.mes_financiero) {
        const { error } = await supabase
          .from("ingresos")
          .update({ mes_financiero: correcto })
          .eq("id", ing.id)
          .eq("user_id", userId);
        if (error) throw error;
        corrected++;
      }
    }

    return { corrected };
  });
