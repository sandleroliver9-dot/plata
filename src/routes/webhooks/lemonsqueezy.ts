import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { parseLemonSqueezyEvent } from "@/lib/lemonsqueezy";
import { verifyLemonSqueezySignature } from "@/lib/lemonsqueezy-signature.server";
import type { Database } from "@/integrations/supabase/types";

// Webhook real de Lemon Squeezy (pago desde la web). Se configura en
// Lemon Squeezy → Settings → Webhooks, apuntando a
// https://platium.app/webhooks/lemonsqueezy, suscripto a `order_created` y
// `order_refunded`. El "Signing secret" que Lemon Squeezy genera ahí va en
// la env var LEMONSQUEEZY_WEBHOOK_SECRET (Vercel).
//
// El usuario se identifica vía `custom_data.user_id`, que viajó de ida en
// el link de checkout (ver buildLemonSqueezyCheckoutUrl en paywall-screen).
// Sin ese dato no hay forma de saber a quién marcarle el pago, así que un
// evento sin user_id se ignora (devuelve 200 igual, para que Lemon Squeezy
// no reintente indefinidamente algo que nunca va a poder resolver).
function getAdminSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const Route = createFileRoute("/webhooks/lemonsqueezy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[webhooks/lemonsqueezy] Falta LEMONSQUEEZY_WEBHOOK_SECRET");
          return new Response("Not configured", { status: 500 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get("x-signature");
        if (!verifyLemonSqueezySignature(rawBody, signature, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: unknown;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const event = parseLemonSqueezyEvent(payload);
        if (!event || !event.userId) return new Response("ok", { status: 200 });

        const supabase = getAdminSupabase();

        if (event.eventName === "order_created" && event.status === "paid") {
          const { error } = await supabase
            .from("entitlements")
            .update({ status: "paid", paid_at: new Date().toISOString(), payment_source: "lemonsqueezy" })
            .eq("user_id", event.userId);
          if (error) {
            console.error("[webhooks/lemonsqueezy] no se pudo marcar el pago", error);
            return new Response("DB error", { status: 500 });
          }
        }

        // Reembolso: se lo vuelve a tratar como trial vencido (no hay un
        // estado "refunded" separado en el CHECK de la tabla, y no hace
        // falta — el efecto que importa es que vuelva a ver el paywall).
        if (event.eventName === "order_refunded") {
          const { error } = await supabase
            .from("entitlements")
            .update({ status: "trial", trial_ends_at: new Date().toISOString(), paid_at: null, payment_source: null })
            .eq("user_id", event.userId);
          if (error) {
            console.error("[webhooks/lemonsqueezy] no se pudo revertir el reembolso", error);
            return new Response("DB error", { status: 500 });
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
