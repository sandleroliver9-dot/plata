# Plata

Plata es una app de finanzas personales para registrar ingresos, gastos, cuotas, prestamos, vencimientos, inversiones, metas y proyecciones.

## Requisitos

- Node.js 22 o superior
- npm
- Un proyecto de Supabase con las migraciones de `supabase/migrations`

## Configuracion

1. Copiar `.env.example` a `.env`.
2. Completar las variables de Supabase.
3. Instalar dependencias:

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Notas de entrega

- No subir `.env` al repositorio.
- Usar un solo gestor de paquetes. Esta entrega queda preparada para npm con `package-lock.json`.
- Las cotizaciones externas dependen de servicios publicos de terceros, por lo que pueden fallar temporalmente sin romper la app.
