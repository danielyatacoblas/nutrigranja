
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Chat Assistant Function Started ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(JSON.stringify({ 
        error: 'No authorization header',
        response: 'Error de autenticación. Por favor, vuelve a iniciar sesión.'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    // Create a client for auth verification with anon key
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ 
        error: 'Authentication failed',
        response: 'Error de autenticación. Por favor, vuelve a iniciar sesión.'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user) {
      console.error('No user found');
      return new Response(JSON.stringify({ 
        error: 'User not found',
        response: 'Usuario no encontrado. Por favor, vuelve a iniciar sesión.'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id);

    const requestBody = await req.json();
    const { message } = requestBody;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error('Invalid message:', message);
      return new Response(JSON.stringify({ 
        error: 'Invalid message',
        response: 'Por favor, envía un mensaje válido.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing message from user:', user.id, 'Message length:', message.length);

    // Use service role key to query assistant_config
    const { data: userConfig, error: configError } = await supabaseClient
      .from('assistant_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Config query result - error:', configError, 'data present:', !!userConfig);

    if (configError && configError.code !== 'PGRST116') {
      console.error('Config query error:', configError);
      return new Response(JSON.stringify({ 
        error: 'Database error',
        response: 'Error al acceder a la configuración. Por favor, intenta nuevamente.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!userConfig || !userConfig.api_key) {
      console.log('No API key configured for user:', user.id);
      return new Response(JSON.stringify({ 
        error: 'API key no configurada',
        response: 'Para usar el asistente, necesitas configurar tu API key de OpenAI. Ve a la configuración del asistente y agrega tu API key.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User config found, API key present:', !!userConfig.api_key);

    const assistantConfig = {
      model: userConfig.model || 'gpt-4o-mini',
      detail_level: userConfig.detail_level || 'medium',
      tone: userConfig.tone || 'professional',
      max_tokens: userConfig.max_tokens || 1000
    };

    // Sistema de instrucciones con restricciones específicas
    const systemPrompt = `Eres el Asistente Virtual de NutriGranja, un sistema de gestión para granjas y proveedores de materiales.

ALCANCE PERMITIDO:
1. Generar reportes simplificados del sistema NutriGranja
2. Buscar y recomendar proveedores de materiales agrícolas
3. Explicar funcionalidades del sistema (pedidos, inventario, proveedores, productos)
4. Ayudar con navegación y uso del sistema

RESTRICCIONES ESTRICTAS:
- NO generes ni analices código
- NO respondas temas ajenos al sistema o proveedores agrícolas
- NO proporciones información médica, legal o financiera
- NO discutas temas políticos, religiosos o controvertidos

CONFIGURACIÓN ACTUAL:
- Nivel de detalle: ${assistantConfig.detail_level}
- Tono: ${assistantConfig.tone}

Si te preguntan algo fuera de tu alcance, responde amablemente que solo puedes ayudar con temas relacionados al sistema NutriGranja y búsqueda de proveedores.`;

    console.log('Calling OpenAI API with model:', assistantConfig.model);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: assistantConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: assistantConfig.max_tokens,
        temperature: assistantConfig.tone === 'formal' ? 0.3 : assistantConfig.tone === 'friendly' ? 0.7 : 0.5,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('OpenAI API error:', response.status, errorData);
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'API key inválida',
          response: 'Tu API key de OpenAI parece ser inválida. Por favor, verifica que sea correcta en la configuración del asistente.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          response: 'Has excedido el límite de solicitudes de tu API key. Por favor, intenta nuevamente en unos momentos.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'OpenAI API error',
        response: 'Error al comunicarse con OpenAI. Por favor, verifica tu API key e intenta nuevamente.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response',
        response: 'Respuesta inválida de OpenAI. Por favor, intenta nuevamente.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const assistantResponse = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    console.log('OpenAI response received successfully, tokens used:', tokensUsed);

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      model_used: assistantConfig.model,
      tokens_used: tokensUsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== Error in chat-assistant function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      response: 'Lo siento, ocurrió un error interno del servidor. Por favor, intenta nuevamente.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
