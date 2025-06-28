
import { supabase } from './base-client';

// Get notifications for a user
export const getUserNotifications = async (userId: string) => {
  return supabase
    .from('notificaciones')
    .select('*')
    .or(`usuario_id.is.null,usuario_id.eq.${userId}`)
    .or(`para_roles.cs.{"admin"},para_roles.cs.{"usuario"}`)
    .order('fecha_creacion', { ascending: false });
};

// Create a new notification
export const createNotification = async (notificationData: {
  tipo: string;
  titulo: string;
  mensaje: string;
  icono?: string;
  color?: string;
  para_roles?: string[];
  entidad_tipo?: string;
  entidad_id?: string;
  usuario_id?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([notificationData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating notification:', error);
      // Rather than failing, we continue with the order process
      // This allows orders to succeed even if notification creation fails
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception creating notification:', error);
    // We still continue with the order process
    return { success: false, error };
  }
};

// Mark notification as seen/deleted for a specific user
export const markNotificationAsSeen = async (notificationId: string, userId: string) => {
  // First, get the current visto object
  const { data, error } = await supabase
    .from('notificaciones')
    .select('visto')
    .eq('id', notificationId)
    .single();

  if (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }

  // Update the visto object for this user
  const vistoData: Record<string, string> = data?.visto ? { ...data.visto as Record<string, string> } : {};
  vistoData[userId] = new Date().toISOString();

  // Update the notification with the new visto data
  return supabase
    .from('notificaciones')
    .update({ visto: vistoData })
    .eq('id', notificationId);
};

// Mark all notifications as seen/deleted for a user
export const markAllNotificationsAsSeen = async (userId: string) => {
  // Get all notifications first
  const { data: notifications, error } = await supabase
    .from('notificaciones')
    .select('id, visto');

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  // For each notification, update its visto field
  const updatePromises = notifications.map(notif => {
    const vistoData: Record<string, string> = notif.visto ? { ...notif.visto as Record<string, string> } : {};
    vistoData[userId] = new Date().toISOString();
    
    return supabase
      .from('notificaciones')
      .update({ visto: vistoData })
      .eq('id', notif.id);
  });

  return Promise.all(updatePromises);
};

// Delete a specific notification
export const deleteNotification = async (notificationId: string) => {
  return supabase
    .from('notificaciones')
    .delete()
    .eq('id', notificationId);
};

// Delete all notifications for a user
export const deleteAllNotifications = async () => {
  // Using a valid filter that selects all notifications
  // instead of the problematic neq (not equal) without a value
  return supabase
    .from('notificaciones')
    .delete()
    .gt('id', '00000000-0000-0000-0000-000000000000');
};
