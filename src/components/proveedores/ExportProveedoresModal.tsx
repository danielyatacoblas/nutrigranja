
import React, { useState } from 'react';
import { Check, Download, FileText } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Proveedor, ProveedorTipo } from '@/types/database';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF, formatProveedoresForExport } from '@/utils/exportUtils';

interface ExportProveedoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedores: Proveedor[];
  proveedoresTipos: ProveedorTipo[];
  exportProveedoresToCSV: () => void;
  exportProveedoresToPDF: () => void;
  exportProveedoresToExcel: () => void;
}

const ExportProveedoresModal: React.FC<ExportProveedoresModalProps> = ({
  isOpen,
  onClose,
  proveedores,
  proveedoresTipos,
  exportProveedoresToCSV,
  exportProveedoresToPDF,
  exportProveedoresToExcel
}) => {
  const [exportType, setExportType] = useState<'todos' | 'filtrados' | 'individual'>('todos');
  const [selectedProveedor, setSelectedProveedor] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [formatoExport, setFormatoExport] = useState<string>('excel');
  
  // Export options
  const [includeProducts, setIncludeProducts] = useState<boolean>(false);
  const [includeRatings, setIncludeRatings] = useState<boolean>(false);
  const [includeContactInfo, setIncludeContactInfo] = useState<boolean>(true);
  const [includeOrderHistory, setIncludeOrderHistory] = useState<boolean>(false);
  
  const handleExport = () => {
    // Filter proveedores based on selection
    let proveedoresToExport = [...proveedores];
    
    if (exportType === 'filtrados' && selectedTipo !== 'todos') {
      proveedoresToExport = proveedores.filter(p => p.tipo === selectedTipo);
    } else if (exportType === 'individual' && selectedProveedor) {
      proveedoresToExport = proveedores.filter(p => p.id === selectedProveedor);
    }
    
    // Format data with selected options
    const formattedData = formatProveedoresForExport(proveedoresToExport, {
      includeProducts,
      includeRatings,
      includeContactInfo,
      includeOrderHistory
    });
    
    const fileName = `proveedores_${exportType}_${new Date().toISOString().split('T')[0]}`;
    const title = 'Reporte de Proveedores';
    
    // Create columns for PDF export
    const columns = Object.keys(formattedData[0] || {}).map(key => ({
      header: key,
      dataKey: key
    }));
    
    try {
      // Execute export based on selected format
      switch (formatoExport) {
        case 'excel':
          exportToExcel(formattedData, fileName);
          toast.success(`Proveedores exportados a Excel correctamente`);
          break;
        case 'csv':
          exportToCSV(formattedData, fileName);
          toast.success(`Proveedores exportados a CSV correctamente`);
          break;
        case 'pdf':
          exportToPDF(formattedData, fileName, title, columns);
          toast.success(`Proveedores exportados a PDF correctamente`);
          break;
      }
      
      onClose();
    } catch (error) {
      toast.error(`Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exportar Proveedores"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Download size={16} />
            Exportar
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Seleccionar formato de exportación</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={formatoExport === 'excel' ? 'default' : 'outline'}
              className={`flex items-center gap-2 ${formatoExport === 'excel' ? 'bg-primary text-white' : ''}`}
              onClick={() => setFormatoExport('excel')}
            >
              <FileText size={16} />
              Excel
              {formatoExport === 'excel' && <Check size={14} className="ml-1" />}
            </Button>
            <Button
              type="button"
              variant={formatoExport === 'csv' ? 'default' : 'outline'}
              className={`flex items-center gap-2 ${formatoExport === 'csv' ? 'bg-primary text-white' : ''}`}
              onClick={() => setFormatoExport('csv')}
            >
              <FileText size={16} />
              CSV
              {formatoExport === 'csv' && <Check size={14} className="ml-1" />}
            </Button>
            <Button
              type="button"
              variant={formatoExport === 'pdf' ? 'default' : 'outline'}
              className={`flex items-center gap-2 ${formatoExport === 'pdf' ? 'bg-primary text-white' : ''}`}
              onClick={() => setFormatoExport('pdf')}
            >
              <FileText size={16} />
              PDF
              {formatoExport === 'pdf' && <Check size={14} className="ml-1" />}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" onValueChange={(value) => setExportType(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="filtrados">Filtrados</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos" className="pt-4">
            <p className="text-sm text-gray-600">
              Se exportarán todos los proveedores registrados.
            </p>
          </TabsContent>
          
          <TabsContent value="filtrados" className="pt-4 space-y-4">
            <div>
              <Label htmlFor="tipo">Filtrar por tipo de proveedor</Label>
              <Select 
                value={selectedTipo} 
                onValueChange={setSelectedTipo}
              >
                <SelectTrigger id="tipo" className="w-full mt-1">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {proveedoresTipos.map(tipo => (
                    <SelectItem key={tipo.id} value={tipo.nombre}>{tipo.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="individual" className="pt-4 space-y-4">
            <div>
              <Label htmlFor="proveedor">Seleccionar proveedor</Label>
              <Select 
                value={selectedProveedor} 
                onValueChange={setSelectedProveedor}
              >
                <SelectTrigger id="proveedor" className="w-full mt-1">
                  <SelectValue placeholder="Seleccione un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map(proveedor => (
                    <SelectItem key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div>
          <h3 className="text-sm font-medium mb-3">Información a incluir</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeProducts" 
                checked={includeProducts} 
                onCheckedChange={(checked) => setIncludeProducts(checked as boolean)} 
              />
              <Label htmlFor="includeProducts">Productos asociados</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeRatings" 
                checked={includeRatings} 
                onCheckedChange={(checked) => setIncludeRatings(checked as boolean)} 
              />
              <Label htmlFor="includeRatings">Calificaciones</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeContact" 
                checked={includeContactInfo} 
                onCheckedChange={(checked) => setIncludeContactInfo(checked as boolean)}
              />
              <Label htmlFor="includeContact">Información de contacto</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeOrderHistory" 
                checked={includeOrderHistory} 
                onCheckedChange={(checked) => setIncludeOrderHistory(checked as boolean)}
              />
              <Label htmlFor="includeOrderHistory">Historial de pedidos</Label>
            </div>
          </div>
        </div>
        
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Información sobre la exportación</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  La exportación incluirá los datos básicos de los proveedores y la información adicional seleccionada.
                  Esta herramienta está diseñada para facilitar la generación de reportes ejecutivos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExportProveedoresModal;
