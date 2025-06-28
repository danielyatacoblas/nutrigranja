
import React from 'react';
import SearchInput from '../common/SearchInput';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface ProductosFiltrosProps {
  busquedaProducto: string;
  setBusquedaProducto: (value: string) => void;
  tipoProducto: string;
  setTipoProducto: (value: string) => void;
  ordenCalificacion: 'asc' | 'desc' | '' | 'none';
  setOrdenCalificacion: (value: 'asc' | 'desc' | '' | 'none') => void;
  tiposProducto: string[];
  // Nuevos filtros
  precioMin: string;
  setPrecioMin: (value: string) => void;
  precioMax: string;
  setPrecioMax: (value: string) => void;
  pesoUnidad: string;
  setPesoUnidad: (value: string) => void;
  estadoStock: string;
  setEstadoStock: (value: string) => void;
}

const ProductosFiltros: React.FC<ProductosFiltrosProps> = ({
  busquedaProducto,
  setBusquedaProducto,
  tipoProducto,
  setTipoProducto,
  ordenCalificacion,
  setOrdenCalificacion,
  tiposProducto,
  precioMin,
  setPrecioMin,
  precioMax,
  setPrecioMax,
  pesoUnidad,
  setPesoUnidad,
  estadoStock,
  setEstadoStock
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-64">
          <SearchInput 
            placeholder="Buscar productos..." 
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
          />
        </div>
        
        <Select 
          value={tipoProducto} 
          onValueChange={setTipoProducto}
        >
          <SelectTrigger className="w-[200px] bg-white border-input focus:ring-nutri-green focus:ring-offset-0">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tiposProducto.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={ordenCalificacion} 
          onValueChange={(value) => setOrdenCalificacion(value as 'asc' | 'desc' | '' | 'none')}
        >
          <SelectTrigger className="w-[240px] bg-white border-input focus:ring-nutri-green focus:ring-offset-0">
            <SelectValue placeholder="Ordenar por calificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ordenar por calificación</SelectItem>
            <SelectItem value="desc">Mayor calificación</SelectItem>
            <SelectItem value="asc">Menor calificación</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nueva fila de filtros adicionales */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Precio:</label>
          <Input
            type="number"
            placeholder="Mín"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="w-20 h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0"
            min="0"
            step="0.01"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="number"
            placeholder="Máx"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="w-20 h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Peso/Unidad:</label>
          <Input
            type="text"
            placeholder="Ej: kg, saco..."
            value={pesoUnidad}
            onChange={(e) => setPesoUnidad(e.target.value)}
            className="w-32 h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0"
          />
        </div>

        <Select 
          value={estadoStock} 
          onValueChange={setEstadoStock}
        >
          <SelectTrigger className="w-[180px] h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0">
            <SelectValue placeholder="Estado del stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="sin_stock">Sin stock</SelectItem>
            <SelectItem value="por_acabarse">Por acabarse</SelectItem>
            <SelectItem value="estable">Estable</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductosFiltros;
