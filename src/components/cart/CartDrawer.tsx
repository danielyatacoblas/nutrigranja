import React, { useEffect, useState, useMemo } from "react";
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
import { getAllProveedores } from "@/integrations/supabase/client";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { items, updateQuantity, total, clearCart, removeItem } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [proveedorMap, setProveedorMap] = useState<{ [id: string]: string }>(
    {}
  );

  // Al montar, obtener todos los proveedores y crear el mapa id->nombre
  useEffect(() => {
    getAllProveedores().then(({ data }) => {
      if (data) {
        const map: { [id: string]: string } = {};
        data.forEach((p: any) => {
          if (p.id && p.nombre) map[p.id] = p.nombre;
        });
        setProveedorMap(map);
      }
    });
  }, []);

  // Agrupar productos por proveedor_id
  const productosPorProveedor = useMemo(() => {
    const grupos: { [proveedorId: string]: typeof items } = {};
    items.forEach((item) => {
      if (!item.proveedor_id) return;
      if (!grupos[item.proveedor_id]) grupos[item.proveedor_id] = [];
      grupos[item.proveedor_id].push(item);
    });
    return grupos;
  }, [items]);

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
      // Agrupa los productos por proveedor_id
      const productosPorProveedor = items.reduce((acc, item) => {
        if (!item.proveedor_id) return acc;
        if (!acc[item.proveedor_id]) acc[item.proveedor_id] = [];
        acc[item.proveedor_id].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Crea un pedido por cada proveedor
      const orderPromises = Object.entries(productosPorProveedor).map(
        async ([proveedor_id, productos]) => {
          return await createPedido({
            productos: productos.map((item) => ({
              id: String(item.id),
              nombre: item.nombre,
              cantidad: item.cantidad,
              precio: item.precio,
              unidad: item.unidad,
              // agrega más campos si es necesario
            })),
            proveedor_id,
            usuario_id: user.id,
            // puedes agregar fecha_estimada_entrega si aplica
          });
        }
      );

      const results = await Promise.all(orderPromises);
      const hasError = results.some((result) => result.error);
      if (hasError) {
        toast.error("Error al procesar uno o más pedidos");
      } else {
        toast.success("Pedidos confirmados exitosamente");
        clearCart();
        onClose();
      }
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
            <div className="space-y-8">
              {Object.entries(productosPorProveedor).map(
                ([proveedorId, productos]) => (
                  <div
                    key={proveedorId}
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <h3 className="font-semibold text-nutri-green mb-2 text-lg">
                      Proveedor: {proveedorMap[proveedorId] || proveedorId}
                    </h3>
                    {(Array.isArray(productos) ? productos : []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border-b pb-4"
                      >
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.nombre}</h4>
                          <p className="text-nutri-green font-bold">
                            ${item.precio.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.cantidad - 1)
                              }
                              className="p-1 rounded hover:bg-gray-100"
                              disabled={item.cantidad <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={item.cantidad}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                const num = Number(value);
                                if (num > 0) {
                                  updateQuantity(item.id, num);
                                }
                              }}
                              className="w-16 text-center border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-nutri-green"
                              inputMode="numeric"
                              pattern="[0-9]*"
                            />
                            <span>{item.unidad}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.cantidad + 1)
                              }
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
                    ))}
                  </div>
                )
              )}
            </div>
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
