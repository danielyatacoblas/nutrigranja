
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { pais, tipo_documento, numero_documento } = await req.json();
    
    if (!pais || !tipo_documento || !numero_documento) {
      return new Response(
        JSON.stringify({ 
          error: 'Se requieren país, tipo de documento y número de documento' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Obtener formato de validación
    const { data: docData, error: docError } = await supabase
      .from('pais_documentos')
      .select('formato, descripcion')
      .eq('pais', pais)
      .eq('tipo_documento', tipo_documento)
      .single();
    
    if (docError || !docData) {
      return new Response(
        JSON.stringify({ 
          error: `No se encontró el formato para ${tipo_documento} de ${pais}`,
          details: docError 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }
    
    // Validar el formato usando expresión regular
    const formatoRegex = new RegExp(docData.formato);
    const isValid = formatoRegex.test(numero_documento);
    
    return new Response(
      JSON.stringify({ 
        isValid, 
        message: isValid 
          ? 'Documento válido' 
          : `Formato inválido. El formato esperado es: ${docData.descripcion || docData.formato}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
