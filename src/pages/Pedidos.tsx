import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  supabase,
  registrarCalificacion,
} from "@/integrations/supabase/client";
import {
  updatePedidoEstado,
  updatePedidoFecha,
  generateOrderPdfOld,
  deletePedido,
} from "@/integrations/supabase/order-service-old";
import { useAuth } from "@/context/AuthContext";
import { Pedido } from "@/types/database";
import FiltroPedidosModal, {
  FiltroPedidos,
} from "@/components/pedidos/FiltroPedidosModal";
import ExportPedidosModal, {
  ExportPedidosSettings,
} from "@/components/pedidos/ExportPedidosModal";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  formatPedidosForExport,
} from "@/utils/exportUtils";
import {
  filterPedidosByExportSettings,
  formatPedidosForDetailedExport,
  formatPedidosForSimpleExport,
  applyAdvancedFilters,
  sortPedidos,
} from "@/utils/pedidosUtils";
import PedidosTable from "@/components/pedidos/PedidosTable";
import PedidosEvaluarModal, {
  RatingData,
} from "@/components/pedidos/PedidosEvaluarModal";
import PedidosDeleteModal from "@/components/pedidos/PedidosDeleteModal";
import PedidosEditModal from "@/components/pedidos/PedidosEditModal";
import PedidosConfirmModal from "@/components/pedidos/PedidosConfirmModal";
import PedidosPdfModal from "@/components/pedidos/PedidosPdfModal";
import PedidosFilter from "@/components/pedidos/PedidosFilter";
import PedidosHeader from "@/components/pedidos/PedidosHeader";
import { PedidosAdvancedFilters } from "@/components/pedidos/PedidosAdvancedFilter";
import { createNotification } from "@/integrations/supabase/client";

const Pedidos = () => {
  // State variables
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isEvaluarModalOpen, setIsEvaluarModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPedido, setCurrentPedido] = useState<Pedido | null>(null);
  const [activeTab, setActiveTab] = useState<"pendientes" | "recibidos">(
    "pendientes"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [proveedorFilter, setProveedorFilter] = useState("");
  const [proveedores, setProveedores] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [productos, setProductos] = useState<{ id: string; nombre: string }[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filtroActual, setFiltroActual] = useState<FiltroPedidos>({
    tipo: "mensual",
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    fechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] =
    useState<PedidosAdvancedFilters>({
      fechaInicio: undefined,
      fechaFin: undefined,
      productoId: "all",
      proveedorId: "all",
      sortField: "fecha_pedido",
      sortDirection: "desc",
    });
  const { user } = useAuth();

  // Fetch orders from Supabase
  const fetchPedidos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("pedido").select(`
          *,
          proveedor:proveedor_id (*),
          usuario:usuario_id (*)
        `);

      if (error) {
        throw error;
      }

      console.log("Pedidos obtenidos:", data);

      // Transform the data to match the Pedido interface and handle potential errors
      const transformedData = data?.map((pedido) => {
        // Check if proveedor is an object and provide default values
        const proveedorData =
          pedido.proveedor &&
          typeof pedido.proveedor === "object" &&
          !Array.isArray(pedido.proveedor) &&
          !("error" in pedido.proveedor)
            ? pedido.proveedor
            : { nombre: "N/A" };

        const usuarioData =
          pedido.usuario &&
          typeof pedido.usuario === "object" &&
          !Array.isArray(pedido.usuario) &&
          !("error" in pedido.usuario)
            ? pedido.usuario
            : { usuario: "N/A" };

        // productos y ticket pueden no existir en pedidos antiguos, aseguramos que existan
        return {
          ...pedido,
          productos: Array.isArray(pedido.productos) ? pedido.productos : [],
          ticket: typeof pedido.ticket === "string" ? pedido.ticket : "",
          proveedor: {
            nombre: proveedorData?.nombre || "N/A",
          },
          usuario: {
            usuario: usuarioData?.usuario || "N/A",
          },
        } as Pedido;
      }) as Pedido[];

      console.log("Pedidos transformados:", transformedData);
      setPedidos(transformedData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar los pedidos" + JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch providers
  const fetchProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from("proveedor")
        .select("id, nombre")
        .eq("activo", true);

      if (error) {
        throw error;
      }

      setProveedores(data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  // Fetch products
  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase
        .from("producto")
        .select("id, nombre");

      if (error) {
        throw error;
      }

      setProductos(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchProveedores();
    fetchProductos();
  }, []);

  // Function to generate PDF for an order and upload to storage
  const processPdfForOrder = async (pedido: Pedido) => {
    try {
      setIsPdfGenerating(true);
      const { pdfUrl } = await generateOrderPdfOld(pedido, user);
      if (!pdfUrl) {
        throw new Error("No se pudo generar URL del PDF");
      }
      try {
        await updatePedidoEstado(pedido.id, "recibido", pdfUrl);
        toast.success("PDF generado correctamente");
        return pdfUrl;
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        `Error al generar el PDF del pedido: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      throw error;
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleViewPdf = (pdfUrl: string) => {
    setCurrentPdfUrl(pdfUrl);
    setIsPdfModalOpen(true);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    setCurrentPdfUrl(null);
  };

  const handleConfirmarPedidoRequest = (pedido: Pedido) => {
    setCurrentPedido(pedido);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmarPedido = (pedido: Pedido) => {
    setCurrentPedido(pedido);
    setIsConfirmModalOpen(false);
    setIsEvaluarModalOpen(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
    //setCurrentPedido(null);
  };

  const handleDeletePedido = (pedido: Pedido) => {
    setIsDeleteModalOpen(true);
    setCurrentPedido(pedido);
  };

  const handleEditPedido = (pedido: Pedido) => {
    setCurrentPedido(pedido);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentPedido(null);
  };

  const handleSaveEdit = async (fechaPedido: string) => {
    if (!currentPedido) return;

    setIsLoading(true);

    try {
      const { error } = await updatePedidoFecha(currentPedido.id, fechaPedido);

      if (error) throw error;

      toast.success("Fecha de pedido actualizada correctamente");
      fetchPedidos();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating order date:", error);
      toast.error("Error al actualizar la fecha del pedido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEvaluarModal = () => {
    setIsEvaluarModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentPedido(null);
  };

  const handleConfirmDelete = async () => {
    if (!currentPedido) return;

    setIsLoading(true);

    try {
      // Delete the order
      const { error } = await deletePedido(currentPedido.id);

      if (error) throw error;

      // Refresh data
      fetchPedidos();
      toast.success(`Pedido eliminado correctamente`);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error al eliminar el pedido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEvaluacion = async (
    ratings: RatingData,
    comentarios: string,
    pedido: Pedido
  ) => {
    if (!currentPedido) {
      toast.error("No hay pedido seleccionado para evaluar.");
      setIsEvaluarModalOpen(false);
      return;
    }
    if (
      ratings.precio === 0 ||
      ratings.calidad === 0 ||
      ratings.tiempoEntrega === 0
    ) {
      toast.error("Por favor, complete todas las evaluaciones");
      return;
    }
    setIsLoading(true);
    try {
      const usuario = user;
      const { pdfUrl } = await generateOrderPdfOld(currentPedido, usuario);
      if (!pdfUrl) throw new Error("No se pudo generar el PDF del pedido");
      // Actualizar estado del pedido y guardar URL del PDF
      await updatePedidoEstado(currentPedido.id, "recibido", pdfUrl);
      // Calificar cada producto del pedido
      if (!Array.isArray(pedido.productos) || pedido.productos.length === 0) {
        toast.error(
          "El pedido no tiene productos válidos. No se puede actualizar el stock."
        );
        setIsEvaluarModalOpen(false);
        return;
      }
      for (const producto of currentPedido.productos) {
        const { error: calificacionError } = await registrarCalificacion({
          producto_id: producto.id,
          proveedor_id: currentPedido.proveedor_id,
          comentario: comentarios,
          tiempo_entrega: ratings.tiempoEntrega,
          precio: ratings.precio,
          calidad: ratings.calidad,
        });
        if (calificacionError) throw calificacionError;
        // Al confirmar el pedido como recibido, SUMAR la cantidad al stock del producto
        // Nunca restar stock al crear el pedido, solo sumar al recibir
        const { data: productoData, error: productoError } = await supabase
          .from("producto")
          .select("stock, nombre")
          .eq("id", producto.id)
          .single();
        if (productoError) throw productoError;
        const cantidadPedido = producto.cantidad;
        const stockAnterior = productoData?.stock;
        const nuevoStock = stockAnterior + cantidadPedido;
        console.log(
          `Actualizando stock para producto ${producto.nombre} (ID: ${producto.id}): cantidad del pedido = ${cantidadPedido}, stock anterior = ${stockAnterior}, stock nuevo = ${nuevoStock}`
        );
        if (cantidadPedido > 0) {
          const { error: updateError } = await supabase
            .from("producto")
            .update({ stock: nuevoStock })
            .eq("id", producto.id);
          if (updateError) throw updateError;
        }
      }
      // Crear notificación informativa (opcional)
      try {
        await createNotification({
          tipo: "pedido_recibido",
          titulo: "Pedido confirmado",
          mensaje: `El pedido #${currentPedido.id.slice(
            0,
            8
          )} ha sido confirmado y recibido.`,
          para_roles: ["admin"],
          icono: "Check",
          color: "green",
          entidad_tipo: "pedido",
          entidad_id: currentPedido.id,
        });
      } catch (notifError) {
        console.error("Error creando notificación:", notifError);
      }
      toast.success("¡Pedido procesado exitosamente!");
      setIsEvaluarModalOpen(false);
      setCurrentPedido(null);
      fetchPedidos();
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error(
        `Error al procesar el pedido: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchTab = (tab: "pendientes" | "recibidos") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Manejador para aplicar filtros de fecha
  const handleApplyFilter = (filtro: FiltroPedidos) => {
    setFiltroActual(filtro);
    toast.success("Filtro aplicado");
    fetchPedidos(); // Refrescar datos con nuevo filtro
  };

  // Apply all filters and sorting
  const getFilteredAndSortedPedidos = () => {
    let filtered = [...pedidos];

    filtered = filtered.filter((pedido) =>
      activeTab === "pendientes"
        ? pedido.estado === "pendiente"
        : pedido.estado === "recibido"
    );

    if (searchTerm) {
      filtered = filtered.filter(
        (pedido) =>
          pedido.productos?.some((prod) =>
            prod.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          pedido.proveedor?.nombre
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (proveedorFilter) {
      filtered = filtered.filter(
        (pedido) => pedido.proveedor_id === proveedorFilter
      );
    }

    filtered = applyAdvancedFilters(filtered, advancedFilters);

    filtered = sortPedidos(
      filtered,
      advancedFilters.sortField,
      advancedFilters.sortDirection
    );

    return filtered;
  };

  const filteredPedidos = getFilteredAndSortedPedidos();

  const handleExportRequest = (
    settings: ExportPedidosSettings,
    format: "pdf" | "excel" | "csv"
  ) => {
    // Filter pedidos according to settings
    const filteredPedidos = filterPedidosByExportSettings(pedidos, settings);

    if (filteredPedidos.length === 0) {
      toast.error("No hay pedidos para exportar con los filtros seleccionados");
      return;
    }

    // Format data according to export type
    const formattedData =
      settings.exportType === "detailed"
        ? formatPedidosForDetailedExport(filteredPedidos, settings)
        : formatPedidosForSimpleExport(filteredPedidos);

    // Export according to format
    const fileName = `pedidos_${new Date().toISOString().split("T")[0]}`;

    try {
      if (format === "csv") {
        exportToCSV(formattedData, fileName);
        toast.success("Pedidos exportados a CSV correctamente");
      } else if (format === "excel") {
        exportToExcel(formattedData, fileName);
        toast.success("Pedidos exportados a Excel correctamente");
      } else if (format === "pdf") {
        // Define columns for PDF
        const columns = Object.keys(formattedData[0] || {}).map((key) => ({
          header: key,
          dataKey: key,
        }));

        exportToPDF(formattedData, fileName, settings.titleReport, columns);
        toast.success("Pedidos exportados a PDF correctamente");
      }
    } catch (error) {
      console.error("Error exporting pedidos:", error);
      toast.error("Error al exportar pedidos");
    }
  };

  const handleQuickExport = (format: "csv" | "excel" | "pdf") => {
    const formattedData = formatPedidosForExport(filteredPedidos);
    const fileName = `pedidos_rapido_${new Date().toISOString().split("T")[0]}`;

    try {
      if (format === "csv") {
        exportToCSV(formattedData, fileName);
        toast.success("Pedidos exportados a CSV correctamente");
      } else if (format === "excel") {
        exportToExcel(formattedData, fileName);
        toast.success("Pedidos exportados a Excel correctamente");
      } else if (format === "pdf") {
        const columns = Object.keys(formattedData[0] || {}).map((key) => ({
          header: key,
          dataKey: key,
        }));

        exportToPDF(formattedData, fileName, "Reporte de Pedidos", columns);
        toast.success("Pedidos exportados a PDF correctamente");
      }
    } catch (error) {
      console.error("Error exporting pedidos:", error);
      toast.error("Error al exportar pedidos");
    }
  };

  return (
    <div>
      {/* Header */}
      <PedidosHeader onOpenFilterModal={() => setIsFilterModalOpen(true)} />

      {/* Filter Card */}
      <Card className="mb-6 overflow-hidden border-none shadow-md bg-white p-4">
        <PedidosFilter
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          proveedorFilter={proveedorFilter}
          onProveedorFilterChange={(value) => {
            setProveedorFilter(value);
            setCurrentPage(1);
          }}
          proveedores={proveedores}
          productos={productos}
          rowsPerPage={rowsPerPage}
          activeTab={activeTab}
          onTabChange={handleSwitchTab}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onQuickExport={handleQuickExport}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
        />
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden border-none shadow-md bg-white">
        <PedidosTable
          pedidos={filteredPedidos}
          isLoading={isLoading}
          activeTab={activeTab}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          setCurrentPage={setCurrentPage}
          onConfirmPedido={handleConfirmarPedidoRequest}
          onEditPedido={handleEditPedido}
          onDeletePedido={handleDeletePedido}
          onViewPdf={handleViewPdf}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modals */}
      <PedidosConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmarPedido}
        currentPedido={currentPedido}
      />

      <PedidosEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        currentPedido={currentPedido}
        isLoading={isLoading}
      />

      <PedidosEvaluarModal
        isOpen={isEvaluarModalOpen}
        onClose={handleCloseEvaluarModal}
        onSubmit={handleSubmitEvaluacion}
        currentPedido={currentPedido}
        isLoading={isLoading}
        isPdfGenerating={isPdfGenerating}
      />

      <PedidosDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
        currentPedido={currentPedido}
        isLoading={isLoading}
      />

      <PedidosPdfModal
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        pdfUrl={currentPdfUrl}
      />

      {/* Filtro Modal */}
      <FiltroPedidosModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filtroActual={filtroActual}
        onApplyFilter={handleApplyFilter}
      />

      {/* Export Modal */}
      <ExportPedidosModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pedidos={pedidos}
        onExport={handleExportRequest}
      />
    </div>
  );
};

export default Pedidos;
