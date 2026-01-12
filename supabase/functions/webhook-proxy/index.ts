import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_BASE = 'https://n8n.zhi-nao.com/webhook';

// 积分消耗定价
const CREDIT_COSTS: Record<string, number> = {
  monitoring: 2,  // 每个模型消耗 2 积分
  diagnosis: 5,   // 归因诊断消耗 5 积分
  simulation: 3,  // 策略模拟消耗 3 积分
};

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

    // Calculate credit cost
    let creditCost = CREDIT_COSTS[endpoint] || 0;
    
    // For monitoring, multiply by number of models
    if (endpoint === 'monitoring' && payload?.selected_models) {
      try {
        const models = JSON.parse(payload.selected_models);
        if (Array.isArray(models)) {
          creditCost = CREDIT_COSTS.monitoring * models.length;
        }
      } catch (e) {
        console.log('[webhook-proxy] Could not parse selected_models, using default cost');
      }
    }

    console.log(`[webhook-proxy] Credit cost for ${endpoint}: ${creditCost}`);

    // Create admin client for credit operations (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Deduct credits using the database function
    const referenceId = payload?.job_id || payload?.diagnosis_id || payload?.scan_result_id || null;
    const description = `${endpoint === 'monitoring' ? 'GEO 扫描' : endpoint === 'diagnosis' ? '归因诊断' : '策略模拟'}`;

    const { data: deductResult, error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: creditCost,
      p_reference_type: endpoint === 'monitoring' ? 'scan_job' : endpoint,
      p_reference_id: referenceId,
      p_description: description,
    });

    if (deductError) {
      console.error('[webhook-proxy] Credit deduction error:', deductError);
      return new Response(
        JSON.stringify({ success: false, error: 'Credit deduction failed', details: deductError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[webhook-proxy] Deduct result:', deductResult);

    // Check if deduction was successful
    if (!deductResult?.success) {
      console.log('[webhook-proxy] Insufficient credits:', deductResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'insufficient_credits',
          current_balance: deductResult?.current_balance || 0,
          required: deductResult?.required || creditCost,
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[webhook-proxy] Credits deducted successfully. New balance: ${deductResult.new_balance}`);

    // Get the webhook secret from environment
    const webhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[webhook-proxy] N8N_WEBHOOK_SECRET not configured');
      // Refund credits since we can't proceed
      await supabaseAdmin.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reference_type: endpoint === 'monitoring' ? 'scan_job' : endpoint,
        p_reference_id: referenceId,
        p_description: `${description} - 配置错误退款`,
      });
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
      // Refund credits on webhook failure
      await supabaseAdmin.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reference_type: endpoint === 'monitoring' ? 'scan_job' : endpoint,
        p_reference_id: referenceId,
        p_description: `${description} - Webhook 调用失败退款`,
      });
      return new Response(
        JSON.stringify({ success: false, error: `Webhook error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[webhook-proxy] Successfully called ${endpoint}`);
    return new Response(
      JSON.stringify({ 
        success: true,
        new_balance: deductResult.new_balance,
        credits_used: creditCost,
      }),
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
