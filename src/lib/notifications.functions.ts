import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildUpcomingEvents, computeSuggestedSalary, daysUntil } from "@/lib/financial-centers";
import { appNow, financialMonth, formatMoney, toISODate } from "@/lib/finance";
import { normalizePayDateMode } from "@/lib/financial-preferences";
import { resolveSalaryPayDate } from "@/lib/profile.functions";
import { fetchInflacion } from "@/lib/quotes.functions";
import type { Database } from "@/integrations/supabase/types";

/**
 * Notificaciones por email/push: vencimientos próximos y recordatorio de
 * sueldo (avisa cuando llega el día de cobro, o una vez por semana en modo
 * "variable", si todavía no se cargó el sueldo del período actual).
 *
 * Gateado igual que el resto de la infra opcional de la app (IA, mail): sin
 * las env vars correspondientes (RESEND_API_KEY, VAPID_*, CRON_SECRET) los
 * envíos correspondientes simplemente se saltan, sin romper nada.
 *
 * `runNotificacionesCron` corre server-side, disparado por Vercel Cron (ver
 * vercel.json) contra la ruta pública `/cron-notificaciones`, que llama a
 * esta función. No usa `requireSupabaseAuth` (no hay un usuario logueado
 * disparando el cron) — se protege con un secret propio comparado contra el
 * header `Authorization: Bearer <CRON_SECRET>` que Vercel agrega solo si la
 * env var `CRON_SECRET` está configurada en el proyecto.
 */

const EVENT_TYPE_LABEL: Record<string, string> = {
  vencimiento: "vencimiento",
  cuota: "cuota de tarjeta",
  prestamo: "cuota de préstamo",
  gasto_fijo: "gasto fijo",
};

function getAdminSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function diasLabel(dias: number) {
  return `${dias} día${dias === 1 ? "" : "s"}`;
}

export const runNotificacionesCron = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const secret = process.env.CRON_SECRET;
  const authHeader = request?.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    throw new Error("Unauthorized");
  }

  const supabase = getAdminSupabase();
  const resendKey = process.env.RESEND_API_KEY;
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  let resend: any = null;
  if (resendKey) {
    const { Resend } = await import("resend");
    resend = new Resend(resendKey);
  }
  let webpush: typeof import("web-push") | null = null;
  if (vapidPublic && vapidPrivate) {
    webpush = await import("web-push");
    webpush.setVapidDetails("mailto:soporte@platium.app", vapidPublic, vapidPrivate);
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, currency, pay_day, pay_date_mode, salary, alert_days, notify_email, notify_push")
    .or("notify_email.eq.true,notify_push.eq.true");
  if (profilesError) throw profilesError;

  // Se pide una sola vez para todos los usuarios (no depende de cada uno) —
  // mismo dato que ya usa Ingresos para la sugerencia de sueldo.
  const inflacion = await fetchInflacion();
  const inflacionPct = inflacion.promedio3m ?? 0;

  let usersProcessed = 0;
  let emailsSent = 0;
  let pushSent = 0;
  let salaryRemindersSent = 0;

  for (const profile of profiles ?? []) {
    usersProcessed++;

    // Recordatorio de sueldo: se resuelve entero acá arriba, ANTES del
    // bloque de vencimientos de abajo (que corta el resto del loop con
    // `continue` si no hay eventos próximos) — alguien sin ningún
    // vencimiento cargado igual quiere que le avisen de cargar el sueldo.
    try {
      const payDateMode = normalizePayDateMode(profile.pay_date_mode);
      const payDay = Number(profile.pay_day) || 1;
      const now = appNow();
      const mesActual = financialMonth(now, payDay);

      const { data: sueldoDelMes } = await supabase
        .from("ingresos")
        .select("id")
        .eq("user_id", profile.id)
        .eq("activo", true)
        .eq("tipo", "Sueldo")
        .eq("mes_financiero", mesActual)
        .limit(1);

      if (!sueldoDelMes || sueldoDelMes.length === 0) {
        const { data: dismissRows } = await supabase
          .from("salary_reminder_dismissals")
          .select("mes_financiero")
          .eq("user_id", profile.id)
          .eq("mes_financiero", mesActual)
          .limit(1);
        const dismissed = (dismissRows?.length ?? 0) > 0;

        // Con día fijo/hábil: ventana de 3 días desde el día de cobro
        // resuelto. Con "variable" (sin fecha fija): un recordatorio suave
        // todos los lunes, sin límite de 3 — no hay una fecha "vencida" de
        // la cual dejar de insistir.
        let dentroDeLaVentana = false;
        if (!dismissed) {
          if (payDateMode === "variable") {
            dentroDeLaVentana = now.getDay() === 1;
          } else {
            const payDate = resolveSalaryPayDate(payDay, payDateMode, now);
            const diasDesdeCobro = Math.floor((now.getTime() - payDate.getTime()) / 86400000);
            dentroDeLaVentana = diasDesdeCobro >= 0 && diasDesdeCobro <= 2;
          }
        }

        if (dentroDeLaVentana) {
          const refId = `sueldo-${mesActual}-${toISODate(now)}`;
          const { data: yaEnviadosMes } = await supabase
            .from("notificaciones_enviadas")
            .select("referencia_id")
            .eq("user_id", profile.id)
            .like("referencia_id", `sueldo-${mesActual}-%`);
          const diasEnviados = new Set((yaEnviadosMes ?? []).map((n) => n.referencia_id));
          const dentroDelLimite = payDateMode === "variable" || diasEnviados.size < 3;

          if (!diasEnviados.has(refId) && dentroDelLimite) {
            const { data: sueldoHist } = await supabase
              .from("ingresos")
              .select("monto, moneda")
              .eq("user_id", profile.id)
              .eq("activo", true)
              .eq("tipo", "Sueldo")
              .order("fecha_cobro", { ascending: false })
              .limit(1);

            const sugerido = computeSuggestedSalary({
              ultimoSueldo: sueldoHist?.[0],
              profileSalary: profile.salary,
              profileCurrency: profile.currency,
              inflacionPct,
            });

            const title = "¿Ya cobraste este mes?";
            const body = sugerido
              ? `Te sugerimos ${formatMoney(sugerido.monto, sugerido.moneda)} según tu último sueldo. Confirmalo en Platium.`
              : "No te olvides de cargar tu sueldo de este mes en Platium.";

            let enviadoAlgun = false;

            if (profile.notify_email && resend) {
              const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
              const email = userData?.user?.email;
              if (email) {
                try {
                  await resend.emails.send({
                    from: process.env.EMAIL_FROM || "Platium <onboarding@resend.dev>",
                    to: email,
                    subject: title,
                    html: `<p>Hola,</p><p>${body}</p>`,
                  });
                  enviadoAlgun = true;
                  await supabase.from("notificaciones_enviadas").insert({ user_id: profile.id, referencia_id: refId, canal: "email" });
                } catch (err) {
                  console.error(`[cron-notificaciones] salary email failed for ${profile.id}`, err);
                }
              }
            }

            if (profile.notify_push && webpush) {
              const { data: subs } = await supabase.from("push_subscriptions").select("*").eq("user_id", profile.id);
              if (subs && subs.length > 0) {
                const payload = JSON.stringify({ title, body, url: "/ingresos" });
                let anySent = false;
                for (const sub of subs) {
                  try {
                    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
                    anySent = true;
                  } catch (err: any) {
                    if (err?.statusCode === 404 || err?.statusCode === 410) {
                      await supabase.from("push_subscriptions").delete().eq("id", sub.id);
                    } else {
                      console.error(`[cron-notificaciones] salary push failed for ${profile.id}`, err);
                    }
                  }
                }
                if (anySent) {
                  enviadoAlgun = true;
                  await supabase.from("notificaciones_enviadas").insert({ user_id: profile.id, referencia_id: refId, canal: "push" });
                }
              }
            }

            if (enviadoAlgun) salaryRemindersSent++;
          }
        }
      }
    } catch (err) {
      console.error(`[cron-notificaciones] salary reminder failed for ${profile.id}`, err);
    }

    const [vencimientos, tarjetas, prestamos, fijos] = await Promise.all([
      supabase.from("vencimientos").select("*").eq("user_id", profile.id).eq("pagado", false),
      supabase.from("tarjetas_cuotas").select("*").eq("user_id", profile.id).eq("activo", true),
      supabase.from("prestamos").select("*").eq("user_id", profile.id).eq("activo", true),
      supabase.from("gastos_fijos").select("*").eq("user_id", profile.id).eq("activo", true),
    ]);

    const alertDays = Math.max(1, Number(profile.alert_days) || 7);
    const events = buildUpcomingEvents({
      profile,
      vencimientos: vencimientos.data ?? [],
      tarjetas: tarjetas.data ?? [],
      prestamos: prestamos.data ?? [],
      gastosFijos: fijos.data ?? [],
      horizonDays: alertDays,
    }).filter((e) => e.type !== "cobro");

    if (events.length === 0) continue;

    const { data: yaEnviadas } = await supabase
      .from("notificaciones_enviadas")
      .select("referencia_id, canal")
      .eq("user_id", profile.id);
    const enviadoSet = new Set((yaEnviadas ?? []).map((n) => `${n.referencia_id}:${n.canal}`));

    const pendientesEmail = profile.notify_email ? events.filter((e) => !enviadoSet.has(`${e.id}:email`)) : [];
    const pendientesPush = profile.notify_push ? events.filter((e) => !enviadoSet.has(`${e.id}:push`)) : [];
    if (pendientesEmail.length === 0 && pendientesPush.length === 0) continue;

    const currency = profile.currency ?? "ARS";

    if (pendientesEmail.length > 0 && resend) {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
      const email = userData?.user?.email;
      if (email) {
        const ordenadas = pendientesEmail.slice().sort((a, b) => a.date.localeCompare(b.date));
        const html = `<p>Hola,</p><p>Tenés estos vencimientos próximos en Platium:</p><ul>${ordenadas
          .map((e) => `<li><strong>${e.title}</strong> — ${formatMoney(e.amount, currency)} (${EVENT_TYPE_LABEL[e.type] ?? e.type}, en ${diasLabel(daysUntil(e.date))})</li>`)
          .join("")}</ul><p>Entrá a Platium para ver el detalle.</p>`;
        try {
          const subject = pendientesEmail.length === 1
            ? "Tenés un vencimiento próximo"
            : `Tenés ${pendientesEmail.length} vencimientos próximos`;
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "Platium <onboarding@resend.dev>",
            to: email,
            subject,
            html,
          });
          emailsSent++;
          await supabase.from("notificaciones_enviadas").insert(
            pendientesEmail.map((e) => ({ user_id: profile.id, referencia_id: e.id, canal: "email" })),
          );
        } catch (err) {
          console.error(`[cron-notificaciones] email failed for ${profile.id}`, err);
        }
      }
    }

    if (pendientesPush.length > 0 && webpush) {
      const { data: subs } = await supabase.from("push_subscriptions").select("*").eq("user_id", profile.id);
      if (subs && subs.length > 0) {
        const ordenadas = pendientesPush.slice().sort((a, b) => a.date.localeCompare(b.date));
        const title = ordenadas.length === 1 ? ordenadas[0].title : `${ordenadas.length} vencimientos próximos`;
        const body = ordenadas.length === 1
          ? `${formatMoney(ordenadas[0].amount, currency)} en ${diasLabel(daysUntil(ordenadas[0].date))}`
          : ordenadas.slice(0, 3).map((e) => e.title).join(", ");
        const payload = JSON.stringify({ title, body });
        let anySent = false;
        for (const sub of subs) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
            anySent = true;
          } catch (err: any) {
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              // Suscripción vencida/revocada del lado del navegador: se limpia
              // acá para no seguir intentando indefinidamente.
              await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            } else {
              console.error(`[cron-notificaciones] push failed for ${profile.id}`, err);
            }
          }
        }
        if (anySent) {
          pushSent++;
          await supabase.from("notificaciones_enviadas").insert(
            pendientesPush.map((e) => ({ user_id: profile.id, referencia_id: e.id, canal: "push" })),
          );
        }
      }
    }
  }

  return { ok: true, usersProcessed, emailsSent, pushSent, salaryRemindersSent };
});

export const updateNotificationPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { notifyEmail: boolean; notifyPush: boolean; alertDays: number }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const alertDays = Math.max(1, Math.min(30, Math.round(Number(data.alertDays) || 7)));
    const { error } = await supabase
      .from("profiles")
      .update({ notify_email: !!data.notifyEmail, notify_push: !!data.notifyPush, alert_days: alertDays })
      .eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { endpoint: string; p256dh: string; auth: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({ user_id: userId, endpoint: data.endpoint, p256dh: data.p256dh, auth: data.auth }, { onConflict: "endpoint" });
    if (error) throw error;
    const { error: profileError } = await supabase.from("profiles").update({ notify_push: true }).eq("id", userId);
    if (profileError) throw profileError;
    return { ok: true };
  });

export const deletePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { endpoint: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", data.endpoint);
    if (error) throw error;
    return { ok: true };
  });
