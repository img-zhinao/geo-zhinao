import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { callN8nWebhook } from './webhook';

/**
 * Simplified payload - only diagnosis_id, N8N fetches full data from Supabase
 */
export interface SimulationTriggerPayload {
  diagnosis_id: string;
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
 * Only sends IDs - N8N fetches full data from Supabase
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

    // Step 2: Call N8N webhook with only IDs
    const result = await callN8nWebhook('simulation', {
      simulation_id: simulationId,
      diagnosis_id: payload.diagnosis_id,
    });

    if (!result.success) {
      console.warn('N8N webhook call failed:', result.error);
      // Don't block user flow, webhook failure is logged
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
      .select('id, diagnosis_id, applied_strategy_id, optimized_content_snippet, predicted_rank_change, improvement_analysis, status, created_at, strategies_used, model_outputs')
      .eq('diagnosis_id', diagnosisId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking existing simulation:', error);
      return null;
    }

    if (!data) return null;

    // Map to SimulationResult with proper types
    return {
      ...data,
      strategies_used: typeof data.strategies_used === 'string' ? data.strategies_used : null,
      model_outputs: data.model_outputs,
    };
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
