import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export type IncomeCreate = {
  concepto: string;
  monto: number | string;
  fecha_cobro: string;
  frecuencia?: string;
};

export const IncomeService = {
  async list(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(userId: string, payload: IncomeCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ingresos')
      .insert({
        user_id: userId,
        concepto: payload.concepto,
        monto: parseFloat(String(payload.monto)),
        fecha_cobro: payload.fecha_cobro,
        frecuencia: payload.frecuencia ?? 'Mensual',
        activo: true,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(userId: string, id: string, payload: Partial<IncomeCreate>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ingresos')
      .update({
        ...(payload.concepto ? { concepto: payload.concepto } : {}),
        ...(payload.monto ? { monto: parseFloat(String(payload.monto)) } : {}),
        ...(payload.fecha_cobro ? { fecha_cobro: payload.fecha_cobro } : {}),
        ...(payload.frecuencia ? { frecuencia: payload.frecuencia } : {}),
      })
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
      .from('ingresos')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};
