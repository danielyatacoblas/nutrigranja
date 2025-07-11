import { Producto } from "@/types/database";
import { supabase } from "./base-client";
import { createNotification } from "./notification-service";

export const createPedido = async (pedido: {
  productos: Producto[]; // array de productos con todos los datos necesarios
  proveedor_id: string;
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

    // Asegura que productos siempre sea un array
    const productos = Array.isArray(pedido.productos) ? pedido.productos : [];
    if (productos.length === 0) {
      throw new Error("El pedido debe tener al menos un producto.");
    }
    const precio_total = productos.reduce(
      (sum, prod) => sum + Number(prod.precio) * Number(prod.cantidad || 1),
      0
    );

    const { data: pedidoData, error: pedidoError } = await supabase
      .from("pedido")
      .insert([
        {
          productos, // array de productos seguro
          proveedor_id: pedido.proveedor_id,
          fecha_estimada_entrega: pedido.fecha_estimada_entrega,
          estado: "pendiente",
          usuario_id: pedido.usuario_id,
          precio_total,
        },
      ])
      .select()
      .single();

    if (pedidoError) throw pedidoError;
    if (!pedidoData) throw new Error("No se pudo crear el pedido");

    // Obtener datos del usuario para la notificación
    let nombreCompleto = "";
    try {
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("nombres, apellidos")
        .eq("id", pedido.usuario_id)
        .single();
      if (!usuarioError && usuarioData) {
        nombreCompleto =
          `${usuarioData.nombres} ${usuarioData.apellidos}`.trim();
      } else {
        nombreCompleto = pedido.usuario_id;
      }
    } catch (e) {
      nombreCompleto = pedido.usuario_id;
    }

    // Crear notificación SOLO para pedido creado, solo para admin
    try {
      await createNotification({
        tipo: "pedido_creado",
        titulo: "Nuevo pedido creado",
        mensaje: `Nuevo pedido creado por ${nombreCompleto}`,
        entidad_tipo: "pedido",
        entidad_id: pedidoData.id,
        para_roles: ["admin"],
        icono: "ShoppingCart",
        color: "green",
      });
    } catch (e) {
      // Si falla la notificación, solo loguea el error, no interrumpe el flujo
      console.error("Error al crear notificación importante:", e);
    }

    return { data: pedidoData, error: null };
  } catch (e) {
    const error = e as Error;
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
