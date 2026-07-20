# CONTEXTO DEL PROYECTO: PLATIUM

Estoy desarrollando una startup fintech llamada **Platium**.

La visión NO es hacer una app simple de gastos.

El objetivo es construir un **asistente financiero personal inteligente** para Latinoamérica que permita a cualquier persona entender, proyectar y optimizar su situación financiera completa.

Quiero que evolucione hacia una startup SaaS con potencial comercial real.

---

# PROBLEMA QUE RESUELVE

La mayoría de las personas:

* No saben cuánto pueden gastar realmente.
* No entienden el impacto de las cuotas futuras.
* No tienen una visión financiera completa.
* Manejan ingresos y gastos en distintas apps o planillas.
* No pueden proyectar meses futuros.
* Toman decisiones financieras sin información.

Platium busca resolver eso mostrando una visión integral del dinero.

---

# FILOSOFÍA DEL PRODUCTO

No quiero una app contable.

No quiero una app para registrar gastos únicamente.

Quiero una app que responda preguntas como:

* ¿Cuánto puedo gastar hoy?
* ¿Voy a llegar bien a fin de mes?
* ¿Qué pasa si saco este préstamo?
* ¿Qué pasa si compro esto en cuotas?
* ¿Cuándo voy a alcanzar mi meta?
* ¿Estoy ahorrando suficiente?
* ¿Cuál es mi patrimonio real?
* ¿Qué decisión financiera me conviene?

---

# STACK ACTUAL

Frontend:

* React
* TypeScript
* TanStack Router
* TanStack Query
* Tailwind

Backend:

* Supabase
* PostgreSQL
* Auth de Supabase

Deploy:

* Vercel

---

# MÓDULOS ACTUALES

## Dashboard

Muestra:

* ingresos
* gastos
* balance
* score financiero
* top categorías
* evolución últimos meses

---

## Movimientos

Permite:

* cargar ingresos
* cargar gastos
* editar movimientos
* eliminar movimientos

---

## Crédito y Cuotas

Permite:

* registrar compras financiadas
* generar cuotas futuras
* proyectar impacto financiero

---

## Flujo de Caja

Permite visualizar:

* meses futuros
* ingresos proyectados
* gastos proyectados
* saldo proyectado

---

## Calendario Financiero

Muestra:

* vencimientos
* fechas de cobro
* eventos financieros

---

## Metas

Permite:

* definir objetivos
* seguir progreso

---

## Inmuebles

Permite:

* registrar propiedades
* calcular patrimonio

---

## Inversiones

Permite:

* registrar inversiones
* calcular valor

---

## Alertas

Sistema inicial de recordatorios financieros.

---

## Insights

Módulo de recomendaciones financieras.

---

# SISTEMA DE MES FINANCIERO

La app utiliza "mes financiero".

No necesariamente coincide con el mes calendario.

Por ejemplo:

Si cobro el 25 de junio:

El período financiero puede ser:

25 junio → 24 julio

Todo el sistema debe respetar esta lógica.

Campos importantes:

* pay_day
* mes_financiero
* fecha_cobro

---

# INGRESOS

Actualmente existe una tabla:

public.ingresos

Campos relevantes:

* user_id
* concepto
* tipo
* monto
* fecha_cobro
* mes_financiero
* activo

Existe un ingreso especial:

```text
concepto = "Sueldo"
tipo = "Sueldo"
```

---

# CAMBIO RECIENTE IMPLEMENTADO

Al guardar Configuración:

* se actualiza profile
* se genera o actualiza automáticamente un ingreso tipo Sueldo
* se calcula fecha_cobro
* se calcula mes_financiero
* se evita duplicación

Hubo problemas donde:

* localhost funcionaba
* Vercel no reflejaba ingresos

Se corrigieron:

* filtros por user_id
* dependencias del useMemo
* sincronización de ingresos

---

# OBJETIVO DE CORTO PLAZO

Tener una versión estable para testers.

Necesito detectar:

* bugs
* inconsistencias financieras
* problemas de UX

---

# OBJETIVO DE MEDIANO PLAZO

Convertir Platium en una herramienta financiera completa.

Agregar:

### Patrimonio Neto

Mostrar:

* activos
* pasivos
* patrimonio neto

---

### Proyecciones Inteligentes

Simular:

* compras
* préstamos
* inversiones
* aumentos salariales

---

### Centro Financiero

Vista central que responda:

* situación actual
* próximos riesgos
* oportunidades

---

### Recomendaciones con IA

Ejemplos:

* estás gastando demasiado en X
* podrías ahorrar Y
* esta compra afecta tu meta
* este préstamo es riesgoso

---

### Score Financiero Real

No gamificado.

Basado en:

* liquidez
* ahorro
* deuda
* patrimonio
* estabilidad

---

# OBJETIVO DE LARGO PLAZO

Convertir Platium en un "copiloto financiero".

Quiero que un usuario pueda abrir la app y recibir:

* diagnóstico financiero
* recomendaciones
* proyecciones
* simulaciones
* alertas

sin necesidad de interpretar planillas o números complejos.

---

# PRINCIPIOS DE DESARROLLO

Cuando propongas cambios:

1. Pensar siempre como producto SaaS.
2. Priorizar valor para el usuario.
3. Evitar complejidad innecesaria.
4. Mantener coherencia con el sistema de mes financiero.
5. No romper datos existentes.
6. Pensar en escalabilidad futura.
7. Priorizar experiencia de usuario por sobre perfección técnica.
8. Cualquier funcionalidad nueva debe acercar la app al objetivo de convertirse en un asistente financiero personal inteligente.

---

# COSAS QUE QUIERO AGREGAR MÁS ADELANTE

## Descubierto configurable

Idea ya definida:

No considerar el descubierto como dinero disponible por defecto.

Agregar modos:

* Estricto (0%)
* Flexible
* Emergencia
* Porcentaje configurable

Debe funcionar como métrica de riesgo y no como saldo disponible.

---

## Simulador financiero

Permitir:

* simular gastos
* simular cuotas
* simular préstamos
* simular cambios de sueldo

antes de ejecutarlos.

---

## Sistema de salud financiera

Más avanzado que el score actual.

Con métricas:

* liquidez
* endeudamiento
* ahorro
* patrimonio
* estabilidad

---

## Automatización

Objetivo futuro:

Conectar bancos y tarjetas para importar movimientos automáticamente.

---

Quiero que cualquier sugerencia o desarrollo futuro se alinee con esta visión y no trate a Platium como una simple app de gastos.

---

# ROADMAP ACORDADO (orden de ejecución)

1. Ver el feedback de los testers y hacer las mejoras pertinentes.
2. Automatización de movimientos bancarios (conexión de cuenta/débito vía agregador tipo Belvo — NO tarjeta de crédito, NO mueve plata).
3. IA dentro de la app: carga rápida de movimientos por texto/voz, categorización automática, y un chatbot simulador de escenarios (cuotas, flujo de caja) que **muestra opciones en paralelo pero nunca recomienda** qué hacer — la app no es una entidad financiera regulada y no da asesoramiento financiero.
4. Pasar Platium a app real: PWA primero, después empaquetar con Capacitor para publicar en Apple App Store y Google Play.

Recién después de completar estos 4 pasos: versión Pro (para inversores) y versión Premium (para negocios), alineadas con la visión de este documento.
