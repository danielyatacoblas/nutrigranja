import React, { useState, useEffect } from "react";
import Card from "../components/common/Card";
import {
  BarChart2,
  Package,
  TruckIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  Loader2,
  PieChart,
  LineChart,
  TrendingUp,
} from "lucide-react";
import Table from "../components/common/Table";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  LineChart as RechartLineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import ReportModal, {
  ReportSettings,
} from "../components/reporting/ReportModal";
import AlertsModal from "../components/dashboard/AlertsModal";
import { toast } from "sonner";
import {
  generateDashboardReport,
  fetchDashboardSummary,
  fetchOrdersByMonth,
  fetchRecentOrders,
  fetchAlerts,
  fetchTopProviders,
  fetchTopProductTypes,
  supabase,
} from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useNavigate } from "react-router-dom";

type TimePeriod = "semanal" | "mensual" | "trimestral" | "anual";

// Sample data for the new charts
const PRODUCT_CATEGORIES_DATA = [
  { name: "Frutas", value: 35, color: "#2196F3" },
  { name: "Verduras", value: 30, color: "#4CAF50" },
  { name: "Lácteos", value: 20, color: "#FFC107" },
  { name: "Carnes", value: 15, color: "#F44336" },
];

const INVENTORY_TREND_DATA = [
  { name: "Enero", stock: 8500, pedidos: 6500 },
  { name: "Febrero", stock: 9200, pedidos: 7200 },
  { name: "Marzo", stock: 8700, pedidos: 6900 },
  { name: "Abril", stock: 9500, pedidos: 7800 },
  { name: "Mayo", stock: 10200, pedidos: 9000 },
  { name: "Junio", stock: 11000, pedidos: 9800 },
];

const TOP_PROVIDERS_DATA = [
  { name: "Proveedor A", valor: 12500 },
  { name: "Proveedor B", valor: 11000 },
  { name: "Proveedor C", valor: 9500 },
  { name: "Proveedor D", valor: 8000 },
  { name: "Proveedor E", valor: 7200 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"ordenes" | "alertas">(
    "ordenes"
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("trimestral"); // Default to trimestral
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentOrdersData, setRecentOrdersData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [showZeroValues, setShowZeroValues] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState({
    productsCount: 0,
    providersCount: 0,
    monthlyPurchases: 0,
    purchaseGrowthRate: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topProviders, setTopProviders] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    summary: true,
    chartData: true,
    recentOrders: true,
    activity: true,
    alerts: true,
    allAlerts: true,
    topProviders: true,
    categories: true,
  });

  // Load dashboard summary data
  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, summary: true }));
        const summary = await fetchDashboardSummary();

        // Map the returned summary object to match our state object structure
        setDashboardSummary({
          productsCount: summary.totalProducts,
          providersCount: summary.totalProviders,
          monthlyPurchases: summary.totalOrdersValue,
          purchaseGrowthRate: summary.purchaseGrowthRate,
        });

        // Set recent orders data
        if (summary.recentOrders?.length > 0) {
          const ordersWithDetails = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            summary.recentOrders.slice(0, 3).map(async (order: any) => {
              // Get product and provider details for each order
              const { data: producto } = await supabase
                .from("producto")
                .select("nombre")
                .eq("id", order.producto_id)
                .single();

              const { data: proveedor } = await supabase
                .from("proveedor")
                .select("nombre")
                .eq("id", order.proveedor_id)
                .single();

              return {
                id: order.id,
                product: producto?.nombre || "Producto desconocido",
                provider: proveedor?.nombre || "Proveedor desconocido",
                quantity: `${order.cantidad} unidades`,
                status: order.estado,
                date: order.fecha_pedido,
              };
            })
          );

          setRecentOrdersData(ordersWithDetails);
        }
      } catch (error) {
        console.error("Error loading dashboard summary:", error);
        toast.error("Error al cargar datos del dashboard");
      } finally {
        setIsLoading((prev) => ({
          ...prev,
          summary: false,
          recentOrders: false,
        }));
      }
    };

    loadSummaryData();
  }, []);

  // Load chart data based on selected time period
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, chartData: true }));

        // Get chart data for the selected period
        const data = await fetchOrdersByMonth(timePeriod, showZeroValues);

        setChartData(data);
      } catch (error) {
        console.error("Error loading chart data:", error);
        toast.error("Error al cargar datos del gráfico");
      } finally {
        setIsLoading((prev) => ({ ...prev, chartData: false }));
      }
    };

    loadChartData();
  }, [timePeriod, showZeroValues]);

  // Load recent activity
  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, activity: true }));
        const data = await fetchRecentOrders();
        setRecentActivity(data);
      } catch (error) {
        console.error("Error loading recent activity:", error);
      } finally {
        setIsLoading((prev) => ({ ...prev, activity: false }));
      }
    };

    loadRecentActivity();
  }, []);

  // Load system alerts - Modified to load both preview alerts and all alerts
  useEffect(() => {
    const loadSystemAlerts = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, alerts: true }));
        // Get preview alerts (limited to 3)
        const previewData = await fetchAlerts(3);
        setSystemAlerts(previewData);

        // Also load all alerts for the modal
        setIsLoading((prev) => ({ ...prev, allAlerts: true }));
        const allAlertsData = await fetchAlerts(100); // Fetch more alerts for the modal
        setAllAlerts(allAlertsData);
      } catch (error) {
        console.error("Error loading system alerts:", error);
      } finally {
        setIsLoading((prev) => ({ ...prev, alerts: false, allAlerts: false }));
      }
    };

    loadSystemAlerts();
  }, []);

  // Load top providers data (actual data from API)
  useEffect(() => {
    const loadTopProviders = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, topProviders: true }));
        const data = await fetchTopProviders(5);
        setTopProviders(
          data.map((provider) => ({
            name: provider.nombre || `Proveedor ${provider.id.slice(0, 4)}`,
            valor: provider.valorTotal || 0,
          }))
        );
      } catch (error) {
        console.error("Error loading top providers:", error);
        // Fallback to sample data if API fails
        setTopProviders(TOP_PROVIDERS_DATA);
      } finally {
        setIsLoading((prev) => ({ ...prev, topProviders: false }));
      }
    };

    loadTopProviders();
  }, []);

  // Load product categories data (fixed to use tipo instead of categoria)
  useEffect(() => {
    const loadProductCategories = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, categories: true }));

        // Fetch top product types by order count
        const data = await fetchTopProductTypes(5);

        if (data && data.length > 0) {
          setProductCategories(data);
        } else {
          // Fallback to sample data only if the API fails to return any data
          setProductCategories([
            { name: "Frutas", value: 35, color: "#2196F3" },
            { name: "Verduras", value: 30, color: "#4CAF50" },
            { name: "Lácteos", value: 20, color: "#FFC107" },
            { name: "Carnes", value: 15, color: "#F44336" },
            { name: "Sin clasificar", value: 10, color: "#9E9E9E" },
          ]);
        }
      } catch (error) {
        console.error("Error loading product categories:", error);
        // Fallback to sample data if API fails
        setProductCategories([
          { name: "Frutas", value: 35, color: "#2196F3" },
          { name: "Verduras", value: 30, color: "#4CAF50" },
          { name: "Lácteos", value: 20, color: "#FFC107" },
          { name: "Carnes", value: 15, color: "#F44336" },
          { name: "Sin clasificar", value: 10, color: "#9E9E9E" },
        ]);
      } finally {
        setIsLoading((prev) => ({ ...prev, categories: false }));
      }
    };

    loadProductCategories();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{`${label} : $${payload[0].value.toFixed(
            2
          )}`}</p>
        </div>
      );
    }
    return null;
  };

  const handleGenerateReport = async (settings: ReportSettings) => {
    try {
      const loadingToastId = toast.loading(
        "Generando reporte del dashboard..."
      );

      const periodoTexto = {
        semanal: "Últimas semanas",
        mensual: "Por meses",
        trimestral: "Por trimestres",
        anual: "Por años",
      }[timePeriod];

      // Use real data for the report
      const reportData = chartData.map((item) => ({
        ...item,
        mes: item.name,
        ventas: item.value,
      }));

      const pdfUrl = await generateDashboardReport(
        settings.reportTitle,
        "Resumen de Actividad",
        settings.chartType,
        reportData,
        {
          Periodo: periodoTexto,
          "Incluye detalles": settings.includeDetails ? "Sí" : "No",
          "Total de productos": dashboardSummary.productsCount.toString(),
          "Total de proveedores": dashboardSummary.providersCount.toString(),
          "Compras mensuales": `$${dashboardSummary.monthlyPurchases.toFixed(
            2
          )}`,
        }
      );

      toast.dismiss(loadingToastId);

      if (pdfUrl) {
        toast.success("Reporte generado correctamente");
        window.open(pdfUrl, "_blank");
      } else {
        toast.error("Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error generating dashboard report:", error);
      toast.error("Error al generar el reporte");
    }
  };

  const getPeriodoTexto = () => {
    switch (timePeriod) {
      case "semanal":
        return "Por semanas";
      case "mensual":
        return "Por meses";
      case "trimestral":
        return "Por trimestres";
      case "anual":
        return "Por años";
      default:
        return "Por trimestres";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to get the appropriate status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "programado":
      case "pendiente":
        return <Clock className="text-yellow-500 w-4 h-4 mr-1" />;
      case "recibido":
      case "completado":
        return <CheckCircle className="text-green-500 w-4 h-4 mr-1" />;
      default:
        return <Clock className="text-gray-500 w-4 h-4 mr-1" />;
    }
  };

  // Helper to get activity icon based on type/modulo
  const getActivityIcon = (activity: any) => {
    switch (activity.modulo?.toLowerCase()) {
      case "productos":
        return <Package className="text-blue-600 w-4 h-4" />;
      case "proveedores":
        return <TruckIcon className="text-green-600 w-4 h-4" />;
      case "usuarios":
        return <Users className="text-purple-600 w-4 h-4" />;
      case "pedidos":
        return <AlertCircle className="text-orange-600 w-4 h-4" />;
      default:
        return <FileText className="text-gray-600 w-4 h-4" />;
    }
  };

  const handleOpenAlertsModal = () => {
    setIsAlertsModalOpen(true);
  };

  const navigateToPedidos = () => {
    navigate("/dashboard/pedidos");
  };

  return (
    <div className="bg-[#FFF8E1]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Panel de Control
        </h1>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Periodo:
          </span>
          <Select
            value={timePeriod}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Products Card */}
        <Card className="flex flex-col items-center p-6">
          {isLoading.summary ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          ) : (
            <>
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Total Productos
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardSummary.productsCount}
              </p>
            </>
          )}
        </Card>

        {/* Active Providers Card */}
        <Card className="flex flex-col items-center p-6">
          {isLoading.summary ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          ) : (
            <>
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <TruckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Proveedores Activos
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardSummary.providersCount}
              </p>
            </>
          )}
        </Card>

        {/* Monthly Purchases Card */}
        <Card className="flex flex-col items-center p-6">
          {isLoading.summary ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          ) : (
            <>
              <div className="rounded-full bg-yellow-100 p-3 mb-4">
                <BarChart2 className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Compras Mensuales
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                ${dashboardSummary.monthlyPurchases.toFixed(2)}
              </p>
              <p
                className={`text-sm mt-2 flex items-center ${
                  dashboardSummary.purchaseGrowthRate >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <span className="mr-1">
                  {dashboardSummary.purchaseGrowthRate >= 0 ? "↑" : "↓"}
                </span>
                {Math.abs(dashboardSummary.purchaseGrowthRate).toFixed(1)}%
                desde el mes pasado
              </p>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart Card */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Compras {getPeriodoTexto()}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1"
            >
              <FileText size={16} />
              Generar Reporte
            </Button>
          </div>

          {/* Filter for zero values */}
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="show-zero-values"
              checked={showZeroValues}
              onCheckedChange={(checked) => setShowZeroValues(checked === true)}
            />
            <label
              htmlFor="show-zero-values"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Mostrar períodos con valor cero
            </label>
          </div>

          <div className="h-80">
            {isLoading.chartData ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#666" }}
                    height={50}
                    tickMargin={10}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: "#666" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#2b632b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No hay datos disponibles para este periodo
              </div>
            )}
          </div>
        </Card>

        {/* Tab Card for Orders and Alerts */}
        <Card>
          <div className="flex mb-4">
            <button
              onClick={() => setSelectedTab("ordenes")}
              className={`px-4 py-2 flex-1 text-center font-medium ${
                selectedTab === "ordenes"
                  ? "text-nutri-green border-b-2 border-nutri-green"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Órdenes Recientes
            </button>
            <button
              onClick={() => setSelectedTab("alertas")}
              className={`px-4 py-2 flex-1 text-center font-medium ${
                selectedTab === "alertas"
                  ? "text-nutri-green border-b-2 border-nutri-green"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Alertas
            </button>
          </div>

          {selectedTab === "ordenes" ? (
            <div className="space-y-4">
              {isLoading.recentOrders ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : recentOrdersData.length > 0 ? (
                recentOrdersData.map((order) => (
                  <div
                    key={order.id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{order.product}</h4>
                        <p className="text-sm text-gray-500">
                          {order.provider}
                        </p>
                      </div>
                      <Badge status={order.status}>
                        {order.status === "pendiente"
                          ? "Pendiente"
                          : order.status === "recibido"
                          ? "Recibido"
                          : order.status === "cancelado"
                          ? "Cancelado"
                          : "En proceso"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{order.quantity}</span>
                      <span className="text-gray-500">
                        {formatDate(order.date)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No hay órdenes en este período
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={navigateToPedidos}
                >
                  Ver Todos los Pedidos
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoading.alerts ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : systemAlerts.length > 0 ? (
                systemAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-md border ${
                      alert.severity === "error"
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <AlertCircle
                      className={`w-5 h-5 mt-0.5 ${
                        alert.severity === "error"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                    <div>
                      <h4 className="font-medium">{alert.message}</h4>
                      {alert.data && (
                        <p className="text-sm text-gray-600">
                          {alert.type === "inventory"
                            ? `Producto: ${alert.data.nombre}`
                            : alert.type === "order"
                            ? `Pedido #${alert.data.id.substring(0, 8)}`
                            : "Alerta del sistema"}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No hay alertas recientes
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleOpenAlertsModal}
                >
                  Ver Todas las Alertas
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* NEW CHARTS SECTION - Now with white backgrounds and functional data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart 1: Product Categories Distribution */}
        <ShadcnCard className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">
              Distribución por Categorías
            </CardTitle>
            <CardDescription>
              Top 5 tipos de productos con más pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isLoading.categories ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={productCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value} pedidos`}
                      contentStyle={{
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                    <Legend />
                  </RechartPieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </ShadcnCard>

        {/* Chart 2: Top Providers */}
        <ShadcnCard className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Top Proveedores</CardTitle>
            <CardDescription>
              Proveedores con mayor volumen de compras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isLoading.topProviders ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topProviders}
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis type="category" dataKey="name" width={90} />
                    <Tooltip
                      formatter={(value) => `$${value}`}
                      contentStyle={{
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                    <Bar dataKey="valor" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </ShadcnCard>

        {/* Chart 3: Inventory vs Orders Trend */}
        <ShadcnCard className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">
              Tendencia Inventario vs Pedidos
            </CardTitle>
            <CardDescription>
              Evolución mensual del inventario y pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={INVENTORY_TREND_DATA}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="stock"
                    name="Stock"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="pedidos"
                    name="Pedidos"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </ShadcnCard>
      </div>

      <div className="grid grid-cols-1 mt-6">
        {/* Recent Activity - Full width */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Actividad Reciente</h3>
            <Button variant="outline" size="sm">
              Ver Todo
            </Button>
          </div>
          <div className="space-y-4">
            {isLoading.activity ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                // Calculate how long ago the activity happened
                const activityDate = new Date(activity.fecha_pedido);
                const now = new Date();
                const diffMs = now.getTime() - activityDate.getTime();
                const diffMins = Math.round(diffMs / 60000);
                const diffHours = Math.round(diffMs / 3600000);
                const diffDays = Math.round(diffMs / 86400000);

                let timeAgo;
                if (diffMins < 60) {
                  timeAgo = `Hace ${diffMins} ${
                    diffMins === 1 ? "minuto" : "minutos"
                  }`;
                } else if (diffHours < 24) {
                  timeAgo = `Hace ${diffHours} ${
                    diffHours === 1 ? "hora" : "horas"
                  }`;
                } else {
                  timeAgo = `Hace ${diffDays} ${
                    diffDays === 1 ? "día" : "días"
                  }`;
                }

                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="bg-blue-100 rounded-full p-2 h-fit">
                      {getActivityIcon(activity)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {activity.producto?.nombre} -{" "}
                        {activity.proveedor?.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {activity.estado === "pendiente"
                          ? "Pendiente de entrega"
                          : activity.estado === "recibido"
                          ? "Pedido recibido"
                          : activity.estado === "cancelado"
                          ? "Pedido cancelado"
                          : "Pedido en proceso"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-gray-500">
                No hay actividad reciente
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Report generation modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onGenerate={handleGenerateReport}
        title="Generar Reporte del Dashboard"
      />

      {/* Alerts modal - New addition */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={allAlerts}
        isLoading={isLoading.allAlerts}
      />
    </div>
  );
};

export default Dashboard;
