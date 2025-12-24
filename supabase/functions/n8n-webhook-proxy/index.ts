import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Webhook endpoints configuration
const WEBHOOK_ENDPOINTS: Record<string, string> = {
  monitoring: "https://n8n.zhi-nao.com/webhook/monitoring",
  diagnosis: "https://n8n.zhi-nao.com/webhook/diagnosis",
};

// HMAC signature generation
async function generateHMAC(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client to verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { webhook_type, job_id, diagnosis_id, scan_result_id } = body;

    console.log("Received webhook proxy request:", { webhook_type, job_id, diagnosis_id, scan_result_id, user_id: user.id });

    // Validate webhook type
    if (!webhook_type || !WEBHOOK_ENDPOINTS[webhook_type]) {
      console.error("Invalid webhook type:", webhook_type);
      return new Response(
        JSON.stringify({ error: "Invalid webhook type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required parameters based on webhook type
    if (webhook_type === "monitoring" && !job_id) {
      return new Response(
        JSON.stringify({ error: "job_id is required for monitoring webhook" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (webhook_type === "diagnosis" && (!diagnosis_id || !scan_result_id)) {
      return new Response(
        JSON.stringify({ error: "diagnosis_id and scan_result_id are required for diagnosis webhook" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare minimal payload (only IDs, no sensitive data)
    const timestamp = Date.now();
    const payload: Record<string, unknown> = {
      timestamp,
      user_id: user.id,
    };

    if (webhook_type === "monitoring") {
      payload.job_id = job_id;
    } else if (webhook_type === "diagnosis") {
      payload.diagnosis_id = diagnosis_id;
      payload.scan_result_id = scan_result_id;
    }

    // Generate HMAC signature
    const webhookSecret = Deno.env.get("N8N_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("N8N_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payloadString = JSON.stringify(payload);
    const signature = await generateHMAC(payloadString, webhookSecret);

    console.log("Calling N8N webhook:", WEBHOOK_ENDPOINTS[webhook_type]);

    // Call the N8N webhook with authentication
    const webhookResponse = await fetch(WEBHOOK_ENDPOINTS[webhook_type], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Timestamp": timestamp.toString(),
      },
      body: payloadString,
    });

    const responseStatus = webhookResponse.status;
    console.log("N8N webhook response status:", responseStatus);

    if (!webhookResponse.ok) {
      console.error("N8N webhook returned error:", responseStatus);
      return new Response(
        JSON.stringify({ error: "Webhook call failed", status: responseStatus }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook triggered successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in n8n-webhook-proxy:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
