import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export type InvestmentBuyCreate = {
  descripcion: string;
  cantidad: number | string;
  precio_unitario: number | string;
  fecha: string;
};

export type InvestmentSellCreate = {
  descripcion: string;
  cantidad: number | string;
  precio_unitario: number | string;
  fecha: string;
};

export type InvestmentDividendCreate = {
  descripcion: string;
  monto: number | string;
  fecha: string;
};

export const InvestmentsService = {
  async listBuys(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_compras')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listSells(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_ventas')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listDividends(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_dividendos')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createBuy(userId: string, payload: InvestmentBuyCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_compras')
      .insert({
        user_id: userId,
        descripcion: payload.descripcion,
        cantidad: parseFloat(String(payload.cantidad)),
        precio_unitario: parseFloat(String(payload.precio_unitario)),
        fecha: payload.fecha,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createSell(userId: string, payload: InvestmentSellCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_ventas')
      .insert({
        user_id: userId,
        descripcion: payload.descripcion,
        cantidad: parseFloat(String(payload.cantidad)),
        precio_unitario: parseFloat(String(payload.precio_unitario)),
        fecha: payload.fecha,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createDividend(userId: string, payload: InvestmentDividendCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_dividendos')
      .insert({
        user_id: userId,
        descripcion: payload.descripcion,
        monto: parseFloat(String(payload.monto)),
        fecha: payload.fecha,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteBuy(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inversiones_compras')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  async deleteSell(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inversiones_ventas')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  async deleteDividend(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inversiones_dividendos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};
