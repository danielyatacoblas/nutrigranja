import { Json } from "@/integrations/supabase/types";

export type UserRole = "admin" | "usuario";
export type UserStatus = "activo" | "inactivo";
export type ProveedorStatus = "activo" | "inactivo";

/* USUARIO: propiedades de base de datos Supabase  @danielyatacoblas*/
export interface Usuario {
  id: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  dni: string | null;
  telefono: string | null;
  rol: UserRole;
  estado: UserStatus;
  fecha_registro: string;
  correo: string;
  avatar_url?: string;
}

/* TIPO DE PROVEEDOR: propiedades de base de datos Supabase */
export interface ProveedorTipo {
  id: string;
  nombre: string;
  icono?: string;
  created_at?: string;
}

/* PROVEEDOR: propiedades de base de datos Supabase  @danielyatacoblas*/
export interface Proveedor {
  id: string;
  nombre: string;
  numero_documento: string;
  direccion: string;
  telefono: string;
  correo: string;
  tipo?: string;
  pais?: string;
  tipo_documento?: string;
  calificacion?: number;
  created_at?: string;
  activo?: boolean;
  estado?: ProveedorStatus;
}

/* UNIDAD DE MEDIDA: propiedades de base de datos Supabase */
export interface UnitOfMeasure {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at?: string;
}

/* PRODUCTO: propiedades de base de datos Supabase  @danielyatacoblas*/
export interface Producto {
  id: string;
  nombre: string;
  tipo: string;
  proveedor_id: string;
  peso: string;
  tiempo_entrega_desde: number | null;
  tiempo_entrega_hasta: number | null;
  imagen_url: string | null;
  referencia?: number;
  precio?: number;
  created_at?: string;
  proveedor?: Proveedor;
  stock: number;
  stock_alert: number;
  unit_of_measure: string;
  cantidad?: number;
}

/* PEDIDO: propiedades de base de datos Supabase */
export interface Pedido {
  id: string;
  proveedor_id: string;
  productos: Producto[];
  precio_total: number;
  estado: string;
  fecha_pedido: string;
  pdf_url?: string | null;
  ticket: string;
  proveedor?: {
    nombre: string;
  };
}

/* HISTORIAL: propiedades de base de datos Supabase */
export interface HistorialItem {
  id: string;
  tipo: string;
  descripcion: string;
  usuario: string;
  fecha: string;
  modulo: string;
  accion: string;
  datos: Record<string, unknown> | null;
  usuario_id: string | null;
  pdf_url?: string | null;
}

// Tipado de tablas
export type AnyTable =
  | "usuarios"
  | "proveedor"
  | "producto"
  | "proveedor_tipo"
  | "historial"
  | "units_of_measure";

// Acoplamiento de tabla Supabase : Type-safe @danielyatacoblas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const anyFrom = <T>(supabase: any, table: AnyTable) => {
  return supabase.from(table) as T;
};
