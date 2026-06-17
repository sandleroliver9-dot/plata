import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export type GoalCreate = {
  nombre: string;
  monto_objetivo: number | string;
  fecha_target?: string;
};

export const GoalsService = {
  async list(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(userId: string, payload: GoalCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('metas')
      .insert({
        user_id: userId,
        nombre: payload.nombre,
        monto_objetivo: parseFloat(String(payload.monto_objetivo)),
        monto_actual: 0,
        fecha_target: payload.fecha_target ?? null,
        activo: true,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(userId: string, id: string, payload: Partial<GoalCreate>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('metas')
      .update({
        ...(payload.nombre ? { nombre: payload.nombre } : {}),
        ...(payload.monto_objetivo ? { monto_objetivo: parseFloat(String(payload.monto_objetivo)) } : {}),
        ...(payload.fecha_target !== undefined ? { fecha_target: payload.fecha_target } : {}),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProgress(userId: string, id: string, monto_actual: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('metas')
      .update({ monto_actual })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async softDelete(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('metas')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};
