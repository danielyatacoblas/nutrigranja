
import { Producto } from '@/types/database';

// Filter products by search term and type
export const filterProductos = (
  productos: Producto[],
  busqueda: string,
  tipo: string,
  ordenCalificacion: 'asc' | 'desc' | ''
): Producto[] => {
  let filtered = [...productos];
  
  // Filter by search
  if (busqueda) {
    filtered = filtered.filter(p => 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
  
  // Filter by type
  if (tipo) {
    filtered = filtered.filter(p => p.tipo === tipo);
  }
  
  // Sort by rating
  if (ordenCalificacion) {
    filtered = [...filtered].sort((a, b) => {
      const calA = a.proveedor?.calificacion || 0;
      const calB = b.proveedor?.calificacion || 0;
      return ordenCalificacion === 'asc' ? calA - calB : calB - calA;
    });
  }
  
  return filtered;
};

// Extract unique product types from list of products
export const extractProductTypes = (productos: Producto[]): string[] => {
  return [...new Set(productos.map(p => p.tipo).filter(t => t))];
};

// Calculate the average rating from multiple rating categories
export const calculateAverageRating = (
  tiempoEntrega: number,
  precio: number,
  calidad: number
): number => {
  return (tiempoEntrega + precio + calidad) / 3;
};

// Filter products by price range
export const filterProductosByPriceRange = (
  productos: Producto[],
  minPrice: number,
  maxPrice: number
): Producto[] => {
  return productos.filter(p => {
    const price = p.precio || 0;
    return price >= minPrice && price <= maxPrice;
  });
};

// Simple pagination - get a page of products
export const paginateProductos = (
  productos: Producto[],
  page: number,
  itemsPerPage: number
): Producto[] => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return productos.slice(startIndex, endIndex);
};

// Group products by type
export const groupProductosByType = (productos: Producto[]): Record<string, Producto[]> => {
  return productos.reduce((grouped, producto) => {
    const type = producto.tipo || 'Sin clasificar';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(producto);
    return grouped;
  }, {} as Record<string, Producto[]>);
};

// Find products with similar attributes (for recommendations)
export const findSimilarProductos = (
  producto: Producto,
  allProductos: Producto[],
  limit: number = 4
): Producto[] => {
  // Filter out the current product
  const otherProductos = allProductos.filter(p => p.id !== producto.id);
  
  // Score each product based on similarity
  const scoredProductos = otherProductos.map(p => {
    let score = 0;
    
    // Same type is a strong indicator of similarity
    if (p.tipo === producto.tipo) score += 5;
    
    // Same provider is also a strong indicator
    if (p.proveedor_id === producto.proveedor_id) score += 4;
    
    // Similar price range (within 20%)
    const productoPrecio = producto.precio || 0;
    const comparePrecio = p.precio || 0;
    
    if (productoPrecio > 0 && comparePrecio > 0) {
      const priceDiff = Math.abs(productoPrecio - comparePrecio) / productoPrecio;
      if (priceDiff <= 0.2) score += 3;
    }
    
    // Similar delivery time
    if (
      producto.tiempo_entrega_desde === p.tiempo_entrega_desde &&
      producto.tiempo_entrega_hasta === p.tiempo_entrega_hasta
    ) {
      score += 2;
    }
    
    return { producto: p, score };
  });
  
  // Sort by score and take the top N
  return scoredProductos
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.producto);
};
