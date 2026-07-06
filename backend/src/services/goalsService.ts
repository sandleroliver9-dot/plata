import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const getSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export type GoalCreate = {
  meta: string;
  objetivo: number;
  ahorrado?: number;
  moneda?: string;
  fecha_objetivo?: string | null;
  notas?: string | null;
};

export type GoalUpdate = Partial<GoalCreate>;

export const GoalsService = {
  // La tabla `metas` no tiene columna `activo`: no hay soft delete posible.
  async list(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      logger.error('Error fetching goals', error);
      throw error;
    }
    return data ?? [];
  },

  async create(userId: string, payload: GoalCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('metas')
      .insert({
        user_id: userId,
        meta: payload.meta,
        objetivo: payload.objetivo,
        ahorrado: payload.ahorrado ?? 0,
        moneda: payload.moneda ?? 'ARS',
        fecha_objetivo: payload.fecha_objetivo ?? null,
        notas: payload.notas ?? null,
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error creating goal', error);
      throw error;
    }
    logger.info('Goal created', { userId, goalId: data?.id });
    return data;
  },

  async update(userId: string, id: string, payload: GoalUpdate) {
    const supabase = getSupabaseClient();
    const patch: Record<string, unknown> = {};
    if (payload.meta !== undefined) patch.meta = payload.meta;
    if (payload.objetivo !== undefined) patch.objetivo = payload.objetivo;
    if (payload.ahorrado !== undefined) patch.ahorrado = payload.ahorrado;
    if (payload.moneda !== undefined) patch.moneda = payload.moneda;
    if (payload.fecha_objetivo !== undefined) patch.fecha_objetivo = payload.fecha_objetivo;
    if (payload.notas !== undefined) patch.notas = payload.notas;

    const { data, error } = await supabase
      .from('metas')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error updating goal', error);
      throw error;
    }
    logger.info('Goal updated', { userId, goalId: id });
    return data;
  },

  async updateProgress(userId: string, id: string, ahorrado: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('metas')
      .update({ ahorrado })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error updating goal progress', error);
      throw error;
    }
    logger.info('Goal progress updated', { userId, goalId: id });
    return data;
  },

  async remove(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('metas')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      logger.error('Error deleting goal', error);
      throw error;
    }
    logger.info('Goal deleted', { userId, goalId: id });
    return true;
  },
};
