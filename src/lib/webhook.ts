/**
 * Unified N8N Webhook utility - Secure proxy through Edge Function
 */

import { supabase } from "@/integrations/supabase/client";

export type WebhookEndpoint = 'monitoring' | 'diagnosis' | 'simulation';

export interface WebhookResponse {
  success: boolean;
  error?: string;
}

/**
 * Escape special characters in string for safe JSON transmission
 */
export function escapeForJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/[\x00-\x1f]/g, (c) => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4));
}

/**
 * Sanitize payload values to prevent JSON parsing issues
 */
function sanitizePayload(payload: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    // Only escape string values that might contain special characters
    if (typeof value === 'string' && !key.endsWith('_id')) {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Call N8N webhook through secure Edge Function proxy
 * The authentication secret is stored server-side in Supabase secrets
 */
export async function callN8nWebhook(
  endpoint: WebhookEndpoint,
  payload: Record<string, string>
): Promise<WebhookResponse> {
  const sanitizedPayload = sanitizePayload(payload);

  console.log(`[Webhook] Calling ${endpoint} via secure proxy:`, sanitizedPayload);

  try {
    const { data, error } = await supabase.functions.invoke('webhook-proxy', {
      body: {
        endpoint,
        payload: sanitizedPayload,
      },
    });

    if (error) {
      console.error(`[Webhook] ${endpoint} proxy error:`, error.message);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      console.error(`[Webhook] ${endpoint} failed:`, data?.error);
      return { success: false, error: data?.error || 'Unknown error' };
    }

    console.log(`[Webhook] ${endpoint} success`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Webhook] ${endpoint} exception:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}
