import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { financialDataQuery } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/use-auth";
import { IntegerInput } from "@/components/ui/number-input";
import { clampDay, useFinancialPreferences, type FinancialPreferences } from "@/lib/financial-preferences";
import { useProfile } from "@/hooks/use-profile";
import { PLATIUM_CARD, PLATIUM_INPUT } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";
import { Field } from "@/components/app/settings-field";

export const Route = createFileRoute("/_authenticated/configuracion/tarjetas")({
  head: () => ({ meta: [{ title: "Tarjetas · Platium" }] }),
  component: TarjetasConfigPage,
});

function TarjetasConfigPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [preferences, setPreferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });
  const { data } = useQuery(financialDataQuery(user?.id));

  const cards = useMemo(() => {
    const map = new Map<string, { tarjeta: string }>();
    (data?.tarjetas ?? []).forEach((card: any) => {
      if (card.tarjeta) map.set(card.tarjeta, { tarjeta: card.tarjeta });
    });
    return Array.from(map.values());
  }, [data?.tarjetas]);

  const updatePreferences = (next: (prev: FinancialPreferences) => FinancialPreferences) => setPreferences(next);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Tarjetas"
        subtitle="Esto permite ubicar mejor tus pagos de tarjeta en el calendario financiero."
      />

      <div className={`${PLATIUM_CARD} p-5`}>
        {cards.length === 0 ? (
          <p className="text-sm text-[#70706a]">Primero cargá una compra en cuotas o una tarjeta. Cuando exista, vas a poder definir cierre y vencimiento.</p>
        ) : (
          <div className="divide-y divide-[#d9d9d9]">
            {cards.map((card) => {
              const item = preferences.cardSettings[card.tarjeta] ?? {};
              return (
                <div key={card.tarjeta} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_130px_130px]">
                  <div>
                    <div className="font-medium">{card.tarjeta}</div>
                    <div className="text-xs text-[#70706a]">Fechas habituales de esta tarjeta.</div>
                  </div>
                  <Field label="Día de cierre">
                    <IntegerInput className={PLATIUM_INPUT}
                      value={item.closingDay ? String(item.closingDay) : ""}
                      placeholder="Día"
                      onChange={(e) => updatePreferences((prev) => ({
                        ...prev,
                        cardSettings: {
                          ...prev.cardSettings,
                          [card.tarjeta]: {
                            ...prev.cardSettings[card.tarjeta],
                            closingDay: e.target.value ? clampDay(e.target.value) : undefined,
                          },
                        },
                      }))}
                    />
                  </Field>
                  <Field label="Día de vencimiento">
                    <IntegerInput className={PLATIUM_INPUT}
                      value={item.dueDay ? String(item.dueDay) : ""}
                      placeholder="Día"
                      onChange={(e) => updatePreferences((prev) => ({
                        ...prev,
                        cardSettings: {
                          ...prev.cardSettings,
                          [card.tarjeta]: {
                            ...prev.cardSettings[card.tarjeta],
                            dueDay: e.target.value ? clampDay(e.target.value) : undefined,
                          },
                        },
                      }))}
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
