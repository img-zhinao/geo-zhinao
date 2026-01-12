import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  TrendingUp,
  Loader2,
  ArrowRight,
  RefreshCcw,
  Diff,
  FileText,
  AlertCircle,
  Zap,
  CheckCircle2,
  Coins,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  triggerSimulation, 
  checkExistingSimulation, 
  subscribeToSimulationUpdates,
  getStrategyColor,
  SimulationResult,
  SimulationTriggerPayload
} from '@/lib/simulation';
import { useCreditsBalance, CREDIT_COSTS, hasEnoughCredits } from '@/hooks/useCredits';

interface StrategySimulatorProps {
  diagnosisId: string;
  missingGeoPillars: string | null;
  rawResponseText: string | null;
}

type SimulatorState = 'idle' | 'processing' | 'result' | 'error';

// Processing tips that rotate
const PROCESSING_TIPS = [
  '正在注入统计数据...',
  '正在构建权威语录...',
  '正在优化内容结构...',
  '正在添加技术术语...',
  '正在计算可见性提升...',
  '正在生成对比分析...',
];

// Parse strategies from string or JSON
function parseStrategies(strategies: string | null): string[] {
  if (!strategies) return [];
  try {
    const parsed = JSON.parse(strategies);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return strategies.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// Component to render optimized content with GEO highlights
function OptimizedContentRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        strong: ({ children }) => (
          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-semibold">
            {children}
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-500/30 text-green-600 dark:text-green-400">
              GEO
            </Badge>
          </span>
        ),
        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function StrategySimulator({
  diagnosisId,
  missingGeoPillars,
  rawResponseText,
}: StrategySimulatorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<SimulatorState>('idle');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const { balance, isLoading: balanceLoading, refetch: refetchBalance } = useCreditsBalance();
  
  const simulationCost = CREDIT_COSTS.simulation;
  const canAfford = hasEnoughCredits(balance, 'simulation');

  // Check for existing simulation on mount
  useEffect(() => {
    const checkExisting = async () => {
      const existing = await checkExistingSimulation(diagnosisId);
      if (existing) {
        setSimulation(existing);
        if (existing.status === 'completed') {
          setState('result');
        } else if (existing.status === 'queued' || existing.status === 'processing') {
          setState('processing');
        } else if (existing.status === 'failed') {
          setState('error');
        }
      }
    };
    checkExisting();
  }, [diagnosisId]);

  // Subscribe to realtime updates when processing
  useEffect(() => {
    if (!simulation?.id || state !== 'processing') return;

    const unsubscribe = subscribeToSimulationUpdates(simulation.id, (result) => {
      setSimulation(result);
      if (result.status === 'completed') {
        setState('result');
        setTimeoutReached(false);
        // Invalidate queries and show success toast
        queryClient.invalidateQueries({ queryKey: ['all-simulations'] });
        toast({
          title: '推演结束',
          description: '请查看结果。',
          className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        });
      } else if (result.status === 'failed') {
        setState('error');
        toast({
          title: '模拟失败',
          description: '请重试。',
          variant: 'destructive',
        });
      }
    });

    return unsubscribe;
  }, [simulation?.id, state]);

  // Rotate processing tips
  useEffect(() => {
    if (state !== 'processing') return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % PROCESSING_TIPS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [state]);

  // Timeout handler (60 seconds)
  useEffect(() => {
    if (state !== 'processing') return;

    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 60000);

    return () => clearTimeout(timeout);
  }, [state, simulation?.id]);

  const handleTriggerSimulation = useCallback(async () => {
    if (!canAfford) {
      toast({
        title: '积分不足',
        description: `策略模拟需要 ${simulationCost} 积分，当前余额 ${balance} 积分`,
        variant: 'destructive',
      });
      return;
    }

    setState('processing');
    setTimeoutReached(false);

    const payload: SimulationTriggerPayload = {
      diagnosis_id: diagnosisId,
    };

    const result = await triggerSimulation(payload);
    
    if (result) {
      const newSimulation: SimulationResult = {
        id: result,
        diagnosis_id: diagnosisId,
        applied_strategy_id: 'geo_optimization',
        optimized_content_snippet: null,
        predicted_rank_change: null,
        improvement_analysis: null,
        status: 'queued',
        created_at: new Date().toISOString(),
        strategies_used: null,
        model_outputs: null,
      };
      setSimulation(newSimulation);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refetchBalance();
    } else {
      setState('error');
    }
  }, [diagnosisId, canAfford, balance, simulationCost, queryClient, refetchBalance]);

  const handleRetry = () => {
    setSimulation(null);
    setState('idle');
    setTimeoutReached(false);
  };

  const handleViewDetails = () => {
    if (simulation?.id) {
      navigate(`/dashboard/simulation/${simulation.id}`);
    }
  };

  // Parse strategies used
  const strategiesUsed = simulation?.applied_strategy_id 
    ? parseStrategies(missingGeoPillars) // Use missing pillars as strategies for now
    : [];

  // IDLE STATE
  if (state === 'idle') {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 overflow-hidden">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">✨ 生成 GEO 优化预演</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                让 AI 自动注入缺失的数据与权威语录，预览排名提升效果
              </p>
            </div>
            
            {/* Credit Info */}
            {!balanceLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4 text-primary" />
                <span>消耗 <span className="font-medium text-foreground">{simulationCost} 积分</span></span>
                <span className="text-border">|</span>
                <span>余额 <span className={`font-medium ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{balance} 积分</span></span>
              </div>
            )}

            {/* Insufficient Credits Alert */}
            {!balanceLoading && !canAfford && (
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>积分不足</AlertTitle>
                <AlertDescription>
                  策略模拟需要 {simulationCost} 积分，当前余额 {balance} 积分。
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleTriggerSimulation}
              size="lg"
              className="gap-2 px-8"
              disabled={!canAfford || balanceLoading}
            >
              <Zap className="h-4 w-4" />
              开始模拟优化
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // PROCESSING STATE
  if (state === 'processing') {
    return (
      <Card className="bg-card/40 backdrop-blur-xl border-border/30 overflow-hidden">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Animated loader */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
              <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">AI 正在优化内容...</h3>
              <p className="text-primary font-medium animate-pulse">
                {PROCESSING_TIPS[currentTipIndex]}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {PROCESSING_TIPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentTipIndex
                      ? 'bg-primary w-6'
                      : idx < currentTipIndex
                      ? 'bg-primary/40'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Timeout warning */}
            {timeoutReached && (
              <div className="flex flex-col items-center gap-3 pt-4">
                <p className="text-sm text-muted-foreground">
                  处理时间较长，请稍候或重试
                </p>
                <Button variant="outline" onClick={handleRetry} className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  重试
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ERROR STATE
  if (state === 'error') {
    return (
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">模拟失败</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI 优化过程中出现错误，请稍后重试
              </p>
            </div>
            <Button variant="outline" onClick={handleRetry} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              重新模拟
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // RESULT STATE
  return (
    <div className="space-y-6">
      {/* Hero Metric Card */}
      <Card className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-primary/5 border-green-500/20 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">预测 AI 可见性提升</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
                    {simulation?.predicted_rank_change || '+--'}
                  </span>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3" />
                优化完成
              </Badge>
              <Button variant="outline" size="sm" onClick={handleViewDetails} className="gap-2">
                <FileText className="h-4 w-4" />
                查看详情
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Diff View */}
      {(rawResponseText || simulation?.optimized_content_snippet) && (
        <Card className="bg-card/40 backdrop-blur-xl border-border/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <Diff className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">智能对比视图</CardTitle>
                <CardDescription>查看优化前后的内容差异</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="optimized" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">原始 AI 印象</TabsTrigger>
                <TabsTrigger value="optimized" className="gap-2">
                  <Sparkles className="h-3 w-3" />
                  优化后 AI 印象
                </TabsTrigger>
              </TabsList>
              <TabsContent value="original" className="mt-4">
                <ScrollArea className="h-[300px] rounded-lg bg-muted/30 border border-border/30 p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm">
                      {rawResponseText || '暂无原始内容'}
                    </p>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="optimized" className="mt-4">
                <ScrollArea className="h-[300px] rounded-lg bg-green-500/5 border border-green-500/20 p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {simulation?.optimized_content_snippet ? (
                      <OptimizedContentRenderer content={simulation.optimized_content_snippet} />
                    ) : (
                      <p className="text-muted-foreground">暂无优化内容</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Strategy Attribution */}
      {strategiesUsed.length > 0 && (
        <Card className="bg-card/40 backdrop-blur-xl border-border/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">优化策略清单</CardTitle>
                <CardDescription>AI 应用的 GEO 优化策略</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strategy Badges */}
            <div className="flex flex-wrap gap-2">
              {strategiesUsed.map((strategy, idx) => {
                const colors = getStrategyColor(strategy);
                return (
                  <Badge
                    key={idx}
                    variant="outline"
                    className={`${colors.bg} ${colors.text} ${colors.border} px-3 py-1`}
                  >
                    {strategy}
                  </Badge>
                );
              })}
            </div>

            {/* Improvement Analysis */}
            {simulation?.improvement_analysis && (
              <div className="pt-4 border-t border-border/30">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  效果分析
                </h4>
                <ScrollArea className="max-h-[200px] rounded-lg bg-muted/20 p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{simulation.improvement_analysis}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Retry Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={handleRetry} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          重新模拟其他策略
        </Button>
      </div>
    </div>
  );
}
