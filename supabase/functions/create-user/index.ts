import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

// CORS headers para compatibilidad con navegadores
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Esta función se ejecutará en la infraestructura Edge Functions de Supabase
serve(async (req: Request) => {
  // Manejar solicitudes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const SUPABASE_URL = "https://mtsyuzvqnpdeqfeqpixv.supabase.co";
  const SERVICE_ROLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c3l1enZxbnBkZXFmZXFwaXh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTY4MzgxOSwiZXhwIjoyMDYxMjU5ODE5fQ.3AOuGbDy-AGjK7f13E0gzaFS2IXKbrTc4YI0zpjjTb0";

  try {
    // Crear cliente con service role key
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Obtener datos de la solicitud
    const { email, password, nombres, apellidos, usuario, dni, telefono, rol } =
      await req.json();

    // Validar datos de entrada
    if (!email || typeof email !== "string" || !email.trim()) {
      return new Response(JSON.stringify({ error: "El email es requerido" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return new Response(
        JSON.stringify({
          error: "La contraseña debe tener al menos 6 caracteres",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verificar si el usuario ya existe
    try {
      const { data: existingUser, error: checkError } =
        await supabaseAdmin.auth.signInWithPassword({
          email: cleanEmail,
          password: "check-password-not-real", // Contraseña falsa para verificar
        });

      if (!checkError) {
        // Si no hay error, signInWithPassword fue exitoso, lo que significaría que el usuario existe
        return new Response(
          JSON.stringify({
            error: "Ya existe un usuario con este correo electrónico",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } else if (checkError.message !== "Invalid login credentials") {
        // Si es un error diferente a credenciales inválidas, puede ser otro problema
        console.error("❌ Error al verificar usuario:", checkError.message);
      }
      // Si el error es "Invalid login credentials", significa que el usuario no existe, así que continuamos
    } catch (err) {
      // Si hay una excepción, asumimos que es porque el usuario no existe y continuamos
      console.log("✅ Usuario no existe, procediendo a crear");
    }

    // Preparar datos para la tabla usuarios - asegurándonos que no haya campos vacíos
    const userNombres = nombres?.trim() || "Usuario";
    const userApellidos = apellidos?.trim() || "Nuevo";
    const userUsuario = usuario?.trim() || cleanEmail;
    const userRol = rol || "usuario";

    console.log("📝 Datos para tabla usuarios preparados:", {
      nombres: userNombres,
      apellidos: userApellidos,
      usuario: userUsuario,
    });

    // Crear el usuario en auth con email confirmado
    console.log("🔑 Creando usuario en auth con email confirmado...");
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          nombres: userNombres,
          apellidos: userApellidos,
          usuario: userUsuario,
          dni: dni || null,
          telefono: telefono || null,
          rol: userRol,
        },
      });

    if (createError) {
      let errorMsg = createError.message;
      if (
        errorMsg?.toLowerCase().includes("user already registered") ||
        errorMsg?.toLowerCase().includes("duplicate key value") ||
        errorMsg?.toLowerCase().includes("already exists")
      ) {
        errorMsg = "Ya existe un usuario con este correo electrónico";
      }

      return new Response(
        JSON.stringify({
          error: errorMsg,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    if (!userData || !userData.user) {
      console.error("❌ Error: No se pudo crear el usuario");
      return new Response(
        JSON.stringify({ error: "No se pudo crear el usuario" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Insertar en la tabla usuarios manualmente
    console.log("👤 Insertando usuario en tabla usuarios...");
    const { error: insertError } = await supabaseAdmin.from("usuarios").insert({
      id: userData.user.id,
      usuario: userUsuario,
      correo: cleanEmail,
      nombres: userNombres,
      apellidos: userApellidos,
      dni: dni?.trim() || null,
      telefono: telefono?.trim() || null,
      estado: "activo",
      rol: userRol || "usuario",
    });

    if (insertError) {
      console.error("❌ Error al insertar en tabla usuarios:", insertError);
      // Intentar eliminar el usuario de auth ya que fallamos al crear el registro en usuarios
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);

      return new Response(
        JSON.stringify({
          error: "Error al crear el usuario : " + insertError.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Devolver respuesta exitosa
    return new Response(
      JSON.stringify({
        data: {
          user: {
            id: userData.user.id,
            email: cleanEmail,
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (err) {
    console.error("❌ Error inesperado en la función edge:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Ocurrió un error inesperado",
        details: err.toString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
