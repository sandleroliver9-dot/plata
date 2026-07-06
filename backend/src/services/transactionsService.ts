import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { financialMonthForUser } from '../utils/financialMonth';

const getSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export type TransactionCreate = {
  fecha: string;
  descripcion?: string | null;
  monto: number;
  tipo: string;
  categoria?: string | null;
  medio?: string | null;
  tarjeta?: string | null;
  es_cuota?: boolean;
  cuota_origen_id?: string | null;
  notas?: string | null;
};

export type TransactionUpdate = Partial<TransactionCreate>;

export const TransactionsService = {
  // `mes` es el mes financiero (ej: "jun 2026"), no el mes calendario: el
  // resto de la app (dashboard, alertas, insights) agrupa todo por mes
  // financiero, no por mes de calendario.
  async list(userId: string, mes?: string) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('movimientos')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('fecha', { ascending: false });

    if (mes) query = query.eq('mes_financiero', mes);

    const { data, error } = await query;
    if (error) {
      logger.error('Error fetching transactions', error);
      throw error;
    }
    return data ?? [];
  },

  async create(userId: string, payload: TransactionCreate) {
    const supabase = getSupabaseClient();
    const mesFinanciero = await financialMonthForUser(userId, payload.fecha);

    const { data, error } = await supabase
      .from('movimientos')
      .insert({
        user_id: userId,
        fecha: payload.fecha,
        descripcion: payload.descripcion ?? null,
        monto: payload.monto,
        tipo: payload.tipo,
        categoria: payload.categoria ?? null,
        medio: payload.medio ?? null,
        tarjeta: payload.tarjeta ?? null,
        es_cuota: payload.es_cuota ?? false,
        cuota_origen_id: payload.cuota_origen_id ?? null,
        notas: payload.notas ?? null,
        mes_financiero: mesFinanciero,
        activo: true,
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error creating transaction', error);
      throw error;
    }
    logger.info('Transaction created', { userId, transactionId: data?.id });
    return data;
  },

  async update(userId: string, id: string, payload: TransactionUpdate) {
    const supabase = getSupabaseClient();
    const patch: Record<string, unknown> = {};
    if (payload.descripcion !== undefined) patch.descripcion = payload.descripcion;
    if (payload.monto !== undefined) patch.monto = payload.monto;
    if (payload.tipo !== undefined) patch.tipo = payload.tipo;
    if (payload.categoria !== undefined) patch.categoria = payload.categoria;
    if (payload.medio !== undefined) patch.medio = payload.medio;
    if (payload.tarjeta !== undefined) patch.tarjeta = payload.tarjeta;
    if (payload.es_cuota !== undefined) patch.es_cuota = payload.es_cuota;
    if (payload.cuota_origen_id !== undefined) patch.cuota_origen_id = payload.cuota_origen_id;
    if (payload.notas !== undefined) patch.notas = payload.notas;
    if (payload.fecha !== undefined) {
      patch.fecha = payload.fecha;
      patch.mes_financiero = await financialMonthForUser(userId, payload.fecha);
    }

    const { data, error } = await supabase
      .from('movimientos')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error updating transaction', error);
      throw error;
    }
    logger.info('Transaction updated', { userId, transactionId: id });
    return data;
  },

  async softDelete(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('movimientos')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      logger.error('Error deleting transaction', error);
      throw error;
    }
    logger.info('Transaction deleted', { userId, transactionId: id });
    return true;
  },
};
