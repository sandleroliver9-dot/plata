// Contenido legal compartido: lo usan las páginas standalone (/terminos,
// /privacidad) y el modal de "leer antes de aceptar" en /auth, para no
// mantener el mismo texto duplicado en dos lugares.

export function TerminosContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <p className="text-xs">Última actualización: septiembre 2026</p>

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
          Al crear una cuenta o usar Platium de cualquier forma, aceptás estos Términos y nuestra
          Política de Privacidad. Si no estás de acuerdo, no debés usar la App. Para usar Platium tenés
          que ser mayor de 18 años o contar con la autorización de tu representante legal.
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
    </div>
  );
}

export function PrivacidadContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <p className="text-xs">Última actualización: septiembre 2026</p>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">1. Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de tus datos personales es Oliver Sandler, persona física
          domiciliada en la Provincia de Buenos Aires, Argentina, en su carácter de titular de Platium.
          Podés contactarnos por cualquier tema relacionado a tus datos escribiendo a{" "}
          <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
            sandleroliver9@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">2. Qué datos guardamos</h2>
        <p>Al usar Platium guardamos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Datos de cuenta: nombre y email (o los datos básicos que comparte Google si entrás con ese método).</li>
          <li>
            Datos financieros que vos cargás manualmente: ingresos, gastos, tarjetas y cuotas, préstamos,
            metas de ahorro, inversiones e inmuebles.
          </li>
          <li>
            Preferencias de la app: día de cobro, moneda, objetivo de ahorro y configuración de
            notificaciones.
          </li>
          <li>
            Si activás las notificaciones push, un identificador técnico de tu navegador o dispositivo
            que nos permite enviártelas (no identifica quién sos por sí solo).
          </li>
          <li>
            Datos de pago: si comprás el acceso completo, el medio de pago (Stripe, Apple o Google)
            procesa tu tarjeta y nos informa únicamente si el pago fue aprobado — nunca vemos ni
            guardamos el número completo de tu tarjeta.
          </li>
        </ul>
        <p>
          <strong>No guardamos ni pedimos claves de home banking, números completos de tarjeta, ni
          accedemos a tus cuentas bancarias.</strong> Toda la información financiera la ingresás vos mismo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">3. Para qué usamos tus datos</h2>
        <p>Usamos tus datos únicamente para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mostrarte tu propia información dentro de la app (dashboard, gráficos, proyecciones).</li>
          <li>Procesar el pago del acceso completo y habilitar tu cuenta cuando corresponda.</li>
          <li>Enviarte emails funcionales: confirmación de cuenta, recuperación de contraseña, y
            recordatorios que vos mismo activás (vencimientos próximos, sueldo pendiente de cargar).</li>
          <li>Enviarte notificaciones push, solo si las activaste vos.</li>
          <li>Si usás la carga rápida por IA, procesar el texto que ingresás para sugerirte cómo cargar
            un movimiento.</li>
        </ul>
        <p>No vendemos ni compartimos tus datos con terceros con fines comerciales o publicitarios.</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">4. Con quién compartimos datos</h2>
        <p>
          Para poder ofrecerte Platium, algunos datos pasan por proveedores que actúan como encargados
          del tratamiento, únicamente para prestar el servicio que les corresponde:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong>: aloja la base de datos y la autenticación de tu cuenta.</li>
          <li><strong>Stripe, Apple App Store y Google Play</strong>: procesan el pago del acceso completo, según desde dónde compres.</li>
          <li><strong>Anthropic</strong>: procesa el texto que ingresás si usás la carga rápida por IA (solo ese texto puntual, no tu información financiera histórica).</li>
          <li><strong>Resend</strong>: envía los emails funcionales de la app.</li>
          <li>Proveedores de notificaciones push (navegadores/sistemas operativos), únicamente si activaste esa función.</li>
        </ul>
        <p>
          Ninguno de estos proveedores está autorizado a usar tus datos para fines propios ajenos a
          prestarle el servicio a Platium.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">5. Transferencia internacional de datos</h2>
        <p>
          Algunos de los proveedores mencionados en la Sección 4 procesan datos en servidores ubicados
          fuera de Argentina (por ejemplo, en Estados Unidos). Al usar Platium, aceptás esta
          transferencia internacional, necesaria para el funcionamiento del servicio, y que estos
          proveedores cuenten con estándares de seguridad y confidencialidad adecuados para proteger tu
          información.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">6. Dónde y cómo se almacenan</h2>
        <p>
          Los datos se almacenan en Supabase (infraestructura en la nube con cifrado en tránsito y en
          reposo), con controles de acceso a nivel de base de datos (Row Level Security) que aseguran que
          cada usuario solo puede ver y modificar su propia información, incluso frente a un error en la
          aplicación.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">7. Cuánto tiempo conservamos tus datos</h2>
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Si pedís la eliminación de tu cuenta (ver
          Sección 9), los borramos de forma permanente dentro de un plazo razonable, salvo la información
          que estemos obligados a conservar por ley (por ejemplo, comprobantes de pago, según la
          normativa impositiva y de defensa del consumidor aplicable).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">8. Tus derechos</h2>
        <p>
          De acuerdo a la Ley 25.326 de Protección de Datos Personales de Argentina, tenés derecho a
          acceder, rectificar, actualizar y eliminar tus datos personales (derechos ARCO). Podés ejercer
          estos derechos escribiendo a{" "}
          <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
            sandleroliver9@gmail.com
          </a>
          . La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la
          Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan por
          incumplimiento de las normas sobre protección de datos personales.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">9. Eliminación de cuenta</h2>
        <p>
          Podés pedir la baja de tu cuenta en cualquier momento, escribiendo a{" "}
          <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
            sandleroliver9@gmail.com
          </a>
          . Al hacerlo, se elimina de forma permanente toda tu información financiera asociada
          (movimientos, tarjetas, préstamos, metas, inversiones, inmuebles).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">10. Cookies y almacenamiento local</h2>
        <p>
          Platium usa el almacenamiento local de tu navegador (localStorage) para mantener tu sesión
          iniciada y recordar algunas preferencias de uso. No usamos cookies de seguimiento publicitario
          ni compartimos esta información con redes de publicidad.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">11. Menores de edad</h2>
        <p>
          Platium no está dirigido a menores de 18 años y no recopilamos a sabiendas datos de menores. Si
          creés que un menor nos proporcionó datos personales, escribinos y lo vamos a eliminar.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">12. Cambios a esta política</h2>
        <p>
          Como Platium está en etapa de pruebas, esta política puede actualizarse. Si hay cambios
          importantes, te vamos a avisar por email o dentro de la app.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-foreground">13. Contacto</h2>
        <p>
          Consultas sobre privacidad:{" "}
          <a href="mailto:sandleroliver9@gmail.com" className="text-primary hover:underline">
            sandleroliver9@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
