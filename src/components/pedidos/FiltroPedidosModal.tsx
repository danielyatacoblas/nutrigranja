
import React, { useState } from 'react';
import { Calendar, CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type FiltroTipo = 'semanal' | 'mensual' | 'trimestral' | 'personalizado';
export type FiltroPedidos = {
  tipo: FiltroTipo;
  fechaInicio?: Date;
  fechaFin?: Date;
};

interface FiltroPedidosModalProps {
  isOpen: boolean;
  onClose: () => void;
  filtroActual: FiltroPedidos;
  onApplyFilter: (filtro: FiltroPedidos) => void;
}

const FiltroPedidosModal: React.FC<FiltroPedidosModalProps> = ({
  isOpen,
  onClose,
  filtroActual,
  onApplyFilter,
}) => {
  const [filtro, setFiltro] = useState<FiltroPedidos>(filtroActual);

  // Reset filter to current state when opening modal
  React.useEffect(() => {
    if (isOpen) {
      setFiltro(filtroActual);
    }
  }, [isOpen, filtroActual]);

  const handleTabChange = (value: string) => {
    const today = new Date();
    let fechaInicio: Date | undefined;
    let fechaFin: Date | undefined;

    switch (value as FiltroTipo) {
      case 'semanal':
        // Calcula inicio de semana (domingo) y fin (sábado)
        fechaInicio = new Date(today);
        fechaInicio.setDate(today.getDate() - today.getDay());
        fechaFin = new Date(today);
        fechaFin.setDate(today.getDate() - today.getDay() + 6);
        break;
      case 'mensual':
        // Primer día del mes actual
        fechaInicio = new Date(today.getFullYear(), today.getMonth(), 1);
        // Último día del mes actual
        fechaFin = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'trimestral':
        // Determina el trimestre actual (0-3)
        const trimestre = Math.floor(today.getMonth() / 3);
        // Primer día del trimestre
        fechaInicio = new Date(today.getFullYear(), trimestre * 3, 1);
        // Último día del trimestre
        fechaFin = new Date(today.getFullYear(), (trimestre + 1) * 3, 0);
        break;
      default:
        // Mantener las fechas personalizadas o setear a undefined
        fechaInicio = filtro.fechaInicio;
        fechaFin = filtro.fechaFin;
    }

    setFiltro({
      tipo: value as FiltroTipo,
      fechaInicio,
      fechaFin,
    });
  };

  const handleApplyFilter = () => {
    onApplyFilter(filtro);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Filtrar pedidos por período
          </DialogTitle>
          <DialogDescription>
            Selecciona un período de tiempo para filtrar los pedidos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Tabs 
            defaultValue={filtro.tipo} 
            value={filtro.tipo} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="semanal">Semanal</TabsTrigger>
              <TabsTrigger value="mensual">Mensual</TabsTrigger>
              <TabsTrigger value="trimestral">Trimestral</TabsTrigger>
              <TabsTrigger value="personalizado">Personalizado</TabsTrigger>
            </TabsList>

            <TabsContent value="personalizado" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha inicio</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtro.fechaInicio ? (
                          format(filtro.fechaInicio, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filtro.fechaInicio}
                        onSelect={(date) => 
                          setFiltro({ ...filtro, fechaInicio: date || undefined })
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha fin</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtro.fechaFin ? (
                          format(filtro.fechaFin, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filtro.fechaFin}
                        onSelect={(date) => 
                          setFiltro({ ...filtro, fechaFin: date || undefined })
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="semanal">
              <div className="rounded-md bg-secondary/50 p-4">
                <p className="text-sm font-medium">
                  {filtro.fechaInicio && filtro.fechaFin ? (
                    <>
                      Mostrando pedidos del{" "}
                      <span className="font-semibold">
                        {format(filtro.fechaInicio, "PPP", { locale: es })}
                      </span>{" "}
                      al{" "}
                      <span className="font-semibold">
                        {format(filtro.fechaFin, "PPP", { locale: es })}
                      </span>
                    </>
                  ) : (
                    "Seleccione un rango de fechas"
                  )}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="mensual">
              <div className="rounded-md bg-secondary/50 p-4">
                <p className="text-sm font-medium">
                  {filtro.fechaInicio ? (
                    <>
                      Mostrando pedidos del mes de{" "}
                      <span className="font-semibold">
                        {format(filtro.fechaInicio, "MMMM yyyy", { locale: es })}
                      </span>
                    </>
                  ) : (
                    "Seleccione un mes"
                  )}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="trimestral">
              <div className="rounded-md bg-secondary/50 p-4">
                <p className="text-sm font-medium">
                  {filtro.fechaInicio && filtro.fechaFin ? (
                    <>
                      Mostrando pedidos del{" "}
                      <span className="font-semibold">
                        {format(filtro.fechaInicio, "MMMM", { locale: es })}
                      </span>{" "}
                      a{" "}
                      <span className="font-semibold">
                        {format(filtro.fechaFin, "MMMM yyyy", { locale: es })}
                      </span>
                    </>
                  ) : (
                    "Seleccione un trimestre"
                  )}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApplyFilter}>
            <Check className="mr-2 h-4 w-4" />
            Aplicar filtro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FiltroPedidosModal;
