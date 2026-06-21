import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { S as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BPUTkY9s.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
const appCss = "/assets/styles-BRqnCQf2.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Página no encontrada" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "La página que buscás no existe o fue movida." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Ir al inicio"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "No pudimos cargar esta página" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Algo salió mal. Probá refrescar o volvé al inicio." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          children: "Reintentar"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
          children: "Ir al inicio"
        }
      )
    ] })
  ] }) });
}
const Route$k = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Plata · Tu fintech personal" },
      { name: "description", content: "Controlá tus ingresos, gastos, tarjetas, inversiones y patrimonio en un solo lugar." },
      { name: "theme-color", content: "#0a0a1a" },
      { property: "og:title", content: "Plata · Tu fintech personal" },
      { property: "og:description", content: "Controlá tus finanzas como una app bancaria." },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "es", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$k.useRouteContext();
  const router = useRouter();
  reactExports.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [queryClient, router]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, theme: "dark", position: "top-right" })
  ] });
}
const $$splitComponentImporter$i = () => import("./reset-password-CFanU-BC.mjs");
const Route$j = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Restablecer contraseña · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./auth-Db_xhxr6.mjs");
const Route$i = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "Ingresar · Plata"
    }]
  }),
  beforeLoad: async () => {
    const {
      data
    } = await supabase.auth.getSession();
    if (data.session) throw redirect({
      to: "/dashboard"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./route-GxhTz3NU.mjs");
async function waitForSession() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const {
      data
    } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }
  return null;
}
const Route$h = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await waitForSession();
    if (!session) throw redirect({
      to: "/auth"
    });
    return {
      user: session.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const Route$g = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  }
});
const $$splitComponentImporter$f = () => import("./vencimientos-w-GAC6OK.mjs");
const Route$f = createFileRoute("/_authenticated/vencimientos")({
  head: () => ({
    meta: [{
      title: "Vencimientos · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./tarjetas-x0JJnjdR.mjs");
const Route$e = createFileRoute("/_authenticated/tarjetas")({
  head: () => ({
    meta: [{
      title: "Tarjetas y cuotas · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./proyecciones-C9A3AmKn.mjs");
const Route$d = createFileRoute("/_authenticated/proyecciones")({
  head: () => ({
    meta: [{
      title: "Proyecciones · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./prestamo-3DESPz8Y.mjs");
const Route$c = createFileRoute("/_authenticated/prestamo")({
  head: () => ({
    meta: [{
      title: "Préstamos · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./patrimonio-DWWvG0WV.mjs");
const Route$b = createFileRoute("/_authenticated/patrimonio")({
  head: () => ({
    meta: [{
      title: "Patrimonio · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./movimientos-C5geDmBd.mjs");
const Route$a = createFileRoute("/_authenticated/movimientos")({
  head: () => ({
    meta: [{
      title: "Movimientos · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./metas-BZtgT6ED.mjs");
const Route$9 = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [{
      title: "Metas · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./inversiones-CTkK_gNM.mjs");
const Route$8 = createFileRoute("/_authenticated/inversiones")({
  head: () => ({
    meta: [{
      title: "Inversiones · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./insights-v9F10n6C.mjs");
const Route$7 = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [{
      title: "Insights · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./inmuebles-hmZKBS7U.mjs");
const Route$6 = createFileRoute("/_authenticated/inmuebles")({
  head: () => ({
    meta: [{
      title: "Inmuebles · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./ingresos-D-AXJg8h.mjs");
const Route$5 = createFileRoute("/_authenticated/ingresos")({
  head: () => ({
    meta: [{
      title: "Ingresos · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./gastos-fijos-Dbap3Sc2.mjs");
const Route$4 = createFileRoute("/_authenticated/gastos-fijos")({
  head: () => ({
    meta: [{
      title: "Gastos fijos · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./dashboard-As9eQvZ8.mjs");
const Route$3 = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{
      title: "Resumen · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./configuracion-BpgkX1oJ.mjs");
const Route$2 = createFileRoute("/_authenticated/configuracion")({
  head: () => ({
    meta: [{
      title: "Configuracion · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./calendario-financiero-Lg3inqML.mjs");
const Route$1 = createFileRoute("/_authenticated/calendario-financiero")({
  head: () => ({
    meta: [{
      title: "Calendario financiero · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./alertas-ONv_m0rc.mjs");
const Route = createFileRoute("/_authenticated/alertas")({
  head: () => ({
    meta: [{
      title: "Alertas · Plata"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const ResetPasswordRoute = Route$j.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$k
});
const AuthRoute = Route$i.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$k
});
const AuthenticatedRouteRoute = Route$h.update({
  id: "/_authenticated",
  getParentRoute: () => Route$k
});
const IndexRoute = Route$g.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$k
});
const AuthenticatedVencimientosRoute = Route$f.update({
  id: "/vencimientos",
  path: "/vencimientos",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedTarjetasRoute = Route$e.update({
  id: "/tarjetas",
  path: "/tarjetas",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedProyeccionesRoute = Route$d.update({
  id: "/proyecciones",
  path: "/proyecciones",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedPrestamoRoute = Route$c.update({
  id: "/prestamo",
  path: "/prestamo",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedPatrimonioRoute = Route$b.update({
  id: "/patrimonio",
  path: "/patrimonio",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedMovimientosRoute = Route$a.update({
  id: "/movimientos",
  path: "/movimientos",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedMetasRoute = Route$9.update({
  id: "/metas",
  path: "/metas",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedInversionesRoute = Route$8.update({
  id: "/inversiones",
  path: "/inversiones",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedInsightsRoute = Route$7.update({
  id: "/insights",
  path: "/insights",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedInmueblesRoute = Route$6.update({
  id: "/inmuebles",
  path: "/inmuebles",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedIngresosRoute = Route$5.update({
  id: "/ingresos",
  path: "/ingresos",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedGastosFijosRoute = Route$4.update({
  id: "/gastos-fijos",
  path: "/gastos-fijos",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardRoute = Route$3.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedConfiguracionRoute = Route$2.update({
  id: "/configuracion",
  path: "/configuracion",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCalendarioFinancieroRoute = Route$1.update({
  id: "/calendario-financiero",
  path: "/calendario-financiero",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAlertasRoute = Route.update({
  id: "/alertas",
  path: "/alertas",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedAlertasRoute,
  AuthenticatedCalendarioFinancieroRoute,
  AuthenticatedConfiguracionRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedGastosFijosRoute,
  AuthenticatedIngresosRoute,
  AuthenticatedInmueblesRoute,
  AuthenticatedInsightsRoute,
  AuthenticatedInversionesRoute,
  AuthenticatedMetasRoute,
  AuthenticatedMovimientosRoute,
  AuthenticatedPatrimonioRoute,
  AuthenticatedPrestamoRoute,
  AuthenticatedProyeccionesRoute,
  AuthenticatedTarjetasRoute,
  AuthenticatedVencimientosRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute,
  ResetPasswordRoute
};
const routeTree = Route$k._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 3e4 } }
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
