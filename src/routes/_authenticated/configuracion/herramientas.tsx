import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { recalculateFinancialMonths } from "@/lib/maintenance.functions";
import { PLATIUM_CARD, PLATIUM_BUTTON_OUTLINE } from "@/components/app/platium-ui";
import { SettingsSubpageHeader } from "@/components/app/settings-subpage-header";

export const Route = createFileRoute("/_authenticated/configuracion/herramientas")({
  head: () => ({ meta: [{ title: "Herramientas avanzadas · Platium" }] }),
  component: HerramientasPage,
});

function HerramientasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const recalculateMonths = useServerFn(recalculateFinancialMonths);
  const recalculateMonthsMutation = useMutation({
    mutationFn: () => recalculateMonths({}),
    onSuccess: ({ corrected }) => {
      if (corrected === 0) {
        toast.success("Todo estaba bien: no había nada para corregir.");
      } else {
        toast.success(`Se corrigieron ${corrected} movimiento${corrected === 1 ? "" : "s"}/ingreso${corrected === 1 ? "" : "s"}.`);
      }
      qc.invalidateQueries({ queryKey: ["movimientos"] });
      qc.invalidateQueries({ queryKey: ["ingresos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["financial-data", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <SettingsSubpageHeader
        title="Herramientas avanzadas"
        subtitle="Recalcular meses, corregir movimientos, etc."
      />

      <div className={`${PLATIUM_CARD} p-5 space-y-4`}>
        <div>
          <div className="font-semibold text-[13px] text-[#20376b]">Corregir meses viejos</div>
          <p className="text-sm text-[#70706a] mt-0.5">Si algún movimiento o ingreso quedó etiquetado con el mes que no corresponde (por ejemplo, después de cambiar tu día de cobro), esto lo recalcula.</p>
        </div>
        <Button
          className={PLATIUM_BUTTON_OUTLINE}
          onClick={() => recalculateMonthsMutation.mutate()}
          disabled={recalculateMonthsMutation.isPending}
        >
          <RefreshCw className="size-4 mr-2" />
          {recalculateMonthsMutation.isPending ? "Corrigiendo..." : "Recalcular meses financieros"}
        </Button>
      </div>
    </div>
  );
}
