import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export type BillCreate = {
  concepto: string;
  monto: number | string;
  fecha_vencimiento: string;
  categoria?: string | null;
};

export const BillsService = {
  async list(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vencimientos')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('fecha_vencimiento', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(userId: string, payload: BillCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vencimientos')
      .insert({
        user_id: userId,
        concepto: payload.concepto,
        monto: parseFloat(String(payload.monto)),
        fecha_vencimiento: payload.fecha_vencimiento,
        categoria: payload.categoria ?? null,
        activo: true,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(userId: string, id: string, payload: Partial<BillCreate>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vencimientos')
      .update({
        ...(payload.concepto ? { concepto: payload.concepto } : {}),
        ...(payload.monto ? { monto: parseFloat(String(payload.monto)) } : {}),
        ...(payload.fecha_vencimiento ? { fecha_vencimiento: payload.fecha_vencimiento } : {}),
        ...(payload.categoria !== undefined ? { categoria: payload.categoria } : {}),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async markAsPaid(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('vencimientos')
      .update({ activo: false, pagado_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  async softDelete(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('vencimientos')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};
