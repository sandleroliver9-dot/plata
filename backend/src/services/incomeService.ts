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

    // Un ingreso tambien impacta el cashflow via movimientos (getMonthlyCashflow
    // lee de ahi, no de ingresos). Los dos inserts (ingresos + movimientos)
    // corren en una unica transaccion de Postgres (ver migracion
    // create_income_with_movement_rpc) para que un fallo a mitad de camino no
    // deje un ingreso sin su movimiento espejo.
    const { data, error } = await supabase.rpc('create_income_with_movement', {
      p_user_id: userId,
      p_concepto: payload.concepto,
      p_monto: payload.monto,
      p_fecha_cobro: payload.fecha_cobro,
      p_mes_financiero: mesFinanciero,
      p_tipo: payload.tipo ?? 'Sueldo',
      p_notas: payload.notas ?? null,
      p_ajuste_esperado: payload.ajuste_esperado ?? null,
    });

    if (error) {
      logger.error('Error creating income', error);
      throw error;
    }

    logger.info('Income created', { userId, incomeId: (data as any)?.id });
    return data;
  },

  async update(userId: string, id: string, payload: IncomeUpdate) {
    const supabase = getSupabaseClient();
    const patch: Record<string, unknown> = {};
    // Espejo de los campos que tambien existen en el movimiento vinculado
    // (ver migracion add_ingreso_id_to_movimientos). softDelete ya cascadeaba
    // por ingreso_id; update() se habia quedado sin hacerlo, dejando el
    // movimiento con el monto/fecha viejos tras editar un ingreso.
    const movPatch: Record<string, unknown> = {};
    if (payload.concepto !== undefined) {
      patch.concepto = payload.concepto;
      movPatch.descripcion = payload.concepto;
    }
    if (payload.monto !== undefined) {
      patch.monto = payload.monto;
      movPatch.monto = payload.monto;
    }
    if (payload.tipo !== undefined) {
      patch.tipo = payload.tipo;
      movPatch.categoria = payload.tipo === 'Sueldo' ? 'Sueldo' : 'Extra';
    }
    if (payload.notas !== undefined) patch.notas = payload.notas;
    if (payload.ajuste_esperado !== undefined) patch.ajuste_esperado = payload.ajuste_esperado;
    if (payload.fecha_cobro !== undefined) {
      const mesFinanciero = await financialMonthForUser(userId, payload.fecha_cobro);
      patch.fecha_cobro = payload.fecha_cobro;
      patch.mes_financiero = mesFinanciero;
      movPatch.fecha = payload.fecha_cobro;
      movPatch.mes_financiero = mesFinanciero;
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

    if (Object.keys(movPatch).length > 0) {
      const { error: movError } = await supabase
        .from('movimientos')
        .update(movPatch)
        .eq('ingreso_id', id)
        .eq('user_id', userId);
      if (movError) {
        logger.error('Error updating mirrored movimiento for income', movError);
        throw movError;
      }
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

    // Vinculado por ingreso_id (FK real, ver migracion
    // add_ingreso_id_to_movimientos): sin esto el movimiento espejo quedaba
    // activo para siempre, inflando el cashflow real de meses pasados.
    const { error: movError } = await supabase
      .from('movimientos')
      .update({ activo: false })
      .eq('ingreso_id', id)
      .eq('user_id', userId);
    if (movError) {
      logger.error('Error deleting mirrored movimiento for income', movError);
      throw movError;
    }

    logger.info('Income deleted', { userId, incomeId: id });
    return true;
  },
};
