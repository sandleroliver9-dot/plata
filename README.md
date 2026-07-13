# Platium - Personal Finance Manager

Aplicación de gestión de finanzas personales. Registra ingresos, gastos, cuotas de tarjeta, préstamos, vencimientos, inversiones, metas de ahorro y proyecciones financieras.

## 🏗️ Arquitectura

Una sola app **TanStack Start** (React + SSR + server functions) que habla directo con **Supabase** — no hay un backend separado. Las pantallas usan el cliente de Supabase (`@supabase/supabase-js`) para leer/escribir datos con Row Level Security, y unas pocas operaciones sensibles (cotizaciones externas, sincronizar el perfil financiero) corren como TanStack Start server functions.

- **Framework**: TanStack Start + TanStack Router v1
- **UI**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Base de datos**: Supabase PostgreSQL (Auth + Postgres + RLS)
- **Ubicación**: `/src`
- **Migrations**: `/supabase/migrations`
- **Deploy**: Vercel (preset `vercel` de Nitro, configurado en `vite.config.ts`)

## 🚀 Quick Start

### Requisitos
- Node.js 20+
- npm
- Cuenta Supabase

### Instalación Local

1. **Clonar repositorio**
```bash
git clone https://github.com/sandleroliver9-dot/plata.git
cd plata
```

2. **Configurar variables de entorno**

Copiá `.env.example` a `.env.local` y completá tus credenciales de Supabase. Hacen falta las versiones `VITE_*` (para el cliente) **y** las versiones sin prefijo (para las server functions, que corren en Node y no ven `import.meta.env`):

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

3. **Instalar dependencias**
```bash
npm install
```

4. **Iniciar en desarrollo**
```bash
npm run dev
```

La app queda en `http://localhost:8080`.

## 📁 Estructura del Proyecto

```
plata/
├── src/
│   ├── components/
│   │   ├── app/                     # Componentes de la app (dialogs, widgets, layout)
│   │   └── ui/                      # Componentes Radix UI
│   ├── routes/                      # TanStack Router (file-based)
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── auth.tsx
│   │   └── _authenticated/          # Pantallas que requieren sesión
│   ├── lib/
│   │   ├── queries.ts               # React Query definitions
│   │   ├── finance.ts               # Mes financiero, formateo, fechas
│   │   ├── financial-centers.ts     # Cashflow, vencimientos, patrimonio neto
│   │   ├── profile.functions.ts     # Server functions (perfil financiero)
│   │   ├── quotes.functions.ts      # Server functions (cotizaciones externas)
│   │   └── ...
│   ├── integrations/supabase/       # Cliente Supabase + tipos generados
│   └── hooks/
├── supabase/
│   └── migrations/                  # Migrations de la base de datos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔐 Autenticación y Seguridad

- Supabase Auth maneja signup/login (email+password, Google OAuth) directo desde el cliente.
- Row Level Security en Postgres filtra cada tabla por `user_id = auth.uid()`.
- Las server functions que necesitan el usuario autenticado validan el JWT recibido por header `Authorization: Bearer <token>` (ver `src/integrations/supabase/auth-middleware.ts`).

## 📊 Base de Datos

Tablas principales (todas particionadas por `user_id`, con `ON DELETE CASCADE` desde `auth.users`):

- `profiles` — perfil del usuario (moneda, sueldo, día de cobro, objetivo de ahorro)
- `categorias` — categorías de ingresos/gastos
- `movimientos` — transacciones (ingresos y gastos reales)
- `ingresos` — ingresos recurrentes/cargados
- `gastos_fijos` — gastos recurrentes mensuales
- `tarjetas_cuotas` — compras en cuotas de tarjeta
- `prestamos` — préstamos y su progreso de pago
- `vencimientos` — vencimientos manuales (ABL, expensas, seguros, etc)
- `metas` — metas de ahorro
- `inmuebles` — portafolio inmobiliario
- `inversiones_activos` / `inversiones_compras` / `inversiones_ventas` / `inversiones_dividendos` — portafolio de inversiones

## 📝 Scripts

```bash
npm run dev              # Desarrollo con hot-reload
npm run build             # Build de producción (Nitro, preset Vercel)
npm run preview           # Preview del build
npm run lint               # ESLint
npm run type-check       # TypeScript check
npm run test               # Vitest
npm run format            # Prettier format
```

## 🌐 Integraciones Externas

- **Supabase**: base de datos PostgreSQL + Auth
- **dolarapi.com**: cotizaciones del dólar en Argentina
- **Bluelytics.com.ar**: inflación de Argentina
- **CoinGecko / Yahoo Finance**: cotizaciones de cripto y acciones (sección Inversiones)

## 🚢 Deployment

Se despliega en Vercel. Variables de entorno necesarias en el proyecto de Vercel:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
```

## 📋 Notas de Desarrollo

- No subir `.env*` al repositorio (usar `.env.example` como template).
- Las cotizaciones externas dependen de servicios públicos de terceros; si fallan, la app cae a un tipo de cambio de referencia y lo avisa en pantalla.
- Las migraciones de Supabase están en `/supabase/migrations`.

## 🐛 Troubleshooting

### "Missing Supabase environment variable(s)"
Faltan las variables sin prefijo `VITE_` (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`) que usan las server functions — no alcanza con configurar solo las `VITE_*`.

### Error de autenticación
- Verificar que el usuario confirmó su email (o que "Confirm email" esté desactivado en el proyecto de Supabase para pruebas).
- Revisar la consola del navegador para el mensaje de error específico de Supabase Auth.

### Error de base de datos
- Verificar credenciales de Supabase.
- Verificar que las migraciones fueron aplicadas.
- Usar Supabase Studio para inspeccionar tablas y RLS.

## 📄 Licencia

MIT

## 👤 Autor

Sandler Oliver

## 📧 Contacto

Abre un issue en GitHub para reportar bugs o sugerir features.
