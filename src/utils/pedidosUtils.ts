
import { ExportPedidosSettings } from "@/components/pedidos/ExportPedidosModal";
import { PedidosAdvancedFilters } from "@/components/pedidos/PedidosAdvancedFilter";

// Filter pedidos by the export settings criteria
export const filterPedidosByExportSettings = (pedidos: any[], settings: ExportPedidosSettings) => {
  let filtered = [...pedidos];
  
  // Filter by status
  if (settings.status !== 'all') {
    filtered = filtered.filter(pedido => pedido.estado === settings.status);
  }
  
  // Filter by time frame
  const now = new Date();
  let startDate: Date | undefined;
  
  switch (settings.timeFrame) {
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'custom':
      startDate = settings.startDate;
      break;
    default:
      // 'all' - no filtering
      break;
  }
  
  if (startDate) {
    filtered = filtered.filter(pedido => new Date(pedido.fecha_pedido) >= startDate!);
  }
  
  if (settings.timeFrame === 'custom' && settings.endDate) {
    const endDatePlusOne = new Date(settings.endDate);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1); // Include the end date
    filtered = filtered.filter(pedido => new Date(pedido.fecha_pedido) < endDatePlusOne);
  }
  
  return filtered;
};

// Apply advanced filters to pedidos
export const applyAdvancedFilters = (pedidos: any[], filters: PedidosAdvancedFilters) => {
  let filtered = [...pedidos];

  // Filter by date range
  if (filters.fechaInicio) {
    filtered = filtered.filter(pedido => new Date(pedido.fecha_pedido) >= filters.fechaInicio!);
  }
  
  if (filters.fechaFin) {
    const endDatePlusOne = new Date(filters.fechaFin);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
    filtered = filtered.filter(pedido => new Date(pedido.fecha_pedido) < endDatePlusOne);
  }

  // Filter by producto
  if (filters.productoId && filters.productoId !== 'all') {
    filtered = filtered.filter(pedido => pedido.producto_id === filters.productoId);
  }

  // Filter by proveedor
  if (filters.proveedorId && filters.proveedorId !== 'all') {
    filtered = filtered.filter(pedido => pedido.proveedor_id === filters.proveedorId);
  }

  return filtered;
};

// Sort pedidos based on criteria
export const sortPedidos = (pedidos: any[], sortField: string, sortDirection: 'asc' | 'desc') => {
  return [...pedidos].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (sortField) {
      case 'fecha_pedido':
        valueA = new Date(a.fecha_pedido);
        valueB = new Date(b.fecha_pedido);
        break;
      case 'producto':
        valueA = a.producto?.nombre || '';
        valueB = b.producto?.nombre || '';
        break;
      case 'proveedor':
        valueA = a.proveedor?.nombre || '';
        valueB = b.proveedor?.nombre || '';
        break;
      case 'cantidad':
        valueA = a.cantidad || 0;
        valueB = b.cantidad || 0;
        break;
      case 'precio_total':
        valueA = a.precio_total || 0;
        valueB = b.precio_total || 0;
        break;
      default:
        valueA = a[sortField];
        valueB = b[sortField];
    }

    // Handle comparison
    if (valueA < valueB) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Format pedidos for different export types
export const formatPedidosForDetailedExport = (pedidos: any[], settings: ExportPedidosSettings) => {
  return pedidos.map(pedido => {
    const formattedPedido: Record<string, any> = {
      ID: pedido.id.substring(0, 8),
      'Fecha Pedido': new Date(pedido.fecha_pedido).toLocaleDateString(),
      'Estado': pedido.estado === 'pendiente' ? 'Pendiente' : 'Recibido',
      'Cantidad': pedido.cantidad || 0,
      'Precio Total': pedido.precio_total ? `$${pedido.precio_total.toFixed(2)}` : '$0.00',
    };
    
    if (settings.includeProductDetails && pedido.producto) {
      formattedPedido['Producto'] = pedido.producto?.nombre || 'N/A';
      formattedPedido['Tipo Producto'] = pedido.producto?.tipo || 'N/A';
    }
    
    if (settings.includeProviderDetails && pedido.proveedor) {
      formattedPedido['Proveedor'] = pedido.proveedor?.nombre || 'N/A';
      formattedPedido['RUC Proveedor'] = pedido.proveedor?.ruc || 'N/A';
      formattedPedido['Teléfono Proveedor'] = pedido.proveedor?.telefono || 'N/A';
    }
    
    return formattedPedido;
  });
};

// Format pedidos for simple export
export const formatPedidosForSimpleExport = (pedidos: any[]) => {
  return pedidos.map(pedido => ({
    Producto: pedido.producto?.nombre || 'N/A',
    Proveedor: pedido.proveedor?.nombre || 'N/A',
    Cantidad: pedido.cantidad || 0,
    'Precio Total': pedido.precio_total ? `$${pedido.precio_total.toFixed(2)}` : '$0.00',
    'Estado': pedido.estado === 'pendiente' ? 'Pendiente' : 'Recibido',
    'Fecha Pedido': new Date(pedido.fecha_pedido).toLocaleDateString(),
  }));
};
