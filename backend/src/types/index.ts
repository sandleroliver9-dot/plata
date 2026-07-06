// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Common entity types
export interface Category {
  id: string;
  user_id: string;
  nombre: string;
  tipo: string;
  color?: string;
  prioridad?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  fecha: string;
  descripcion?: string;
  monto: number;
  tipo: string;
  categoria?: string;
  medio?: string;
  tarjeta?: string;
  es_cuota: boolean;
  cuota_origen_id?: string;
  notas?: string;
  mes_financiero: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  country?: string;
  currency: string;
  display_name?: string;
  onboarding_done: boolean;
  overdraft_allowed?: number;
  pay_date_mode: string;
  pay_day?: number;
  salary?: number;
  saving_target?: number;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  concepto: string;
  monto: number;
  fecha_cobro: string;
  mes_financiero: string;
  tipo?: string;
  ajuste_esperado?: number;
  notas?: string;
  activo: boolean;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  concepto: string;
  monto: number;
  fecha: string;
  notas?: string;
  pagado: boolean;
  recurrente: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  meta: string;
  objetivo: number;
  ahorrado: number;
  moneda: string;
  fecha_objetivo?: string;
  notas?: string;
  created_at: string;
}

export interface InvestmentAsset {
  id: string;
  user_id: string;
  nombre: string;
  ticker?: string;
  tipo: string;
  sector?: string;
  moneda_base: string;
  valor_actual_usd?: number;
  precio_actualizado_en?: string;
  notas?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentBuy {
  id: string;
  user_id: string;
  activo_id: string;
  cantidad: number;
  precio_usd: number;
  tc?: number;
  broker?: string;
  notas?: string;
  fecha: string;
  created_at: string;
}

export interface InvestmentSell {
  id: string;
  user_id: string;
  activo_id: string;
  cantidad: number;
  precio_usd: number;
  tc?: number;
  notas?: string;
  fecha: string;
  created_at: string;
}

export interface InvestmentDividend {
  id: string;
  user_id: string;
  activo_id: string;
  monto_usd: number;
  tc?: number;
  notas?: string;
  fecha: string;
  created_at: string;
}
