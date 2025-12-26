import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const N8N_SIMULATION_WEBHOOK = 'https://n8n.zhi-nao.com/webhook/simulation';

export interface SimulationTriggerPayload {
  diagnosis_id: string;
  job_id: string;
  scan_result_id: string;
  brand_name: string;
  search_query: string;
  raw_response_text: string | null;
  missing_geo_pillars: string | null;
  root_cause_analysis: string | null;
}

export interface SimulationResult {
  id: string;
  diagnosis_id: string;
  applied_strategy_id: string;
  optimized_content_snippet: string | null;
  predicted_rank_change: string | null;
  improvement_analysis: string | null;
  status: string | null;
  created_at: string | null;
  strategies_used: string | null;
  model_outputs: unknown;
}

/**
 * Trigger simulation by inserting a record and calling N8N webhook
 */
export async function triggerSimulation(
  payload: SimulationTriggerPayload,
  strategyId: string = 'geo_optimization'
): Promise<string | null> {
  try {
    // Step 0: Check for existing pending/queued simulation
    const existing = await checkExistingSimulation(payload.diagnosis_id);
    if (existing && (existing.status === 'queued' || existing.status === 'processing')) {
      toast.info('模拟任务进行中', { description: '请等待当前任务完成' });
      return existing.id;
    }

    // Step 1: Insert new simulation record with pending status
    const { data: simulation, error: insertError } = await supabase
      .from('simulation_results')
      .insert({
        diagnosis_id: payload.diagnosis_id,
        applied_strategy_id: strategyId,
        status: 'queued',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting simulation record:', insertError);
      toast.error('创建模拟任务失败', { description: insertError.message });
      return null;
    }

    const simulationId = simulation.id;
    console.log('Simulation record created:', simulationId);

    // Step 2: Call N8N webhook
    const webhookPayload = {
      simulation_id: simulationId,
      diagnosis_id: payload.diagnosis_id,
      job_id: payload.job_id,
      scan_result_id: payload.scan_result_id,
      brand_name: payload.brand_name,
      search_query: payload.search_query,
      raw_response_text: payload.raw_response_text,
      missing_geo_pillars: payload.missing_geo_pillars,
      root_cause_analysis: payload.root_cause_analysis,
      applied_strategy_id: strategyId,
    };

    console.log('Calling N8N simulation webhook with payload:', webhookPayload);

    try {
      const response = await fetch(N8N_SIMULATION_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
        mode: 'no-cors', // N8N may not support CORS
      });

      console.log('N8N simulation webhook response:', response);
    } catch (fetchError) {
      console.warn('N8N webhook fetch error (may be CORS):', fetchError);
      // Continue even if fetch fails due to CORS - N8N will still process
    }

    toast.success('模拟任务已提交', {
      description: 'AI 正在优化内容并预测效果...',
    });

    return simulationId;
  } catch (error) {
    console.error('Error triggering simulation:', error);
    toast.error('模拟启动失败', { description: '请稍后重试' });
    return null;
  }
}

/**
 * Check for existing simulation result
 */
export async function checkExistingSimulation(
  diagnosisId: string
): Promise<SimulationResult | null> {
  try {
    const { data, error } = await supabase
      .from('simulation_results')
      .select('*')
      .eq('diagnosis_id', diagnosisId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking existing simulation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error checking simulation:', error);
    return null;
  }
}

/**
 * Subscribe to realtime simulation updates
 */
export function subscribeToSimulationUpdates(
  simulationId: string,
  onUpdate: (result: SimulationResult) => void
): () => void {
  const channel = supabase
    .channel(`simulation_updates_${simulationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'simulation_results',
        filter: `id=eq.${simulationId}`,
      },
      (payload) => {
        console.log('Simulation update received:', payload);
        onUpdate(payload.new as SimulationResult);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Strategy color mapping
 */
export const STRATEGY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Statistics: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' },
  Quotations: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
  'Technical Terms': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30' },
  Citations: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
  'Structured Data': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30' },
  Authority: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  default: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border/30' },
};

export function getStrategyColor(strategy: string): { bg: string; text: string; border: string } {
  // Check for partial matches
  for (const [key, value] of Object.entries(STRATEGY_COLORS)) {
    if (key !== 'default' && strategy.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return STRATEGY_COLORS.default;
}
