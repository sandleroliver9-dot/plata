// Service Worker mínimo para notificaciones push (vencimientos próximos,
// recordatorio de sueldo). No cachea nada ni intercepta fetch — solo escucha
// push/notificationclick. Ver src/lib/notifications.functions.ts (server) y
// src/routes/_authenticated/configuracion.tsx (suscripción del navegador).

self.addEventListener("push", (event) => {
  let payload = { title: "Platium", body: "Tenés novedades." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // payload no vino como JSON: se usa el default de arriba.
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url || "/notificaciones" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/notificaciones";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(url);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
