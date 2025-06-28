
import React, { useState } from 'react';
import ProveedorCard from '../common/ProveedorCard';
import { ProveedorWithTipo, getProveedorIconUrl } from '@/utils/proveedorUtils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface ProveedoresGridProps {
  proveedores: ProveedorWithTipo[];
  proveedoresSeleccionados: string[];
  toggleProveedorSelection: (id: string) => void;
  proveedoresTipos: any[];
  loading?: boolean;
  mostrarInactivos?: boolean;
}

const ProveedoresGrid: React.FC<ProveedoresGridProps> = ({
  proveedores,
  proveedoresSeleccionados,
  toggleProveedorSelection,
  proveedoresTipos,
  loading = false,
  mostrarInactivos = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Límite de 4 proveedores por página
  
  // Filter inactive providers if required
  const proveedoresFiltrados = mostrarInactivos 
    ? proveedores 
    : proveedores.filter(p => p.activo);
    
  // Calculate pagination values
  const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProveedores = proveedoresFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Add ellipsis if needed at beginning
      if (currentPage > 3) {
        pageNumbers.push('ellipsis');
      }
      
      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }
      
      // Add ellipsis if needed at end
      if (currentPage < totalPages - 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="col-span-4 text-center py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-nutri-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Cargando proveedores...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentProveedores.length === 0 ? (
          <div className="col-span-4 text-center py-8 text-gray-500">
            No se encontraron proveedores con los criterios de búsqueda.
          </div>
        ) : (
          currentProveedores.map((proveedor) => (
            <div
              key={proveedor.id}
              className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                proveedoresSeleccionados.includes(proveedor.id) 
                  ? 'ring-2 ring-nutri-green shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => toggleProveedorSelection(proveedor.id)}
            >
              {!proveedor.activo && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                </div>
              )}
              <ProveedorCard 
                logo={getProveedorIconUrl(proveedor, proveedoresTipos)}
                nombre={proveedor.nombre || 'Sin nombre'}
                rating={proveedor.calificacion || 0}
                porcentajePedidos={proveedor.porcentajePedidos || 0}
              />
            </div>
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={prevPage} 
                className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
            
            {getPageNumbers().map((pageNum, i) => (
              pageNum === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${pageNum}`}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    onClick={() => paginate(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={nextPage} 
                className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {proveedoresFiltrados.length > 0 && (
        <div className="text-sm text-gray-500">
          Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, proveedoresFiltrados.length)} de {proveedoresFiltrados.length} proveedores
        </div>
      )}
    </div>
  );
};

export default ProveedoresGrid;
