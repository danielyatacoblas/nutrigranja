import { supabase } from "./base-client";
import { createNotification } from "./notification-service";

export const createPedido = async (pedido: {
  producto_id: string;
  proveedor_id: string;
  precio_total: number;
  cantidad: number;
  fecha_estimada_entrega?: string;
  usuario_id?: string;
}) => {
  try {
    // Obtener el usuario_id del usuario autenticado si no se proporciona
    if (!pedido.usuario_id) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");
      pedido.usuario_id = user.id;
    }

    // Crear el pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from("pedido")
      .insert([
        {
          producto_id: pedido.producto_id,
          proveedor_id: pedido.proveedor_id,
          precio_total: pedido.precio_total,
          cantidad: pedido.cantidad,
          fecha_estimada_entrega: pedido.fecha_estimada_entrega,
          estado: "pendiente",
          usuario_id: pedido.usuario_id,
        },
      ])
      .select()
      .single();

    if (pedidoError) throw pedidoError;
    if (!pedidoData) throw new Error("No se pudo crear el pedido");

    // Crear notificación de manera no bloqueante
    try {
      // Intentamos crear una notificación pero no bloqueamos si falla
      const result = await createNotification({
        tipo: "pedido_creado",
        titulo: "Nuevo pedido creado",
        mensaje: `Se ha creado un nuevo pedido con ID: ${pedidoData.id}`,
        entidad_tipo: "pedido",
        entidad_id: pedidoData.id,
        para_roles: ["admin"],
        icono: "ShoppingCart",
        color: "green",
      });

      // Solo accede a data si result.data no es null
      const notificationId = result.data?.id;
      if (notificationId) {
        console.log("Notificación creada con ID:", notificationId);
      }
    } catch (e) {
      // Solo loggeamos el error pero no interrumpimos la creación del pedido
      console.error("Error al crear notificación:", e);
    }

    return { data: pedidoData, error: null };
  } catch (error: any) {
    console.error("Error al crear pedido:", error);
    return { data: null, error };
  }
};

export const getAllPedidos = async () => {
  try {
    const { data, error } = await supabase
      .from("pedido")
      .select(
        `
        *,
        producto:producto_id (*),
        proveedor:proveedor_id (*)
      `
      )
      .order("fecha_creacion", { ascending: false });

    console.log("Fetched pedidos:", data);
    return { data, error };
  } catch (err) {
    console.error("Error in getAllPedidos:", err);
    return { data: null, error: err };
  }
};

export const getPedidosByEstado = async (estado: string) => {
  try {
    const { data, error } = await supabase
      .from("pedido")
      .select(
        `
        *,
        producto:producto_id (*),
        proveedor:proveedor_id (*)
      `
      )
      .eq("estado", estado)
      .order("fecha_pedido", { ascending: false });

    console.log(`Fetched pedidos with estado=${estado}:`, data);
    return { data, error };
  } catch (err) {
    console.error(`Error in getPedidosByEstado(${estado}):`, err);
    return { data: null, error: err };
  }
};

export const updatePedidoEstado = async (
  id: string,
  estado: string,
  pdf_url?: string
) => {
  const updates: { estado: string; pdf_url?: string } = { estado };

  if (pdf_url) {
    updates.pdf_url = pdf_url;
  }

  return supabase.from("pedido").update(updates).eq("id", id);
};

export const updatePedidoFecha = async (
  id: string,
  fecha_estimada_entrega: string
) => {
  return supabase
    .from("pedido")
    .update({ fecha_estimada_entrega })
    .eq("id", id);
};

export const updatePedidoPdfUrl = async (id: string, pdf_url: string) => {
  return supabase.from("pedido").update({ pdf_url }).eq("id", id);
};

export const deletePedido = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from("pedido")
      .delete()
      .eq("id", orderId);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { data: null, error };
  }
};
