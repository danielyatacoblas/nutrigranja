import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchInput from "../components/common/SearchInput";
import Table from "../components/common/Table";
import {
  Calendar,
  FileText,
  Filter,
  Eye,
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
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
import HistorialFilterModal from "../components/historial/HistorialFilterModal";
import HistorialVisualizerModal from "../components/historial/HistorialVisualizerModal";
import ExportHistorialModal from "../components/historial/ExportHistorialModal";
import { HistorialItem } from "@/types/database";
import { generateHistoryReportPdf } from "@/integrations/supabase/report-service";

interface HistoryFilter {
  tipo: string;
  startDate: string;
  endDate: string;
}

const Historial = () => {
  const { user, userProfile } = useAuth();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const fetchingRef = useRef(false);

  // Estados de filtros
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Estados únicos para filtros
  const [tiposUnicos, setTiposUnicos] = useState<string[]>(["Todos"]);
  const [modulosUnicos, setModulosUnicos] = useState<string[]>(["Todos"]);
  const [usuariosUnicos, setUsuariosUnicos] = useState<string[]>(["Todos"]);
  const [accionesUnicas, setAccionesUnicas] = useState<string[]>(["Todos"]);

  // Estados de modales
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedHistorialItem, setSelectedHistorialItem] =
    useState<HistorialItem | null>(null);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);

  // Verificar si es admin usando useMemo para evitar cálculos innecesarios
  const isAdmin = useMemo(() => {
    return userProfile?.rol === "admin";
  }, [userProfile?.rol]);

  const fetchHistorial = useCallback(async () => {
    // Verificar que el usuario esté autenticado y sea admin
    if (!user || !userProfile || userProfile.rol !== "admin") {
      console.log("Usuario no autorizado para obtener historial");
      setLoading(false);
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (fetchingRef.current) {
      console.log("Ya hay una consulta de historial en progreso");
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);

      const { data, error } = await supabase
        .from("historial")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error en consulta de historial:", error);
        throw error;
      }

      const historialItems = (data || []).map((item) => ({
        ...item,
        datos: item.datos as Record<string, any> | null,
      })) as HistorialItem[];

      const tipos = [
        "Todos",
        ...Array.from(new Set(historialItems.map((item) => item.tipo))),
      ];
      const modulos = [
        "Todos",
        ...Array.from(new Set(historialItems.map((item) => item.modulo))),
      ];
      const usuarios = [
        "Todos",
        ...Array.from(new Set(historialItems.map((item) => item.usuario))),
      ];
      const acciones = [
        "Todos",
        ...Array.from(new Set(historialItems.map((item) => item.accion))),
      ];

      setHistorial(historialItems);
      setTiposUnicos(tipos);
      setModulosUnicos(modulos);
      setUsuariosUnicos(usuarios);
      setAccionesUnicas(acciones);
    } catch (err) {
      console.error("Error al cargar historial:", err);
      toast.error("Error al cargar el historial de actividades");
      setHistorial([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id, userProfile?.rol]); // Dependencias mínimas

  useEffect(() => {
    // Solo ejecutar si tenemos usuario autenticado y perfil con rol admin
    if (user && userProfile && userProfile.rol === "admin") {
      console.log("Ejecutando fetchHistorial...");
      fetchHistorial();
    } else if (user && userProfile && userProfile.rol !== "admin") {
      console.log("Usuario no es admin, no cargando historial");
      setLoading(false);
    } else {
      console.log("Usuario o perfil no disponible para historial");
      setLoading(false);
    }
  }, [user?.id, userProfile?.rol]); // Solo depender de ID de usuario y rol

  // Aplicar filtros usando useMemo para optimizar
  const filteredHistorial = useMemo(() => {
    let filtered = historial;

    // Filtrar por tipo
    if (filtroTipo !== "Todos") {
      filtered = filtered.filter((item) => item.tipo === filtroTipo);
    }

    // Filtrar por fecha de inicio
    if (startDate) {
      const inicio = new Date(startDate);
      filtered = filtered.filter((item) => new Date(item.fecha) >= inicio);
    }

    // Filtrar por fecha de fin
    if (endDate) {
      const fin = new Date(endDate);
      fin.setHours(23, 59, 59);
      filtered = filtered.filter((item) => new Date(item.fecha) <= fin);
    }

    // Aplicar búsqueda de texto
    if (searchTerm) {
      const lowerCaseValue = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.descripcion.toLowerCase().includes(lowerCaseValue) ||
          item.usuario.toLowerCase().includes(lowerCaseValue) ||
          item.tipo.toLowerCase().includes(lowerCaseValue) ||
          item.modulo.toLowerCase().includes(lowerCaseValue) ||
          item.accion.toLowerCase().includes(lowerCaseValue)
      );
    }

    return filtered;
  }, [historial, filtroTipo, startDate, endDate, searchTerm]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleAdvancedFilters = useCallback((filters: HistoryFilter) => {
    setFiltroTipo(filters.tipo);
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
    setCurrentPage(1);
  }, []);

  const handleTipoChange = useCallback((value: string) => {
    setFiltroTipo(value);
    setCurrentPage(1);
  }, []);

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStartDate(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEndDate(e.target.value);
      setCurrentPage(1);
    },
    []
  );

  const limpiarFiltros = useCallback(() => {
    setFiltroTipo("Todos");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleViewDetails = useCallback((item: HistorialItem) => {
    setSelectedHistorialItem(item);
    setIsVisualizerOpen(true);
  }, []);

  const handleGenerateReport = useCallback(
    async (item: HistorialItem) => {
      if (isGeneratingPdf) return;

      try {
        setIsGeneratingPdf(true);

        const toastId = toast.loading("Generando reporte PDF...");

        const pdfUrl = await generateHistoryReportPdf(item);

        if (pdfUrl) {
          toast.dismiss(toastId);
          toast.success("PDF generado");

          setHistorial((prev) =>
            prev.map((h) => (h.id === item.id ? { ...h, pdf_url: pdfUrl } : h))
          );

          window.open(pdfUrl, "_blank");
        } else {
          toast.dismiss(toastId);
          toast.error("Error al generar el PDF");
        }
      } catch (error) {
        console.error("Error generating report:", error);
        toast.error("Error al generar el PDF");
      } finally {
        setIsGeneratingPdf(false);
      }
    },
    [isGeneratingPdf]
  );

  const handleDownloadReport = useCallback((pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  }, []);

  const getAccionBadge = useCallback((accion: string) => {
    let badgeClass = "";
    switch (accion) {
      case "crear":
        badgeClass = "bg-green-100 text-green-800";
        break;
      case "actualizar":
        badgeClass = "bg-blue-100 text-blue-800";
        break;
      case "eliminar":
        badgeClass = "bg-red-100 text-red-800";
        break;
      case "confirmar":
        badgeClass = "bg-purple-100 text-purple-800";
        break;
      case "alerta":
        badgeClass = "bg-yellow-100 text-yellow-800";
        break;
      case "activar":
        badgeClass = "bg-green-100 text-green-800";
        break;
      case "desactivar":
        badgeClass = "bg-red-100 text-red-800";
        break;
      case "cambiar_rol":
        badgeClass = "bg-indigo-100 text-indigo-800";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800";
    }
    return badgeClass;
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistorial.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentItems = filteredHistorial.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

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
  }, [totalPages, currentPage]);

  const columns = useMemo(
    () => [
      {
        header: "Tipo",
        accessor: "tipo",
        width: "10%",
        cell: (value: string) => {
          let badgeClass = "";
          switch (value) {
            case "Pedido":
              badgeClass = "bg-blue-100 text-blue-800";
              break;
            case "Proveedor":
              badgeClass = "bg-green-100 text-green-800";
              break;
            case "Producto":
              badgeClass = "bg-purple-100 text-purple-800";
              break;
            case "Usuario":
              badgeClass = "bg-orange-100 text-orange-800";
              break;
            case "Compra":
              badgeClass = "bg-red-100 text-red-800";
              break;
            case "Reporte":
              badgeClass = "bg-indigo-100 text-indigo-800";
              break;
            default:
              badgeClass = "bg-gray-100 text-gray-800";
          }
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
            >
              {value}
            </span>
          );
        },
      },
      { header: "Descripción", accessor: "descripcion", width: "25%" },
      { header: "Usuario", accessor: "usuario", width: "10%" },
      {
        header: "Fecha",
        accessor: "fecha",
        width: "15%",
        cell: (value: string) => {
          const fecha = new Date(value);
          return <span>{fecha.toLocaleString()}</span>;
        },
      },
      { header: "Módulo", accessor: "modulo", width: "10%" },
      {
        header: "Acción",
        accessor: "accion",
        width: "10%",
        cell: (value: string) => {
          const badgeClass = getAccionBadge(value);
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        header: "Detalles",
        accessor: "id",
        width: "20%",
        cell: (value: string, row: HistorialItem) => (
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(row)}
              className="px-2 py-1 h-8"
            >
              <Eye size={14} className="mr-1" />
              Ver
            </Button>

            {row.pdf_url ? (
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 px-2 py-1 h-8"
                onClick={() => handleDownloadReport(row.pdf_url!)}
              >
                <Download size={14} className="text-green-600" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 px-2 py-1 h-8"
                onClick={() => handleGenerateReport(row)}
                disabled={isGeneratingPdf}
              >
                <FileText size={14} className="mr-1 text-blue-600" />
                Gen PDF
              </Button>
            )}
          </div>
        ),
      },
    ],
    [
      getAccionBadge,
      handleViewDetails,
      handleDownloadReport,
      handleGenerateReport,
      isGeneratingPdf,
    ]
  );

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            No tienes permisos para acceder a esta página. Esta sección está
            disponible solo para administradores.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Historial de Actividades
          </h1>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-md bg-white">
        <div className="bg-white p-6 border-b border-border/30">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Buscar en historial..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white border-input focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 bg-white ${
                    showFilters
                      ? "border-primary/70 text-primary"
                      : "border-muted"
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter
                    size={16}
                    className={
                      showFilters ? "text-primary" : "text-muted-foreground"
                    }
                  />
                  {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                  {showFilters ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </Button>

                {(filtroTipo !== "Todos" ||
                  startDate ||
                  endDate ||
                  searchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limpiarFiltros}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de registro
                    </label>
                    <Select value={filtroTipo} onValueChange={handleTipoChange}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposUnicos.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha desde
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <div className="bg-gray-100 p-2 text-gray-500">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="p-2 focus:outline-none flex-1 min-w-0"
                        placeholder="Fecha inicio"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha hasta
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <div className="bg-gray-100 p-2 text-gray-500">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="p-2 focus:outline-none flex-1 min-w-0"
                        placeholder="Fecha fin"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center">
              <span className="text-sm text-gray-500">Mostrar</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8 mx-2 bg-white">
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
          </div>
        </div>

        <div className="p-6 bg-white">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredHistorial.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <History size={36} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No se encontraron registros
              </h3>
              <p className="text-gray-500">
                No hay registros que coincidan con los criterios de búsqueda.
              </p>
            </div>
          ) : (
            <Table columns={columns} data={currentItems} />
          )}

          {!loading && filteredHistorial.length > 0 && totalPages > 1 && (
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
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
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
            {filteredHistorial.length > 0
              ? Math.min(startIndex + 1, filteredHistorial.length)
              : 0}{" "}
            a {Math.min(endIndex, filteredHistorial.length)} de{" "}
            {filteredHistorial.length}{" "}
            {filteredHistorial.length === 1 ? "registro" : "registros"}
          </div>
        </div>
      </Card>

      <HistorialFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleAdvancedFilters}
        tiposUnicos={tiposUnicos}
        currentFilters={{
          tipo: filtroTipo,
          startDate: startDate,
          endDate: endDate,
        }}
      />

      {selectedHistorialItem && (
        <HistorialVisualizerModal
          isOpen={isVisualizerOpen}
          onClose={() => setIsVisualizerOpen(false)}
          data={selectedHistorialItem.datos}
          title={`Registro de ${selectedHistorialItem.tipo}`}
          description={selectedHistorialItem.descripcion}
          type={selectedHistorialItem.tipo}
          action={selectedHistorialItem.accion}
        />
      )}

      <ExportHistorialModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tiposUnicos={tiposUnicos}
        modulosUnicos={modulosUnicos}
        usuariosUnicos={usuariosUnicos}
        accionesUnicas={accionesUnicas}
      />
    </div>
  );
};

export default Historial;
