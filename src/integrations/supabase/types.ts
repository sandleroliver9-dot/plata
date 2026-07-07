export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          activo: boolean
          color: string | null
          created_at: string
          id: string
          nombre: string
          prioridad: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          color?: string | null
          created_at?: string
          id?: string
          nombre: string
          prioridad?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          activo?: boolean
          color?: string | null
          created_at?: string
          id?: string
          nombre?: string
          prioridad?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          estado: string
          id: string
          mensaje: string
          pagina: string | null
          severidad: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          id?: string
          mensaje: string
          pagina?: string | null
          severidad?: string | null
          tipo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          id?: string
          mensaje?: string
          pagina?: string | null
          severidad?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gastos_fijos: {
        Row: {
          activo: boolean
          categoria: string | null
          created_at: string
          fin: string | null
          gasto: string
          id: string
          inicio: string | null
          medio: string | null
          monto_mensual: number
          notas: string | null
          user_id: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          created_at?: string
          fin?: string | null
          gasto: string
          id?: string
          inicio?: string | null
          medio?: string | null
          monto_mensual: number
          notas?: string | null
          user_id: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          created_at?: string
          fin?: string | null
          gasto?: string
          id?: string
          inicio?: string | null
          medio?: string | null
          monto_mensual?: number
          notas?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ingresos: {
        Row: {
          activo: boolean
          ajuste_esperado: number | null
          concepto: string
          created_at: string
          fecha_cobro: string
          id: string
          mes_financiero: string
          monto: number
          notas: string | null
          tipo: string | null
          user_id: string
        }
        Insert: {
          activo?: boolean
          ajuste_esperado?: number | null
          concepto: string
          created_at?: string
          fecha_cobro: string
          id?: string
          mes_financiero: string
          monto: number
          notas?: string | null
          tipo?: string | null
          user_id: string
        }
        Update: {
          activo?: boolean
          ajuste_esperado?: number | null
          concepto?: string
          created_at?: string
          fecha_cobro?: string
          id?: string
          mes_financiero?: string
          monto?: number
          notas?: string | null
          tipo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inmuebles: {
        Row: {
          activo: boolean
          alquilado: boolean
          ciudad: string | null
          created_at: string
          deuda_asociada: number
          fecha_tasacion: string | null
          id: string
          moneda: string
          notas: string | null
          pais: string | null
          propiedad: string
          renta_mensual: number | null
          tipo: string | null
          user_id: string
          valor_estimado: number
        }
        Insert: {
          activo?: boolean
          alquilado?: boolean
          ciudad?: string | null
          created_at?: string
          deuda_asociada?: number
          fecha_tasacion?: string | null
          id?: string
          moneda?: string
          notas?: string | null
          pais?: string | null
          propiedad: string
          renta_mensual?: number | null
          tipo?: string | null
          user_id: string
          valor_estimado?: number
        }
        Update: {
          activo?: boolean
          alquilado?: boolean
          ciudad?: string | null
          created_at?: string
          deuda_asociada?: number
          fecha_tasacion?: string | null
          id?: string
          moneda?: string
          notas?: string | null
          pais?: string | null
          propiedad?: string
          renta_mensual?: number | null
          tipo?: string | null
          user_id?: string
          valor_estimado?: number
        }
        Relationships: []
      }
      inversiones: {
        Row: {
          activo: boolean
          activo_nombre: string
          broker: string | null
          cantidad: number
          created_at: string
          fecha: string
          id: string
          moneda: string
          notas: string | null
          precio_compra: number
          ticker: string | null
          tipo: string
          user_id: string
          valor_actual: number
        }
        Insert: {
          activo?: boolean
          activo_nombre: string
          broker?: string | null
          cantidad?: number
          created_at?: string
          fecha?: string
          id?: string
          moneda?: string
          notas?: string | null
          precio_compra?: number
          ticker?: string | null
          tipo: string
          user_id: string
          valor_actual?: number
        }
        Update: {
          activo?: boolean
          activo_nombre?: string
          broker?: string | null
          cantidad?: number
          created_at?: string
          fecha?: string
          id?: string
          moneda?: string
          notas?: string | null
          precio_compra?: number
          ticker?: string | null
          tipo?: string
          user_id?: string
          valor_actual?: number
        }
        Relationships: []
      }
      inversiones_activos: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          moneda_base: string
          nombre: string
          notas: string | null
          precio_actualizado_en: string | null
          sector: string | null
          ticker: string | null
          tipo: string
          updated_at: string
          user_id: string
          valor_actual_usd: number | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          moneda_base?: string
          nombre: string
          notas?: string | null
          precio_actualizado_en?: string | null
          sector?: string | null
          ticker?: string | null
          tipo: string
          updated_at?: string
          user_id: string
          valor_actual_usd?: number | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          moneda_base?: string
          nombre?: string
          notas?: string | null
          precio_actualizado_en?: string | null
          sector?: string | null
          ticker?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor_actual_usd?: number | null
        }
        Relationships: []
      }
      inversiones_compras: {
        Row: {
          activo_id: string
          broker: string | null
          cantidad: number
          created_at: string
          fecha: string
          id: string
          notas: string | null
          precio_usd: number
          tc: number | null
          user_id: string
        }
        Insert: {
          activo_id: string
          broker?: string | null
          cantidad: number
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          precio_usd: number
          tc?: number | null
          user_id: string
        }
        Update: {
          activo_id?: string
          broker?: string | null
          cantidad?: number
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          precio_usd?: number
          tc?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inversiones_compras_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inversiones_activos"
            referencedColumns: ["id"]
          },
        ]
      }
      inversiones_dividendos: {
        Row: {
          activo_id: string
          created_at: string
          fecha: string
          id: string
          monto_usd: number
          notas: string | null
          tc: number | null
          user_id: string
        }
        Insert: {
          activo_id: string
          created_at?: string
          fecha?: string
          id?: string
          monto_usd: number
          notas?: string | null
          tc?: number | null
          user_id: string
        }
        Update: {
          activo_id?: string
          created_at?: string
          fecha?: string
          id?: string
          monto_usd?: number
          notas?: string | null
          tc?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inversiones_dividendos_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inversiones_activos"
            referencedColumns: ["id"]
          },
        ]
      }
      inversiones_ventas: {
        Row: {
          activo_id: string
          cantidad: number
          created_at: string
          fecha: string
          id: string
          notas: string | null
          precio_usd: number
          tc: number | null
          user_id: string
        }
        Insert: {
          activo_id: string
          cantidad: number
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          precio_usd: number
          tc?: number | null
          user_id: string
        }
        Update: {
          activo_id?: string
          cantidad?: number
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          precio_usd?: number
          tc?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inversiones_ventas_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inversiones_activos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          ahorrado: number
          created_at: string
          fecha_objetivo: string | null
          id: string
          meta: string
          moneda: string
          notas: string | null
          objetivo: number
          user_id: string
        }
        Insert: {
          ahorrado?: number
          created_at?: string
          fecha_objetivo?: string | null
          id?: string
          meta: string
          moneda?: string
          notas?: string | null
          objetivo: number
          user_id: string
        }
        Update: {
          ahorrado?: number
          created_at?: string
          fecha_objetivo?: string | null
          id?: string
          meta?: string
          moneda?: string
          notas?: string | null
          objetivo?: number
          user_id?: string
        }
        Relationships: []
      }
      movimientos: {
        Row: {
          activo: boolean
          categoria: string | null
          created_at: string
          cuota_origen_id: string | null
          descripcion: string | null
          es_cuota: boolean
          fecha: string
          id: string
          ingreso_id: string | null
          medio: string | null
          mes_financiero: string
          monto: number
          notas: string | null
          tarjeta: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          created_at?: string
          cuota_origen_id?: string | null
          descripcion?: string | null
          es_cuota?: boolean
          fecha: string
          id?: string
          ingreso_id?: string | null
          medio?: string | null
          mes_financiero: string
          monto: number
          notas?: string | null
          tarjeta?: string | null
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          created_at?: string
          cuota_origen_id?: string | null
          descripcion?: string | null
          es_cuota?: boolean
          fecha?: string
          id?: string
          ingreso_id?: string | null
          medio?: string | null
          mes_financiero?: string
          monto?: number
          notas?: string | null
          tarjeta?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_ingreso_id_fkey"
            columns: ["ingreso_id"]
            isOneToOne: false
            referencedRelation: "ingresos"
            referencedColumns: ["id"]
          },
        ]
      }
      prestamos: {
        Row: {
          activo: boolean
          created_at: string
          cuota_mensual: number
          cuotas_pagadas: number
          cuotas_totales: number
          descripcion: string
          dia_pago: number | null
          id: string
          inicio: string | null
          notas: string | null
          tasa: number | null
          tasa_tipo: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          cuota_mensual: number
          cuotas_pagadas?: number
          cuotas_totales: number
          descripcion: string
          dia_pago?: number | null
          id?: string
          inicio?: string | null
          notas?: string | null
          tasa?: number | null
          tasa_tipo?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          cuota_mensual?: number
          cuotas_pagadas?: number
          cuotas_totales?: number
          descripcion?: string
          dia_pago?: number | null
          id?: string
          inicio?: string | null
          notas?: string | null
          tasa?: number | null
          tasa_tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          currency: string
          display_name: string | null
          id: string
          onboarding_done: boolean
          overdraft_allowed: number | null
          pay_date_mode: string
          pay_day: number | null
          salary: number | null
          saving_target: number | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          id: string
          onboarding_done?: boolean
          overdraft_allowed?: number | null
          pay_date_mode?: string
          pay_day?: number | null
          salary?: number | null
          saving_target?: number | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          id?: string
          onboarding_done?: boolean
          overdraft_allowed?: number | null
          pay_date_mode?: string
          pay_day?: number | null
          salary?: number | null
          saving_target?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tarjetas_cuotas: {
        Row: {
          activo: boolean
          compra: string
          created_at: string
          cuota_actual: number
          cuotas_totales: number
          fin: string | null
          id: string
          inicio: string
          notas: string | null
          tarjeta: string
          user_id: string
          valor_cuota: number
        }
        Insert: {
          activo?: boolean
          compra: string
          created_at?: string
          cuota_actual?: number
          cuotas_totales: number
          fin?: string | null
          id?: string
          inicio: string
          notas?: string | null
          tarjeta: string
          user_id: string
          valor_cuota: number
        }
        Update: {
          activo?: boolean
          compra?: string
          created_at?: string
          cuota_actual?: number
          cuotas_totales?: number
          fin?: string | null
          id?: string
          inicio?: string
          notas?: string | null
          tarjeta?: string
          user_id?: string
          valor_cuota?: number
        }
        Relationships: []
      }
      vencimientos: {
        Row: {
          concepto: string
          created_at: string
          fecha: string
          id: string
          monto: number
          notas: string | null
          pagado: boolean
          recurrente: boolean
          user_id: string
        }
        Insert: {
          concepto: string
          created_at?: string
          fecha: string
          id?: string
          monto: number
          notas?: string | null
          pagado?: boolean
          recurrente?: boolean
          user_id: string
        }
        Update: {
          concepto?: string
          created_at?: string
          fecha?: string
          id?: string
          monto?: number
          notas?: string | null
          pagado?: boolean
          recurrente?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
