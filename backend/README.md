# Plata Backend API

Backend REST API para Plata - Gestor de Finanzas Personales.

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y llenar credenciales de Supabase:

```bash
cp .env.example .env
```

### 3. Iniciar en desarrollo

```bash
npm run dev
```

El servidor correrá en `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Estado del servidor

### Autenticación
- Todos los endpoints requieren `Authorization: Bearer {token}` header

### Profile
- `GET /api/profile` - Obtener perfil
- `PUT /api/profile` - Actualizar perfil

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Transacciones
- `GET /api/transactions?month=2026-01` - Listar transacciones
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

## Estructura

```
backend/
├── src/
│   ├── index.ts           # Servidor principal
│   ├── middleware/
│   │   └── auth.ts        # Middleware de autenticación
│   └── routes/
│       ├── profile.ts     # Rutas de perfil
│       ├── categories.ts  # Rutas de categorías
│       └── transactions.ts # Rutas de transacciones
├── prisma/
│   └── schema.prisma      # Schema de base de datos
├── .env                   # Variables de entorno
└── package.json
```

## Próximos Pasos

1. Crear rutas para:
   - Ingresos (Income)
   - Vencimientos (Bills)
   - Inversiones (Investments)
   - Metas (Goals)
   - Proyecciones (Projections)
   - Cotizaciones (Quotes)

2. Migrar frontend para usar estas APIs

3. Agregar validación de entrada con Zod

4. Agregar tests

## Desarrollo

```bash
npm run dev          # Iniciar servidor con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Ejecutar compilado
npm run lint         # Linter
npm run db:push      # Sincronizar schema con Supabase
npm run db:studio    # Abrir Prisma Studio
```
