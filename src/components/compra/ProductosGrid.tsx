
import React, { useState } from 'react';
import ProductCard from '../common/ProductCard';
import { Producto } from '@/types/database';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';

interface ProductosGridProps {
  productos: Producto[];
  loading?: boolean;
}

const ProductosGrid: React.FC<ProductosGridProps> = ({ 
  productos,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 2x4 grid on desktop by default
  
  // Calculate pagination values
  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = productos.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 border-4 border-nutri-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    );
  }
  
  if (productos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No se encontraron productos con los filtros seleccionados
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentProducts.map((producto) => (
          <ProductCard 
            key={producto.id}
            id={producto.id as unknown as number}
            imagen={producto.imagen_url || 'https://m.media-amazon.com/images/I/61oII8uzxiL._SL1000_.jpg'}
            nombre={producto.nombre}
            precio={producto.precio || 0}
            rating={producto.proveedor?.calificacion || 0}
            tiempoEntrega={`${producto.tiempo_entrega_desde || 1}-${producto.tiempo_entrega_hasta || 3} días`}
            unidad={producto.peso}
            proveedor_id={producto.proveedor_id || undefined}
            stock={producto.stock}
            unitOfMeasure={producto.unit_of_measure}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
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
      
      <div className="mt-2 text-sm text-gray-500">
        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, productos.length)} de {productos.length} productos
      </div>
    </div>
  );
};

export default ProductosGrid;
