/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { FileText, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import { toast } from "sonner";
import { Pedido } from "@/types/database";
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
} from "../ui/select";

interface PedidosTableProps {
  pedidos: Pedido[];
  isLoading: boolean;
  activeTab: "pendientes" | "recibidos";
  currentPage: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  onConfirmPedido: (pedido: Pedido) => void;
  onEditPedido: (pedido: Pedido) => void;
  onDeletePedido: (pedido: Pedido) => void;
  onViewPdf: (pdfUrl: string) => void;
  onRowsPerPageChange: (value: number) => void;
}

const PedidosTable: React.FC<PedidosTableProps> = ({
  pedidos,
  isLoading,
  activeTab,
  currentPage,
  rowsPerPage,
  setCurrentPage,
  onConfirmPedido,
  onEditPedido,
  onDeletePedido,
  onViewPdf,
  onRowsPerPageChange,
}) => {
  // Format date function
  const formatOrderDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Table columns definition
  const columns = [
    {
      header: "Producto",
      accessor: "producto",
      cell: (value: any) => value?.nombre || "N/A",
    },
    {
      header: "Proveedor",
      accessor: "proveedor",
      cell: (value: any) => value?.nombre || "N/A",
    },
    { header: "Cantidad", accessor: "cantidad" },
    {
      header: "Fecha Pedido",
      accessor: "fecha_pedido",
      cell: (value: string) => formatOrderDate(value),
    },
    {
      header: "Precio Total",
      accessor: "precio_total",
      cell: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      header: "Estado",
      accessor: "estado",
      cell: (value: string) => (
        <Badge status={value as any}>
          {value === "pendiente" ? "Pendiente" : "Recibido"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessor: "id",
      cell: (_: any, row: Pedido) => (
        <div className="flex justify-center space-x-2">
          {row.estado === "pendiente" ? (
            <>
              <Button onClick={() => onConfirmPedido(row)}>Confirmar</Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={() => onEditPedido(row)}
              >
                <Edit size={16} className="mr-1" /> Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeletePedido(row)}
                className="flex items-center"
              >
                <Trash2 size={16} />
              </Button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  row.pdf_url
                    ? onViewPdf(row.pdf_url)
                    : toast.error("No hay PDF disponible")
                }
              >
                <FileText size={16} className="mr-1" />
                Ver PDF
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeletePedido(row)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPedidos = pedidos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(pedidos.length / rowsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if fewer pages than maxVisiblePages
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

  // Display loading, empty, or content state
  if (isLoading) {
    return (
      <div className="py-10 text-center text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Cargando pedidos...</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto text-gray-300 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H4" />
            <line x1="14" y1="2" x2="14" y2="8" />
            <line x1="8" y1="8" x2="20" y2="8" />
            <line x1="5" y1="12" x2="19" y2="12" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-500">
          No hay pedidos{" "}
          {activeTab === "pendientes" ? "pendientes" : "recibidos"}
        </h3>
        <p className="text-gray-400 mt-1">
          {activeTab === "pendientes"
            ? "Los pedidos pendientes aparecerán aquí"
            : "Los pedidos recibidos aparecerán aquí"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <section className="flex justify-end items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Mostrar</span>
        <Select
          value={rowsPerPage.toString()}
          onValueChange={(value) => onRowsPerPageChange(Number(value))}
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
      </section>
      <Table columns={columns} data={currentPedidos} />
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
        Mostrando{" "}
        {pedidos.length > 0 ? Math.min(startIndex + 1, pedidos.length) : 0} a{" "}
        {Math.min(endIndex, pedidos.length)} de {pedidos.length}{" "}
        {pedidos.length === 1 ? "pedido" : "pedidos"}
      </div>
    </div>
  );
};

export default PedidosTable;
