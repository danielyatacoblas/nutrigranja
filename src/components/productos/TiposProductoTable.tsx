
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash,
  Plus,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

interface TipoProducto {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}

interface TiposProductoTableProps {
  tipos: TipoProducto[];
  onEdit: (tipo: TipoProducto) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const TiposProductoTable: React.FC<TiposProductoTableProps> = ({
  tipos,
  onEdit,
  onDelete,
  onAdd
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipoId, setSelectedTipoId] = useState<string>('');
  const itemsPerPage = 4;

  // Filtrar tipos por término de búsqueda
  const filteredTipos = tipos.filter(tipo => 
    tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTipos = filteredTipos.slice(startIndex, endIndex);

  // Prepare options for combobox
  const tiposOptions: ComboboxOption[] = tipos.map(tipo => ({
    value: tipo.id,
    label: tipo.nombre
  }));

  // Handle combobox selection
  const handleTipoChange = (value: string) => {
    setSelectedTipoId(value);
    const selectedTipo = tipos.find(t => t.id === value);
    if (selectedTipo) {
      onEdit(selectedTipo);
    }
  };

  // Generar números de página para paginación
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 2) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <Input
            placeholder="Buscar tipos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Resetear a primera página cuando se busca
            }}
            className="pl-10 bg-white border-input focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <Button
          onClick={onAdd}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus size={16} />
          Nuevo Tipo
        </Button>
      </div>
      
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="font-medium">Nombre</TableHead>
              <TableHead className="font-medium">Descripción</TableHead>
              <TableHead className="font-medium">Fecha de Creación</TableHead>
              <TableHead className="font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTipos.map((tipo, index) => (
              <TableRow key={tipo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="font-medium">{tipo.nombre}</TableCell>
                <TableCell>{tipo.descripcion || 'Sin descripción'}</TableCell>
                <TableCell>{new Date(tipo.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(tipo)} 
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                      <Edit size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(tipo.id)} 
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currentTipos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? 'No se encontraron resultados' : 'No se encontraron tipos de producto'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => 
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`page-${page}`}>
                    <PaginationLink 
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page as number);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <div className="mt-2 text-gray-500 text-sm">
        Mostrando {Math.min(startIndex + 1, filteredTipos.length)} a {Math.min(endIndex, filteredTipos.length)} de {filteredTipos.length} {filteredTipos.length === 1 ? 'tipo de producto' : 'tipos de producto'}
      </div>
    </div>
  );
};

export default TiposProductoTable;
