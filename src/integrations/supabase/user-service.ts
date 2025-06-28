import { supabase } from "./base-client";

// Helper para crear usuario directamente con email confirmado
export const createUserWithConfirmedEmail = async (
  email: string,
  password: string,
  userData?: {
    usuario?: string;
    nombres?: string;
    apellidos?: string;
    dni?: string;
    telefono?: string;
    rol?: "admin" | "usuario";
  }
) => {
  try {
    console.log("Creando usuario con email confirmado:", email);

    if (!email || !password) {
      console.error("Error: Email y contraseña son requeridos");
      return { data: null, error: "Email y contraseña son requeridos" };
    }

    if (password.length < 6) {
      console.error("Error: La contraseña debe tener al menos 6 caracteres");
      return {
        data: null,
        error: "La contraseña debe tener al menos 6 caracteres",
      };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Asegurarse de que tenemos valores válidos para nombres y apellidos
    const cleanUserData = {
      usuario: userData?.usuario?.trim() || cleanEmail,
      nombres: userData?.nombres?.trim() || "Usuario",
      apellidos: userData?.apellidos?.trim() || "Nuevo",
      dni: userData?.dni?.trim() || null,
      telefono: userData?.telefono?.trim() || null,
      rol: userData?.rol || "usuario",
    };

    // Llamar a la Edge Function para crear usuario con email confirmado
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        email: cleanEmail,
        password: password,
        ...cleanUserData,
      },
    });

    if (error) {
      // Intenta extraer el mensaje real del body de la respuesta
      let errorMsg = error.message || "Error al crear usuario";
      if (error?.context?.response) {
        try {
          const errorBody = await error.context.response.json();
          if (errorBody?.error) errorMsg = errorBody.error;
        } catch (e) {
          // No se pudo parsear el body, ignora
        }
      }
      return {
        data: null,
        error: errorMsg,
      };
    }
    if (data?.error) {
      return {
        data: null,
        error: data.error,
      };
    }

    return { data: data.data, error: null };
  } catch (error) {
    console.error("Error al crear usuario con email confirmado:", error);
    return {
      data: null,
      error: error.message || "Error inesperado al crear usuario",
    };
  }
};
