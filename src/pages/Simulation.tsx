import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FlaskConical, 
  ArrowLeft, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { PAWCComparisonView } from '@/components/simulation/PAWCComparisonView';
import { SIRadarChart } from '@/components/simulation/SIRadarChart';
import { PredictionCard } from '@/components/simulation/PredictionCard';

const strategyLabels: Record<string, string> = {
  add_citations: '增加引用',
  optimize_schema: '优化结构化数据',
  improve_content: '内容优化',
  enhance_expertise: '增强专业性',
  boost_freshness: '提升时效性',
};

export default function Simulation() {
  const { simulationId } = useParams<{ simulationId: string }>();
  const navigate = useNavigate();

  const { data: simulation, isLoading, refetch } = useQuery({
    queryKey: ['simulation-result', simulationId],
    queryFn: async () => {
      if (!simulationId) return null;

      // Fetch simulation with related diagnosis data
      const { data, error } = await supabase
        .from('simulation_results')
        .select('*, diagnosis_reports(scan_result_id)')
        .eq('id', simulationId)
        .single();

      if (error) throw error;

      // If we have diagnosis, get the original scan result
      let originalContent: string | null = null;
      if (data?.diagnosis_reports?.scan_result_id) {
        const { data: scanResult } = await supabase
          .from('scan_results')
          .select('raw_response_text')
          .eq('id', data.diagnosis_reports.scan_result_id)
          .single();
        originalContent = scanResult?.raw_response_text || null;
      }

      return { ...data, originalContent };
    },
    enabled: !!simulationId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'queued' || data?.status === 'processing') {
        return 3000;
      }
      return false;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!simulationId) return;

    const channel = supabase
      .channel(`simulation_${simulationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'simulation_results',
          filter: `id=eq.${simulationId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [simulationId, refetch]);

  const strategyLabel = simulation?.applied_strategy_id 
    ? strategyLabels[simulation.applied_strategy_id] || simulation.applied_strategy_id
    : '未知策略';

  return (
    <DashboardLayout>
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回诊断报告
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <FlaskConical className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">策略模拟结果</h1>
            <p className="text-muted-foreground">
              应用策略: {strategyLabel}
            </p>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : !simulation ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">模拟结果不存在</h3>
              <p className="text-muted-foreground">无法找到该模拟结果</p>
            </CardContent>
          </Card>
        ) : simulation.status === 'queued' || simulation.status === 'processing' ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <FlaskConical className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
              </div>
              <h3 className="text-xl font-semibold mt-6">AI 正在模拟优化效果...</h3>
              <p className="text-muted-foreground mt-2">
                正在应用「{strategyLabel}」策略并预测效果
              </p>
              <Badge variant="secondary" className="mt-4 gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {simulation.status === 'queued' ? '排队中' : '模拟中'}
              </Badge>
            </CardContent>
          </Card>
        ) : simulation.status === 'failed' ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">模拟失败</h3>
              <p className="text-muted-foreground">模拟过程中出现错误，请稍后重试</p>
            </CardContent>
          </Card>
        ) : (
          /* Completed State */
          <div className="space-y-6">
            {/* Prediction Card */}
            <PredictionCard 
              predictedRankChange={simulation.predicted_rank_change}
              algorithm={simulation.algorithm}
            />

            {/* SI Radar Chart */}
            <SIRadarChart 
              scores={simulation.si_scores as Record<string, number> | null} 
              geoMetrics={simulation.geo_metrics as Record<string, unknown> | null} 
            />

            {/* PAWC Comparison View */}
            <PAWCComparisonView 
              originalContent={simulation.originalContent}
              optimizedContent={simulation.optimized_content_snippet}
            />

            {/* Improvement Analysis */}
            {simulation.improvement_analysis && (
              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">优化分析</h3>
                      <p className="text-sm text-muted-foreground">为什么这个策略有效</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border/30 p-6">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{simulation.improvement_analysis}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Back to Diagnosis */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/diagnosis/${simulation.diagnosis_id}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回诊断报告尝试其他策略
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
