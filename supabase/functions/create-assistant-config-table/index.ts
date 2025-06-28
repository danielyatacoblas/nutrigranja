
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create assistant_config table
    const { error } = await supabaseClient.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS assistant_config (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          model VARCHAR(50) DEFAULT 'gpt-4o-mini',
          detail_level VARCHAR(20) DEFAULT 'medium',
          tone VARCHAR(20) DEFAULT 'professional',
          max_tokens INTEGER DEFAULT 1000,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
        
        -- Enable RLS
        ALTER TABLE assistant_config ENABLE ROW LEVEL SECURITY;
        
        -- Policy for users to manage their own config
        CREATE POLICY "Users can manage their own assistant config" ON assistant_config
          FOR ALL USING (auth.uid() = user_id);
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
