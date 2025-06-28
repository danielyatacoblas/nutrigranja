import React, { useState } from "react";
import {
  FileText,
  ChevronDown,
  Edit,
  Trash,
  Mail,
  Download,
  Flag,
} from "lucide-react";
import { Proveedor, ProveedorTipo, ProveedorStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import StarRating from "../common/StarRating";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import ExportProveedoresModal from "./ExportProveedoresModal";
import { toast } from "sonner";

// Mapa de iconos para tipos de proveedor
const getIconComponent = (
  tipoNombre: string | undefined,
  proveedorTipos: ProveedorTipo[]
) => {
  if (!tipoNombre) return null;

  const tipoObj = proveedorTipos.find((t) => t.nombre === tipoNombre);
  if (!tipoObj || !tipoObj.icono) return null;

  // Aquí se devolvería el componente del icono correspondiente
  // Para simplificar, solo devolvemos el nombre del icono
  return tipoObj.icono;
};

interface ProveedoresTableProps {
  proveedores: Proveedor[];
  proveedorTipos: ProveedorTipo[];
  handleOpenModal: (proveedor?: Proveedor) => void;
  handleOpenDeleteModal: (proveedor: Proveedor) => void;
  exportProveedoresToCSV: () => void;
  exportProveedoresToPDF: () => void;
  exportProveedoresToExcel: () => void;
  loading: boolean;
}

const ProveedoresTable: React.FC<ProveedoresTableProps> = ({
  proveedores,
  proveedorTipos,
  handleOpenModal,
  handleOpenDeleteModal,
  exportProveedoresToCSV,
  exportProveedoresToPDF,
  exportProveedoresToExcel,
  loading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showExportModal, setShowExportModal] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(proveedores.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentProveedores = proveedores.slice(startIndex, endIndex);

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
        pages.push("ellipsis");
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
        pages.push("ellipsis");
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mostrar</span>
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

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 border-primary/40 hover:border-primary bg-white"
        >
          <Download size={16} className="text-primary" />
          Exportar
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="font-medium">Nombre</TableHead>
              <TableHead className="font-medium">Documento</TableHead>
              <TableHead className="font-medium">País</TableHead>
              <TableHead className="font-medium">Tipo</TableHead>
              <TableHead className="font-medium">Dirección</TableHead>
              <TableHead className="font-medium">Teléfono</TableHead>
              <TableHead className="font-medium">Correo</TableHead>
              <TableHead className="font-medium">Calificación</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
              <TableHead className="font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    <span className="ml-4">Cargando proveedores...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentProveedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No se encontraron proveedores que coincidan con los filtros.
                </TableCell>
              </TableRow>
            ) : (
              currentProveedores.map((proveedor, index) => (
                <TableRow
                  key={proveedor.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <TableCell className="font-medium">
                    {proveedor.nombre}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        {proveedor.tipo_documento || "RUC"}
                      </span>
                      <span>{proveedor.numero_documento}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Flag size={16} className="text-gray-600" />
                      <span>{proveedor.pais || "Perú"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Aquí iría el icono específico del tipo de proveedor */}
                      <span>{proveedor.tipo || "No asignado"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{proveedor.direccion}</TableCell>
                  <TableCell>{proveedor.telefono}</TableCell>
                  <TableCell>{proveedor.correo}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <StarRating
                        rating={
                          Number(proveedor.calificacion?.toFixed(1) ?? 0) || 0
                        }
                        size={16}
                      />
                      <span className="ml-2">
                        {Number(proveedor.calificacion?.toFixed(1) ?? 0) || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {proveedor.activo ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(proveedor)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteModal(proveedor)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <Trash size={18} />
                      </Button>
                      <a
                        href={`mailto:${proveedor.correo}`}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        <Mail size={18} />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) =>
                page === "ellipsis" ? (
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
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="mt-2 text-gray-500 text-sm">
        Mostrando {Math.min(startIndex + 1, proveedores.length)} a{" "}
        {Math.min(endIndex, proveedores.length)} de {proveedores.length}{" "}
        {proveedores.length === 1 ? "proveedor" : "proveedores"}
      </div>

      {/* Export Modal */}
      <ExportProveedoresModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        proveedores={proveedores}
        proveedoresTipos={proveedorTipos}
        exportProveedoresToCSV={exportProveedoresToCSV}
        exportProveedoresToPDF={exportProveedoresToPDF}
        exportProveedoresToExcel={exportProveedoresToExcel}
      />
    </div>
  );
};

export default ProveedoresTable;
