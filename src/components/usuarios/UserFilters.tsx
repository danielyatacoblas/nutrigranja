
import React from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole, UserStatus } from '@/types/database';
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
import { Input } from "@/components/ui/input";

interface UserFiltersProps {
  searchTerm: string;
  handleSearch: (term: string) => void;
  rolFilter: UserRole | 'todos';
  setRolFilter: (role: UserRole | 'todos') => void;
  statusFilter: UserStatus | 'todos';
  setStatusFilter: (status: UserStatus | 'todos') => void;
  dateFilter: 'recientes' | 'antiguos' | 'todos';
  setDateFilter: (filter: 'recientes' | 'antiguos' | 'todos') => void;
  handleResetFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  handleSearch,
  rolFilter,
  setRolFilter,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  handleResetFilters,
  showFilters,
  setShowFilters
}) => {
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Buscar por usuario, nombre, correo, DNI, teléfono..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white border-input focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className={`flex items-center gap-2 bg-white ${showFilters ? 'border-primary/70 text-primary' : 'border-muted'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className={showFilters ? "text-primary" : "text-muted-foreground"} />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          
          {(rolFilter !== 'todos' || statusFilter !== 'todos' || dateFilter !== 'todos') && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleResetFilters}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground bg-white"
            >
              <X size={16} />
              Borrar filtros
            </Button>
          )}
        </div>
      </div>
      
      <Collapsible open={showFilters}>
        <CollapsibleContent className="pt-4 pb-2 space-y-4 border-t border-border/40 animate-accordion-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <Select 
                value={rolFilter} 
                onValueChange={(value) => setRolFilter(value as UserRole | 'todos')}
              >
                <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as UserStatus | 'todos')}
              >
                <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de registro</label>
              <Select 
                value={dateFilter} 
                onValueChange={(value) => setDateFilter(value as 'recientes' | 'antiguos' | 'todos')}
              >
                <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                  <SelectValue placeholder="Ordenar por fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Sin ordenar</SelectItem>
                  <SelectItem value="recientes">Más recientes</SelectItem>
                  <SelectItem value="antiguos">Más antiguos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default UserFilters;
