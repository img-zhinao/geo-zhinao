import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { 
  Stethoscope, 
  FlaskConical, 
  Loader2,
  FileText,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeNotification } from '@/hooks/useRealtimeNotification';
import { callN8nWebhook } from '@/lib/webhook';

// Strategy definitions
const strategyLabels: Record<string, { label: string; description: string }> = {
  add_citations: { label: '增加引用', description: '添加权威来源引用以提升可信度' },
  optimize_schema: { label: '优化结构化数据', description: '使用 Schema.org 标记提升语义理解' },
  improve_content: { label: '内容优化', description: '优化内容结构和关键词布局' },
  enhance_expertise: { label: '增强专业性', description: '展示行业专业知识和权威性' },
  boost_freshness: { label: '提升时效性', description: '更新内容以反映最新信息' },
};

interface ScanJob {
  id: string;
  brand_name: string;
  search_query: string;
  status: string;
  created_at: string;
  scan_results: {
    id: string;
    model_name: string;
    rank_position: number | null;
    avs_score: number | null;
  }[];
}

interface DiagnosisReport {
  id: string;
  scan_result_id: string;
  status: string;
  root_cause_analysis: string | null;
  optimization_suggestions: string | null;
  missing_geo_pillars: string | null;
  diagnostic_model: string | null;
  tokens_used: number | null;
  created_at: string;
}

export default function DiagnosisList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<string | null>(null);

  // Global realtime notification for diagnosis_reports status updates
  useRealtimeNotification({
    table: 'diagnosis_reports',
    userId: user?.id,
    queryKeysToInvalidate: [['diagnosis-for-result'], ['scan-jobs-for-diagnosis']],
    successMessage: {
      title: '深度诊断报告已生成',
      description: 'DeepSeek-R1 分析完成。',
    },
    failedMessage: {
      title: '诊断失败',
      description: '请重试。',
    },
  });

  // Fetch completed scan jobs with results
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['scan-jobs-for-diagnosis', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('scan_jobs')
        .select(`
          id,
          brand_name,
          search_query,
          status,
          created_at,
          scan_results (
            id,
            model_name,
            rank_position,
            avs_score
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ScanJob[];
    },
    enabled: !!user?.id,
  });

  // Fetch diagnosis report for selected result
  const { data: report, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['diagnosis-for-result', selectedResultId],
    queryFn: async () => {
      if (!selectedResultId) return null;
      
      const { data, error } = await supabase
        .from('diagnosis_reports')
        .select('*')
        .eq('scan_result_id', selectedResultId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DiagnosisReport | null;
    },
    enabled: !!selectedResultId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'queued' || data?.status === 'processing') {
        return 3000;
      }
      return false;
    },
  });

  // Subscribe to realtime updates for the selected result's diagnosis
  useEffect(() => {
    if (!selectedResultId) return;

    const channel = supabase
      .channel(`diagnosis_list_${selectedResultId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diagnosis_reports',
          filter: `scan_result_id=eq.${selectedResultId}`,
        },
        () => {
          refetchReport();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedResultId, refetchReport]);

  const handleStartDiagnosis = async (scanResultId: string) => {
    setIsDiagnosing(scanResultId);

    try {
      // First create the diagnosis record
      const { data: diagnosisData, error: insertError } = await supabase
        .from('diagnosis_reports')
        .insert({
          scan_result_id: scanResultId,
          status: 'queued',
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Trigger N8N webhook through secure proxy
      const result = await callN8nWebhook('diagnosis', {
        diagnosis_id: diagnosisData.id,
        scan_result_id: scanResultId,
      });

      if (!result.success) {
        console.warn('N8N webhook call failed:', result.error);
      }

      toast({
        title: '诊断任务已创建',
        description: 'DeepSeek-R1 正在进行病理分析...',
      });

      setSelectedResultId(scanResultId);
      refetchReport();
    } catch (error) {
      console.error('Error starting diagnosis:', error);
      toast({
        title: '创建诊断失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsDiagnosing(null);
    }
  };

  const handleSimulation = async (strategyId: string, diagnosisId: string) => {
    try {
      const { data, error } = await supabase
        .from('simulation_results')
        .insert({
          diagnosis_id: diagnosisId,
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
    }
  };

  // Parse missing pillars as suggested strategies for simulation
  const parseMissingPillars = (pillars: string | null): string[] => {
    if (!pillars) return [];
    try {
      const parsed = JSON.parse(pillars);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return pillars.split(',').map(p => p.trim()).filter(Boolean);
    }
    return [];
  };
  
  const missingPillars = report ? parseMissingPillars(report.missing_geo_pillars) : [];

  return (
    <DashboardLayout>
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">归因诊断</h1>
            <p className="text-muted-foreground">
              使用 DeepSeek-R1 深度分析品牌在 AI 回复中的表现
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Job List */}
          <Card className="lg:col-span-1 bg-card/40 backdrop-blur-xl border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">已完成的扫描任务</CardTitle>
              <CardDescription>选择一个扫描结果进行归因诊断</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !jobs || jobs.length === 0 ? (
                  <div className="text-center py-10 px-4 text-muted-foreground">
                    暂无已完成的扫描任务
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium truncate">{job.brand_name}</span>
                          <Badge variant="outline" className="shrink-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            已完成
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 truncate">
                          {job.search_query}
                        </p>
                        <div className="space-y-2">
                          {job.scan_results?.map((result) => (
                            <Button
                              key={result.id}
                              variant={selectedResultId === result.id ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-between text-left h-auto py-2"
                              onClick={() => setSelectedResultId(result.id)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{result.model_name}</span>
                                {result.rank_position && (
                                  <Badge variant="outline" className="text-xs">
                                    #{result.rank_position}
                                  </Badge>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Panel - Diagnosis Report */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedResultId ? (
              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Stethoscope className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">选择扫描结果</h3>
                  <p className="text-muted-foreground">
                    请从左侧列表中选择一个扫描结果以查看或开始诊断
                  </p>
                </CardContent>
              </Card>
            ) : reportLoading ? (
              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardContent className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : !report ? (
              /* No diagnosis yet - show start button */
              <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Stethoscope className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">尚未诊断</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    该扫描结果尚未进行归因诊断。点击下方按钮开始使用 DeepSeek-R1 进行深度分析。
                  </p>
                  <Button
                    size="lg"
                    onClick={() => handleStartDiagnosis(selectedResultId)}
                    disabled={isDiagnosing === selectedResultId}
                  >
                    {isDiagnosing === selectedResultId ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        正在创建诊断任务...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="h-5 w-5 mr-2" />
                        开始诊断
                      </>
                    )}
                  </Button>
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
                  <h3 className="text-xl font-semibold mt-6">DeepSeek-R1 正在进行病理分析...</h3>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    正在深度分析您的品牌在 AI 回复中的表现，识别问题根因并生成优化建议
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
                  <p className="text-muted-foreground mb-4">分析过程中出现错误</p>
                  <Button onClick={() => handleStartDiagnosis(selectedResultId)}>
                    重新诊断
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Completed State - Show Report */
              <>
                {/* Root Cause Analysis */}
                {report.root_cause_analysis && (
                  <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">根因分析</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-[200px]">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{report.root_cause_analysis}</ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Optimization Suggestions */}
                {report.optimization_suggestions && (
                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">优化建议</CardTitle>
                            <CardDescription>
                              诊断模型: {report.diagnostic_model} | Token 消耗: {report.tokens_used}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/diagnosis/${report.id}`)}
                        >
                          查看完整报告
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] rounded-lg bg-muted/30 border border-border/30 p-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>
                            {report.optimization_suggestions}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Missing GEO Pillars as Simulation Strategies */}
                {missingPillars.length > 0 && (
                  <Card className="bg-card/40 backdrop-blur-xl border-border/30">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <FlaskConical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">缺失 GEO 支柱</CardTitle>
                          <CardDescription>点击策略按钮开始模拟优化效果</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {missingPillars.map((pillar) => {
                          const strategy = strategyLabels[pillar] || {
                            label: pillar,
                            description: '优化策略',
                          };

                          return (
                            <Button
                              key={pillar}
                              variant="outline"
                              className="h-auto flex-col items-start p-4 text-left hover:bg-primary/10 hover:border-primary/50"
                              onClick={() => handleSimulation(pillar, report.id)}
                            >
                              <FlaskConical className="h-5 w-5 mb-2 text-primary" />
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
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
