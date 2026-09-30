import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";

/**
 * Solo tiene efecto adentro de la app nativa (iOS/Android empaquetada con
 * Capacitor) — en la web (platium.app en el navegador) se usa Lemon Squeezy
 * en cambio, ver paywall-screen.tsx. RevenueCat cobra ahí de verdad vía
 * Apple/Google; nuestro backend se entera después por el webhook
 * /webhooks/revenuecat, que marca `entitlements` como pagado.
 *
 * El `appUserID` que le pasamos a `configure` es el mismo user id de
 * Supabase (no el anónimo que generaría RevenueCat solo): así el webhook
 * puede escribir directo en `entitlements.user_id` sin tener que mapear
 * identidades entre los dos sistemas.
 *
 * La API key pública de RevenueCat (VITE_REVENUECAT_IOS_API_KEY) es segura
 * de exponer en el cliente — es lo mismo que hace cualquier app nativa con
 * su SDK. El secret real (el que protege el webhook) es otro, server-only.
 */

let configured = false;

export function isRevenueCatAvailable() {
  return Capacitor.isNativePlatform() && !!import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
}

async function ensureConfigured(userId: string) {
  if (configured) return;
  const apiKey = import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined;
  if (!apiKey) throw new Error("Falta VITE_REVENUECAT_IOS_API_KEY");
  await Purchases.configure({ apiKey, appUserID: userId });
  configured = true;
}

export type PurchaseLifetimeResult = { ok: true } | { ok: false; cancelled: boolean; message: string };

export async function purchaseLifetime(userId: string): Promise<PurchaseLifetimeResult> {
  try {
    await ensureConfigured(userId);
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.lifetime ?? offerings.current?.availablePackages[0] ?? null;
    if (!pkg) throw new Error("No hay ninguna oferta configurada en RevenueCat todavía");
    await Purchases.purchasePackage({ aPackage: pkg });
    return { ok: true };
  } catch (error: any) {
    return { ok: false, cancelled: !!error?.userCancelled, message: error?.message ?? "Error desconocido" };
  }
}

export async function restorePurchases(userId: string): Promise<PurchaseLifetimeResult> {
  try {
    await ensureConfigured(userId);
    await Purchases.restorePurchases();
    return { ok: true };
  } catch (error: any) {
    return { ok: false, cancelled: false, message: error?.message ?? "Error desconocido" };
  }
}
