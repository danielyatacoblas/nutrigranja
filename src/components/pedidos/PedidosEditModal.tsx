
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/common/Modal';
import { Pedido } from '@/types/database';

interface PedidosEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fechaPedido: string) => void;
  currentPedido: Pedido | null;
  isLoading: boolean;
}

const PedidosEditModal: React.FC<PedidosEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPedido,
  isLoading
}) => {
  const [editFechaPedido, setEditFechaPedido] = useState('');

  useEffect(() => {
    if (currentPedido && currentPedido.fecha_pedido) {
      setEditFechaPedido(new Date(currentPedido.fecha_pedido).toISOString().split('T')[0]);
    }
  }, [currentPedido]);

  const handleSave = () => {
    onSave(editFechaPedido);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Fecha de Pedido"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {currentPedido && (
          <>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p><span className="font-medium">Producto:</span> {currentPedido.producto?.nombre}</p>
              <p><span className="font-medium">Proveedor:</span> {currentPedido.proveedor?.nombre}</p>
              <p><span className="font-medium">Cantidad:</span> {currentPedido.cantidad}</p>
              <p><span className="font-medium">Precio Total:</span> ${currentPedido.precio_total.toFixed(2)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Pedido
              </label>
              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-nutri-green focus:border-nutri-green"
                value={editFechaPedido}
                onChange={(e) => setEditFechaPedido(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PedidosEditModal;
