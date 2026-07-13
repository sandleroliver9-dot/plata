import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Wallet, CreditCard, Landmark, LineChart, Building2, Target, Settings, LogOut, Receipt, Menu, Sparkles, Bell, Lightbulb, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SubTabs, FLUJO_TABS, CREDITO_TABS } from "./sub-tabs";

const navGroups: Array<{ label?: string; items: Array<{ to: string; label: string; icon: typeof LayoutDashboard; match?: string[] }> }> = [
  { items: [{ to: "/dashboard", label: "Resumen", icon: LayoutDashboard }] },
  {
    label: "Día a día",
    items: [
      { to: "/movimientos", label: "Flujo de caja", icon: ArrowLeftRight, match: ["/movimientos", "/ingresos", "/gastos-fijos"] },
      { to: "/tarjetas", label: "Crédito y cuotas", icon: CreditCard, match: ["/tarjetas", "/prestamo"] },
      
    ],
  },
  {
    label: "Patrimonio",
    items: [
      { to: "/inmuebles", label: "Inmuebles", icon: Building2 },
      { to: "/inversiones", label: "Inversiones", icon: LineChart },
      { to: "/proyecciones", label: "Proyecciones", icon: Sparkles },
      { to: "/metas", label: "Metas", icon: Target },
    ],
  },
  {
    label: "Control",
    items: [
      { to: "/alertas", label: "Alertas", icon: Bell },
      { to: "/insights", label: "Insights", icon: Lightbulb },
      { to: "/calendario-financiero", label: "Calendario", icon: CalendarDays },
    ],
  },
  { items: [{ to: "/configuracion", label: "Configuración", icon: Settings }] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    // supabase-js limpia la sesión local antes de intentar el llamado al
    // servidor, así que igual navegamos a /auth si falla la red — pero
    // avisamos, en vez de fallar en silencio.
    if (error) toast.error("No se pudo cerrar sesión en el servidor, pero se cerró localmente.");
    navigate({ to: "/auth", replace: true });
  }

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto p-3 space-y-4">
      {navGroups.map((group, gi) => (
        <div key={gi} className="space-y-1">
          {group.label && (
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {group.label}
            </div>
          )}
          {group.items.map((item) => {
            const matches = item.match ?? [item.to];
            const active = matches.some((m) => pathname === m || pathname.startsWith(m + "/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const Brand = () => (
    <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
      <div className="size-9 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
        <Wallet className="size-5 text-primary-foreground" />
      </div>
      <div className="font-bold tracking-tight text-lg">Platium</div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        <Brand />
        <NavList />
        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70" onClick={signOut}>
            <LogOut className="size-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border bg-sidebar">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Abrir menú"><Menu className="size-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border flex flex-col">
                <VisuallyHidden><SheetTitle>Menú</SheetTitle></VisuallyHidden>
                <Brand />
                <NavList onNavigate={() => setMobileOpen(false)} />
                <div className="p-3 border-t border-sidebar-border">
                  <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70" onClick={signOut}>
                    <LogOut className="size-4 mr-2" /> Cerrar sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="size-7 rounded-lg" style={{ background: "var(--gradient-primary)" }} />
            <span className="font-bold">Platium</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4" /></Button>
        </div>
        <div className="p-4 pb-24 md:p-8 max-w-7xl mx-auto space-y-4">
          {FLUJO_TABS.some(t => t.to === pathname) && <SubTabs tabs={FLUJO_TABS} />}
          {CREDITO_TABS.some(t => t.to === pathname) && <SubTabs tabs={CREDITO_TABS} />}
          {children}
        </div>
      </main>
    </div>
  );
}
