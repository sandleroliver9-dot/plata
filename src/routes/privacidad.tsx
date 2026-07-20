import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/privacidad")({
  head: () => ({ meta: [{ title: "Política de Privacidad · Platium" }] }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Volver
        </Link>
        <Card className="p-6 md:p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Política de Privacidad</h1>
            <p className="text-xs">Última actualización: julio 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">1. Qué datos guardamos</h2>
            <p>Al usar Platium guardamos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Datos de cuenta: nombre y email (o los datos básicos que comparte Google si entrás con ese método).</li>
              <li>
                Datos financieros que vos cargás manualmente: ingresos, gastos, tarjetas y cuotas, préstamos,
                metas de ahorro, inversiones e inmuebles.
              </li>
            </ul>
            <p>
              <strong>No guardamos ni pedimos claves de home banking, números completos de tarjeta, ni
              accedemos a tus cuentas bancarias.</strong> Toda la información financiera la ingresás vos mismo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">2. Para qué usamos tus datos</h2>
            <p>
              Únicamente para mostrarte tu propia información dentro de la app (dashboard, gráficos,
              proyecciones) y para enviarte emails funcionales (confirmación de cuenta, recuperación de
              contraseña). No vendemos ni compartimos tus datos con terceros con fines comerciales o
              publicitarios.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">3. Dónde se almacenan</h2>
            <p>
              Los datos se almacenan en Supabase (infraestructura en la nube con cifrado), con controles de
              acceso a nivel de base de datos que aseguran que cada usuario solo puede ver su propia
              información.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">4. Tus derechos</h2>
            <p>
              De acuerdo a la Ley 25.326 de Protección de Datos Personales de Argentina, tenés derecho a
              acceder, rectificar y eliminar tus datos personales. Podés ejercer estos derechos escribiendo
              a{" "}
              <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
                sandleroliver9@gmail.com
              </a>
              . La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la
              Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan por
              incumplimiento de las normas sobre protección de datos personales.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">5. Eliminación de cuenta</h2>
            <p>
              Podés pedir la baja de tu cuenta en cualquier momento. Al hacerlo, se elimina de forma
              permanente toda tu información financiera asociada.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">6. Cambios a esta política</h2>
            <p>
              Como Platium está en etapa de pruebas, esta política puede actualizarse. Si hay cambios
              importantes, te vamos a avisar por email.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">7. Contacto</h2>
            <p>
              Consultas sobre privacidad:{" "}
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
