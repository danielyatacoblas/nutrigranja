
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';

// Create a Supabase client with the service role key
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Received request to increment-stock function');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Validate request method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Only POST requests are accepted.' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { productId, quantity } = requestBody;
    
    // Validate required fields
    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: productId' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (quantity === undefined || typeof quantity !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid field: quantity (must be a number)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Incrementing stock for product ${productId} by ${quantity} units`);
    
    // Get current stock
    const { data: product, error: getError } = await supabaseClient
      .from('producto')
      .select('stock')
      .eq('id', productId)
      .single();
    
    if (getError) {
      console.error('Error getting product:', getError);
      return new Response(
        JSON.stringify({ error: 'Error getting product', details: getError }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!product) {
      return new Response(
        JSON.stringify({ error: `Product with ID ${productId} not found` }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate new stock value
    const newStock = (product?.stock || 0) + quantity;
    console.log(`Updating stock from ${product?.stock || 0} to ${newStock}`);
    
    // Update product stock
    const { data, error: updateError } = await supabaseClient
      .from('producto')
      .update({ stock: newStock })
      .eq('id', productId)
      .select();
    
    if (updateError) {
      console.error('Error updating stock:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error updating stock', details: updateError }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stock updated', 
        oldStock: product?.stock, 
        newStock 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in increment-stock function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
