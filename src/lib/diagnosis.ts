import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { callN8nWebhook } from './webhook';

/**
 * Simplified payload - only IDs, N8N fetches full data from Supabase
 */
export interface DiagnosisTriggerPayload {
  job_id: string;
  scan_result_id: string;
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
 * Only sends IDs - N8N fetches full data from Supabase
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

    // Send webhook request to N8N with only IDs
    const result = await callN8nWebhook('diagnosis', {
      diagnosis_id: diagnosisRecord.id,
      scan_result_id: payload.scan_result_id,
    });

    if (!result.success) {
      console.warn('N8N webhook call failed:', result.error);
      // Don't block user flow, webhook failure is logged
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
