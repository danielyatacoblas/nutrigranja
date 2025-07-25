import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  unidad: string;
  proveedor_id?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "cantidad">, cantidad: number) => void;
  removeFromCart: (id: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Cargar carrito desde localStorage al iniciar
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart_items");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback(
    (newItem: Omit<CartItem, "cantidad">, cantidad: number) => {
      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.id === newItem.id
        );

        if (existingItem) {
          return currentItems.map((item) =>
            item.id === newItem.id
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item
          );
        }

        return [...currentItems, { ...newItem, cantidad }];
      });
    },
    []
  );

  const removeFromCart = useCallback((id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  // Define removeItem as an alias to removeFromCart for consistency
  const removeItem = useCallback((id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, cantidad: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, cantidad } : item))
        .filter((item) => item.cantidad > 0)
    );
  }, []);

  // Borra el carrito (y localStorage) al cerrar sesión
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart_items");
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        removeItem,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
