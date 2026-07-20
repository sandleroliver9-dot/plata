import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Chatbot simulador de escenarios ("si compro esto en N cuotas, ¿cómo quedo?").
 *
 * Principios acordados para toda la IA de la app:
 * - NUNCA da consejos financieros: muestra escenarios en paralelo y el
 *   usuario decide. Si le piden una recomendación, lo aclara y redirige.
 * - NUNCA hace aritmética por su cuenta: la proyección base viene ya
 *   calculada por la app (la misma tabla de 12 meses de Proyecciones), y
 *   cualquier operación sobre ella pasa por herramientas deterministas que
 *   se ejecutan acá en el servidor, no en el modelo.
 * - Gateado detrás de ANTHROPIC_API_KEY: sin la clave devuelve
 *   { configured: false } y la UI avisa, nunca rompe.
 */

type ProyeccionMes = { mes: string; ingresos: number; gastos: number; disponible: number };
type Turno = { role: "user" | "assistant"; content: string };

const MAX_PREGUNTA = 500;
const MAX_HISTORIAL = 12;
const MAX_MESES = 12;

export const simulateScenario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pregunta: string; historial: Turno[]; moneda: string; proyeccion: ProyeccionMes[] }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { configured: false as const };
    }

    const pregunta = data.pregunta.trim().slice(0, MAX_PREGUNTA);
    if (!pregunta) throw new Error("Escribí una pregunta primero");
    const proyeccion = data.proyeccion.slice(0, MAX_MESES).map((m) => ({
      mes: String(m.mes).slice(0, 20),
      ingresos: Math.round(Number(m.ingresos) || 0),
      gastos: Math.round(Number(m.gastos) || 0),
      disponible: Math.round(Number(m.disponible) || 0),
    }));
    const historial = data.historial.slice(-MAX_HISTORIAL).map((t) => ({
      role: t.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(t.content).slice(0, 2000),
    }));

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const system = `Sos el simulador financiero de Platium, una app argentina de finanzas personales. Tu única función es ayudar al usuario a ENTENDER escenarios con sus propios números: compras en cuotas, impacto en su flujo de caja, cuánto le quedaría disponible por mes.

Reglas estrictas:
- NUNCA das consejos ni recomendaciones financieras. No decís qué le conviene, si debería comprar o no, en cuántas cuotas hacerlo, ni opinás sobre inversiones o préstamos. Si te piden una recomendación, aclarás amablemente que no das consejos, y ofrecés mostrar los escenarios en paralelo (ej: cómo queda en 3, 6 y 12 cuotas) para que decida el usuario.
- NUNCA calculás números vos. Todo número que muestres tiene que salir de los resultados de las herramientas o de la proyección del contexto. Si necesitás dividir un monto en cuotas o restar una cuota del disponible, usás las herramientas.
- Respondés en español rioplatense (vos), corto y claro. Montos en ${data.moneda === "USD" ? "dólares" : "pesos argentinos"}, formateados con separador de miles.
- "Disponible" en la proyección es lo que le queda al usuario cada mes después de gastos fijos y cuotas, antes de su objetivo de ahorro. Un disponible negativo con la compra simulada significa que ese mes no le alcanza.

Proyección de los próximos meses del usuario (calculada por la app):
${proyeccion.map((m) => `- ${m.mes}: ingresos ${m.ingresos}, gastos ${m.gastos}, disponible ${m.disponible}`).join("\n")}`;

    const tools = [
      {
        name: "calcular_cuota",
        description: "Divide un monto total en N cuotas iguales sin interés y devuelve el valor de cada cuota.",
        input_schema: {
          type: "object" as const,
          properties: {
            montoTotal: { type: "number" as const },
            cantidadCuotas: { type: "number" as const },
          },
          required: ["montoTotal", "cantidadCuotas"],
        },
      },
      {
        name: "proyectar_escenario",
        description: "Aplica una cuota mensual fija sobre la proyección del usuario durante N meses y devuelve, mes a mes, el disponible actual y el disponible si asumiera esa cuota.",
        input_schema: {
          type: "object" as const,
          properties: {
            cuotaMensual: { type: "number" as const },
            cantidadMeses: { type: "number" as const },
          },
          required: ["cuotaMensual", "cantidadMeses"],
        },
      },
    ];

    function runTool(name: string, input: any) {
      if (name === "calcular_cuota") {
        const total = Number(input?.montoTotal) || 0;
        const n = Math.max(1, Math.round(Number(input?.cantidadCuotas) || 1));
        return { valorCuota: Math.round((total / n) * 100) / 100, cantidadCuotas: n, montoTotal: total };
      }
      if (name === "proyectar_escenario") {
        const cuota = Number(input?.cuotaMensual) || 0;
        const meses = Math.max(1, Math.min(MAX_MESES, Math.round(Number(input?.cantidadMeses) || 1)));
        return {
          cuotaMensual: cuota,
          meses: proyeccion.slice(0, meses).map((m) => ({
            mes: m.mes,
            disponibleHoy: m.disponible,
            disponibleConCompra: Math.round((m.disponible - cuota) * 100) / 100,
          })),
        };
      }
      return { error: `Herramienta desconocida: ${name}` };
    }

    const messages: any[] = [...historial, { role: "user", content: pregunta }];
    // El chatbot necesita razonar mejor que las tareas de extraccion
    // (carga rapida/categorizacion usan Haiku): aca va el modelo grande.
    const model = "claude-sonnet-5";

    let response = await client.messages.create({ model, max_tokens: 1024, system, tools, messages });
    let guard = 0;
    while (response.stop_reason === "tool_use" && guard < 5) {
      guard++;
      const toolResults = response.content
        .filter((block) => block.type === "tool_use")
        .map((block: any) => ({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: JSON.stringify(runTool(block.name, block.input)),
        }));
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
      response = await client.messages.create({ model, max_tokens: 1024, system, tools, messages });
    }

    const respuesta = response.content
      .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!respuesta) throw new Error("No pude armar una respuesta, probá reformular la pregunta");
    return { configured: true as const, respuesta };
  });
