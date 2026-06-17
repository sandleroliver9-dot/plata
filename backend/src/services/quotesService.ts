// Service for external quotes/pricing data
export type Dolares = {
  oficial?: number;
  blue?: number;
  mep?: number;
  ccl?: number;
  cripto?: number;
  tarjeta?: number;
  fetched_at: string;
};

export const QuotesService = {
  async getDolares(): Promise<Dolares> {
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares', { 
        headers: { Accept: 'application/json' } 
      });
      if (!res.ok) throw new Error(`dolarapi ${res.status}`);
      const arr = (await res.json()) as Array<{ casa: string; venta: number }>;
      const pick = (k: string) => arr.find((x) => x.casa === k)?.venta;
      return {
        oficial: pick('oficial'),
        blue: pick('blue'),
        mep: pick('bolsa'),
        ccl: pick('contadoconliqui'),
        cripto: pick('cripto'),
        tarjeta: pick('tarjeta'),
        fetched_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error fetching dolares:', err);
      throw err;
    }
  },

  async getInflacion(): Promise<{ valor: number; mes: string; fetched_at: string }> {
    try {
      const res = await fetch('https://api.bluelytics.com.ar/v2/latest', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`bluelytics ${res.status}`);
      const data = (await res.json()) as any;
      return {
        valor: data.last_update?.variation_pcent_month ?? 0,
        mes: new Date().toISOString().slice(0, 7),
        fetched_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error fetching inflacion:', err);
      throw err;
    }
  },
};
