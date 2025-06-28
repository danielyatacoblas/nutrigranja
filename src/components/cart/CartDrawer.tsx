import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { createPedido } from "@/integrations/supabase/order-service";
import { useAuth } from "@/context/AuthContext";
import ShoppingBagIcon from "./ShoppingBagIcon";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { items, updateQuantity, total, clearCart, removeItem } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      toast.error("No hay productos en el carrito");
      return;
    }

    if (!user) {
      toast.error("Debes iniciar sesión para realizar un pedido");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating orders for cart items:", items);
      console.log("Using user ID:", user.id);

      // Create a request for each product in the cart
      const orderPromises = items.map(async (item) => {
        if (!item.proveedor_id) {
          console.error("Missing proveedor_id for item:", item);
          throw new Error(
            `El producto ${item.nombre} no tiene proveedor asignado`
          );
        }

        const result = await createPedido({
          producto_id: String(item.id),
          proveedor_id: item.proveedor_id,
          precio_total: item.precio * item.cantidad,
          cantidad: item.cantidad,
          usuario_id: user.id, // Aseguramos que se pase el ID del usuario autenticado
        });

        if (result.error) {
          if (result.error.message?.includes("notificaciones")) {
            console.error(
              "Notification error but continuing order process:",
              result.error
            );
            return { success: true, withNotificationIssue: true };
          }

          console.error("Error creating order:", result.error);
          throw new Error(result.error.message || "Error al crear el pedido");
        }

        console.log("Order created successfully:", result.data);
        return result;
      });

      const results = await Promise.all(orderPromises);

      // Check if any orders had notification issues
      const hasNotificationIssues = results.some(
        (result) => "withNotificationIssue" in result
      );

      if (hasNotificationIssues) {
        toast.error("Error al procesar pedido");
      } else {
        toast.success("Pedido confirmado exitosamente");
      }

      clearCart(); // Clear cart after successful order creation
      onClose(); // Close drawer
    } catch (error) {
      console.error("Error creating orders:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Error desconocido";
      toast.error("Error al confirmar el pedido: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle>Carrito de Compras</DrawerTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBagIcon className="h-12 w-12 mb-2" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 mb-4 border-b pb-4"
              >
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.nombre}</h3>
                  <p className="text-nutri-green font-bold">
                    ${item.precio.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span>
                      {item.cantidad} {item.unidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded hover:bg-gray-100 ml-auto text-red-500"
                      title="Eliminar del carrito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DrawerFooter className="border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>
          <Button
            onClick={handleConfirmOrder}
            className="w-full bg-nutri-green hover:bg-nutri-green/90"
            disabled={isLoading || items.length === 0}
          >
            {isLoading ? "Procesando..." : "Confirmar Pedido"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
