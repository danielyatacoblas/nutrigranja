export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assistant_config: {
        Row: {
          api_key: string | null
          created_at: string | null
          detail_level: string | null
          id: string
          max_tokens: number | null
          model: string | null
          tone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          detail_level?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          detail_level?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calificacion: {
        Row: {
          calidad: number
          comentario: string | null
          fecha_calificacion: string
          id: string
          precio: number
          producto_id: string
          proveedor_id: string
          tiempo_entrega: number
        }
        Insert: {
          calidad: number
          comentario?: string | null
          fecha_calificacion?: string
          id?: string
          precio: number
          producto_id: string
          proveedor_id: string
          tiempo_entrega: number
        }
        Update: {
          calidad?: number
          comentario?: string | null
          fecha_calificacion?: string
          id?: string
          precio?: number
          producto_id?: string
          proveedor_id?: string
          tiempo_entrega?: number
        }
        Relationships: [
          {
            foreignKeyName: "calificacion_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificacion_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedor"
            referencedColumns: ["id"]
          },
        ]
      }
      historial: {
        Row: {
          accion: string
          datos: Json | null
          descripcion: string
          fecha: string
          id: string
          modulo: string
          pdf_url: string | null
          tipo: string
          usuario: string
          usuario_id: string | null
        }
        Insert: {
          accion: string
          datos?: Json | null
          descripcion: string
          fecha?: string
          id?: string
          modulo: string
          pdf_url?: string | null
          tipo: string
          usuario: string
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          datos?: Json | null
          descripcion?: string
          fecha?: string
          id?: string
          modulo?: string
          pdf_url?: string | null
          tipo?: string
          usuario?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          color: string | null
          creador_id: string | null
          entidad_id: string | null
          entidad_tipo: string | null
          fecha_creacion: string
          icono: string | null
          id: string
          mensaje: string
          para_roles: string[] | null
          tipo: string
          titulo: string
          url: string | null
          usuario_id: string | null
          visto: Json | null
        }
        Insert: {
          color?: string | null
          creador_id?: string | null
          entidad_id?: string | null
          entidad_tipo?: string | null
          fecha_creacion?: string
          icono?: string | null
          id?: string
          mensaje: string
          para_roles?: string[] | null
          tipo: string
          titulo: string
          url?: string | null
          usuario_id?: string | null
          visto?: Json | null
        }
        Update: {
          color?: string | null
          creador_id?: string | null
          entidad_id?: string | null
          entidad_tipo?: string | null
          fecha_creacion?: string
          icono?: string | null
          id?: string
          mensaje?: string
          para_roles?: string[] | null
          tipo?: string
          titulo?: string
          url?: string | null
          usuario_id?: string | null
          visto?: Json | null
        }
        Relationships: []
      }
      pais_documentos: {
        Row: {
          codigo: string
          created_at: string | null
          descripcion: string | null
          formato: string
          id: string
          pais: string
          tipo_documento: string
        }
        Insert: {
          codigo: string
          created_at?: string | null
          descripcion?: string | null
          formato: string
          id?: string
          pais: string
          tipo_documento: string
        }
        Update: {
          codigo?: string
          created_at?: string | null
          descripcion?: string | null
          formato?: string
          id?: string
          pais?: string
          tipo_documento?: string
        }
        Relationships: []
      }
      pedido: {
        Row: {
          cantidad: number
          estado: string
          fecha_estimada_entrega: string | null
          fecha_pedido: string
          id: string
          pdf_url: string | null
          precio_total: number
          producto_id: string
          proveedor_id: string
          usuario_id: string | null
        }
        Insert: {
          cantidad: number
          estado?: string
          fecha_estimada_entrega?: string | null
          fecha_pedido?: string
          id?: string
          pdf_url?: string | null
          precio_total: number
          producto_id: string
          proveedor_id: string
          usuario_id?: string | null
        }
        Update: {
          cantidad?: number
          estado?: string
          fecha_estimada_entrega?: string | null
          fecha_pedido?: string
          id?: string
          pdf_url?: string | null
          precio_total?: number
          producto_id?: string
          proveedor_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      producto: {
        Row: {
          codigo: string | null
          created_at: string | null
          id: string
          imagen_url: string | null
          nombre: string
          peso: string
          precio: number | null
          proveedor_id: string | null
          referencia: number | null
          stock: number
          stock_alert: number
          tiempo_entrega_desde: number | null
          tiempo_entrega_hasta: number | null
          tipo: string
          unit_of_measure: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          peso: string
          precio?: number | null
          proveedor_id?: string | null
          referencia?: number | null
          stock?: number
          stock_alert?: number
          tiempo_entrega_desde?: number | null
          tiempo_entrega_hasta?: number | null
          tipo: string
          unit_of_measure?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          peso?: string
          precio?: number | null
          proveedor_id?: string | null
          referencia?: number | null
          stock?: number
          stock_alert?: number
          tiempo_entrega_desde?: number | null
          tiempo_entrega_hasta?: number | null
          tipo?: string
          unit_of_measure?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedor"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedor: {
        Row: {
          activo: boolean
          calificacion: number | null
          correo: string | null
          created_at: string
          direccion: string | null
          id: string
          nombre: string | null
          numero_documento: string | null
          pais: string | null
          telefono: string | null
          tipo: string | null
          tipo_documento: string | null
        }
        Insert: {
          activo?: boolean
          calificacion?: number | null
          correo?: string | null
          created_at?: string
          direccion?: string | null
          id?: string
          nombre?: string | null
          numero_documento?: string | null
          pais?: string | null
          telefono?: string | null
          tipo?: string | null
          tipo_documento?: string | null
        }
        Update: {
          activo?: boolean
          calificacion?: number | null
          correo?: string | null
          created_at?: string
          direccion?: string | null
          id?: string
          nombre?: string | null
          numero_documento?: string | null
          pais?: string | null
          telefono?: string | null
          tipo?: string | null
          tipo_documento?: string | null
        }
        Relationships: []
      }
      proveedor_tipo: {
        Row: {
          created_at: string
          descripcion: string | null
          icono: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      tipo_productos: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      units_of_measure: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          apellidos: string
          correo: string
          dni: string | null
          estado: Database["public"]["Enums"]["user_status"]
          fecha_registro: string
          id: string
          nombres: string
          rol: Database["public"]["Enums"]["user_role"]
          telefono: string | null
          usuario: string | null
        }
        Insert: {
          apellidos: string
          correo: string
          dni?: string | null
          estado?: Database["public"]["Enums"]["user_status"]
          fecha_registro?: string
          id: string
          nombres: string
          rol?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          usuario?: string | null
        }
        Update: {
          apellidos?: string
          correo?: string
          dni?: string | null
          estado?: Database["public"]["Enums"]["user_status"]
          fecha_registro?: string
          id?: string
          nombres?: string
          rol?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          usuario?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verificar_pedidos_retrasados: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "usuario"
      user_status: "activo" | "inactivo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "usuario"],
      user_status: ["activo", "inactivo"],
    },
  },
} as const
