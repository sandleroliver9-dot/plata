import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const getSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

// `vencimientos` es solo para compromisos manuales (ABL, expensas, seguro...).
// Los vencimientos de tarjetas/prestamos/gastos fijos se derivan en el
// frontend a partir de esas tablas, no viven aca. La tabla real no tiene
// columna `activo`, `categoria` ni `fecha_vencimiento`: solo concepto, fecha,
// monto, notas, pagado, recurrente.
export type BillCreate = {
  concepto: string;
  monto: number;
  fecha: string;
  recurrente?: boolean;
  notas?: string | null;
};

export type BillUpdate = Partial<BillCreate>;

export const BillsService = {
  async list(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vencimientos')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: true });
    if (error) {
      logger.error('Error fetching bills', error);
      throw error;
    }
    return data ?? [];
  },

  async create(userId: string, payload: BillCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vencimientos')
      .insert({
        user_id: userId,
        concepto: payload.concepto,
        monto: payload.monto,
        fecha: payload.fecha,
        recurrente: payload.recurrente ?? false,
        notas: payload.notas ?? null,
        pagado: false,
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error creating bill', error);
      throw error;
    }
    logger.info('Bill created', { userId, billId: data?.id });
    return data;
  },

  async update(userId: string, id: string, payload: BillUpdate) {
    const supabase = getSupabaseClient();
    const patch: Record<string, unknown> = {};
    if (payload.concepto !== undefined) patch.concepto = payload.concepto;
    if (payload.monto !== undefined) patch.monto = payload.monto;
    if (payload.fecha !== undefined) patch.fecha = payload.fecha;
    if (payload.recurrente !== undefined) patch.recurrente = payload.recurrente;
    if (payload.notas !== undefined) patch.notas = payload.notas;

    const { data, error } = await supabase
      .from('vencimientos')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error updating bill', error);
      throw error;
    }
    logger.info('Bill updated', { userId, billId: id });
    return data;
  },

  async setPaid(userId: string, id: string, pagado: boolean) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vencimientos')
      .update({ pagado })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    if (error) {
      logger.error('Error updating bill paid status', error);
      throw error;
    }
    logger.info('Bill paid status updated', { userId, billId: id, pagado });
    return data;
  },

  async remove(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('vencimientos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      logger.error('Error deleting bill', error);
      throw error;
    }
    logger.info('Bill deleted', { userId, billId: id });
    return true;
  },
};
