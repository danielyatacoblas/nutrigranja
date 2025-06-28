import { useState, useEffect } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getAllProveedores,
  getAllProveedoresTipos,
  getProductosByProveedores,
} from "@/integrations/supabase/client";
import { Producto } from "@/types/database";
import {
  ProveedorWithTipo,
  assignPrincipalProductTypes,
  filterProveedores,
} from "@/utils/proveedorUtils";
import { filterProductos, extractProductTypes } from "@/utils/productoUtils";
import { supabase } from "@/integrations/supabase/client";

// Import components
import ProveedoresFiltros from "@/components/compra/ProveedoresFiltros";
import ProveedoresGrid from "@/components/compra/ProveedoresGrid";
import ProductosFiltros from "@/components/compra/ProductosFiltros";
import ProductosGrid from "@/components/compra/ProductosGrid";

const Compra = () => {
  // Estado para proveedores
  const [proveedores, setProveedores] = useState<ProveedorWithTipo[]>([]);
  const [proveedoresTipos, setProveedoresTipos] = useState<any[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState<
    ProveedorWithTipo[]
  >([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);

  // Estado de filtros
  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [tipoProveedor, setTipoProveedor] = useState("all");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [tipoProducto, setTipoProducto] = useState("all");
  const [ordenCalificacion, setOrdenCalificacion] = useState<
    "asc" | "desc" | "" | "none"
  >("none");
  const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState<
    string[]
  >([]);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Nuevos estados para filtros de productos
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [pesoUnidad, setPesoUnidad] = useState("");
  const [estadoStock, setEstadoStock] = useState("all");

  // Estados para tipos únicos (para los filtros)
  const [tiposProveedor, setTiposProveedor] = useState<string[]>([]);
  const [tiposProducto, setTiposProducto] = useState<string[]>([]);

  // Estados para loading
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    fetchProveedores();
    fetchProveedoresTipos();
  }, []);

  // Cargar productos cuando cambian los proveedores seleccionados
  useEffect(() => {
    fetchProductos(proveedoresSeleccionados);
  }, [proveedoresSeleccionados]);

  // Cargar proveedores
  const fetchProveedores = async () => {
    try {
      setLoadingProveedores(true);
      const { data: proveedoresData, error } = await getAllProveedores();
      if (error) throw error;

      if (proveedoresData) {
        // --- INICIO: Lógica de cálculo de porcentaje de pedidos ---
        const { data: pedidosData, error: pedidosError } = await supabase
          .from("pedido")
          .select("proveedor_id");

        if (pedidosError) {
          console.error("Error al obtener pedidos:", pedidosError);
          // Si hay un error, continuamos sin los porcentajes
        }

        const totalPedidos = pedidosData?.length || 0;

        const proveedoresConPorcentaje = proveedoresData.map((proveedor) => {
          const pedidosProveedor =
            pedidosData?.filter(
              (pedido) => pedido.proveedor_id === proveedor.id
            ) || [];
          const porcentajePedidos =
            totalPedidos > 0
              ? Math.round((pedidosProveedor.length / totalPedidos) * 100)
              : 0;
          return {
            ...proveedor,
            porcentajePedidos,
          };
        });
        // --- FIN: Lógica de cálculo de porcentaje de pedidos ---

        // Asignar el tipo de producto principal a cada proveedor
        const proveedoresConTipos = await assignPrincipalProductTypes(
          proveedoresConPorcentaje as unknown as ProveedorWithTipo[]
        );

        setProveedores(proveedoresConTipos);
        setProveedoresFiltrados(proveedoresConTipos);

        // Extraer tipos únicos de proveedor
        const tipos = [
          ...new Set(
            proveedoresConTipos.map((p) => p.tipo || "").filter((t) => t)
          ),
        ];
        setTiposProveedor(tipos);
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      toast.error("Error al cargar proveedores");
    } finally {
      setLoadingProveedores(false);
    }
  };

  // Cargar tipos de proveedores
  const fetchProveedoresTipos = async () => {
    try {
      const { data: tiposData, error } = await getAllProveedoresTipos();
      if (error) throw error;

      if (tiposData) {
        setProveedoresTipos(tiposData);
      }
    } catch (error) {
      console.error("Error al cargar tipos de proveedores:", error);
      toast.error("Error al cargar tipos de proveedores");
    }
  };

  // Cargar productos
  const fetchProductos = async (proveedorIds: string[] = []) => {
    try {
      setLoadingProductos(true);
      const { data, error } = await getProductosByProveedores(proveedorIds);
      if (error) throw error;

      if (data) {
        setProductos(data as unknown as Producto[]);
        setProductosFiltrados(data as unknown as Producto[]);

        // Extraer tipos únicos de productos
        setTiposProducto(extractProductTypes(data as unknown as Producto[]));
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoadingProductos(false);
    }
  };

  // Filtrar proveedores
  useEffect(() => {
    const actualTipoProveedor = tipoProveedor === "all" ? "" : tipoProveedor;
    const filtered = filterProveedores(
      proveedores,
      busquedaProveedor,
      actualTipoProveedor
    );
    setProveedoresFiltrados(filtered);
  }, [busquedaProveedor, tipoProveedor, proveedores]);

  // Filtrar productos
  useEffect(() => {
    const actualTipoProducto = tipoProducto === "all" ? "" : tipoProducto;
    const actualOrdenCalificacion =
      ordenCalificacion === "none" ? "" : ordenCalificacion;
    const filtered = filterProductos(
      productos,
      busquedaProducto,
      actualTipoProducto,
      actualOrdenCalificacion as "asc" | "desc" | ""
    );
    setProductosFiltrados(filtered);
  }, [busquedaProducto, tipoProducto, ordenCalificacion, productos]);

  // Seleccionar/deseleccionar un proveedor
  const toggleProveedorSelection = (proveedorId: string) => {
    let newSelection = [...proveedoresSeleccionados];

    if (newSelection.includes(proveedorId)) {
      newSelection = newSelection.filter((id) => id !== proveedorId);
    } else {
      newSelection.push(proveedorId);
    }

    setProveedoresSeleccionados(newSelection);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setProveedoresSeleccionados([]);
    setBusquedaProveedor("");
    setTipoProveedor("all");
    setBusquedaProducto("");
    setTipoProducto("all");
    setOrdenCalificacion("none");
    setMostrarInactivos(false);
    setPrecioMin("");
    setPrecioMax("");
    setPesoUnidad("");
    setEstadoStock("all");
    fetchProductos();
  };

  return (
    <div className="bg-[#FFF8E1] min-h-screen pb-10">
      {/* Panel de filtrado y selección de proveedores */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-nutri-green">Proveedores</h1>

          <div className="flex items-center space-x-2">
            {(proveedoresSeleccionados.length > 0 ||
              mostrarInactivos ||
              busquedaProveedor ||
              tipoProveedor !== "all") && (
              <Button
                onClick={limpiarFiltros}
                variant="outline"
                className="flex items-center"
              >
                <FilterX size={16} className="mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Filtros de proveedor */}
        <ProveedoresFiltros
          busquedaProveedor={busquedaProveedor}
          setBusquedaProveedor={setBusquedaProveedor}
          tipoProveedor={tipoProveedor}
          setTipoProveedor={setTipoProveedor}
          tiposProveedor={tiposProveedor}
          mostrarInactivos={mostrarInactivos}
          setMostrarInactivos={setMostrarInactivos}
        />

        {/* Tarjetas de proveedores */}
        <ProveedoresGrid
          proveedores={proveedoresFiltrados}
          proveedoresSeleccionados={proveedoresSeleccionados}
          toggleProveedorSelection={toggleProveedorSelection}
          proveedoresTipos={proveedoresTipos}
          loading={loadingProveedores}
          mostrarInactivos={mostrarInactivos}
        />
      </div>

      {/* Sección de productos */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-nutri-green">
            Materias Primas
          </h2>

          <ProductosFiltros
            busquedaProducto={busquedaProducto}
            setBusquedaProducto={setBusquedaProducto}
            tipoProducto={tipoProducto}
            setTipoProducto={setTipoProducto}
            ordenCalificacion={ordenCalificacion}
            setOrdenCalificacion={setOrdenCalificacion}
            tiposProducto={tiposProducto}
            precioMin={precioMin}
            setPrecioMin={setPrecioMin}
            precioMax={precioMax}
            setPrecioMax={setPrecioMax}
            pesoUnidad={pesoUnidad}
            setPesoUnidad={setPesoUnidad}
            estadoStock={estadoStock}
            setEstadoStock={setEstadoStock}
          />
        </div>

        {/* Productos */}
        <ProductosGrid
          productos={productosFiltrados}
          loading={loadingProductos}
        />
      </div>
    </div>
  );
};

export default Compra;
