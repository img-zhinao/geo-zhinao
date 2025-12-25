import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const N8N_DIAGNOSIS_WEBHOOK = 'https://n8n.zhi-nao.com/webhook/diagnosis';

export interface DiagnosisTriggerPayload {
  job_id: string;
  scan_result_id: string;
  brand_name: string;
  search_query: string;
  citations: unknown;
  raw_response_text: string | null;
}

export interface DiagnosisReport {
  id: string;
  scan_result_id: string;
  job_id: string | null;
  root_cause_analysis: string | null;
  missing_geo_pillars: string | null;
  optimization_suggestions: string | null;
  status: string | null;
  created_at: string | null;
}

/**
 * Check if a diagnosis report exists for a scan result
 */
export async function checkExistingDiagnosis(scanResultId: string): Promise<DiagnosisReport | null> {
  const { data, error } = await supabase
    .from('diagnosis_reports')
    .select('*')
    .eq('scan_result_id', scanResultId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking existing diagnosis:', error);
    return null;
  }

  return data;
}

/**
 * Trigger a diagnosis workflow via N8N webhook
 */
export async function triggerDiagnosis(payload: DiagnosisTriggerPayload): Promise<string | null> {
  try {
    // First, create a diagnosis record with queued status
    const { data: diagnosisRecord, error: insertError } = await supabase
      .from('diagnosis_reports')
      .insert({
        scan_result_id: payload.scan_result_id,
        job_id: payload.job_id,
        status: 'queued',
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Failed to create diagnosis record: ${insertError.message}`);
    }

    // Send webhook request to N8N
    const webhookPayload = {
      diagnosis_id: diagnosisRecord.id,
      job_id: payload.job_id,
      scan_result_id: payload.scan_result_id,
      brand_name: payload.brand_name,
      search_query: payload.search_query,
      citations: payload.citations,
      raw_response_text: payload.raw_response_text,
    };

    const response = await fetch(N8N_DIAGNOSIS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      console.warn('N8N webhook returned non-OK status:', response.status);
    }

    toast.success('诊断任务已提交', {
      description: 'AI 正在思考中，请稍候...',
    });

    return diagnosisRecord.id;
  } catch (error) {
    console.error('Error triggering diagnosis:', error);
    toast.error('诊断任务提交失败', {
      description: error instanceof Error ? error.message : '请稍后重试',
    });
    return null;
  }
}

/**
 * Subscribe to realtime updates for a diagnosis report
 */
export function subscribeToDiagnosisUpdates(
  scanResultId: string,
  onUpdate: (report: DiagnosisReport) => void
) {
  const channel = supabase
    .channel(`diagnosis-${scanResultId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'diagnosis_reports',
        filter: `scan_result_id=eq.${scanResultId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as DiagnosisReport);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
