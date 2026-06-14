import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export type TransactionCreate = {
  fecha: string;
  concepto: string;
  monto: number | string;
  tipo: string;
  categoria?: string | null;
  cuota?: number | null;
  descripcion?: string | null;
};

export const TransactionsService = {
  async list(userId: string, month?: string) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('movimientos')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('fecha', { ascending: false });

    if (month) {
      query = query.like('fecha', `${month}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async create(userId: string, payload: TransactionCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('movimientos')
      .insert({
        user_id: userId,
        fecha: payload.fecha,
        concepto: payload.concepto,
        monto: parseFloat(String(payload.monto)),
        tipo: payload.tipo,
        categoria: payload.categoria ?? null,
        cuota: payload.cuota ?? null,
        descripcion: payload.descripcion ?? null,
        activo: true,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(userId: string, id: string, payload: Partial<TransactionCreate>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('movimientos')
      .update({
        ...(payload.fecha !== undefined ? { fecha: payload.fecha } : {}),
        ...(payload.concepto !== undefined ? { concepto: payload.concepto } : {}),
        ...(payload.monto !== undefined ? { monto: parseFloat(String(payload.monto)) } : {}),
        ...(payload.tipo !== undefined ? { tipo: payload.tipo } : {}),
        ...(payload.categoria !== undefined ? { categoria: payload.categoria } : {}),
        ...(payload.cuota !== undefined ? { cuota: payload.cuota } : {}),
        ...(payload.descripcion !== undefined ? { descripcion: payload.descripcion } : {}),
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
      .from('movimientos')
      .update({ activo: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};
