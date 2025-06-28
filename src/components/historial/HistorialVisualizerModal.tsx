
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface HistorialVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, any> | null;
  title: string;
  description: string;
  type: string;
  action: string;
}

const HistorialVisualizerModal: React.FC<HistorialVisualizerModalProps> = ({
  isOpen,
  onClose,
  data,
  title,
  description,
  type,
  action
}) => {
  const getIcon = () => {
    switch (action) {
      case 'eliminar':
      case 'desactivar':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'crear':
      case 'confirmar':
      case 'activar':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getBadgeClass = () => {
    switch (action) {
      case 'crear':
      case 'activar':
        return 'bg-green-100 text-green-800';
      case 'actualizar':
      case 'cambiar_rol':
        return 'bg-blue-100 text-blue-800';
      case 'eliminar':
      case 'desactivar':
        return 'bg-red-100 text-red-800';
      case 'confirmar':
        return 'bg-purple-100 text-purple-800';
      case 'alerta':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatData = (data: Record<string, any> | null) => {
    if (!data) return null;
    
    return Object.entries(data).map(([key, value]) => {
      // Format the key to be more readable
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
      
      // Handle nested objects
      const formattedValue = typeof value === 'object' && value !== null
        ? JSON.stringify(value, null, 2)
        : String(value);
      
      return (
        <div key={key} className="mb-2">
          <span className="font-medium text-gray-700">{formattedKey}:</span> {formattedValue}
        </div>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-gray-600">{description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {type}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass()}`}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </span>
            </div>
          </div>
        </DialogHeader>
        
        {data && (
          <ScrollArea className="max-h-96 p-4 border rounded-md">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Detalles:</h3>
              {formatData(data)}
            </div>
          </ScrollArea>
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HistorialVisualizerModal;
