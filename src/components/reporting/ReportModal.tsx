
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart2, PieChart, LineChart, FileText, CheckCircle2, Table2, List, FileSpreadsheet, Trophy, Star } from "lucide-react";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (settings: ReportSettings) => Promise<void>;
  title: string;
  isRanking?: boolean;
  onQuickReport?: (type: string) => Promise<void>;
}

export interface ReportSettings {
  chartType: 'bar' | 'pie' | 'line';
  itemCount: number;
  reportTitle: string;
  includeTotals: boolean;
  includeDetails: boolean;
  reportType: 'simple' | 'detailed' | 'combined';
  includeProducts: boolean;
  includeOrders: boolean;
  exportFormat: 'pdf';
  timeRange: 'month' | 'quarter' | 'year' | 'all';
  highlightTopItems: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  title,
  isRanking = false,
  onQuickReport,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<ReportSettings>({
    chartType: 'bar',
    itemCount: 5,
    reportTitle: isRanking ? 'Ranking de Proveedores' : 'Resumen del Dashboard',
    includeTotals: true,
    includeDetails: true,
    reportType: 'simple',
    includeProducts: false,
    includeOrders: false,
    exportFormat: 'pdf',
    timeRange: 'month',
    highlightTopItems: true
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      // Ya no mostramos el toast aquí - será manejado en el componente padre
      await onGenerate(settings);
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickReport = async (type: string) => {
    if (onQuickReport) {
      try {
        setIsGenerating(true);
        // Ya no mostramos el toast aquí - será manejado en el componente padre
        await onQuickReport(type);
        onClose();
      } catch (error) {
        console.error('Error generating quick report:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        {isRanking && (
          <div className="mb-4 border-b pb-4">
            <h3 className="text-sm font-medium mb-3">Reportes Rápidos</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center gap-2"
                variant="outline"
                onClick={() => handleQuickReport('top5')}
                disabled={isGenerating}
              >
                <Trophy className="h-4 w-4" />
                Top 5
              </Button>

              <Button 
                className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 flex items-center gap-2"
                variant="outline"
                onClick={() => handleQuickReport('top10')}
                disabled={isGenerating}
              >
                <Star className="h-4 w-4" />
                Top 10
              </Button>

              <Button 
                className="bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 flex items-center gap-2"
                variant="outline"
                onClick={() => handleQuickReport('detailed')}
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4" />
                Detallado
              </Button>

              <Button 
                className="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 flex items-center gap-2"
                variant="outline"
                onClick={() => handleQuickReport('destacados')}
                disabled={isGenerating}
              >
                <Trophy className="h-4 w-4" />
                Destacados
              </Button>

              <Button 
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-2"
                variant="outline"
                onClick={() => handleQuickReport('tabla')}
                disabled={isGenerating}
              >
                <Table2 className="h-4 w-4" />
                Tabla
              </Button>
            </div>
          </div>
        )}
        
        <div className="py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="format">Formato</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Report title */}
              <div className="space-y-2">
                <Label htmlFor="reportTitle">Título del reporte</Label>
                <input
                  id="reportTitle"
                  type="text"
                  value={settings.reportTitle}
                  onChange={(e) => setSettings({...settings, reportTitle: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background"
                />
              </div>

              {/* Report type selection */}
              <div className="space-y-2">
                <Label>Tipo de reporte</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    type="button"
                    variant={settings.reportType === 'simple' ? "default" : "outline"} 
                    className="flex-1 flex flex-col items-center gap-1 py-3 h-auto"
                    onClick={() => setSettings({...settings, reportType: 'simple'})}
                  >
                    <List className="h-5 w-5" />
                    <span>Simple</span>
                  </Button>
                  
                  <Button 
                    type="button"
                    variant={settings.reportType === 'detailed' ? "default" : "outline"}
                    className="flex-1 flex flex-col items-center gap-1 py-3 h-auto"
                    onClick={() => setSettings({...settings, reportType: 'detailed'})}
                  >
                    <Table2 className="h-5 w-5" />
                    <span>Detallado</span>
                  </Button>
                  
                  <Button 
                    type="button"
                    variant={settings.reportType === 'combined' ? "default" : "outline"}
                    className="flex-1 flex flex-col items-center gap-1 py-3 h-auto"
                    onClick={() => setSettings({...settings, reportType: 'combined'})}
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Combinado</span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {settings.reportType === 'simple' && "Reporte básico con datos esenciales"}
                  {settings.reportType === 'detailed' && "Reporte completo con todos los detalles disponibles"}
                  {settings.reportType === 'combined' && "Reporte que combina múltiples tablas relacionadas"}
                </p>
              </div>

              {/* Time range */}
              <div className="space-y-2">
                <Label htmlFor="timeRange">Periodo de tiempo</Label>
                <Select 
                  value={settings.timeRange}
                  onValueChange={(value: 'month' | 'quarter' | 'year' | 'all') => 
                    setSettings({...settings, timeRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="quarter">Último trimestre</SelectItem>
                    <SelectItem value="year">Último año</SelectItem>
                    <SelectItem value="all">Todos los tiempos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* Chart type selection */}
              <div className="space-y-2">
                <Label>Tipo de gráfico</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    type="button"
                    variant={settings.chartType === 'bar' ? "default" : "outline"} 
                    className="flex-1 flex flex-col items-center gap-1 py-4 h-auto"
                    onClick={() => setSettings({...settings, chartType: 'bar'})}
                  >
                    <BarChart2 className="h-6 w-6" />
                    <span>Barras</span>
                  </Button>
                  
                  <Button 
                    type="button"
                    variant={settings.chartType === 'pie' ? "default" : "outline"}
                    className="flex-1 flex flex-col items-center gap-1 py-4 h-auto"
                    onClick={() => setSettings({...settings, chartType: 'pie'})}
                  >
                    <PieChart className="h-6 w-6" />
                    <span>Circular</span>
                  </Button>
                  
                  <Button 
                    type="button"
                    variant={settings.chartType === 'line' ? "default" : "outline"}
                    className="flex-1 flex flex-col items-center gap-1 py-4 h-auto"
                    onClick={() => setSettings({...settings, chartType: 'line'})}
                  >
                    <LineChart className="h-6 w-6" />
                    <span>Líneas</span>
                  </Button>
                </div>
              </div>

              {isRanking && (
                <div className="space-y-2">
                  <Label htmlFor="itemCount">Cantidad de proveedores</Label>
                  <Select 
                    value={settings.itemCount.toString()}
                    onValueChange={(value) => setSettings({...settings, itemCount: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Top 5</SelectItem>
                      <SelectItem value="10">Top 10</SelectItem>
                      <SelectItem value="20">Top 20</SelectItem>
                      <SelectItem value="50">Top 50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Include options for related data */}
              {settings.reportType === 'combined' && (
                <div className="space-y-4 mt-4 border-t pt-4">
                  <Label>Datos relacionados a incluir</Label>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox" 
                      id="includeProducts"
                      checked={settings.includeProducts}
                      onChange={(e) => setSettings({...settings, includeProducts: e.target.checked})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="includeProducts" className="cursor-pointer">Incluir productos de los proveedores</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox" 
                      id="includeOrders"
                      checked={settings.includeOrders}
                      onChange={(e) => setSettings({...settings, includeOrders: e.target.checked})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="includeOrders" className="cursor-pointer">Incluir pedidos relacionados</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox" 
                      id="highlightTopItems"
                      checked={settings.highlightTopItems}
                      onChange={(e) => setSettings({...settings, highlightTopItems: e.target.checked})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="highlightTopItems" className="cursor-pointer">Destacar los mejores elementos</Label>
                  </div>
                </div>
              )}

              {/* Include options */}
              <div className="space-y-4">
                <Label>Opciones adicionales</Label>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox" 
                    id="includeTotals"
                    checked={settings.includeTotals}
                    onChange={(e) => setSettings({...settings, includeTotals: e.target.checked})}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="includeTotals" className="cursor-pointer">Incluir totales y resumen</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox" 
                    id="includeDetails"
                    checked={settings.includeDetails}
                    onChange={(e) => setSettings({...settings, includeDetails: e.target.checked})}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="includeDetails" className="cursor-pointer">Incluir detalles completos</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-6">
              {/* Export format options - por ahora solo PDF */}
              <div className="space-y-2">
                <Label>Formato de exportación</Label>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    type="button"
                    variant="default" 
                    className="flex-1 flex items-center gap-2 py-6 justify-center h-auto"
                    disabled
                  >
                    <FileText className="h-5 w-5" />
                    <span>PDF (Portable Document Format)</span>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">En este momento solo se soporta exportación a PDF.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Generar Reporte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
