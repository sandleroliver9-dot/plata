import { Lock, LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Se muestra cuando el trial gratis de 7 días venció y el usuario todavía
 * no pagó. Es solo la parte visual: el bloqueo real de los datos ya está
 * hecho en Supabase (RLS vía has_active_entitlement()), así que aunque
 * alguien se saltee esta pantalla no puede leer ni escribir nada.
 *
 * El botón de suscripción todavía no hace nada — el cobro real (Stripe
 * para web, RevenueCat para las apps) es el siguiente paso, pendiente de
 * esas cuentas. Diseño provisorio con los colores de marca ya definidos;
 * se termina de vestir cuando lleguen las pantallas finales.
 */
export function PaywallScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#EAF2FA" }}>
      <Card className="max-w-sm w-full p-8 text-center space-y-5" style={{ background: "#FFFFFF" }}>
        <div
          className="size-14 rounded-2xl grid place-items-center mx-auto"
          style={{ background: "#17366C" }}
        >
          <Lock className="size-7" style={{ color: "#FFFFFF" }} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold" style={{ color: "#101A2E" }}>Tu prueba gratis terminó</h1>
          <p className="text-sm" style={{ color: "#5C6E8C" }}>
            Probaste Platium gratis durante 7 días. Para seguir viendo tu balance, tus movimientos y todo lo demás, hace falta suscribirte.
          </p>
        </div>

        <div className="rounded-xl p-4 space-y-1" style={{ background: "#EAF2FA" }}>
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold" style={{ color: "#17366C" }}>
            <Sparkles className="size-4" />
            USD 2,99 · pago único
          </div>
          <p className="text-xs" style={{ color: "#5C6E8C" }}>Acceso completo, sin vencimiento.</p>
        </div>

        <Button className="w-full" disabled style={{ background: "#17366C", color: "#FFFFFF", opacity: 0.6 }}>
          Suscribirme — muy pronto
        </Button>

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-1.5 text-xs mx-auto"
          style={{ color: "#5C6E8C" }}
        >
          <LogOut className="size-3.5" />
          Cerrar sesión
        </button>
      </Card>
    </div>
  );
}
