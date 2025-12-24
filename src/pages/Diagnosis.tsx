import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { 
  Stethoscope, 
  ArrowLeft, 
  FlaskConical, 
  Loader2,
  FileText,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Strategy definitions
const strategyLabels: Record<string, { label: string; description: string }> = {
  add_citations: { label: '增加引用', description: '添加权威来源引用以提升可信度' },
  optimize_schema: { label: '优化结构化数据', description: '使用 Schema.org 标记提升语义理解' },
  improve_content: { label: '内容优化', description: '优化内容结构和关键词布局' },
  enhance_expertise: { label: '增强专业性', description: '展示行业专业知识和权威性' },
  boost_freshness: { label: '提升时效性', description: '更新内容以反映最新信息' },
};

export default function Diagnosis() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  // Fetch diagnosis report
  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['diagnosis-report', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      
      const { data, error } = await supabase
        .from('diagnosis_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!reportId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if still processing
      const data = query.state.data;
      if (data?.status === 'queued' || data?.status === 'processing') {
        return 3000;
      }
      return false;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!reportId) return;

    const channel = supabase
      .channel(`diagnosis_${reportId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'diagnosis_reports',
          filter: `id=eq.${reportId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, refetch]);

  const handleSimulation = async (strategyId: string) => {
    if (!reportId) return;
    
    setIsSimulating(strategyId);

    try {
      const { data, error } = await supabase
        .from('simulation_results')
        .insert({
          diagnosis_id: reportId,
          applied_strategy_id: strategyId,
          status: 'queued',
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: '模拟任务已创建',
        description: '正在跳转到模拟结果页面...',
      });

      navigate(`/dashboard/simulation/${data.id}`);
    } catch (error) {
      console.error('Error creating simulation:', error);
      toast({
        title: '创建模拟失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(null);
    }
  };

  const suggestedStrategies = (report?.suggested_strategy_ids as string[]) || [];

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
          onClick={() => navigate('/dashboard/geo-analysis')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回监控中心
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">归因诊断报告</h1>
            <p className="text-muted-foreground">
              基于 DeepSeek-R1 深度分析的诊断结果
            </p>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : !report ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">报告不存在</h3>
              <p className="text-muted-foreground">无法找到该诊断报告</p>
            </CardContent>
          </Card>
        ) : report.status === 'queued' || report.status === 'processing' ? (
          /* Processing State */
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Stethoscope className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
              </div>
              <h3 className="text-xl font-semibold mt-6">AI 正在深度诊断...</h3>
              <p className="text-muted-foreground mt-2">
                DeepSeek-R1 正在分析您的品牌在 AI 回复中的表现
              </p>
              <Badge variant="secondary" className="mt-4 gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {report.status === 'queued' ? '排队中' : '分析中'}
              </Badge>
            </CardContent>
          </Card>
        ) : report.status === 'failed' ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">诊断失败</h3>
              <p className="text-muted-foreground">分析过程中出现错误，请稍后重试</p>
            </CardContent>
          </Card>
        ) : (
          /* Completed State - Show Report */
          <div className="space-y-6">
            {/* Root Cause Summary */}
            {report.root_cause_summary && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">核心问题摘要</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{report.root_cause_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Full Report */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">详细诊断报告</CardTitle>
                    <CardDescription>
                      诊断模型: {report.diagnostic_model} | Token 消耗: {report.tokens_used}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] rounded-lg bg-muted/30 border border-border/30 p-6">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {report.report_markdown || '暂无报告内容'}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Suggested Strategies */}
            {suggestedStrategies.length > 0 && (
              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <FlaskConical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">推荐优化策略</CardTitle>
                      <CardDescription>点击策略按钮开始模拟优化效果</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {suggestedStrategies.map((strategyId) => {
                      const strategy = strategyLabels[strategyId] || {
                        label: strategyId,
                        description: '优化策略',
                      };

                      return (
                        <Button
                          key={strategyId}
                          variant="outline"
                          className="h-auto flex-col items-start p-4 text-left hover:bg-primary/10 hover:border-primary/50"
                          onClick={() => handleSimulation(strategyId)}
                          disabled={isSimulating === strategyId}
                        >
                          {isSimulating === strategyId ? (
                            <Loader2 className="h-5 w-5 mb-2 animate-spin" />
                          ) : (
                            <FlaskConical className="h-5 w-5 mb-2 text-primary" />
                          )}
                          <span className="font-semibold">{strategy.label}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {strategy.description}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
