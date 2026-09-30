import { useState } from "react";
import { Lock, LogOut, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildLemonSqueezyCheckoutUrl } from "@/lib/lemonsqueezy";
import { isRevenueCatAvailable, purchaseLifetime } from "@/lib/revenuecat-native";

/**
 * Se muestra cuando el trial gratis de 7 días venció y el usuario todavía
 * no pagó. Es solo la parte visual: el bloqueo real de los datos ya está
 * hecho en Supabase (RLS vía has_active_entitlement()), así que aunque
 * alguien se saltee esta pantalla no puede leer ni escribir nada.
 *
 * El botón manda al checkout hosteado de Lemon Squeezy (pago web) con el
 * user_id embebido como custom data — es lo que el webhook
 * /webhooks/lemonsqueezy usa para marcar el pago en `entitlements`. Se abre
 * en una pestaña nueva para no perder esta, y el usuario vuelve y recarga.
 * Sin VITE_LEMONSQUEEZY_CHECKOUT_URL configurada (todavía no está en
 * Vercel), el botón queda deshabilitado en vez de romper.
 *
 * Adentro de la app nativa (Capacitor, iOS/Android) se usa RevenueCat en
 * vez de Lemon Squeezy — ver isRevenueCatAvailable/purchaseLifetime en
 * src/lib/revenuecat-native.ts. En la web (import.meta.env sin
 * Capacitor.isNativePlatform()) esa función siempre da false, así que este
 * componente sigue andando igual que antes para todos los que entran por
 * el navegador.
 */
export function PaywallScreen({ userId, email }: { userId: string; email?: string | null }) {
  const [purchasing, setPurchasing] = useState(false);
  const nativeAvailable = isRevenueCatAvailable();
  const checkoutBase = import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL as string | undefined;
  const checkoutUrl = checkoutBase ? buildLemonSqueezyCheckoutUrl(checkoutBase, { userId, email }) : null;

  async function handleNativePurchase() {
    setPurchasing(true);
    const result = await purchaseLifetime(userId);
    setPurchasing(false);
    if (result.ok) {
      toast.success("¡Listo! Ya tenés acceso completo.");
      window.location.reload();
    } else if (!result.cancelled) {
      toast.error(result.message);
    }
  }

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

        {nativeAvailable ? (
          <Button
            className="w-full"
            disabled={purchasing}
            onClick={handleNativePurchase}
            style={{ background: "#17366C", color: "#FFFFFF", opacity: purchasing ? 0.6 : 1 }}
          >
            {purchasing ? "Procesando..." : "Suscribirme"}
          </Button>
        ) : checkoutUrl ? (
          <Button asChild className="w-full" style={{ background: "#17366C", color: "#FFFFFF" }}>
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              Suscribirme
            </a>
          </Button>
        ) : (
          <Button className="w-full" disabled style={{ background: "#17366C", color: "#FFFFFF", opacity: 0.6 }}>
            Suscribirme — muy pronto
          </Button>
        )}

        {checkoutUrl && !nativeAvailable && (
          <>
            <p className="text-xs" style={{ color: "#5C6E8C" }}>
              Se abre en una pestaña nueva. Después de pagar, volvé acá y tocá "Ya pagué".
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 text-xs mx-auto font-medium"
              style={{ color: "#17366C" }}
            >
              <RefreshCw className="size-3.5" />
              Ya pagué, actualizar
            </button>
          </>
        )}

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
