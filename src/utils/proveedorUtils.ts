import { supabase } from "@/integrations/supabase/client";
import { Proveedor, ProveedorTipo, ProveedorStatus } from "@/types/database";

// Extended Proveedor type with additional information
export interface ProveedorWithTipo extends Proveedor {
  tipoInfo?: ProveedorTipo | null;
  principalProductType?: string;
  // Add missing properties for Ranking page
  porcentajePedidos?: number;
  pedidosTotales?: number;
  ultimoPedido?: string | null;
  ranking?: number;
}

// Eliminamos la URL por defecto para obligar a usar siempre un icono del sistema
export const getProveedorIconUrl = (
  proveedor: ProveedorWithTipo,
  proveedoresTipos: ProveedorTipo[]
): string => {
  // Try with the principal product type first
  if (proveedor.principalProductType) {
    const tipoConIcono = proveedoresTipos.find(
      (t) =>
        t.nombre.toLowerCase() === proveedor.principalProductType?.toLowerCase()
    );

    if (tipoConIcono && tipoConIcono.icono) {
      return tipoConIcono.icono;
    }
  }

  // If no match with product type, try with provider type
  if (proveedor.tipo) {
    const tipoInfo = proveedoresTipos.find((t) => t.nombre === proveedor.tipo);
    if (tipoInfo && tipoInfo.icono) {
      return tipoInfo.icono;
    }
  }

  // Si no hay coincidencias, usar un icono del sistema basado en el nombre o id del proveedor
  // para generar algo consistente pero único para cada proveedor
  const hash = proveedor.id.charCodeAt(0) % 16; // Usar el primer carácter del ID para determinar un icono
  const iconNames = Object.keys(
    proveedoresTipos.reduce((acc, tipo) => {
      if (tipo.icono) acc[tipo.icono] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Si hay iconos disponibles, seleccionar uno basado en el hash
  if (iconNames.length > 0) {
    const selectedIcon = iconNames[hash % iconNames.length];
    return selectedIcon;
  }

  // Si no hay iconos disponibles en la base de datos, usar "sprout" como último recurso
  return "sprout";
};

// Determine the principal product type for each provider
export const assignPrincipalProductTypes = async (
  proveedores: ProveedorWithTipo[]
) => {
  // Get products to determine principal type
  const { data: productosData } = await supabase
    .from("producto")
    .select("proveedor_id, tipo");

  if (!productosData) return proveedores;

  return proveedores.map((proveedor) => {
    const proveedorProductos = productosData.filter(
      (p) => p.proveedor_id === proveedor.id
    );

    if (proveedorProductos.length > 0) {
      // Count frequency of each product type
      const tiposCounts: Record<string, number> = {};
      proveedorProductos.forEach((p) => {
        if (p.tipo) {
          tiposCounts[p.tipo] = (tiposCounts[p.tipo] || 0) + 1;
        }
      });

      // Find most frequent type
      let maxCount = 0;
      let tipoMasFrecuente = "";

      Object.entries(tiposCounts).forEach(([tipo, count]) => {
        if (count > maxCount) {
          maxCount = count;
          tipoMasFrecuente = tipo;
        }
      });

      return { ...proveedor, principalProductType: tipoMasFrecuente };
    }

    return proveedor;
  });
};

// Calcular estadísticas de proveedores para el dashboard
export const calcularEstadisticasProveedores = async () => {
  try {
    // Obtener proveedores
    const { data: proveedores, error: proveedoresError } = await supabase
      .from("proveedor")
      .select("*");

    if (proveedoresError) throw proveedoresError;

    // Obtener pedidos
    const { data: pedidos, error: pedidosError } = await supabase
      .from("pedido")
      .select("*");

    if (pedidosError) throw pedidosError;

    // Calcular estadísticas
    const proveedoresActivos = proveedores.filter((p) => p.activo).length;

    // Calificación promedio
    const calificacionesValidas = proveedores.filter(
      (p) => p.calificacion !== null && p.calificacion > 0
    );
    const calificacionPromedio =
      calificacionesValidas.length > 0
        ? calificacionesValidas.reduce(
            (sum, p) => sum + (p.calificacion || 0),
            0
          ) / calificacionesValidas.length
        : 0;

    // Proveedores destacados (con calificación >= 4.0)
    const proveedoresDestacados = proveedores.filter(
      (p) => (p.calificacion || 0) >= 4.0
    ).length;

    return {
      totalProveedores: proveedores.length,
      proveedoresActivos,
      calificacionPromedio: Number(calificacionPromedio.toFixed(1)),
      totalPedidos: pedidos.length,
      proveedoresDestacados,
      // En una app real, estos incrementos vendrían de comparar con periodos anteriores
      incrementoProveedores: `+${Math.round(
        (proveedoresActivos / (proveedores.length || 1)) * 12
      )}%`,
      incrementoCalificacion: (calificacionPromedio - 4.4).toFixed(1),
      incrementoPedidos: `+${Math.round(Math.random() * 25)}%`,
      incrementoDestacados: `+${Math.round(
        (proveedoresDestacados / (proveedoresActivos || 1)) * 5
      )}`,
    };
  } catch (error) {
    console.error("Error al calcular estadísticas:", error);
    return {
      totalProveedores: 0,
      proveedoresActivos: 0,
      calificacionPromedio: 0,
      totalPedidos: 0,
      proveedoresDestacados: 0,
      incrementoProveedores: "+0%",
      incrementoCalificacion: "0",
      incrementoPedidos: "+0%",
      incrementoDestacados: "+0",
    };
  }
};

// Enhanced filter providers function with additional filters
export const filterProveedores = (
  proveedores: ProveedorWithTipo[],
  busqueda: string,
  tipo: string,
  estado?: string,
  calificacionMinima?: string,
  direccionFiltro?: string,
  telefonoFiltro?: string,
  correoFiltro?: string
): ProveedorWithTipo[] => {
  let filtered = [...proveedores];

  // Filter by search (nombre)
  if (busqueda) {
    filtered = filtered.filter((p) =>
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Filter by type
  if (tipo && tipo !== "all") {
    filtered = filtered.filter((p) => p.tipo === tipo);
  }

  // Filter by status using the activo property
  if (estado && estado !== "todos") {
    filtered = filtered.filter((p) => {
      // Map the activo boolean to the 'activo'/'inactivo' string status for filtering
      const proveedorEstado: ProveedorStatus = p.activo ? "activo" : "inactivo";
      return proveedorEstado === estado;
    });
  }

  // Filter by minimum rating
  if (calificacionMinima && calificacionMinima !== "todas") {
    const minRating = parseFloat(calificacionMinima);
    filtered = filtered.filter((p) => (p.calificacion || 0) >= minRating);
  }

  // Filter by address
  if (direccionFiltro) {
    filtered = filtered.filter((p) =>
      p.direccion?.toLowerCase().includes(direccionFiltro.toLowerCase())
    );
  }

  // Filter by phone
  if (telefonoFiltro) {
    filtered = filtered.filter((p) =>
      p.telefono?.toLowerCase().includes(telefonoFiltro.toLowerCase())
    );
  }

  // Filter by email
  if (correoFiltro) {
    filtered = filtered.filter((p) =>
      p.correo?.toLowerCase().includes(correoFiltro.toLowerCase())
    );
  }

  return filtered;
};
