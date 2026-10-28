import { createFileRoute } from "@tanstack/react-router";
import { runNotificacionesCron } from "@/lib/notifications.functions";

// Endpoint que dispara Vercel Cron (ver vercel.json). Antes esto validaba el
// secret adentro de un server fn usando getRequest() desde un loader — ese
// mecanismo dejó de funcionar de forma confiable (getRequest() no devolvía
// el header real en este contexto), así que ahora se valida acá mismo,
// directo sobre el Request real que entrega server.handlers — el mismo
// patrón que ya usan los webhooks de pago (Lemon Squeezy, RevenueCat).
export const Route = createFileRoute("/cron-notificaciones")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        const authHeader = request.headers.get("authorization");
        if (!secret || authHeader !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        const result = await runNotificacionesCron();
        return Response.json(result);
      },
    },
  },
});
