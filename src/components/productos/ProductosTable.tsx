import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  File, 
  ChevronDown,
  Edit,
  Trash,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Producto } from '@/types/database';
import { Button } from '@/components/ui/button';
import ProgressBar from '../common/ProgressBar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductosTableProps {
  productos: Producto[];
  handleOpenModal: (producto?: Producto) => void;
  handleOpenDeleteModal: (producto: Producto) => void;
  exportProductosToCSV: () => void;
  exportProductosToPDF: () => void;
  exportProductosToExcel: () => void;
}

const ProductosTable: React.FC<ProductosTableProps> = ({ 
  productos, 
  handleOpenModal, 
  handleOpenDeleteModal,
  exportProductosToCSV,
  exportProductosToPDF,
  exportProductosToExcel
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Calculate pagination
  const totalPages = Math.ceil(productos.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentProductos = productos.slice(startIndex, endIndex);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer pages than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page, last page, current page, and pages around current
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Handle stock status display
  const getStockStatus = (stock: number, stockAlert: number) => {
    if (stock <= 0) {
      return { label: 'Sin stock', color: 'text-red-600 bg-red-100' };
    } else if (stock <= stockAlert) {
      return { label: 'Por acabarse', color: 'text-amber-600 bg-amber-100' };
    } else {
      return { label: 'Estable', color: 'text-green-600 bg-green-100' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Mostrar
          </span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page when changing rows per page
            }}
          >
            <SelectTrigger className="w-20 h-8 bg-white">
              <SelectValue placeholder="8" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">filas por página</span>
        </div>
        
        <DropdownMenu open={showExportOptions} onOpenChange={setShowExportOptions}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 border-primary/40 hover:border-primary bg-white"
            >
              <FileText size={16} className="text-primary" />
              Exportar
              <ChevronDown size={16} className={showExportOptions ? "rotate-180 transition-transform" : "transition-transform"} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={exportProductosToCSV}
              className="cursor-pointer flex items-center gap-2"
            >
              <FileText size={16} /> Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={exportProductosToExcel}
              className="cursor-pointer flex items-center gap-2"
            >
              <FileSpreadsheet size={16} /> Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={exportProductosToPDF}
              className="cursor-pointer flex items-center gap-2"
            >
              <File size={16} /> Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="font-medium">Imagen</TableHead>
              <TableHead className="font-medium">Nombre</TableHead>
              <TableHead className="font-medium">Tipo</TableHead>
              <TableHead className="font-medium">Proveedor</TableHead>
              <TableHead className="font-medium">Peso/Unidad</TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center gap-2">
                  T. Entrega
                  <div className="flex flex-col">
                    <ArrowUp size={12} className="text-gray-400" />
                    <ArrowDown size={12} className="text-gray-400" />
                  </div>
                </div>
              </TableHead>
              <TableHead className="font-medium">Stock</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
              <TableHead className="font-medium">Precio</TableHead>
              <TableHead className="font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProductos.map((producto, index) => {
              const stockStatus = getStockStatus(producto.stock, producto.stock_alert);
              return (
                <TableRow key={producto.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell>
                    <div className="w-12 h-12">
                      {producto.imagen_url ? (
                        <img 
                          src={producto.imagen_url} 
                          alt={producto.nombre} 
                          className="w-full h-full rounded-md object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>{producto.tipo || 'No asignado'}</TableCell>
                  <TableCell>{producto.proveedor?.nombre || 'Sin proveedor'}</TableCell>
                  <TableCell>{producto.peso} ({producto.unit_of_measure || 'UNIDAD'})</TableCell>
                  <TableCell>
                    {producto.tiempo_entrega_desde && producto.tiempo_entrega_hasta ? 
                      `${producto.tiempo_entrega_desde} - ${producto.tiempo_entrega_hasta} días` : 
                      'No especificado'}
                  </TableCell>
                  <TableCell className="font-medium">{producto.stock}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${producto.precio?.toFixed(2) || '0.00'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenModal(producto)} 
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenDeleteModal(producto)} 
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {currentProductos.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  No se encontraron productos
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
        Mostrando {Math.min(startIndex + 1, productos.length)} a {Math.min(endIndex, productos.length)} de {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
      </div>
    </div>
  );
};

export default ProductosTable;
