import { supabase } from "./base-client";

// Get notifications for a user (solo las no eliminadas)
export const getUserNotifications = async (userId: string) => {
  return supabase
    .from("v_notificaciones_usuario")
    .select("*")
    .eq("usuario_id", userId)
    .order("fecha_creacion", { ascending: false });
};

// Marcar notificación como leída para el usuario
export const markNotificationAsSeen = async (notificacionUsuarioId: string) => {
  return supabase.rpc("marcar_notificacion_leida", {
    p_notificacion_usuario_id: notificacionUsuarioId,
  });
};

// Eliminar una notificación solo para el usuario
export const deleteNotification = async (notificacionUsuarioId: string) => {
  return supabase
    .from("notificaciones_usuario")
    .update({ eliminada: true, fecha_eliminada: new Date().toISOString() })
    .eq("id", notificacionUsuarioId);
};

// Eliminar todas las notificaciones para un usuario
export const deleteAllNotifications = async (userId: string) => {
  // Llama la función SQL que marca todas como eliminadas para el usuario
  return supabase.rpc("eliminar_todas_notificaciones_usuario", {
    p_usuario_id: userId,
  });
};

// Crear una nueva notificación global (la lógica de asignación individual la hacen los triggers/funciones en la base de datos)
export const createNotification = async (notificationData: {
  tipo: string;
  titulo: string;
  mensaje: string;
  icono?: string;
  color?: string;
  entidad_tipo?: string;
  entidad_id?: string;
  usuario_id?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from("notificaciones")
      .insert([notificationData])
      .select()
      .single();
    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Exception creating notification:", error);
    return { success: false, error };
  }
};
