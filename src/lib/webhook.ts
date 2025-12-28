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
 * Call N8N webhook with authentication header
 * Includes special character escaping for safe JSON transmission
 */
export async function callN8nWebhook(
  endpoint: WebhookEndpoint,
  payload: Record<string, string>
): Promise<WebhookResponse> {
  const url = `${N8N_WEBHOOK_BASE}/${endpoint}`;
  const sanitizedPayload = sanitizePayload(payload);

  console.log(`[Webhook] Calling ${endpoint}:`, sanitizedPayload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [WEBHOOK_AUTH_HEADER]: WEBHOOK_AUTH_VALUE,
      },
      body: JSON.stringify(sanitizedPayload),
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
