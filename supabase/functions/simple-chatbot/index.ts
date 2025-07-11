import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { message } = requestBody;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "Invalid message",
          response: "Por favor, envía un mensaje válido.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "API key no configurada",
          response:
            "No se encontró la API key de OpenAI en las variables de entorno.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `Eres el Asistente Virtual de NutriGranja. Ayuda a los usuarios a navegar y entender el sistema, pero no generes código ni respondas temas ajenos a la plataforma.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 800,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: "OpenAI API error",
          response:
            errorData.error?.message || "Error al comunicarse con OpenAI.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const assistantResponse =
      data.choices?.[0]?.message?.content || "Sin respuesta.";

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        response: "Ocurrió un error interno. Intenta nuevamente.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
