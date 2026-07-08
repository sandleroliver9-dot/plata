import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/terminos")({
  head: () => ({ meta: [{ title: "Términos y Condiciones · Plata" }] }),
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
            <p className="text-xs">Última actualización: julio 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">1. Qué es Plata</h2>
            <p>
              Plata es una herramienta personal para registrar y visualizar tu información financiera:
              ingresos, gastos, tarjetas, préstamos, metas, inversiones e inmuebles que vos mismo cargás.
              Plata <strong>no es una entidad financiera, no procesa pagos ni mueve dinero</strong>: es
              exclusivamente un tracker/organizador. No está regulada por el BCRA ni ofrece productos
              bancarios o de inversión.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">2. Etapa beta</h2>
            <p>
              Plata está en fase de pruebas con un grupo cerrado de usuarios. Puede tener errores,
              cambios de funcionalidad sin aviso previo, e interrupciones del servicio. No se garantiza
              disponibilidad continua ni la conservación indefinida de los datos cargados durante esta etapa.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">3. Tu cuenta</h2>
            <p>
              Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que
              ocurra en tu cuenta. La información financiera que cargás (montos, categorías, fechas) es
              ingresada manualmente por vos; Plata no verifica su exactitud.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">4. Uso aceptable</h2>
            <p>
              No está permitido usar Plata para actividades ilegales, intentar acceder a cuentas de otros
              usuarios, ni realizar ingeniería inversa de la aplicación.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">5. Eliminación de cuenta</h2>
            <p>
              Podés pedir la eliminación de tu cuenta y de todos tus datos en cualquier momento,
              escribiendo a{" "}
              <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
                sandleroliver9@gmail.com
              </a>
              . Al eliminar la cuenta se borra en cascada toda la información asociada (movimientos,
              tarjetas, préstamos, metas, inversiones, inmuebles).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">6. Sin garantías</h2>
            <p>
              Plata se ofrece "tal cual", sin garantías de ningún tipo durante esta etapa de pruebas. No
              nos responsabilizamos por decisiones financieras tomadas en base a la información mostrada
              en la app.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">7. Contacto</h2>
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
