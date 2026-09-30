// Lógica pura para parsear el payload del webhook de RevenueCat (pago
// nativo iOS/Android) — sin red ni env vars, para poder testearla sola.
// La verificación de que el request realmente vino de RevenueCat (header
// Authorization contra el secret) vive en el route handler, no acá.

export type RevenueCatEvent = {
  eventType: string;
  userId: string | null;
  store: string | null;
};

export function parseRevenueCatEvent(payload: unknown): RevenueCatEvent | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, any>;
  const event = body?.event;
  if (!event || typeof event !== "object") return null;
  const eventType = event.type;
  if (typeof eventType !== "string") return null;
  const userId = typeof event.app_user_id === "string" ? event.app_user_id : null;
  const store = typeof event.store === "string" ? event.store : null;
  return { eventType, userId, store };
}

/**
 * RevenueCat manda el store en mayúsculas (APP_STORE, MAC_APP_STORE,
 * PLAY_STORE, AMAZON, STRIPE, PROMOTIONAL...). Acá solo nos importan los dos
 * que Platium realmente vende — el resto queda sin payment_source
 * (la columna lo permite NULL) en vez de forzar un valor incorrecto.
 */
export function mapRevenueCatStoreToPaymentSource(store: string | null): "apple" | "google" | null {
  if (store === "APP_STORE" || store === "MAC_APP_STORE") return "apple";
  if (store === "PLAY_STORE") return "google";
  return null;
}

// Eventos que representan una compra nueva confirmada. Nuestro único
// producto (Lifetime, pago único) dispara NON_RENEWING_PURCHASE; se incluye
// también INITIAL_PURCHASE por si alguna vez se agrega algo con
// renovación, para no tener que tocar esto de nuevo.
export const REVENUECAT_GRANT_EVENT_TYPES = ["INITIAL_PURCHASE", "NON_RENEWING_PURCHASE"];
