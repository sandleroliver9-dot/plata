import type { CapacitorConfig } from "@capacitor/cli";

// Platium corre como TanStack Start con server functions (Supabase, IA,
// cotizaciones), no como una SPA estática — no se puede empaquetar como
// bundle local dentro de la app. Por eso server.url apunta directo a la
// web en producción: la app nativa es un contenedor delgado sobre el
// sitio real, con acceso a plugins nativos de Capacitor por encima.
const config: CapacitorConfig = {
  appId: "com.platium.app",
  appName: "Platium",
  webDir: "capacitor-www",
  server: {
    url: "https://www.platium.app",
    androidScheme: "https",
    iosScheme: "https",
    // Login con Google (vía Supabase Auth) redirecciona por accounts.google.com
    // y por el dominio de Supabase antes de volver a platium.app — sin
    // esto la WebView de Capacitor corta la navegación a esos dominios.
    allowNavigation: [
      "*.platium.app",
      "*.supabase.co",
      "accounts.google.com",
      "*.google.com",
    ],
  },
};

export default config;
