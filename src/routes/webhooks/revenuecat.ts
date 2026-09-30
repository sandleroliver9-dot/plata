import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { mapRevenueCatStoreToPaymentSource, parseRevenueCatEvent, REVENUECAT_GRANT_EVENT_TYPES } from "@/lib/revenuecat";
import type { Database } from "@/integrations/supabase/types";

// Webhook de RevenueCat (pago nativo, iOS/Android). Se configura en
// RevenueCat → Project settings → Webhooks, apuntando a
// https://platium.app/webhooks/revenuecat, con un "Authorization header"
// propio (no HMAC como Lemon Squeezy — acá RevenueCat simplemente reenvía
// el header tal cual lo configuraste) guardado en REVENUECAT_WEBHOOK_SECRET
// como "Bearer <secret>" completo, igual que CRON_SECRET en
// notifications.functions.ts.
//
// El usuario se identifica vía `event.app_user_id`, que es el mismo user id
// de Supabase porque así configuramos el SDK nativo (ver
// src/lib/revenuecat-native.ts, `Purchases.configure({ appUserID: ... })`).
function getAdminSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const Route = createFileRoute("/webhooks/revenuecat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[webhooks/revenuecat] Falta REVENUECAT_WEBHOOK_SECRET");
          return new Response("Not configured", { status: 500 });
        }

        const authHeader = request.headers.get("authorization");
        if (authHeader !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const event = parseRevenueCatEvent(payload);
        if (!event || !event.userId) return new Response("ok", { status: 200 });

        if (REVENUECAT_GRANT_EVENT_TYPES.includes(event.eventType)) {
          const supabase = getAdminSupabase();
          const { error } = await supabase
            .from("entitlements")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              payment_source: mapRevenueCatStoreToPaymentSource(event.store),
            })
            .eq("user_id", event.userId);
          if (error) {
            console.error("[webhooks/revenuecat] no se pudo marcar el pago", error);
            return new Response("DB error", { status: 500 });
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
