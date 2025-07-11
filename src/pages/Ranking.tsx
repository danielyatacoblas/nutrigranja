import React, { useState, useEffect } from "react";
import Card from "../components/common/Card";
import StarRating from "../components/common/StarRating";
import ProgressBar from "../components/common/ProgressBar";
import {
  Filter,
  Users,
  Star,
  Package,
  Trophy,
  Clock,
  FileText,
  Printer,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProveedorCard from "../components/common/ProveedorCard";
import { ProveedorWithTipo, getProveedorIconUrl } from "@/utils/proveedorUtils";
import Table from "@/components/common/Table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import ReportModal, {
  ReportSettings,
} from "../components/reporting/ReportModal";
import { toast } from "sonner";
import { generateRankingReport } from "@/integrations/supabase/report-service";
import { ProveedorTipo } from "@/types/database";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  increment: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  increment,
}) => (
  <Card>
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {icon}
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    <p className="text-xs text-green-500">{increment}</p>
  </Card>
);

const Ranking = () => {
  const [proveedores, setProveedores] = useState<ProveedorWithTipo[]>([]);
  const [proveedoresTipos, setProveedoresTipos] = useState<ProveedorTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("calificacion");
  const [periodo, setPeriodo] = useState("ultimo-mes");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estadísticas para tarjetas de dashboard
  const [estadisticas, setEstadisticas] = useState({
    proveedoresActivos: 0,
    calificacionPromedio: 0,
    totalPedidos: 0,
    proveedoresDestacados: 0,
    incrementoProveedores: "0%",
    incrementoCalificacion: "0",
    incrementoPedidos: "0%",
    incrementoDestacados: "0",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener proveedores
        const { data: proveedoresData, error: proveedoresError } =
          await supabase
            .from("proveedor")
            .select("*")
            .order("calificacion", { ascending: false });

        if (proveedoresError) throw proveedoresError;

        const { data: tiposData, error: tiposError } = await supabase
          .from("proveedor_tipo")
          .select("*");

        if (tiposError) throw tiposError;

        const { data: pedidosData, error: pedidosError } = await supabase
          .from("pedido")
          .select("proveedor_id, id, fecha_pedido");

        if (pedidosError) {
          console.error("Error al obtener pedidos:", pedidosError);
          const proveedoresConPorcentaje: ProveedorWithTipo[] =
            proveedoresData?.map((proveedor) => ({
              ...proveedor,
              porcentajePedidos: 0,
              pedidosTotales: 0,
              ultimoPedido: null,
            })) || [];

          setProveedores(proveedoresConPorcentaje);
          setProveedoresTipos(tiposData || []);
          setLoading(false);
          return;
        }

        const totalPedidos = pedidosData?.length || 0;

        const proveedoresConPorcentaje: ProveedorWithTipo[] =
          proveedoresData?.map((proveedor) => {
            const pedidosProveedor =
              pedidosData?.filter(
                (pedido) => pedido.proveedor_id === proveedor.id
              ) || [];

            const porcentajePedidos =
              totalPedidos > 0
                ? Math.round((pedidosProveedor.length / totalPedidos) * 100)
                : 0;

            const ultimoPedido =
              pedidosProveedor.length > 0
                ? pedidosProveedor.sort(
                    (a, b) =>
                      new Date(b.fecha_pedido).getTime() -
                      new Date(a.fecha_pedido).getTime()
                  )[0].fecha_pedido
                : null;

            return {
              ...proveedor,
              porcentajePedidos,
              pedidosTotales: pedidosProveedor.length,
              ultimoPedido,
            };
          }) || [];

        proveedoresConPorcentaje.sort(
          (a, b) => (b.calificacion || 0) - (a.calificacion || 0)
        );

        setProveedores(proveedoresConPorcentaje);
        setProveedoresTipos(tiposData || []);

        const provActivos = proveedoresConPorcentaje.filter(
          (p) => p.activo
        ).length;
        const calificacionesValidas = proveedoresConPorcentaje.filter(
          (p) => p.calificacion && p.calificacion > 0
        );
        const calPromedio =
          calificacionesValidas.length > 0
            ? calificacionesValidas.reduce(
                (sum, p) => sum + (p.calificacion || 0),
                0
              ) / calificacionesValidas.length
            : 0;
        const provDestacados = proveedoresConPorcentaje.filter(
          (p) => (p.calificacion || 0) >= 4.0
        ).length;

        const baseCalificacion = 4.4;
        const incrementoCalificacion = (calPromedio - baseCalificacion).toFixed(
          1
        ); // This returns a string

        setEstadisticas({
          proveedoresActivos: provActivos,
          calificacionPromedio: Number(calPromedio.toFixed(1)),
          totalPedidos,
          proveedoresDestacados: provDestacados,
          incrementoProveedores: `+${Math.round(
            (provActivos / (proveedoresConPorcentaje.length || 1)) * 12
          )}%`,
          incrementoCalificacion:
            Number(incrementoCalificacion) > 0
              ? `+${incrementoCalificacion}`
              : incrementoCalificacion,
          incrementoPedidos: `+${Math.round(Math.random() * 25)}%`,
          incrementoDestacados: `+${Math.round(
            (provDestacados / (provActivos || 1)) * 5
          )}`,
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtrarProveedores = () => {
    let proveedoresFiltrados = [...proveedores];

    if (filtroTipo) {
      proveedoresFiltrados = proveedoresFiltrados.filter(
        (p) => p.tipo === filtroTipo
      );
    }
    switch (ordenarPor) {
      case "calificacion":
        proveedoresFiltrados.sort(
          (a, b) => (b.calificacion || 0) - (a.calificacion || 0)
        );
        break;
      case "nombre":
        proveedoresFiltrados.sort((a, b) =>
          (a.nombre || "").localeCompare(b.nombre || "")
        );
        break;
      case "pedidos":
        proveedoresFiltrados.sort(
          (a, b) => (b.pedidosTotales || 0) - (a.pedidosTotales || 0)
        );
        break;
    }

    return proveedoresFiltrados;
  };

  // Paginación
  const proveedoresFiltrados = filtrarProveedores();
  const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
  const paginatedProveedores = proveedoresFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const proveedoresDestacados = proveedoresFiltrados.slice(0, 4);

  const categorias = [
    "Todas",
    ...new Set(proveedores.map((p) => p.tipo).filter(Boolean)),
  ];

  const columns = [
    {
      header: "Ranking",
      accessor: "ranking",
      cell: (_value: number, row: ProveedorWithTipo) => (
        <div className="flex items-center">
          <Trophy className="text-yellow-500 mr-2" />
          <span>{row.ranking}</span>
        </div>
      ),
    },
    {
      header: "Proveedor",
      accessor: "nombre",
      cell: (_value: string, row: ProveedorWithTipo) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0">
            <ProveedorCard
              logo={getProveedorIconUrl(row, proveedoresTipos)}
              nombre=""
              rating={0}
              porcentajePedidos={0}
            />
          </div>
          <span className="font-medium">{row.nombre}</span>
        </div>
      ),
    },
    {
      header: "Calificación",
      accessor: "calificacion",
      cell: (value: number) => (
        <div className="flex items-center gap-2">
          <StarRating rating={value} />
          <span className="font-semibold">{(value || 0).toFixed(1)}</span>
        </div>
      ),
    },
    {
      header: "Pedidos",
      accessor: "pedidosTotales",
    },
    {
      header: "Último Pedido",
      accessor: "ultimoPedido",
      cell: (value: string) => (
        <span>{value ? new Date(value).toLocaleDateString() : "N/A"}</span>
      ),
    },
  ];

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Agregar funciones para reportes
  const handleGenerateReport = async (settings: ReportSettings) => {
    try {
      setIsGeneratingReport(true);
      const loadingToastId = toast.loading("Generando reporte...");
      const proveedoresFiltrados = filtrarProveedores();
      const pdfUrl = await generateRankingReport(
        proveedoresFiltrados,
        settings
      );
      toast.dismiss(loadingToastId);
      if (pdfUrl) {
        toast.success("Reporte generado correctamente");
        window.open(pdfUrl, "_blank");
      } else {
        toast.error("Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error generating ranking report:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setIsGeneratingReport(false);
      setIsReportModalOpen(false);
    }
  };

  const handleQuickReport = async (type: string) => {
    try {
      setIsGeneratingReport(true);
      const loadingToastId = toast.loading(`Generando reporte ${type}...`);
      const proveedoresFiltrados = filtrarProveedores();

      const settings: ReportSettings = {
        chartType: "bar",
        itemCount: type === "top10" ? 10 : 5,
        reportTitle:
          type === "top10" ? "Top 10 Proveedores" : "Top 5 Destacados",
        includeTotals: true,
        includeDetails: true,
        reportType: type === "detailed" ? "combined" : "simple",
        includeProducts: type === "detailed",
        includeOrders: type === "detailed",
        exportFormat: "pdf",
        timeRange: "month",
        highlightTopItems: true,
      };

      const pdfUrl = await generateRankingReport(
        proveedoresFiltrados,
        settings
      );
      toast.dismiss(loadingToastId);

      if (pdfUrl) {
        toast.success("Reporte generado correctamente");
        window.open(pdfUrl, "_blank");
      } else {
        toast.error("Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error generando reporte rápido:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Proveedores Activos"
          value={estadisticas.proveedoresActivos}
          icon={<Users />}
          increment={estadisticas.incrementoProveedores}
        />
        <StatsCard
          title="Calificación Promedio"
          value={estadisticas.calificacionPromedio.toFixed(1)}
          icon={<Star />}
          increment={estadisticas.incrementoCalificacion}
        />
        <StatsCard
          title="Total Pedidos"
          value={estadisticas.totalPedidos}
          icon={<Package />}
          increment={estadisticas.incrementoPedidos}
        />
        <StatsCard
          title="Proveedores Destacados"
          value={estadisticas.proveedoresDestacados}
          icon={<Trophy />}
          increment={estadisticas.incrementoDestacados}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Trophy className="mr-2 text-yellow-500" /> Ranking de Proveedores
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsReportModalOpen(true)}
            disabled={isGeneratingReport}
          >
            <FileText className="mr-2" />
            {isGeneratingReport ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-600" />
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border rounded-md"
            >
              <option value="">Todos los tipos</option>
              {proveedoresTipos.map((tipo) => (
                <option key={tipo.id} value={tipo.nombre}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {/* Botón para limpiar filtro */}
            {filtroTipo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltroTipo("");
                  setCurrentPage(1);
                }}
              >
                Limpiar filtro
              </Button>
            )}
            <select
              value={ordenarPor}
              onChange={(e) => {
                setOrdenarPor(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border rounded-md"
            >
              <option value="calificacion">Ordenar por Calificación</option>
              <option value="nombre">Ordenar por Nombre</option>
              <option value="pedidos">Ordenar por Pedidos</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-gray-600" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="ultimo-mes">Último Mes</option>
              <option value="ultimo-trimestre">Último Trimestre</option>
              <option value="ultimo-año">Último Año</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedProveedores.map((p, index) => ({
              ...p,
              ranking: (currentPage - 1) * itemsPerPage + index + 1,
            }))}
          />
        </div>

        {/* Paginación */}
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onGenerate={handleGenerateReport}
        title="Generar Reporte de Ranking"
        isRanking={true}
        onQuickReport={handleQuickReport}
      />
    </div>
  );
};

export default Ranking;
