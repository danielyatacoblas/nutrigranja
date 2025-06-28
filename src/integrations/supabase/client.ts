// Re-export everything from the individual service files
export { supabase, adminAuthClient } from "./base-client";

// Re-export product services
export {
  productosWithRelations,
  getProductosByProveedor,
  getProductosByProveedores,
  getProveedorProductTypes,
  getTiposProducto,
  createTipoProducto,
  updateTipoProducto,
  deleteTipoProducto,
  searchTiposProducto,
  getUnitsOfMeasure,
  getProductosWithLowStock,
} from "./product-service";

// Re-export provider services
export {
  getAllProveedores,
  getAllProveedoresTipos,
  getAllIconosTiposProveedores,
  getAllPaises,
  getTiposDocumentoPorPais,
  validarFormatoDocumento,
  updateProveedorEstado,
} from "./provider-service";

// Re-export order services
export {
  createPedido,
  getAllPedidos,
  getPedidosByEstado,
  updatePedidoEstado,
  updatePedidoPdfUrl,
  deletePedido,
} from "./order-service";

// Re-export rating services
export {
  getCalificacionesByProducto,
  registrarCalificacion,
} from "./rating-service";

// Re-export user services
export { createUserWithConfirmedEmail } from "./user-service";

// Re-export report services
export {
  generateHistoryReportPdf,
  generateDashboardReport,
  generateRankingReport,
} from "./report-service";

// Re-export notification services
export {
  getUserNotifications,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
} from "./notification-service";

// Import all dashboard service functions
export {
  fetchDashboardSummary,
  fetchRecentOrders,
  fetchUpcomingDeliveries,
  fetchOrdersByMonth,
  fetchTopProviders,
  fetchAlerts,
  fetchTopProductTypes,
} from "./dashboard-service";
