
import React from 'react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/common/Modal';
import { Pedido } from '@/types/database';

interface PedidosDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  currentPedido: Pedido | null;
  isLoading: boolean;
}

const PedidosDeleteModal: React.FC<PedidosDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  currentPedido,
  isLoading
}) => {
  const formatOrderDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Pedido"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete} disabled={isLoading}>
            {isLoading ? 'Eliminando...' : 'Eliminar Pedido'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          ¿Está seguro que desea eliminar este pedido?
        </p>
        <p className="text-gray-500 text-sm">
          Esta acción no afectará las calificaciones registradas previamente.
        </p>
        {currentPedido && (
          <div className="bg-gray-100 p-3 rounded-md">
            <p><span className="font-medium">Producto:</span> {currentPedido.producto?.nombre}</p>
            <p><span className="font-medium">Proveedor:</span> {currentPedido.proveedor?.nombre}</p>
            <p><span className="font-medium">Cantidad:</span> {currentPedido.cantidad}</p>
            <p><span className="font-medium">Fecha Pedido:</span> {formatOrderDate(currentPedido.fecha_pedido)}</p>
            <p><span className="font-medium">Precio Total:</span> ${currentPedido.precio_total.toFixed(2)}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PedidosDeleteModal;
