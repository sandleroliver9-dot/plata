import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { financialMonthForUser } from '../utils/financialMonth';

const getSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export type IncomeCreate = {
  concepto: string;
  monto: number;
  fecha_cobro: string;
  tipo?: string | null;
  notas?: string | null;
  ajuste_esperado?: number | null;
};

export type IncomeUpdate = Partial<IncomeCreate>;

export const IncomeService = {
  async list(userId: string, mes?: string) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('ingresos')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('fecha_cobro', { ascending: false });

    if (mes) query = query.eq('mes_financiero', mes);

    const { data, error } = await query;
    if (error) {
      logger.error('Error fetching income', error);
      throw error;
    }
    return data ?? [];
  },

  async create(userId: string, payload: IncomeCreate) {
    const supabase = getSupabaseClient();
    const mesFinanciero = await financialMonthForUser(userId, payload.fecha_cobro);

    const { data, error } = await supabase
      .from('ingresos')
      .insert({
        user_id: userId,
        concepto: payload.concepto,
        monto: payload.monto,
        fecha_cobro: payload.fecha_cobro,
        mes_financiero: mesFinanciero,
        tipo: payload.tipo ?? null,
        notas: payload.notas ?? null,
        ajuste_esperado: payload.ajuste_esperado ?? null,
        activo: true,
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error creating income', error);
      throw error;
    }

    // Un ingreso tambien impacta el cashflow via movimientos (getMonthlyCashflow
    // lee de ahi, no de ingresos). Se replica el mismo doble-insert que hace
    // ingresos.tsx para que dar de alta por API tenga el mismo efecto.
    const { error: movError } = await supabase.from('movimientos').insert({
      user_id: userId,
      tipo: 'Ingreso',
      descripcion: payload.concepto,
      monto: payload.monto,
      fecha: payload.fecha_cobro,
      mes_financiero: mesFinanciero,
      categoria: payload.tipo === 'Sueldo' ? 'Sueldo' : 'Extra',
    });
    if (movError) {
      logger.error('Error mirroring income into movimientos', movError);
      throw movError;
    }

    logger.info('Income created', { userId, incomeId: data?.id });
    return data;
  },

  async update(userId: string, id: string, payload: IncomeUpdate) {
    const supabase = getSupabaseClient();
    const patch: Record<string, unknown> = {};
    if (payload.concepto !== undefined) patch.concepto = payload.concepto;
    if (payload.monto !== undefined) patch.monto = payload.monto;
    if (payload.tipo !== undefined) patch.tipo = payload.tipo;
    if (payload.notas !== undefined) patch.notas = payload.notas;
    if (payload.ajuste_esperado !== undefined) patch.ajuste_esperado = payload.ajuste_esperado;
    if (payload.fecha_cobro !== undefined) {
      patch.fecha_cobro = payload.fecha_cobro;
      patch.mes_financiero = await financialMonthForUser(userId, payload.fecha_cobro);
    }

    const { data, error } = await supabase
      .from('ingresos')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error updating income', error);
      throw error;
    }

    logger.info('Income updated', { userId, incomeId: id });
    return data;
  },

  async softDelete(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('ingresos')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      logger.error('Error deleting income', error);
      throw error;
    }
    logger.info('Income deleted', { userId, incomeId: id });
    return true;
  },
};
