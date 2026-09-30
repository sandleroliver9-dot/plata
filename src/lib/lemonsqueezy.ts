// Lógica pura de Lemon Squeezy que puede vivir en el bundle del cliente (la
// usa paywall-screen.tsx para armar el link de checkout). La verificación de
// firma (que necesita node:crypto) está aparte, en lemonsqueezy-signature.server.ts,
// justamente para que ESTE archivo se pueda importar desde un componente de
// React sin que Vite intente meter node:crypto en el navegador.

export type LemonSqueezyOrderEvent = {
  eventName: string;
  userId: string | null;
  status: string | null;
};

/**
 * Extrae del payload del webhook lo mínimo que necesitamos: qué evento es,
 * a qué usuario de Platium corresponde (viaja como `custom_data.user_id`,
 * el dato que mandamos nosotros al armar el link de checkout) y el estado
 * de la orden.
 */
export function parseLemonSqueezyEvent(payload: unknown): LemonSqueezyOrderEvent | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, any>;
  const eventName = body?.meta?.event_name;
  if (typeof eventName !== "string") return null;
  const userId = body?.meta?.custom_data?.user_id ?? null;
  const status = body?.data?.attributes?.status ?? null;
  return { eventName, userId: typeof userId === "string" ? userId : null, status: typeof status === "string" ? status : null };
}

/**
 * Arma el link de checkout con el email y el user_id de Supabase incrustados
 * como "checkout overrides" (soportado por Lemon Squeezy vía query params,
 * sin necesitar su API). Ese `custom[user_id]` es lo que vuelve en el
 * webhook para saber a quién marcarle el pago.
 */
export function buildLemonSqueezyCheckoutUrl(baseUrl: string, opts: { userId: string; email?: string | null }): string {
  const url = new URL(baseUrl);
  url.searchParams.set("checkout[custom][user_id]", opts.userId);
  if (opts.email) url.searchParams.set("checkout[email]", opts.email);
  return url.toString();
}
