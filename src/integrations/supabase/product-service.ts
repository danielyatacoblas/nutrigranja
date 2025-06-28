import { supabase } from "./base-client";

export const productosWithRelations = () => {
  return supabase.from("producto").select(`
      *,
      proveedor (*)
    `);
};

export const getProductosByProveedor = (proveedorId: string) => {
  return supabase.from("producto").select("*").eq("proveedor_id", proveedorId);
};

export const getProductosByProveedores = (proveedorIds: string[]) => {
  if (proveedorIds.length === 0) {
    return productosWithRelations();
  }

  return supabase
    .from("producto")
    .select(
      `
      *,
      proveedor (*)
    `
    )
    .in("proveedor_id", proveedorIds);
};

export const getProveedorProductTypes = (proveedorId: string) => {
  return supabase
    .from("producto")
    .select("tipo")
    .eq("proveedor_id", proveedorId);
};

export const getProductosByPriceRange = (
  minPrice: number,
  maxPrice: number
) => {
  return supabase
    .from("producto")
    .select(
      `
      *,
      proveedor (*)
    `
    )
    .gte("precio", minPrice)
    .lte("precio", maxPrice);
};

export const getProductosPaginated = (
  page: number = 1,
  pageSize: number = 10
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return supabase
    .from("producto")
    .select(
      `
      *,
      proveedor (*)
    `,
      { count: "exact" }
    )
    .range(from, to);
};

export const getProductosCount = () => {
  return supabase.from("producto").select("*", { count: "exact", head: true });
};

export const searchProductos = (
  searchTerm: string = "",
  tipo: string = "",
  minPrice: number = 0,
  maxPrice: number = 9999999,
  ordenPor: string = "nombre",
  ordenDireccion: "asc" | "desc" = "asc",
  page: number = 1,
  pageSize: number = 10
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("producto")
    .select(
      `
      *,
      proveedor (*)
    `,
      { count: "exact" }
    )
    .gte("precio", minPrice)
    .lte("precio", maxPrice);

  if (searchTerm) {
    query = query.ilike("nombre", `%${searchTerm}%`);
  }

  if (tipo && tipo !== "todos") {
    query = query.eq("tipo", tipo);
  }

  if (ordenPor === "calificacion") {
    query = query.order("proveedor(calificacion)", {
      ascending: ordenDireccion === "asc",
    });
  } else {
    query = query.order(ordenPor, { ascending: ordenDireccion === "asc" });
  }

  return query.range(from, to);
};

export const fullTextSearchProductos = (
  searchTerm: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return supabase
    .from("producto")
    .select(
      `
      *,
      proveedor (*)
    `,
      { count: "exact" }
    )
    .or(`nombre.ilike.%${searchTerm}%, tipo.ilike.%${searchTerm}%`)
    .range(from, to);
};

// Helper to get products with low stock
export const getProductosWithLowStock = () => {
  return supabase
    .from("producto")
    .select(
      `
      *,
      proveedor (*)
    `
    )
    .lte("stock", "stock_alert")
    .order("stock", { ascending: true });
};

// Helper to update product stock
export const updateProductoStock = (
  productoId: string,
  stock: number,
  stockAlert: number
) => {
  return supabase
    .from("producto")
    .update({
      stock,
      stock_alert: stockAlert,
    })
    .eq("id", productoId);
};

// Helper to get all units of measure from SUNAT standards
export const getUnitsOfMeasure = () => {
  return supabase
    .from("units_of_measure")
    .select("*")
    .order("name", { ascending: true });
};

// Nuevo: Operaciones para tipos de productos
export const getTiposProducto = () => {
  return supabase
    .from("tipo_productos")
    .select("*")
    .order("nombre", { ascending: true });
};

export const createTipoProducto = (nombre: string, descripcion?: string) => {
  return supabase.from("tipo_productos").insert([
    {
      nombre,
      descripcion,
    },
  ]);
};

export const updateTipoProducto = (
  id: string,
  nombre: string,
  descripcion?: string
) => {
  return supabase
    .from("tipo_productos")
    .update({
      nombre,
      descripcion,
      updated_at: new Date().toISOString(), // Fix: Convert Date to ISO string
    })
    .eq("id", id);
};

export const deleteTipoProducto = (id: string) => {
  return supabase.from("tipo_productos").delete().eq("id", id);
};

// Búsqueda de tipos de productos
export const searchTiposProducto = (searchTerm: string) => {
  return supabase
    .from("tipo_productos")
    .select("*")
    .ilike("nombre", `%${searchTerm}%`)
    .order("nombre");
};
