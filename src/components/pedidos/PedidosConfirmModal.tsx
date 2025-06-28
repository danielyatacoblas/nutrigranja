import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pedido } from "@/types/database";

interface PedidosConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pedido: Pedido) => void;
  currentPedido: Pedido | null;
}

const PedidosConfirmModal: React.FC<PedidosConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPedido,
}) => {
  const formatOrderDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  const handleConfirm = () => {
    if (currentPedido) {
      onConfirm(currentPedido);
    }
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro que desea confirmar la recepción de este pedido? Esta
            acción generará una orden de compra oficial y no podrá deshacerse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-gray-50 p-3 rounded-md my-4">
          {currentPedido && (
            <>
              <p>
                <span className="font-medium">Producto:</span>{" "}
                {currentPedido.producto?.nombre}
              </p>
              <p>
                <span className="font-medium">Proveedor:</span>{" "}
                {currentPedido.proveedor?.nombre}
              </p>
              <p>
                <span className="font-medium">Cantidad:</span>{" "}
                {currentPedido.cantidad}
              </p>
              <p>
                <span className="font-medium">Fecha Pedido:</span>{" "}
                {formatOrderDate(currentPedido.fecha_pedido)}
              </p>
              <p>
                <span className="font-medium">Precio Total:</span> $
                {currentPedido.precio_total.toFixed(2)}
              </p>
            </>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirmar Recepción
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PedidosConfirmModal;
