
import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Calendar, Package, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

export interface PedidosAdvancedFilters {
  fechaInicio?: Date;
  fechaFin?: Date;
  productoId: string;
  proveedorId: string;
  sortField: 'fecha_pedido' | 'producto' | 'proveedor' | 'cantidad' | 'precio_total';
  sortDirection: 'asc' | 'desc';
}

interface PedidosAdvancedFilterProps {
  filters: PedidosAdvancedFilters;
  onFiltersChange: (filters: PedidosAdvancedFilters) => void;
  productos: { id: string; nombre: string }[];
  proveedores: { id: string; nombre: string }[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const PedidosAdvancedFilter: React.FC<PedidosAdvancedFilterProps> = ({
  filters,
  onFiltersChange,
  productos,
  proveedores,
  showFilters,
  setShowFilters
}) => {
  const hasActiveFilters = filters.fechaInicio || filters.fechaFin || (filters.productoId && filters.productoId !== 'all') || (filters.proveedorId && filters.proveedorId !== 'all');

  const handleResetFilters = () => {
    onFiltersChange({
      fechaInicio: undefined,
      fechaFin: undefined,
      productoId: 'all',
      proveedorId: 'all',
      sortField: 'fecha_pedido',
      sortDirection: 'desc'
    });
  };

  const updateFilter = (key: keyof PedidosAdvancedFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className={`flex items-center gap-2 bg-white ${showFilters ? 'border-primary/70 text-primary' : 'border-muted'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className={showFilters ? "text-primary" : "text-muted-foreground"} />
            Filtros avanzados
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleResetFilters}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground bg-white"
            >
              <X size={16} />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Ordenar por:</span>
          <Select
            value={filters.sortField}
            onValueChange={(value) => updateFilter('sortField', value)}
          >
            <SelectTrigger className="w-40 h-8 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="fecha_pedido">Fecha</SelectItem>
              <SelectItem value="producto">Producto</SelectItem>
              <SelectItem value="proveedor">Proveedor</SelectItem>
              <SelectItem value="cantidad">Cantidad</SelectItem>
              <SelectItem value="precio_total">Precio</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
            className="bg-white"
          >
            {filters.sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>
      
      <Collapsible open={showFilters}>
        <CollapsibleContent className="pt-4 pb-2 space-y-4 border-t border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de fecha inicio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar size={16} className="inline mr-1" />
                Fecha inicio
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fechaInicio ? (
                      format(filters.fechaInicio, "PPP", { locale: es })
                    ) : (
                      <span className="text-muted-foreground">Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.fechaInicio}
                    onSelect={(date) => updateFilter('fechaInicio', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de fecha fin */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar size={16} className="inline mr-1" />
                Fecha fin
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fechaFin ? (
                      format(filters.fechaFin, "PPP", { locale: es })
                    ) : (
                      <span className="text-muted-foreground">Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.fechaFin}
                    onSelect={(date) => updateFilter('fechaFin', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de producto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Package size={16} className="inline mr-1" />
                Producto
              </label>
              <Select
                value={filters.productoId}
                onValueChange={(value) => updateFilter('productoId', value)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Todos los productos" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {productos.map(producto => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de proveedor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Building2 size={16} className="inline mr-1" />
                Proveedor
              </label>
              <Select
                value={filters.proveedorId}
                onValueChange={(value) => updateFilter('proveedorId', value)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Todos los proveedores" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todos los proveedores</SelectItem>
                  {proveedores.map(proveedor => (
                    <SelectItem key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PedidosAdvancedFilter;
