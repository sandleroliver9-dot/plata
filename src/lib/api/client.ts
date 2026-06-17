import { supabase } from '@/integrations/supabase/client';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function apiFetch(path: string, options?: { method?: string; body?: any }) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API ${res.status}`);
  }

  // Some endpoints (DELETE) return empty body
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// Helper functions for each resource
export const apiClient = {
  // Profile
  profile: {
    get: () => apiFetch('/profile'),
    update: (data: any) => apiFetch('/profile', { method: 'PUT', body: data }),
  },

  // Categories
  categories: {
    list: () => apiFetch('/categories'),
    create: (data: any) => apiFetch('/categories', { method: 'POST', body: data }),
    update: (id: string, data: any) => apiFetch(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Transactions
  transactions: {
    list: (month?: string) => apiFetch(`/transactions${month ? `?month=${month}` : ''}`),
    create: (data: any) => apiFetch('/transactions', { method: 'POST', body: data }),
    update: (id: string, data: any) => apiFetch(`/transactions/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiFetch(`/transactions/${id}`, { method: 'DELETE' }),
  },

  // Income
  income: {
    list: () => apiFetch('/income'),
    create: (data: any) => apiFetch('/income', { method: 'POST', body: data }),
    update: (id: string, data: any) => apiFetch(`/income/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiFetch(`/income/${id}`, { method: 'DELETE' }),
  },

  // Bills
  bills: {
    list: () => apiFetch('/bills'),
    create: (data: any) => apiFetch('/bills', { method: 'POST', body: data }),
    update: (id: string, data: any) => apiFetch(`/bills/${id}`, { method: 'PUT', body: data }),
    markAsPaid: (id: string) => apiFetch(`/bills/${id}/pay`, { method: 'PATCH' }),
    delete: (id: string) => apiFetch(`/bills/${id}`, { method: 'DELETE' }),
  },

  // Goals
  goals: {
    list: () => apiFetch('/goals'),
    create: (data: any) => apiFetch('/goals', { method: 'POST', body: data }),
    update: (id: string, data: any) => apiFetch(`/goals/${id}`, { method: 'PUT', body: data }),
    updateProgress: (id: string, monto_actual: number) => 
      apiFetch(`/goals/${id}/progress`, { method: 'PATCH', body: { monto_actual } }),
    delete: (id: string) => apiFetch(`/goals/${id}`, { method: 'DELETE' }),
  },

  // Investments
  investments: {
    listBuys: () => apiFetch('/investments/buys'),
    listSells: () => apiFetch('/investments/sells'),
    listDividends: () => apiFetch('/investments/dividends'),
    createBuy: (data: any) => apiFetch('/investments/buy', { method: 'POST', body: data }),
    createSell: (data: any) => apiFetch('/investments/sell', { method: 'POST', body: data }),
    createDividend: (data: any) => apiFetch('/investments/dividend', { method: 'POST', body: data }),
    deleteBuy: (id: string) => apiFetch(`/investments/buy/${id}`, { method: 'DELETE' }),
    deleteSell: (id: string) => apiFetch(`/investments/sell/${id}`, { method: 'DELETE' }),
    deleteDividend: (id: string) => apiFetch(`/investments/dividend/${id}`, { method: 'DELETE' }),
  },

  // Quotes
  quotes: {
    getDolares: () => apiFetch('/quotes/dolar'),
    getInflacion: () => apiFetch('/quotes/inflation'),
  },
};
