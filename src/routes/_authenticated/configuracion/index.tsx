import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, Shield, Wallet, CreditCard, Receipt, BarChart3, Bell, Wrench, FileText, Lock, ChevronRight } from "lucide-react";
import { financialDataQuery, useDolarTC } from "@/lib/supabase-queries";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney } from "@/lib/finance";
import { getEmergencyFundSummary, getMonthlyCashflow } from "@/lib/financial-centers";
import { incomeFrequencyLabel, useFinancialPreferences } from "@/lib/financial-preferences";
import { PLATIUM_CARD, PLATIUM_PAGE_TITLE, PLATIUM_PAGE_SUBTITLE } from "@/components/app/platium-ui";

export const Route = createFileRoute("/_authenticated/configuracion/")({
  head: () => ({ meta: [{ title: "Configuración · Platium" }] }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "ARS";
  const [preferences] = useFinancialPreferences(user?.id, { payDateMode: profile?.pay_date_mode, payDay: profile?.pay_day });

  const { data } = useQuery(financialDataQuery(user?.id));
  const { tc } = useDolarTC();

  const cards = useMemo(() => {
    const map = new Map<string, true>();
    (data?.tarjetas ?? []).forEach((card: any) => { if (card.tarjeta) map.set(card.tarjeta, true); });
    return Array.from(map.keys());
  }, [data?.tarjetas]);
  const fijosCount = data?.fijos?.length ?? 0;

  const cash = getMonthlyCashflow({
    profile,
    movimientos: data?.movimientos,
    ingresos: data?.ingresos,
    gastosFijos: data?.fijos,
    tarjetas: data?.tarjetas,
    prestamos: data?.prestamos,
    preferences,
    tc,
  });
  const emergency = getEmergencyFundSummary(cash, preferences);
  const savingTarget = Number(profile?.saving_target ?? 20);
  const emergencyPct = emergency.recommended > 0 ? Math.min(100, (emergency.current / emergency.recommended) * 100) : 0;
  const riskProfileLabel = preferences.riskProfile.charAt(0).toUpperCase() + preferences.riskProfile.slice(1);

  return (
    <div className="space-y-6 font-plus-jakarta text-[#111]">
      <header>
        <h1 className={PLATIUM_PAGE_TITLE}>Configuración</h1>
        <p className={`${PLATIUM_PAGE_SUBTITLE} mt-1`}>Personalizá tu experiencia financiera.</p>
      </header>

      <div className="grid gap-3">
        <Link to="/configuracion/objetivo-ahorro" className={`${PLATIUM_CARD} p-4 flex items-center gap-3 hover:bg-[#f5f5f4] transition-colors`}>
          <div className="size-10 rounded-full bg-[#eaf2fa] grid place-items-center text-[#20376b] shrink-0"><Target className="size-5" /></div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[13px] text-[#111]">Objetivo de ahorro</div>
            <div className="text-xs text-[#70706a] mt-0.5">Querés ahorrar el {savingTarget}% de tus ingresos.</div>
          </div>
          <div className="num text-lg font-bold text-[#20376b] shrink-0">{savingTarget}%</div>
          <ChevronRight className="size-4 text-[#8e8e88] shrink-0" />
        </Link>

        <Link to="/configuracion/fondo-emergencia" className={`${PLATIUM_CARD} p-4 block hover:bg-[#f5f5f4] transition-colors`}>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#eaf2fa] grid place-items-center text-[#20376b] shrink-0"><Shield className="size-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px] text-[#111]">Fondo de emergencia</div>
              <div className="text-xs text-[#70706a] mt-0.5">Tenés {formatMoney(emergency.current, currency)} de {formatMoney(emergency.recommended, currency)}</div>
            </div>
            <ChevronRight className="size-4 text-[#8e8e88] shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="h-1.5 flex-1 bg-[#d9d9d9] rounded-full overflow-hidden">
              <div className="h-full bg-[#20376b] rounded-full" style={{ width: `${emergencyPct}%` }} />
            </div>
            <span className="text-xs text-[#70706a] shrink-0">{emergency.coveredMonths.toFixed(1)} meses</span>
          </div>
        </Link>
      </div>

      <Section label="Mi economía">
        <SettingsRow
          to="/configuracion/ingresos"
          icon={<Wallet className="size-5" />}
          title="Ingresos y cobros"
          subtitle="Configurá tu fecha y frecuencia de cobro."
          trailing={
            <div className="text-right shrink-0">
              <div className="text-[13px] font-medium text-[#111]">Día {profile?.pay_day ?? 1}</div>
              <div className="text-xs text-[#70706a]">{incomeFrequencyLabel(preferences.income.frequency)}</div>
            </div>
          }
        />
        <SettingsRow
          to="/configuracion/tarjetas"
          icon={<CreditCard className="size-5" />}
          title="Tarjetas"
          subtitle={cards.length === 0 ? "Todavía no cargaste ninguna tarjeta." : `${cards.length} tarjeta${cards.length === 1 ? "" : "s"} configurada${cards.length === 1 ? "" : "s"}.`}
        />
        <SettingsRow
          to="/configuracion/gastos-recurrentes"
          icon={<Receipt className="size-5" />}
          title="Gastos recurrentes"
          subtitle={fijosCount === 0 ? "Todavía no cargaste gastos fijos." : `${fijosCount} gasto${fijosCount === 1 ? "" : "s"} configurado${fijosCount === 1 ? "" : "s"}.`}
        />
      </Section>

      <Section label="Preferencias">
        <SettingsRow
          to="/configuracion/perfil-financiero"
          icon={<BarChart3 className="size-5" />}
          title="Perfil financiero"
          subtitle={riskProfileLabel}
        />
        <SettingsRow
          to="/configuracion/notificaciones"
          icon={<Bell className="size-5" />}
          title="Notificaciones"
          subtitle="Te avisamos sobre vencimientos y movimientos."
        />
      </Section>

      <Section label="Otros">
        <SettingsRow
          to="/configuracion/herramientas"
          icon={<Wrench className="size-5" />}
          title="Herramientas avanzadas"
          subtitle="Recalcular meses, corregir movimientos, etc."
        />
        <SettingsRow to="/terminos" icon={<FileText className="size-5" />} title="Términos y condiciones" />
        <SettingsRow to="/privacidad" icon={<Lock className="size-5" />} title="Política de privacidad" />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[#70706a] px-1 mb-2">{label}</div>
      <div className={`${PLATIUM_CARD} divide-y divide-[#d9d9d9] overflow-hidden`}>{children}</div>
    </div>
  );
}

function SettingsRow({ to, icon, title, subtitle, trailing }: { to: string; icon: ReactNode; title: string; subtitle?: string; trailing?: ReactNode }) {
  return (
    <Link to={to as any} className="flex items-center gap-3 p-4 hover:bg-[#f5f5f4] transition-colors">
      <div className="size-9 rounded-md bg-[#eaf2fa] grid place-items-center text-[#20376b] shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[13px] text-[#111]">{title}</div>
        {subtitle && <div className="text-xs text-[#70706a] mt-0.5 truncate">{subtitle}</div>}
      </div>
      {trailing}
      <ChevronRight className="size-4 text-[#8e8e88] shrink-0" />
    </Link>
  );
}
