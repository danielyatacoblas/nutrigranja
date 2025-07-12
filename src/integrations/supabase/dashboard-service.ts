/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "./base-client";

// Fetch dashboard summary data
export const fetchDashboardSummary = async () => {
  try {
    // Get total products
    const { data: products, error: productError } = await supabase
      .from("producto")
      .select("*");

    if (productError) throw productError;

    // Get total providers
    const { data: providers, error: providerError } = await supabase
      .from("proveedor")
      .select("*");

    if (providerError) throw providerError;

    // Get pending orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: pendingOrders, error: pendingError } = await supabase
      .from("pedido")
      .select("*")
      .eq("estado", "pendiente")
      .gte("fecha_pedido", thirtyDaysAgo.toISOString());

    if (pendingError) throw pendingError;

    // Get completed orders in last 30 days
    const { data: completedOrders, error: completedError } = await supabase
      .from("pedido")
      .select("*")
      .eq("estado", "recibido")
      .gte("fecha_pedido", thirtyDaysAgo.toISOString());

    if (completedError) throw completedError;

    // Calculate total orders value
    const allOrders = [...pendingOrders, ...completedOrders];
    const totalValue = allOrders.reduce(
      (sum, order) => sum + (order.precio_total || 0),
      0
    );

    // Also get recent orders to include in the summary
    const { data: recentOrders } = await supabase
      .from("pedido")
      .select("*")
      .order("fecha_pedido", { ascending: false })
      .limit(5);

    return {
      totalProducts: products.length,
      totalProviders: providers.length,
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      totalOrdersValue: totalValue,
      recentOrders: recentOrders || [],
      purchaseGrowthRate: 5.2, // Placeholder value, would normally be calculated
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

// Fetch recent orders
export const fetchRecentOrders = async (limit = 5, userId?: string) => {
  try {
    let query = supabase
      .from("pedido")
      .select(`*, proveedor:proveedor_id (*)`)
      .order("fecha_pedido", { ascending: false })
      .limit(limit);
    if (userId) {
      query = query.eq("usuario_id", userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    // Solo pedidos realizados o completados
    const filtered = (data || []).filter(
      (pedido) => pedido.estado === "pendiente" || pedido.estado === "recibido"
    );
    // Eliminar el id antes de devolver
    const mapped = filtered.map(({ id, ...rest }) => rest);
    return mapped;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw error;
  }
};

// Fetch upcoming deliveries
export const fetchUpcomingDeliveries = async (limit = 5) => {
  try {
    const today = new Date();

    const { data, error } = await supabase
      .from("pedido")
      .select(
        `
        *,
        producto:producto_id (*),
        proveedor:proveedor_id (*)
      `
      )
      .eq("estado", "pendiente")
      .order("fecha_pedido", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching upcoming deliveries:", error);
    throw error;
  }
};

// Fetch chart data for orders by time period with option to filter zero values
export const fetchOrdersByMonth = async (
  period: "semanal" | "mensual" | "trimestral" | "anual" = "trimestral",
  showZeroValues: boolean = true
) => {
  try {
    // Define date ranges based on the selected period
    const today = new Date();
    const fromDate = new Date();
    const periods = [];

    // Set default range based on period
    switch (period) {
      case "semanal":
        // For weekly: show current month by weeks
        fromDate.setDate(1); // First day of current month
        break;

      case "mensual":
        // For monthly: show last 6 months
        fromDate.setMonth(fromDate.getMonth() - 5);
        fromDate.setDate(1); // First day of month
        break;

      case "trimestral":
        // For quarterly: show last 4 quarters
        fromDate.setMonth(fromDate.getMonth() - 9); // Go back 3 quarters from current one
        // Adjust to start of quarter
        fromDate.setMonth(Math.floor(fromDate.getMonth() / 3) * 3);
        fromDate.setDate(1);
        break;

      case "anual":
        // For yearly: show current year
        fromDate.setMonth(0); // January
        fromDate.setDate(1); // First day of year
        break;
    }

    // Set time to beginning of day
    fromDate.setHours(0, 0, 0, 0);

    // Fetch orders within date range
    console.log(
      `Fetching orders from ${fromDate.toISOString()} to ${today.toISOString()}`
    );

    const { data, error } = await supabase
      .from("pedido")
      .select("precio_total, fecha_pedido, estado")
      .gte("fecha_pedido", fromDate.toISOString())
      .eq("estado", "recibido"); // Only consider completed orders

    if (error) throw error;

    console.log(`Found ${data?.length || 0} orders in the date range`);

    // Generate period labels based on the selected time period
    switch (period) {
      case "semanal": {
        // Generate weeks in the current month
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Calculate number of weeks in the month
        const numWeeks = Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7);

        for (let i = 0; i < numWeeks; i++) {
          const weekStart = new Date(firstDay);
          weekStart.setDate(firstDay.getDate() + i * 7 - firstDay.getDay() + 1);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          // Check if this week is within the month
          if (
            weekStart.getMonth() === today.getMonth() ||
            weekEnd.getMonth() === today.getMonth()
          ) {
            const weekStartFormatted = `${weekStart.getDate()}/${
              weekStart.getMonth() + 1
            }`;
            const weekEndFormatted = `${weekEnd.getDate()}/${
              weekEnd.getMonth() + 1
            }`;

            const periodName = `${weekStartFormatted}-${weekEndFormatted}`;

            periods.push({
              name: periodName,
              startDate: new Date(weekStart),
              endDate: new Date(weekEnd),
            });
          }
        }
        break;
      }

      case "mensual": {
        // For monthly, only include the current month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Create period object for just the current month
        const monthDate = new Date(currentYear, currentMonth, 1);
        const periodName = monthDate.toLocaleDateString("es-ES", {
          month: "long",
        });

        // Get first and last day of month
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        periods.push({
          name: periodName.charAt(0).toUpperCase() + periodName.slice(1), // Capitalize first letter
          startDate,
          endDate,
        });
        break;
      }

      case "trimestral": {
        // Generate last 4 quarters
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const monthNames = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];
        for (let i = 0; i < 4; i++) {
          const quarterOffset = i - 3; // Start from 3 quarters ago
          const quarterNumber = ((currentQuarter + quarterOffset + 4) % 4) + 1; // Ensure it's 1-4
          const quarterYear =
            today.getFullYear() +
            Math.floor((currentQuarter + quarterOffset) / 4);

          // Calculate quarter start and end dates
          const startMonth = (quarterNumber - 1) * 3;
          const endMonth = startMonth + 2;
          const startDate = new Date(quarterYear, startMonth, 1);
          const endDate = new Date(quarterYear, startMonth + 3, 0);

          // Etiqueta: 'Enero-Marzo 2024', etc.
          const periodName = `${monthNames[startMonth]}-${monthNames[endMonth]} ${quarterYear}`;

          periods.push({
            name: periodName,
            startDate,
            endDate,
          });
        }
        break;
      }

      case "anual": {
        // Show current year months
        for (let month = 0; month < 12; month++) {
          const monthDate = new Date(today.getFullYear(), month, 1);
          const monthName = monthDate.toLocaleDateString("es-ES", {
            month: "long",
          });

          // Get first and last day of month
          const startDate = new Date(today.getFullYear(), month, 1);
          const endDate = new Date(today.getFullYear(), month + 1, 0);

          periods.push({
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1), // Capitalize first letter
            startDate,
            endDate,
          });
        }
        break;
      }
    }

    // Calculate values for each period
    let result = periods.map((periodInfo) => {
      // Filter orders in this period
      const periodOrders =
        data?.filter((order) => {
          const orderDate = new Date(order.fecha_pedido);
          return (
            orderDate >= periodInfo.startDate && orderDate <= periodInfo.endDate
          );
        }) || [];

      // Calculate total value for the period
      const totalValue = periodOrders.reduce(
        (sum, order) => sum + Number(order.precio_total),
        0
      );

      return {
        name: periodInfo.name,
        value: totalValue,
      };
    });

    // Filter out zero values if requested
    if (!showZeroValues) {
      // Filter out periods with zero value
      result = result.filter((item) => item.value > 0);

      // If no periods have value and it's not monthly period, show at least one period
      if (result.length === 0 && period !== "mensual") {
        // Find closest period with data or show the latest period
        const nonEmptyPeriods = periods.map((periodInfo, index) => {
          const periodOrders =
            data?.filter((order) => {
              const orderDate = new Date(order.fecha_pedido);
              return (
                orderDate >= periodInfo.startDate &&
                orderDate <= periodInfo.endDate
              );
            }) || [];

          const totalValue = periodOrders.reduce(
            (sum, order) => sum + Number(order.precio_total),
            0
          );

          return {
            index,
            name: periodInfo.name,
            value: totalValue,
            endDate: periodInfo.endDate,
          };
        });

        // Sort by end date (most recent first)
        nonEmptyPeriods.sort(
          (a, b) => b.endDate.getTime() - a.endDate.getTime()
        );

        if (nonEmptyPeriods.length > 0) {
          result = [
            { name: nonEmptyPeriods[0].name, value: nonEmptyPeriods[0].value },
          ];
        } else {
          // If still no data, just show the current period with 0
          result = [{ name: periods[0].name, value: 0 }];
        }
      }
    }

    console.log("Chart data result:", result);

    return result;
  } catch (error) {
    console.error("Error fetching orders by month:", error);
    return [];
  }
};

// Fetch top providers
export const fetchTopProviders = async (limit = 5) => {
  try {
    // Get all providers
    const { data: providers, error: providerError } = await supabase
      .from("proveedor")
      .select("*");

    if (providerError) throw providerError;

    // Get all orders
    const { data: orders, error: orderError } = await supabase
      .from("pedido")
      .select("*");

    if (orderError) throw orderError;

    // Calculate metrics for each provider
    const providersWithStats = providers.map((provider) => {
      const providerOrders = orders.filter(
        (order) => order.proveedor_id === provider.id
      );
      const total = providerOrders.reduce(
        (sum, order) => sum + (order.precio_total || 0),
        0
      );

      return {
        ...provider,
        pedidosTotales: providerOrders.length,
        valorTotal: total,
      };
    });

    // Sort by total value and get top N
    return providersWithStats
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top providers:", error);
    throw error;
  }
};

// Fetch alert notifications with configurable limit
export const fetchAlerts = async (limit = 3) => {
  try {
    // Get low inventory alerts (stock <= stock_alert)
    const { data: lowInventory, error: inventoryError } = await supabase
      .from("producto")
      .select("*");

    if (inventoryError) throw inventoryError;

    // Get pending orders past expected delivery date
    const today = new Date();

    const { data: lateOrders, error: orderError } = await supabase
      .from("pedido")
      .select(
        `
        *,
        proveedor:proveedor_id (*)
      `
      )
      .eq("estado", "pendiente")
      .order("fecha_pedido", { ascending: false });

    if (orderError) throw orderError;

    // Combine alerts
    const alerts = [
      ...lowInventory
        .filter(
          (product) =>
            product.stock === 0 || product.stock <= product.stock_alert
        )
        .map((product) => ({
          type: "inventory",
          message:
            product.stock === 0
              ? `¡Sin stock! El producto ${product.nombre} está agotado.`
              : `Stock bajo para ${product.nombre}: ${product.stock} unidades (límite: ${product.stock_alert})`,
          date: new Date().toISOString(),
          severity: product.stock === 0 ? "error" : "warning",
          data: product,
        })),
      ...lateOrders
        .map((order) => {
          const daysLate = Math.floor(
            (today.getTime() - new Date(order.fecha_pedido).getTime()) /
              (1000 * 3600 * 24)
          );
          if (daysLate > 7) {
            return {
              type: "order",
              message: `Pedido #${order.id.substring(
                0,
                8
              )} retrasado ${daysLate} días`,
              date: order.fecha_pedido,
              severity: "error",
              data: order,
            };
          }
          return null;
        })
        .filter(Boolean),
    ];

    return alerts.slice(0, limit);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};

// Fetch top 5 product types by order count
export const fetchTopProductTypes = async (limit = 5) => {
  try {
    // Get all orders to count products by type
    const { data: orders, error: orderError } = await supabase
      .from("pedido")
      .select("producto_id");

    if (orderError) throw orderError;

    // Get all products with their types
    const { data: products, error: productError } = await supabase
      .from("producto")
      .select("id, tipo");

    if (productError) throw productError;

    // Count orders by product type
    const typeOrderCounts: Record<string, { count: number; color?: string }> =
      {};

    // Map product IDs to their types
    const productTypeMap = new Map();
    products.forEach((product) => {
      productTypeMap.set(product.id, product.tipo || "Sin clasificar");
    });

    // Count orders by product type
    orders.forEach((order) => {
      const productType =
        productTypeMap.get(order.producto_id) || "Sin clasificar";
      if (!typeOrderCounts[productType]) {
        typeOrderCounts[productType] = { count: 0 };
      }
      typeOrderCounts[productType].count += 1;
    });

    // Assign colors to each type
    const categoryColors = {
      Frutas: "#2196F3",
      Verduras: "#4CAF50",
      Lácteos: "#FFC107",
      Carnes: "#F44336",
      "Sin clasificar": "#9E9E9E",
    };

    // Convert to array and sort by count (descending)
    const sortedTypes = Object.entries(typeOrderCounts)
      .map(([name, { count }]) => ({
        name,
        value: count,
        color:
          (categoryColors as any)[name] ||
          `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

    return sortedTypes;
  } catch (error) {
    console.error("Error fetching top product types:", error);
    return [];
  }
};
