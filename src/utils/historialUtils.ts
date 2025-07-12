import { supabase } from "@/integrations/supabase/client";

export async function registrarHistorial({
  tipo,
  descripcion,
  usuario,
  usuario_id,
  nombres,
  apellidos,
  modulo,
  accion,
  datos,
}: {
  tipo: string;
  descripcion: string;
  usuario: string;
  usuario_id: string;
  nombres: string;
  apellidos: string;
  modulo: string;
  accion: string;
  datos: Record<string, unknown> | null;
}) {
  const nombreCompleto = `${usuario} (${nombres} ${apellidos})`;
  const { error } = await supabase.from("historial").insert([
    {
      tipo,
      descripcion,
      usuario: nombreCompleto,
      usuario_id,
      modulo,
      accion,
      datos,
    },
  ]);
  if (error) {
    console.error("Error registrando historial:", error);
  }
}
