import { createFileRoute } from "@tanstack/react-router";
import { runNotificacionesCron } from "@/lib/notifications.functions";

// Endpoint que dispara Vercel Cron (ver vercel.json). No es una pantalla
// para usuarios: SSR corre `runNotificacionesCron` en el loader (que valida
// el header Authorization: Bearer <CRON_SECRET> que Vercel agrega solo)
// antes de devolver cualquier HTML. Sin el secret correcto, el server fn
// tira una excepción y esta ruta responde con error en vez de HTML normal.
// Se llama al server fn directo (sin useServerFn, que es un hook de React y
// esta ruta nunca se navega desde la UI): createServerFn ya expone la
// función como invocable directamente server-side.
export const Route = createFileRoute("/cron-notificaciones")({
  ssr: true,
  loader: () => runNotificacionesCron(),
  component: () => {
    const data = Route.useLoaderData();
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  },
});
