import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FlaskConical, 
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeNotification } from '@/hooks/useRealtimeNotification';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Strategy definitions
const strategyLabels: Record<string, string> = {
  add_citations: '增加引用',
  optimize_schema: '优化结构化数据',
  improve_content: '内容优化',
  enhance_expertise: '增强专业性',
  boost_freshness: '提升时效性',
};

interface SimulationWithDiagnosis {
  id: string;
  applied_strategy_id: string;
  status: string;
  predicted_rank_change: number | null;
  created_at: string;
  diagnosis_reports: {
    id: string;
    scan_results: {
      id: string;
      model_name: string;
      scan_jobs: {
        brand_name: string;
        search_query: string;
      };
    };
  };
}

export default function SimulationList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Global realtime notification for simulation_results status updates
  useRealtimeNotification({
    table: 'simulation_results',
    userId: user?.id,
    queryKeysToInvalidate: [['all-simulations']],
    successMessage: {
      title: '推演结束',
      description: '请查看结果。',
    },
    failedMessage: {
      title: '模拟失败',
      description: '请重试。',
    },
  });

  // Fetch all simulations for the user
  const { data: simulations, isLoading } = useQuery({
    queryKey: ['all-simulations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('simulation_results')
        .select(`
          id,
          applied_strategy_id,
          status,
          predicted_rank_change,
          created_at,
          diagnosis_reports!inner (
            id,
            scan_results!inner (
              id,
              model_name,
              scan_jobs!inner (
                brand_name,
                search_query,
                user_id
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by user_id on the client side since we can't filter nested joins easily
      const filtered = (data as unknown as SimulationWithDiagnosis[])?.filter(
        (sim) => (sim.diagnosis_reports?.scan_results?.scan_jobs as any)?.user_id === user.id
      );

      return filtered || [];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-500 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            已完成
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            处理中
          </Badge>
        );
      case 'queued':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            排队中
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            失败
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRankChangeIcon = (change: number | null) => {
    if (change === null) return null;
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

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
            <FlaskConical className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">策略模拟</h1>
            <p className="text-muted-foreground">
              查看所有优化策略模拟结果
            </p>
          </div>
        </div>

        <Card className="bg-card/40 backdrop-blur-xl border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">模拟历史</CardTitle>
            <CardDescription>所有策略模拟任务的运行记录</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !simulations || simulations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">暂无模拟记录</h3>
                <p className="text-muted-foreground">
                  完成归因诊断后，可选择优化策略进行效果模拟
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/dashboard/diagnosis')}
                >
                  前往归因诊断
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-border/30">
                  {simulations.map((sim) => {
                    const scanResult = sim.diagnosis_reports?.scan_results;
                    const scanJob = scanResult?.scan_jobs;

                    return (
                      <div
                        key={sim.id}
                        className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/dashboard/simulation/${sim.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {scanJob?.brand_name || '未知品牌'}
                              </span>
                              <Badge variant="outline" className="shrink-0">
                                {strategyLabels[sim.applied_strategy_id] || sim.applied_strategy_id}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-2">
                              {scanJob?.search_query || '未知查询'} · {scanResult?.model_name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {formatDistanceToNow(new Date(sim.created_at), {
                                  addSuffix: true,
                                  locale: zhCN,
                                })}
                              </span>
                              {sim.predicted_rank_change !== null && (
                                <span className="flex items-center gap-1">
                                  {getRankChangeIcon(sim.predicted_rank_change)}
                                  {sim.predicted_rank_change > 0 ? '+' : ''}
                                  {sim.predicted_rank_change} 名
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {getStatusBadge(sim.status)}
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
