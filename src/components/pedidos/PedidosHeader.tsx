
import React from 'react';
import { Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PedidosHeaderProps {
  onOpenFilterModal: () => void;
}

const PedidosHeader: React.FC<PedidosHeaderProps> = ({ onOpenFilterModal }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Package size={24} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
      </div>
      
      {/* Botón de filtro por período */}
      <Button 
        variant="outline" 
        onClick={onOpenFilterModal}
        className="bg-white border-primary text-primary hover:bg-primary/10"
      >
        <Calendar className="mr-2 h-5 w-5" />
        Filtrar por período
      </Button>
    </div>
  );
};

export default PedidosHeader;
