
import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AlertData {
  type: string;
  message: string;
  date: string;
  severity: string;
  data?: any;
}

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertData[];
  isLoading: boolean;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ isOpen, onClose, alerts, isLoading }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Todas las alertas del sistema</DialogTitle>
          <DialogDescription>
            Listado completo de alertas y notificaciones
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-nutri-green border-t-transparent rounded-full"></div>
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-md border ${
                alert.severity === 'error' ? 'bg-red-50 border-red-200' : 
                alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                'bg-blue-50 border-blue-200'
              }`}>
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  alert.severity === 'error' ? 'text-red-500' : 
                  alert.severity === 'warning' ? 'text-yellow-500' : 
                  'text-blue-500'
                }`} />
                <div>
                  <h4 className="font-medium">{alert.message}</h4>
                  {alert.data && (
                    <p className="text-sm text-gray-600">
                      {alert.type === 'inventory' ? 
                        `Producto: ${alert.data.nombre}` : 
                        alert.type === 'order' ?
                        `Pedido #${alert.data.id?.substring(0, 8)}` :
                        'Alerta del sistema'}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">
              No hay alertas en el sistema
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertsModal;
