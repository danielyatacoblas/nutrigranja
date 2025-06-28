
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Printer, FileText, FileSpreadsheet } from 'lucide-react';
import { formatPedidosForExport, exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportUtils';

export type ExportPedidosSettings = {
  timeFrame: 'all' | 'month' | 'quarter' | 'year' | 'custom';
  status: 'all' | 'pendiente' | 'recibido';
  startDate: Date | undefined;
  endDate: Date | undefined;
  includeProviderDetails: boolean;
  includeProductDetails: boolean;
  titleReport: string;
  exportType: 'detailed' | 'simple';
};

interface ExportPedidosModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidos: any[];
  onExport: (settings: ExportPedidosSettings, format: 'pdf' | 'excel' | 'csv') => void;
}

const ExportPedidosModal: React.FC<ExportPedidosModalProps> = ({
  isOpen,
  onClose,
  pedidos,
  onExport
}) => {
  const [settings, setSettings] = useState<ExportPedidosSettings>({
    timeFrame: 'all',
    status: 'all',
    startDate: undefined,
    endDate: undefined,
    includeProviderDetails: true,
    includeProductDetails: true,
    titleReport: 'Reporte de Pedidos',
    exportType: 'detailed'
  });

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    onExport(settings, format);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <h2 className="text-xl font-bold mb-4">Exportar Pedidos</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Título del Reporte</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                value={settings.titleReport}
                onChange={(e) => setSettings({...settings, titleReport: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Período</label>
              <Select 
                value={settings.timeFrame} 
                onValueChange={(value: any) => setSettings({...settings, timeFrame: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pedidos</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Estado de Pedidos</label>
              <Select 
                value={settings.status} 
                onValueChange={(value: any) => setSettings({...settings, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado de pedidos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="recibido">Recibidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Tipo de Reporte</label>
              <Select 
                value={settings.exportType} 
                onValueChange={(value: any) => setSettings({...settings, exportType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="detailed">Detallado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {settings.timeFrame === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Fecha Inicio</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {settings.startDate ? format(settings.startDate, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={settings.startDate}
                      onSelect={(date) => setSettings({...settings, startDate: date || undefined})}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Fecha Fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {settings.endDate ? format(settings.endDate, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={settings.endDate}
                      onSelect={(date) => setSettings({...settings, endDate: date || undefined})}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="space-y-3 mt-4">
            <label className="font-medium">Incluir detalles:</label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeProvider" 
                checked={settings.includeProviderDetails}
                onCheckedChange={(checked) => 
                  setSettings({...settings, includeProviderDetails: checked === true})
                }
              />
              <label htmlFor="includeProvider" className="text-sm">
                Detalles del proveedor
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeProduct" 
                checked={settings.includeProductDetails}
                onCheckedChange={(checked) => 
                  setSettings({...settings, includeProductDetails: checked === true})
                }
              />
              <label htmlFor="includeProduct" className="text-sm">
                Detalles del producto
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              className="flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              className="flex items-center"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              className="flex items-center bg-[#2E7D32] text-white"
            >
              <Printer className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPedidosModal;
