import { supabase } from "./client";
import { ProveedorStatus } from "@/types/database";

export const getAllProveedores = () => {
  return supabase.from("proveedor").select("*");
};

export const getAllProveedoresTipos = () => {
  return supabase.from("proveedor_tipo").select("*");
};

export const getAllIconosTiposProveedores = async () => {
  const { data, error } = await supabase
    .from("proveedor_tipo")
    .select("nombre, icono");

  if (error) {
    console.error("Error al obtener iconos de tipos de proveedores:", error);
    return [];
  }

  return data || [];
};

export const getAllPaises = async () => {
  try {
    const { data, error } = await supabase
      .from("pais_documentos")
      .select("pais, codigo")
      .order("pais", { ascending: true });

    if (error) throw error;

    // Filter unique countries
    const uniquePaises = Array.from(
      new Map(data.map((item) => [item.pais, item])).values()
    );

    return uniquePaises;
  } catch (error) {
    console.error("Error fetching países:", error);
    throw error;
  }
};

export const getTiposDocumentoPorPais = async (pais: string) => {
  try {
    const { data, error } = await supabase
      .from("pais_documentos")
      .select("*")
      .eq("pais", pais)
      .order("tipo_documento", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching tipos de documento:", error);
    throw error;
  }
};

export const validarFormatoDocumento = async (
  tipoDocumento: string,
  numeroDocumento: string,
  pais: string
) => {
  try {
    const { data, error } = await supabase
      .from("pais_documentos")
      .select("formato")
      .eq("tipo_documento", tipoDocumento)
      .eq("pais", pais)
      .maybeSingle();

    if (error) throw error;

    if (!data) return false;

    const regexPattern = new RegExp(data.formato);
    return regexPattern.test(numeroDocumento);
  } catch (error) {
    console.error("Error validating document format:", error);
    return true;
  }
};

export const updateProveedorEstado = async (
  proveedorId: string,
  estado: ProveedorStatus
) => {
  try {
    const { error } = await supabase
      .from("proveedor")
      .update({ activo: estado === "activo" })
      .eq("id", proveedorId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating provider status:", error);
    throw error;
  }
};
