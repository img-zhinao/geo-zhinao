/**
 * Unified N8N Webhook utility with Header Auth
 */

const N8N_WEBHOOK_BASE = 'https://n8n.zhi-nao.com/webhook';
const WEBHOOK_AUTH_HEADER = 'zhinao-geo-scan';
const WEBHOOK_AUTH_VALUE = 'lxt123456';

export type WebhookEndpoint = 'monitoring' | 'diagnosis' | 'simulation';

export interface WebhookResponse {
  success: boolean;
  error?: string;
}

/**
 * Call N8N webhook with authentication header
 * Only sends IDs, N8N fetches full data from Supabase
 */
export async function callN8nWebhook(
  endpoint: WebhookEndpoint,
  payload: Record<string, string>
): Promise<WebhookResponse> {
  const url = `${N8N_WEBHOOK_BASE}/${endpoint}`;

  console.log(`[Webhook] Calling ${endpoint}:`, payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [WEBHOOK_AUTH_HEADER]: WEBHOOK_AUTH_VALUE,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Webhook] ${endpoint} failed:`, response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    console.log(`[Webhook] ${endpoint} success`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Webhook] ${endpoint} exception:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}
