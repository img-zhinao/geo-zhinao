import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_BASE = 'https://n8n.zhi-nao.com/webhook';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with user's auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('[webhook-proxy] Auth error:', authError?.message || 'No user');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[webhook-proxy] Authenticated user: ${user.id}`);

    // Parse request body
    const { endpoint, payload } = await req.json();

    // Validate endpoint
    const allowedEndpoints = ['monitoring', 'diagnosis', 'simulation'];
    if (!endpoint || !allowedEndpoints.includes(endpoint)) {
      console.error('[webhook-proxy] Invalid endpoint:', endpoint);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the webhook secret from environment
    const webhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[webhook-proxy] N8N_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Webhook configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call N8N webhook with secret header
    const webhookUrl = `${N8N_WEBHOOK_BASE}/${endpoint}`;
    console.log(`[webhook-proxy] Calling ${webhookUrl} for user ${user.id}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'zhinao-geo-scan': webhookSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[webhook-proxy] N8N error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ success: false, error: `Webhook error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[webhook-proxy] Successfully called ${endpoint}`);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[webhook-proxy] Exception:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
