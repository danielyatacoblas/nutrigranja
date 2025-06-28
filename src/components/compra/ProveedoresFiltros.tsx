
import React from 'react';
import SearchInput from '../common/SearchInput';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProveedoresFiltrosProps {
  busquedaProveedor: string;
  setBusquedaProveedor: (value: string) => void;
  tipoProveedor: string;
  setTipoProveedor: (value: string) => void;
  tiposProveedor: string[];
  estadoProveedor?: string;
  setEstadoProveedor?: (value: string) => void;
  mostrarInactivos?: boolean;
  setMostrarInactivos?: (value: boolean) => void;
  // Nuevos filtros
  calificacionMinima?: string;
  setCalificacionMinima?: (value: string) => void;
  direccionFiltro?: string;
  setDireccionFiltro?: (value: string) => void;
  telefonoFiltro?: string;
  setTelefonoFiltro?: (value: string) => void;
  correoFiltro?: string;
  setCorreoFiltro?: (value: string) => void;
}

const ProveedoresFiltros: React.FC<ProveedoresFiltrosProps> = ({
  busquedaProveedor,
  setBusquedaProveedor,
  tipoProveedor,
  setTipoProveedor,
  tiposProveedor,
  estadoProveedor = 'todos',
  setEstadoProveedor,
  mostrarInactivos = false,
  setMostrarInactivos,
  calificacionMinima = 'todas',
  setCalificacionMinima,
  direccionFiltro = '',
  setDireccionFiltro,
  telefonoFiltro = '',
  setTelefonoFiltro,
  correoFiltro = '',
  setCorreoFiltro
}) => {
  return (
    <div className="space-y-4">
      {/* Primera fila de filtros básicos */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="w-64">
          <SearchInput 
            placeholder="Buscar proveedor..." 
            value={busquedaProveedor}
            onChange={(e) => setBusquedaProveedor(e.target.value)}
          />
        </div>
        
        <Select 
          value={tipoProveedor} 
          onValueChange={setTipoProveedor}
        >
          <SelectTrigger className="w-[200px] bg-white border-input focus:ring-nutri-green focus:ring-offset-0">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tiposProveedor.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {setEstadoProveedor && (
          <Select 
            value={estadoProveedor} 
            onValueChange={setEstadoProveedor}
          >
            <SelectTrigger className="w-[200px] bg-white border-input focus:ring-nutri-green focus:ring-offset-0">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge>
                </div>
              </SelectItem>
              <SelectItem value="inactivo">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Inactivo</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {setMostrarInactivos && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="mostrar-inactivos" 
              checked={mostrarInactivos} 
              onCheckedChange={setMostrarInactivos} 
            />
            <Label htmlFor="mostrar-inactivos">Mostrar proveedores inactivos</Label>
          </div>
        )}
      </div>

      {/* Segunda fila de filtros adicionales */}
      <div className="flex flex-wrap gap-4 items-center">
        {setCalificacionMinima && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Calificación mín:</label>
            <Select 
              value={calificacionMinima} 
              onValueChange={setCalificacionMinima}
            >
              <SelectTrigger className="w-[140px] h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="4">4+ estrellas</SelectItem>
                <SelectItem value="3">3+ estrellas</SelectItem>
                <SelectItem value="2">2+ estrellas</SelectItem>
                <SelectItem value="1">1+ estrellas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {setDireccionFiltro && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Dirección:</label>
            <Input
              type="text"
              placeholder="Filtrar por dirección"
              value={direccionFiltro}
              onChange={(e) => setDireccionFiltro(e.target.value)}
              className="w-40 h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0"
            />
          </div>
        )}

        {setTelefonoFiltro && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Teléfono:</label>
            <Input
              type="text"
              placeholder="Filtrar por teléfono"
              value={telefonoFiltro}
              onChange={(e) => setTelefonoFiltro(e.target.value)}
              className="w-36 h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0"
            />
          </div>
        )}

        {setCorreoFiltro && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Correo:</label>
            <Input
              type="text"
              placeholder="Filtrar por correo"
              value={correoFiltro}
              onChange={(e) => setCorreoFiltro(e.target.value)}
              className="w-40 h-9 bg-white border-input focus:ring-nutri-green focus:ring-offset-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProveedoresFiltros;
