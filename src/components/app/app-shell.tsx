import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SubTabs, FLUJO_TABS, CREDITO_TABS } from "./sub-tabs";

const navGroups: Array<{ label: string; items: Array<{ to: string; label: string; match?: string[] }> }> = [
  {
    label: "Día a día",
    items: [
      { to: "/movimientos", label: "Flujo de caja", match: ["/movimientos", "/ingresos", "/gastos-fijos"] },
      { to: "/tarjetas", label: "Crédito y cuotas", match: ["/tarjetas", "/prestamo"] },
    ],
  },
  {
    label: "Patrimonio",
    items: [
      { to: "/inmuebles", label: "Inmuebles" },
      { to: "/inversiones", label: "Inversiones" },
      { to: "/proyecciones", label: "Proyecciones" },
      { to: "/metas", label: "Metas" },
    ],
  },
  {
    label: "Control",
    items: [
      { to: "/notificaciones", label: "Notificaciones" },
      { to: "/insights", label: "Insights" },
      { to: "/vencimientos", label: "Vencimientos" },
      { to: "/configuracion", label: "Configuración" },
    ],
  },
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
    <nav className="flex-1 overflow-y-auto p-3 space-y-1 font-plus-jakarta">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="border-t border-[#d9d9d9] my-3" />}
          <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-[#70706a]">
            {group.label}
          </div>
          {group.items.map((item) => {
            const matches = item.match ?? [item.to];
            const active = matches.some((m) => pathname === m || pathname.startsWith(m + "/"));
            return (
              <Link
                key={item.to}
                to={item.to as any}
                onClick={onNavigate}
                className={cn(
                  "block px-3 py-2 rounded-lg text-[13px] transition-colors",
                  active ? "text-[#20376b] font-semibold" : "text-[#111] hover:text-[#20376b]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const Brand = () => (
    <Link to="/dashboard" className="h-16 flex items-center gap-2 px-5 border-b border-[#d9d9d9]">
      <img src="/brand/platium-logo.png" alt="Platium" className="h-9 w-auto" />
    </Link>
  );

  return (
    <div className="min-h-screen flex w-full bg-white">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-[#d9d9d9]">
        <Brand />
        <NavList />
        <div className="p-3 border-t border-[#d9d9d9] font-plus-jakarta">
          <Button variant="ghost" className="w-full justify-start text-[13px] text-[#111] hover:text-[#20376b]" onClick={signOut}>
            <LogOut className="size-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-[#d9d9d9] bg-white">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Abrir menú"><Menu className="size-5 text-[#20376b]" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[317px] bg-white border-[#d9d9d9] flex flex-col">
                <VisuallyHidden><SheetTitle>Menú</SheetTitle></VisuallyHidden>
                <Brand />
                <NavList onNavigate={() => setMobileOpen(false)} />
                <div className="p-3 border-t border-[#d9d9d9] font-plus-jakarta">
                  <Button variant="ghost" className="w-full justify-start text-[13px] text-[#111] hover:text-[#20376b]" onClick={signOut}>
                    <LogOut className="size-4 mr-2" /> Cerrar sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/brand/platium-logo.png" alt="Platium" className="h-7 w-auto" />
            </Link>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4 text-[#20376b]" /></Button>
        </div>
        <div className="p-4 pb-36 md:p-8 max-w-7xl mx-auto space-y-4">
          {FLUJO_TABS.some(t => t.to === pathname) && <SubTabs tabs={FLUJO_TABS} />}
          {CREDITO_TABS.some(t => t.to === pathname) && <SubTabs tabs={CREDITO_TABS} />}
          {children}
        </div>
      </main>
    </div>
  );
}
