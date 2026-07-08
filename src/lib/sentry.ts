import * as Sentry from "@sentry/tanstackstart-react";

// El DSN de Sentry es publico por diseño (va embebido en el bundle del
// cliente), pero igual lo leemos de una env var en vez de hardcodearlo para
// poder rotarlo sin tocar codigo. Solo se activa en produccion: no queremos
// que errores locales durante desarrollo consuman la cuota gratuita.
let initialized = false;

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || !import.meta.env.PROD || initialized) return;
  initialized = true;
  Sentry.init({ dsn, tracesSampleRate: 0 });
}

export { Sentry };
