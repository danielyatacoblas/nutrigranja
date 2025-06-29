import React from "react";
import { Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: number;
  imagen: string;
  nombre: string;
  precio: number;
  rating: number;
  tiempoEntrega: string;
  unidad?: string;
  proveedor_id?: string;
  stock?: number;
  unitOfMeasure?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  imagen,
  nombre,
  precio,
  rating,
  tiempoEntrega,
  unidad = "Tonelada",
  proveedor_id,
  stock,
  unitOfMeasure = "UNIDAD",
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(
      {
        id,
        imagen,
        nombre,
        precio,
        unidad,
        proveedor_id,
      },
      1
    );
    toast.success(`${nombre} agregado al carrito`);
  };

  const getStockStatusColor = () => {
    if (stock === undefined) return "text-gray-500";
    if (stock <= 0) return "text-red-500";
    if (stock < 10) return "text-white";
    return "text-white";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        <img
          src={imagen}
          alt={nombre}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {stock !== undefined && (
          <div
            className={` absolute top-2 right-2 ${
              stock <= 0 ? "bg-red-600 text-white" : getStockStatusColor()
            } px-2 py-1 rounded-full text-xs font-bold shadow-sm border border-white bg-green-600`}
          >
            {stock <= 0 ? "Sin Stock" : `Stock: ${stock} ${unitOfMeasure}`}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{nombre}</h3>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-bold text-nutri-green">
            ${precio.toFixed(2)}
          </p>
          <div className="flex items-center">
            <StarRating rating={rating} size={16} />
            <span className="ml-1">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center text-gray-600 mb-2">
          <Clock size={16} />
          <span className="ml-1 text-sm">{tiempoEntrega}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-4">
          <Package size={16} />
          <span className="ml-1 text-sm">
            {unidad} ({unitOfMeasure})
          </span>
        </div>
        <Button
          onClick={handleAddToCart}
          className={"w-full bg-nutri-green hover:bg-nutri-green/90"}
        >
          Agregar al Carrito
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
