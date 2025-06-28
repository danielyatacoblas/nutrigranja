import React, { useState, useEffect } from "react";
import {
  Bell,
  ShoppingCart,
  User,
  AlertTriangle,
  Check,
  Package,
  UserPlus,
  Pen,
  Trash2,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import CartDrawer from "../cart/CartDrawer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteAllNotifications,
  deleteNotification,
  getUserNotifications,
  markAllNotificationsAsSeen,
  markNotificationAsSeen,
} from "@/integrations/supabase/notification-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ProfileConfigModal from "../profile/ProfileConfigModal";
import { useTheme } from "@/context/ThemeContext";
import { Usuario } from "@/types/database";

interface HeaderProps {
  title?: string;
}

// Updated to match the database table structure
interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
  icono: string | null;
  color: string | null;
  visto: Record<string, boolean> | null;
  creador_id?: string | null;
  usuario_id?: string | null;
  para_roles?: string[] | null;
  url?: string | null;
  entidad_tipo?: string | null;
  entidad_id?: string | null;
}

const Header: React.FC<HeaderProps> = () => {
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [userInfo, setUserInfo] = useState<Usuario | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user) {
      fetchUserInfo();
      fetchNotifications();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        setUserInfo(data);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      if (!user?.id) return;

      const { data, error } = await getUserNotifications(user.id);

      if (error) throw error;

      // Ensure data conforms to Notification[] type
      const typedNotifications = data?.map((notification) => ({
        ...notification,
        visto: notification.visto || {},
      })) as Notification[];

      // Calculate unread notifications
      const unread =
        typedNotifications?.filter((notification) => {
          const visto = notification.visto || {};
          return !visto[user.id || ""];
        }).length || 0;

      setNotifications(typedNotifications || []);
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (icono: string) => {
    switch (icono) {
      case "alert-triangle":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "check":
      case "check-circle":
        return <Check className="w-4 h-4 text-green-600" />;
      case "package-plus":
        return <Package className="w-4 h-4 text-purple-600" />;
      case "user-plus":
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case "pen":
        return <Pen className="w-4 h-4 text-blue-600" />;
      case "shopping-cart":
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColorClass = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-100 text-red-800 border-red-200";
      case "green":
        return "bg-green-100 text-green-800 border-green-200";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - notificationDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "Hace unos segundos";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} ${days === 1 ? "día" : "días"}`;
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const { error } = await deleteNotification(notificationId);

      if (error) {
        console.error("Error deleting notification:", error);
        toast.error("Error al eliminar la notificación");
        return;
      }

      // Update locally
      setNotifications(
        notifications.filter(
          (notification) => notification.id !== notificationId
        )
      );

      // Update counter if this was an unread notification
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      if (
        deletedNotification &&
        (!deletedNotification.visto || !deletedNotification.visto[user.id])
      ) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      toast.success("Notificación eliminada");
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Error al eliminar la notificación");
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!user) return;

    try {
      setIsDeletingAll(true);
      const { error } = await deleteAllNotifications();

      if (error) {
        console.error("Error deleting all notifications:", error);
        toast.error("Error al eliminar las notificaciones");
        setIsDeletingAll(false);
        return;
      }

      // Update locally
      setNotifications([]);
      setUnreadCount(0);

      toast.success("Todas las notificaciones han sido eliminadas");
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      toast.error("Error al eliminar las notificaciones");
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <>
      <div className="bg-white  h-16 flex items-center justify-end px-6 py-2">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger>
              <div className="relative cursor-pointer">
                <Bell className="text-gray-600 w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-nutri-yellow text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Notificaciones
                  </h2>
                  {unreadCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-nutri-green text-white"
                    >
                      {unreadCount} sin leer
                    </Badge>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      Cargando notificaciones...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const hasBeenRead =
                        notification.visto &&
                        notification.visto[user?.id || ""];
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-200 flex gap-3 ${
                            !hasBeenRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full ${getNotificationColorClass(
                              notification.color || ""
                            )}`}
                          >
                            {getNotificationIcon(notification.icono || "")}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {notification.titulo}
                            </p>
                            <p className="text-sm text-gray-600">
                              {notification.mensaje}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(notification.fecha_creacion)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-500"
                            onClick={(e) =>
                              handleDeleteNotification(e, notification.id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t flex justify-end">
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleDeleteAllNotifications}
                    disabled={isDeletingAll || notifications.length === 0}
                  >
                    {isDeletingAll ? "Eliminando..." : "Eliminar todas"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div
            className="relative cursor-pointer"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="text-gray-600 w-6 h-6" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-nutri-yellow text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>

          <div className="relative cursor-pointer ">
            <Popover>
              <PopoverTrigger>
                <Avatar>
                  <AvatarImage
                    src={userInfo?.avatar_url || ""}
                    alt={userInfo?.nombres}
                  />
                  <AvatarFallback className="bg-green-600 text-white">
                    {userInfo?.nombres?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="p-2">
                  <p className="font-bold text-gray-800 ">
                    {userInfo?.nombres}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userInfo?.correo}
                  </p>
                </div>
                <Separator />
                <div className="py-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                  </Button>
                </div>
                <Separator />
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ProfileConfigModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdate={() => {
          fetchUserInfo();
          toast.success("Perfil actualizado");
        }}
      />
    </>
  );
};

export default Header;
