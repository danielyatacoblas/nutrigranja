
import { supabase } from './base-client';
import { calculateAverageRating } from '@/utils/productoUtils';

// Helper to get ratings by product
export const getCalificacionesByProducto = (productoId: string) => {
  return supabase
    .from('calificacion')
    .select('*')
    .eq('producto_id', productoId);
};

// Helper to register a rating
export const registrarCalificacion = async (calificacionData: {
  producto_id: string;
  proveedor_id: string;
  comentario?: string;
  tiempo_entrega: number;
  precio: number;
  calidad: number;
}) => {
  // Register the rating
  const { data, error } = await supabase
    .from('calificacion')
    .insert(calificacionData)
    .select();
    
  if (error) return { error };
  
  // Calculate average rating
  const avgRating = calculateAverageRating(
    calificacionData.tiempo_entrega,
    calificacionData.precio,
    calificacionData.calidad
  );
  
  // Update provider rating
  try {
    // Get all ratings for this provider
    const { data: ratings, error: ratingsError } = await supabase
      .from('calificacion')
      .select('tiempo_entrega, precio, calidad')
      .eq('proveedor_id', calificacionData.proveedor_id);
      
    if (ratingsError) throw ratingsError;
    
    // Calculate provider overall rating based on all ratings
    let overallRating = 0;
    if (ratings && ratings.length > 0) {
      const totalRating = ratings.reduce((sum, rating) => {
        const ratingAvg = (rating.tiempo_entrega + rating.precio + rating.calidad) / 3;
        return sum + ratingAvg;
      }, 0);
      
      overallRating = totalRating / ratings.length;
    } else {
      overallRating = avgRating;
    }
    
    // Update provider rating
    await supabase
      .from('proveedor')
      .update({ calificacion: overallRating })
      .eq('id', calificacionData.proveedor_id);
      
  } catch (providerError) {
    console.error('Error updating provider rating:', providerError);
  }
  
  return { data };
};
