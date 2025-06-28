
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, FileSpreadsheet, File, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';

interface ExportHistorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiposUnicos: string[];
  modulosUnicos: string[];
  usuariosUnicos: string[];
  accionesUnicas: string[];
}

const ExportHistorialModal: React.FC<ExportHistorialModalProps> = ({
  isOpen,
  onClose,
  tiposUnicos,
  modulosUnicos,
  usuariosUnicos,
  accionesUnicas,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [exportFilters, setExportFilters] = useState({
    tipo: 'Todos',
    modulo: 'Todos',
    usuario: 'Todos',
    accion: 'Todos',
    startDate: '',
    endDate: '',
  });
  const [includeColumns, setIncludeColumns] = useState({
    tipo: true,
    descripcion: true,
    usuario: true,
    fecha: true,
    modulo: true,
    accion: true,
  });

  const handleFilterChange = (field: string, value: string) => {
    setExportFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColumnToggle = (column: string) => {
    setIncludeColumns(prev => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev]
    }));
  };

  const handleExport = () => {
    // Implement the actual export functionality here
    toast.success(`Exportando historial en formato ${selectedFormat.toUpperCase()}`);
    onClose();
  };

  const selectedFormatIcon = () => {
    switch (selectedFormat) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'csv':
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {selectedFormatIcon()}
            Exportar historial de actividades
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-2">
            <Label>Formato de exportación</Label>
            <div className="flex gap-3">
              <Button 
                variant={selectedFormat === 'pdf' ? "default" : "outline"} 
                className={`flex-1 ${selectedFormat === 'pdf' ? "bg-primary" : "bg-white"}`}
                onClick={() => setSelectedFormat('pdf')}
              >
                <File className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button 
                variant={selectedFormat === 'excel' ? "default" : "outline"}
                className={`flex-1 ${selectedFormat === 'excel' ? "bg-primary" : "bg-white"}`}
                onClick={() => setSelectedFormat('excel')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
              </Button>
              <Button 
                variant={selectedFormat === 'csv' ? "default" : "outline"}
                className={`flex-1 ${selectedFormat === 'csv' ? "bg-primary" : "bg-white"}`}
                onClick={() => setSelectedFormat('csv')}
              >
                <FileText className="mr-2 h-4 w-4" /> CSV
              </Button>
            </div>
          </div>

          {/* Filter options */}
          <div className="space-y-4">
            <Label>Filtros para exportación</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={exportFilters.tipo}
                  onValueChange={(value) => handleFilterChange('tipo', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposUnicos.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modulo">Módulo</Label>
                <Select 
                  value={exportFilters.modulo}
                  onValueChange={(value) => handleFilterChange('modulo', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modulosUnicos.map((modulo) => (
                      <SelectItem key={modulo} value={modulo}>
                        {modulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Select 
                  value={exportFilters.usuario}
                  onValueChange={(value) => handleFilterChange('usuario', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosUnicos.map((usuario) => (
                      <SelectItem key={usuario} value={usuario}>
                        {usuario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accion">Acción</Label>
                <Select 
                  value={exportFilters.accion}
                  onValueChange={(value) => handleFilterChange('accion', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar acción" />
                  </SelectTrigger>
                  <SelectContent>
                    {accionesUnicas.map((accion) => (
                      <SelectItem key={accion} value={accion}>
                        {accion.charAt(0).toUpperCase() + accion.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha desde</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha hasta</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Column selection */}
          <div className="space-y-2">
            <Label>Columnas a incluir</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="col-tipo" 
                  checked={includeColumns.tipo} 
                  onCheckedChange={() => handleColumnToggle('tipo')} 
                />
                <Label htmlFor="col-tipo" className="cursor-pointer">Tipo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="col-descripcion" 
                  checked={includeColumns.descripcion} 
                  onCheckedChange={() => handleColumnToggle('descripcion')} 
                />
                <Label htmlFor="col-descripcion" className="cursor-pointer">Descripción</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="col-usuario" 
                  checked={includeColumns.usuario} 
                  onCheckedChange={() => handleColumnToggle('usuario')} 
                />
                <Label htmlFor="col-usuario" className="cursor-pointer">Usuario</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="col-fecha" 
                  checked={includeColumns.fecha} 
                  onCheckedChange={() => handleColumnToggle('fecha')} 
                />
                <Label htmlFor="col-fecha" className="cursor-pointer">Fecha</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="col-modulo" 
                  checked={includeColumns.modulo} 
                  onCheckedChange={() => handleColumnToggle('modulo')} 
                />
                <Label htmlFor="col-modulo" className="cursor-pointer">Módulo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="col-accion" 
                  checked={includeColumns.accion} 
                  onCheckedChange={() => handleColumnToggle('accion')} 
                />
                <Label htmlFor="col-accion" className="cursor-pointer">Acción</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Exportar {selectedFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportHistorialModal;
