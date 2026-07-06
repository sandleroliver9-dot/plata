import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const getSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export type AssetCreate = {
  nombre: string;
  ticker?: string | null;
  tipo: string;
  sector?: string | null;
  moneda_base?: string;
  notas?: string | null;
};

export type InvestmentBuyCreate = {
  activo_id: string;
  cantidad: number;
  precio_usd: number;
  fecha: string;
  tc?: number | null;
  broker?: string | null;
  notas?: string | null;
};

export type InvestmentSellCreate = {
  activo_id: string;
  cantidad: number;
  precio_usd: number;
  fecha: string;
  tc?: number | null;
  notas?: string | null;
};

export type InvestmentDividendCreate = {
  activo_id: string;
  monto_usd: number;
  fecha: string;
  tc?: number | null;
  notas?: string | null;
};

// El backend usa la service role key (sin RLS): hay que chequear a mano que
// el activo referenciado sea del usuario, o cualquiera podria adjuntar
// compras/ventas/dividendos al activo de otro usuario conociendo su UUID.
async function assertAssetOwnership(userId: string, assetId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('inversiones_activos')
    .select('id')
    .eq('id', assetId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    logger.error('Error verifying investment asset ownership', error);
    throw error;
  }
  if (!data) {
    const notFound = new Error('Investment asset not found');
    (notFound as any).status = 404;
    throw notFound;
  }
}

export const InvestmentsService = {
  async listAssets(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_activos')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('nombre');
    if (error) {
      logger.error('Error fetching investment assets', error);
      throw error;
    }
    return data ?? [];
  },

  async createAsset(userId: string, payload: AssetCreate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_activos')
      .insert({
        user_id: userId,
        nombre: payload.nombre,
        ticker: payload.ticker ?? null,
        tipo: payload.tipo,
        sector: payload.sector ?? null,
        moneda_base: payload.moneda_base ?? 'USD',
        notas: payload.notas ?? null,
      })
      .select()
      .maybeSingle();
    if (error) {
      logger.error('Error creating investment asset', error);
      throw error;
    }
    logger.info('Investment asset created', { userId, assetId: data?.id });
    return data;
  },

  async listBuys(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_compras')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });
    if (error) {
      logger.error('Error fetching investment buys', error);
      throw error;
    }
    return data ?? [];
  },

  async listSells(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_ventas')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });
    if (error) {
      logger.error('Error fetching investment sells', error);
      throw error;
    }
    return data ?? [];
  },

  async listDividends(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_dividendos')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });
    if (error) {
      logger.error('Error fetching investment dividends', error);
      throw error;
    }
    return data ?? [];
  },

  async createBuy(userId: string, payload: InvestmentBuyCreate) {
    await assertAssetOwnership(userId, payload.activo_id);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_compras')
      .insert({
        user_id: userId,
        activo_id: payload.activo_id,
        cantidad: payload.cantidad,
        precio_usd: payload.precio_usd,
        fecha: payload.fecha,
        tc: payload.tc ?? null,
        broker: payload.broker ?? null,
        notas: payload.notas ?? null,
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error creating investment buy', error);
      throw error;
    }
    logger.info('Investment buy created', { userId, buyId: data?.id });
    return data;
  },

  async createSell(userId: string, payload: InvestmentSellCreate) {
    await assertAssetOwnership(userId, payload.activo_id);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_ventas')
      .insert({
        user_id: userId,
        activo_id: payload.activo_id,
        cantidad: payload.cantidad,
        precio_usd: payload.precio_usd,
        fecha: payload.fecha,
        tc: payload.tc ?? null,
        notas: payload.notas ?? null,
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error creating investment sell', error);
      throw error;
    }
    logger.info('Investment sell created', { userId, sellId: data?.id });
    return data;
  },

  async createDividend(userId: string, payload: InvestmentDividendCreate) {
    await assertAssetOwnership(userId, payload.activo_id);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inversiones_dividendos')
      .insert({
        user_id: userId,
        activo_id: payload.activo_id,
        monto_usd: payload.monto_usd,
        fecha: payload.fecha,
        tc: payload.tc ?? null,
        notas: payload.notas ?? null,
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error creating investment dividend', error);
      throw error;
    }
    logger.info('Investment dividend created', { userId, dividendId: data?.id });
    return data;
  },

  // inversiones_compras/ventas/dividendos no tienen columna `activo`: se
  // borran de verdad, igual que hace inversiones.tsx en el frontend.
  async deleteBuy(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inversiones_compras')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      logger.error('Error deleting investment buy', error);
      throw error;
    }
    logger.info('Investment buy deleted', { userId, buyId: id });
    return true;
  },

  async deleteSell(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inversiones_ventas')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      logger.error('Error deleting investment sell', error);
      throw error;
    }
    logger.info('Investment sell deleted', { userId, sellId: id });
    return true;
  },

  async deleteDividend(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inversiones_dividendos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      logger.error('Error deleting investment dividend', error);
      throw error;
    }
    logger.info('Investment dividend deleted', { userId, dividendId: id });
    return true;
  },
};
