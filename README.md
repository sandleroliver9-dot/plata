# Plata - Personal Finance Manager

Aplicación fullstack de gestión de finanzas personales con backend Express separado y frontend React. Diseñada para registrar ingresos, gastos, cuotas, préstamos, vencimientos, inversiones, metas y proyecciones financieras.

## 🏗️ Arquitectura

### Frontend (React + TanStack)
- **Framework**: TanStack Start + React Router v1
- **UI**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Ubicación**: `/src`
- **Puerto**: `8080`

### Backend (Express + TypeScript)
- **Framework**: Express.js con TypeScript 5.2
- **Base de datos**: Supabase PostgreSQL
- **Validación**: Zod 3.22
- **Ubicación**: `/backend`
- **Puerto**: `3000`

### Base de datos
- **Proveedor**: Supabase PostgreSQL
- **Multi-tenant**: Particionado por `user_id`
- **Migrations**: `/supabase/migrations`

## 🚀 Quick Start

### Requisitos
- Node.js 20+
- npm o yarn
- Git
- Cuenta Supabase

### Instalación Local

1. **Clonar repositorio**
```bash
git clone https://github.com/sandleroliver9-dot/plata.git
cd plata
```

2. **Configurar variables de entorno**

Frontend (`.env`):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_API_URL=http://localhost:3000
```

Backend (`backend/.env`):
```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=super-secret-jwt-key-xxxx
```

3. **Instalar dependencias**

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

4. **Iniciar en desarrollo**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

Accede a:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📦 Docker

### Docker Compose (Recomendado)

1. **Crear archivo `.env.docker`**
```bash
cp .env.docker.example .env.docker
# Editar con tus credenciales de Supabase
```

2. **Construir e iniciar**
```bash
docker-compose up --build
```

El frontend estará en `http://localhost:8080` y el backend en `http://localhost:3000`.

### Builds individuales

**Backend:**
```bash
cd backend
docker build -t plata-backend .
docker run -p 3000:3000 --env-file .env plata-backend
```

**Frontend:**
```bash
docker build -t plata-frontend .
docker run -p 8080:8080 plata-frontend
```

## 🔌 API Endpoints

Todos los endpoints excepto cotizaciones requieren autenticación con token Bearer de Supabase.

### Authentication
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/profile
```

### Profile
- `GET /api/profile` - Obtener perfil del usuario
- `PUT /api/profile` - Actualizar perfil (salario, día de pago, etc)

### Categorías
- `GET /api/categories` - Listar categorías del usuario
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar (soft delete)

### Movimientos/Transacciones
- `GET /api/transactions?month=2026-01` - Listar transacciones por mes
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

### Ingresos Recurrentes
- `GET /api/income` - Listar ingresos
- `POST /api/income` - Crear ingreso
- `PUT /api/income/:id` - Actualizar ingreso
- `DELETE /api/income/:id` - Eliminar ingreso

### Vencimientos/Cuotas
- `GET /api/bills` - Listar vencimientos
- `POST /api/bills` - Crear vencimiento
- `PUT /api/bills/:id` - Actualizar vencimiento
- `PATCH /api/bills/:id/pay` - Marcar como pagado
- `DELETE /api/bills/:id` - Eliminar vencimiento

### Metas de Ahorro
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Crear meta
- `PUT /api/goals/:id` - Actualizar meta
- `PATCH /api/goals/:id/progress` - Actualizar progreso
- `DELETE /api/goals/:id` - Eliminar meta

### Inversiones
- `GET /api/investments/buys` - Listar compras
- `GET /api/investments/sells` - Listar ventas
- `GET /api/investments/dividends` - Listar dividendos
- `POST /api/investments/buy` - Registrar compra
- `POST /api/investments/sell` - Registrar venta
- `POST /api/investments/dividend` - Registrar dividendo
- `DELETE /api/investments/buy/:id` - Eliminar compra
- `DELETE /api/investments/sell/:id` - Eliminar venta
- `DELETE /api/investments/dividend/:id` - Eliminar dividendo

### Cotizaciones (Sin autenticación)
- `GET /api/quotes/dolar` - Cotizaciones del dólar
- `GET /api/quotes/inflation` - Datos de inflación Argentina

## 📁 Estructura del Proyecto

```
plata/
├── src/                              # Frontend React
│   ├── components/
│   │   ├── app/                     # Componentes principales
│   │   │   ├── app-shell.tsx
│   │   │   ├── csv-import-dialog.tsx
│   │   │   ├── movimiento-dialog.tsx
│   │   │   └── ...
│   │   └── ui/                      # Componentes Radix UI
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       └── ...
│   ├── routes/                      # TanStack Router
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── auth.tsx
│   │   └── _authenticated/
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts            # Cliente API con helpers tipados
│   │   ├── queries.ts               # React Query definitions
│   │   ├── finance.ts               # Lógica financiera
│   │   ├── categories.ts
│   │   ├── utils.ts
│   │   └── ...
│   ├── hooks/                       # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-mobile.tsx
│   │   └── use-profile.ts
│   └── styles.css
├── backend/                          # Express + TypeScript
│   ├── src/
│   │   ├── routes/                  # HTTP Routes
│   │   │   ├── profile.ts
│   │   │   ├── categories.ts
│   │   │   ├── transactions.ts
│   │   │   ├── income.ts
│   │   │   ├── bills.ts
│   │   │   ├── goals.ts
│   │   │   ├── investments.ts
│   │   │   └── quotes.ts
│   │   ├── services/                # Business Logic
│   │   │   ├── profileService.ts
│   │   │   ├── categoriesService.ts
│   │   │   ├── transactionsService.ts
│   │   │   ├── incomeService.ts
│   │   │   ├── billsService.ts
│   │   │   ├── goalsService.ts
│   │   │   ├── investmentsService.ts
│   │   │   └── quotesService.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT verification
│   │   │   └── validate.ts          # Zod validation
│   │   └── index.ts                 # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── supabase/
│   └── migrations/                  # Database migrations
├── docker-compose.yml
├── Dockerfile
├── .env.docker.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación
1. **Frontend**: Supabase Auth maneja Login/Signup
2. **Backend**: Valida JWT tokens firmados por Supabase
3. **Middleware**: `authenticateToken` verifica en `Authorization: Bearer <token>`
4. **User ID**: Se extrae del JWT y se usa para filtrar datos

### Validación
- Todos los POST/PUT/PATCH usan Zod schemas
- Errores de validación retornan 400 con detalles
- Acceso no autorizado retorna 401

## 📊 Base de Datos

### Tablas principales
- `profiles` - Perfil del usuario (salario, día pago, etc)
- `categorias` - Categorías de transacciones
- `movimientos` - Transacciones/gastos
- `ingresos` - Ingresos recurrentes
- `vencimientos` - Cuotas/facturas/suscripciones
- `metas` - Metas de ahorro
- `inversiones_compras` - Compras de inversiones
- `inversiones_ventas` - Ventas de inversiones
- `inversiones_dividendos` - Dividendos recibidos

Todas las tablas están particionadas por `user_id` para multi-tenancy.

## 📝 Scripts

### Frontend
```bash
npm run dev              # Desarrollo con hot-reload
npm run build            # Build de producción
npm run preview          # Preview del build
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run format           # Prettier format
```

### Backend
```bash
cd backend
npm run dev              # Desarrollo con nodemon
npm run build            # Compilar TypeScript
npm run start            # Ejecutar compilado
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run format           # Prettier format
```

## 🌐 Integraciones Externas

- **Supabase**: Base de datos PostgreSQL + Auth
- **dolarapi.com**: Cotizaciones de dólar en Argentina
- **Bluelytics.com.ar**: Inflación de Argentina

## 🚢 Deployment

### Vercel (Frontend)
```bash
# Variables de entorno en Vercel
VITE_API_URL=https://tu-backend.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Render/Railway/Heroku (Backend)
```bash
# Variables de entorno
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
```

## 📋 Notas de Desarrollo

- No subir `.env` al repositorio (usar `.env.example` como template)
- Usar un solo gestor de paquetes (npm se usa en esta entrega)
- Las cotizaciones externas dependen de servicios públicos de terceros
- Las migraciones de Supabase están en `/supabase/migrations`
- Backend y frontend se comunican vía HTTP REST API

## 🐛 Troubleshooting

### Error de conexión al backend
- Verificar que backend está corriendo en `http://localhost:3000`
- Verificar que `VITE_API_URL` esté configurado correctamente
- Revisar CORS en `backend/src/index.ts`

### Error de autenticación
- Verificar que el token JWT es válido
- Verificar que `SUPABASE_JWT_SECRET` está correcto en backend
- Revisar logs en browser console

### Error de base de datos
- Verificar credenciales de Supabase
- Verificar que las migraciones fueron aplicadas
- Usar Supabase Studio para inspeccionar tablas

## 📄 Licencia

MIT

## 👤 Autor

Sandler Oliver

## 📧 Contacto

Abre un issue en GitHub para reportar bugs o sugerir features.

---

**Última actualización**: Junio 2026  
**Versión**: 2.0 - Monorepo con Backend separado
