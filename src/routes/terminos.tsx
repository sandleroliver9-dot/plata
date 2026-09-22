import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/terminos")({
  head: () => ({ meta: [{ title: "Términos y Condiciones · Platium" }] }),
  component: TerminosPage,
});

function TerminosPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Volver
        </Link>
        <Card className="p-6 md:p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Términos y Condiciones</h1>
            <p className="text-xs">Última actualización: septiembre 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">1. Quiénes somos y qué es Platium</h2>
            <p>
              Platium es un servicio ofrecido por Oliver Sandler, persona física domiciliada en la Provincia
              de Buenos Aires, Argentina ("Platium", "nosotros"). Estos Términos y Condiciones (los "Términos")
              regulan el uso de la aplicación web y las aplicaciones móviles de Platium (en conjunto, la
              "App") por parte de cualquier persona que la use ("vos", "el usuario").
            </p>
            <p>
              Platium es una herramienta personal para registrar y visualizar tu información financiera:
              ingresos, gastos, tarjetas y cuotas, préstamos, metas de ahorro, inversiones e inmuebles que vos
              mismo cargás. Platium <strong>no es una entidad financiera, no está regulada por el BCRA, no
              ofrece productos bancarios, de crédito ni de inversión, y no accede ni opera tus cuentas
              bancarias</strong>: es exclusivamente un tracker/organizador de información que vos ingresás. Que
              Platium cobre un precio por su uso (ver Sección 5) no altera esta naturaleza: es el pago por el
              uso de un software, no una operación financiera regulada.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">2. Aceptación de los términos</h2>
            <p>
              Al crear una cuenta o usar Platium de cualquier forma, aceptás estos Términos y nuestra{" "}
              <Link to="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.
              Si no estás de acuerdo, no debés usar la App. Para usar Platium tenés que ser mayor de 18 años
              o contar con la autorización de tu representante legal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">3. Etapa beta</h2>
            <p>
              Platium está en fase de pruebas. Puede tener errores, cambios de funcionalidad sin aviso
              previo, e interrupciones del servicio. No se garantiza disponibilidad continua ni la
              conservación indefinida de los datos cargados durante esta etapa. Igualmente, hacemos nuestro
              mejor esfuerzo para que la información que cargás no se pierda.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">4. Registro y tu cuenta</h2>
            <p>
              Para usar Platium necesitás crear una cuenta con tu email y contraseña, o mediante tu cuenta de
              Google. Sos responsable de mantener la confidencialidad de tus credenciales y de toda la
              actividad que ocurra en tu cuenta. Tenés que darnos información real y mantenerla actualizada.
              La información financiera que cargás (montos, categorías, fechas) es ingresada manualmente por
              vos; Platium no verifica su exactitud ni se responsabiliza por errores de carga.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">5. Planes, precios y medios de pago</h2>
            <p>
              Al crear tu cuenta accedés a un período de prueba gratuito de 7 (siete) días con acceso
              completo a la App. Vencido ese plazo, seguir usando las funciones financieras de Platium
              requiere un pago único de <strong>USD 2,99</strong> (dólares estadounidenses), que otorga acceso
              completo sin vencimiento a la versión de la App vigente al momento del pago.
            </p>
            <p>
              Según desde dónde accedas, el pago se procesa a través de: (i) Stripe, si pagás desde la
              versión web de Platium; o (ii) Apple App Store o Google Play, si pagás desde la aplicación
              móvil correspondiente — sujeto además a los términos de pago de esas plataformas. Platium
              nunca ve ni almacena el número completo de tu tarjeta: ese dato lo procesa directamente el
              medio de pago elegido.
            </p>
            <p>
              Si pagás con una tarjeta emitida en Argentina, tu resumen puede reflejar un monto en pesos
              distinto a los USD 2,99 (por el tipo de cambio y los impuestos/percepciones que aplique tu
              banco o la AFIP a los consumos en moneda extranjera), ajeno a Platium.
            </p>
            <p>
              Nos reservamos el derecho de modificar el precio o el modelo de cobro (por ejemplo, pasar a un
              esquema de suscripción) para nuevos usuarios o nuevas versiones de la App, sin que eso afecte
              el acceso ya adquirido por usuarios existentes bajo el esquema vigente al momento de su pago.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">6. Derecho de arrepentimiento y reembolsos</h2>
            <p>
              De acuerdo con el artículo 34 de la Ley 24.240 de Defensa del Consumidor, si compraste el
              acceso a Platium a distancia (por ejemplo, desde la web), tenés derecho a revocar la aceptación
              dentro de los 10 (diez) días corridos contados desde la fecha del pago, sin costo ni
              responsabilidad alguna, escribiendo a{" "}
              <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
                sandleroliver9@gmail.com
              </a>
              . En ese caso te reintegramos el monto pagado por el medio de pago original.
            </p>
            <p>
              Si tu compra se realizó a través de Apple App Store o Google Play, los reembolsos se rigen por
              las políticas de esas plataformas, no por Platium directamente — tenés que solicitarlos ante
              Apple o Google.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">7. Uso aceptable</h2>
            <p>
              No está permitido usar Platium para actividades ilegales, intentar acceder a cuentas de otros
              usuarios, interferir con el funcionamiento de la App, ni realizar ingeniería inversa,
              descompilación o extracción no autorizada de su código o de sus diseños.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">8. Propiedad intelectual</h2>
            <p>
              "Platium", su logotipo y su diseño son marcas y creaciones cuya titularidad corresponde a
              Oliver Sandler, actualmente en trámite de registro ante el Instituto Nacional de la Propiedad
              Industrial (INPI). El software, los textos, gráficos y demás contenido de la App están
              protegidos por la Ley 11.723 de Propiedad Intelectual. No se te otorga ninguna licencia sobre
              estos elementos más allá del derecho a usar la App conforme a estos Términos. Los datos
              financieros que vos cargás siguen siendo tuyos: no reclamamos ninguna titularidad sobre ellos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">9. Uso de inteligencia artificial</h2>
            <p>
              Algunas funciones opcionales de Platium (como la carga rápida de movimientos) utilizan modelos
              de inteligencia artificial de terceros para asistirte a completar información. Estas funciones
              son una ayuda para cargar datos más rápido: <strong>Platium no realiza cálculos automáticos
              sobre tu información real sin que vos los confirmes, y en ningún caso te brinda asesoramiento
              financiero, recomendaciones de inversión ni sugerencias personalizadas sobre qué hacer con tu
              dinero</strong>. Cualquier información generada por IA puede contener errores y es tu
              responsabilidad revisarla antes de guardarla.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">10. Sin garantías y limitación de responsabilidad</h2>
            <p>
              Platium se ofrece "tal cual", sin garantías de ningún tipo, especialmente durante esta etapa de
              pruebas. No nos responsabilizamos por decisiones financieras que tomes en base a la información
              mostrada en la app, ni por pérdidas derivadas de errores de carga, interrupciones del servicio
              o fallas técnicas. Esta limitación no excluye responsabilidades que, según la Ley 24.240 u otra
              norma de orden público argentina, no puedan ser válidamente limitadas.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">11. Eliminación de cuenta</h2>
            <p>
              Podés pedir la eliminación de tu cuenta y de todos tus datos en cualquier momento, escribiendo
              a{" "}
              <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
                sandleroliver9@gmail.com
              </a>
              . Al eliminar la cuenta se borra en cascada toda la información asociada (movimientos,
              tarjetas, préstamos, metas, inversiones, inmuebles). Si ya pagaste el acceso completo, darte de
              baja no genera por sí solo derecho a reembolso fuera de lo previsto en la Sección 6.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">12. Modificaciones a estos Términos</h2>
            <p>
              Podemos actualizar estos Términos en cualquier momento, especialmente mientras Platium esté en
              etapa de pruebas. Si el cambio es significativo, te vamos a avisar por email o dentro de la
              App. Si seguís usando Platium después de un cambio, se entiende que lo aceptás.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">13. Ley aplicable y jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la República Argentina. Para cualquier controversia,
              en tu carácter de consumidor podés optar, a tu elección, por la justicia correspondiente a tu
              domicilio o por la de la Ciudad Autónoma de Buenos Aires, conforme el artículo 36 de la Ley
              24.240.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">14. Contacto</h2>
            <p>
              Consultas sobre estos términos:{" "}
              <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
                sandleroliver9@gmail.com
              </a>
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
