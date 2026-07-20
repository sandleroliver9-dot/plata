import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { financialDataQuery } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useFinancialPreferences } from "@/lib/financial-preferences";
import { getInflacion } from "@/lib/quotes.functions";
import { computeProjectionRows } from "@/lib/projection";

// Misma proyección de 12 meses que usa la pantalla de Proyecciones, pero con
// los valores por defecto (sin que el usuario haya movido los sliders de
// ahorro/inflación), para poder ofrecerla en cualquier pantalla vía el
// widget flotante del simulador de IA.
export function useProjectionSummary() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const currency = profile?.currency ?? "ARS";
  const overdraft = Number(profile?.overdraft_allowed ?? 0);
  const salary = Number(profile?.salary ?? 0);

  const { data } = useQuery(financialDataQuery(user?.id));

  const fetchInflacion = useServerFn(getInflacion);
  const { data: infl } = useQuery({
    queryKey: ["inflacion-ar"],
    queryFn: () => fetchInflacion(),
    staleTime: 1000 * 60 * 60 * 6,
  });

  const ahorroPct = Number(profile?.saving_target ?? 20);
  const inflacionPct = infl?.promedio3m ? Number(infl.promedio3m.toFixed(1)) : 0;

  const rows = useMemo(
    () => computeProjectionRows({ data, profile, preferences, salary, ahorroPct, inflacionPct, overdraft, currency }),
    [data, profile, preferences, salary, ahorroPct, inflacionPct, overdraft, currency],
  );

  return { rows, currency };
}
