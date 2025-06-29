import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/common/Modal";
import StarRating from "@/components/common/StarRating";
import { Pedido } from "@/types/database";
import { toast } from "../ui/sonner";

interface PedidosEvaluarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ratings: RatingData, comentarios: string, pedido: Pedido) => void;
  currentPedido: Pedido | null;
  isLoading: boolean;
  isPdfGenerating: boolean;
}

export interface RatingData {
  precio: number;
  calidad: number;
  tiempoEntrega: number;
}

const PedidosEvaluarModal: React.FC<PedidosEvaluarModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentPedido,
  isLoading,
  isPdfGenerating,
}) => {
  const [ratings, setRatings] = useState<RatingData>({
    precio: 0,
    calidad: 0,
    tiempoEntrega: 0,
  });
  const [comentarios, setComentarios] = useState("");

  const handleRatingChange = (tipo: keyof RatingData, value: number) => {
    setRatings({
      ...ratings,
      [tipo]: value,
    });
  };

  const handleComentariosChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComentarios(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(ratings, comentarios, currentPedido);
  };

  // Reset form when modal opens with a new pedido
  React.useEffect(() => {
    if (isOpen) {
      setRatings({
        precio: 0,
        calidad: 0,
        tiempoEntrega: 0,
      });
      setComentarios("");
    }
  }, [isOpen, currentPedido]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluar Pedido"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isPdfGenerating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isPdfGenerating}
          >
            {isLoading || isPdfGenerating
              ? "Procesando..."
              : "Guardar Evaluación"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-gray-700 mb-2">Precio</h4>
          <div className="flex">
            <StarRating
              rating={ratings.precio}
              editable={true}
              onChange={(value) => handleRatingChange("precio", value)}
              size={24}
            />
          </div>
        </div>

        <div>
          <h4 className="text-gray-700 mb-2">Calidad</h4>
          <div className="flex">
            <StarRating
              rating={ratings.calidad}
              editable={true}
              onChange={(value) => handleRatingChange("calidad", value)}
              size={24}
            />
          </div>
        </div>

        <div>
          <h4 className="text-gray-700 mb-2">Tiempo de Entrega</h4>
          <div className="flex">
            <StarRating
              rating={ratings.tiempoEntrega}
              editable={true}
              onChange={(value) => handleRatingChange("tiempoEntrega", value)}
              size={24}
            />
          </div>
        </div>

        <div>
          <h4 className="text-gray-700 mb-2">Comentarios</h4>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
            rows={4}
            value={comentarios}
            onChange={handleComentariosChange}
            placeholder="Ingrese sus comentarios aquí..."
          />
        </div>

        {isPdfGenerating && (
          <div className="bg-blue-50 p-4 rounded-md flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-700">Generando documento PDF...</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PedidosEvaluarModal;
