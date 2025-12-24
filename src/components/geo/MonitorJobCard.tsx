import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  ChevronDown, 
  ChevronUp, 
  Stethoscope, 
  Hash, 
  TrendingUp, 
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Json } from '@/integrations/supabase/types';

export interface ScanResultItem {
  id: string;
  model_name: string;
  rank_position: number | null;
  avs_score: number | null;
  sentiment_score: number | null;
  created_at: string | null;
}

export interface ScanJobWithResults {
  id: string;
  brand_name: string;
  search_query: string;
  status: string | null;
  selected_models: Json;
  created_at: string | null;
  scan_results: ScanResultItem[];
}

interface MonitorJobCardProps {
  job: ScanJobWithResults;
  onStartDiagnosis: (scanResultId: string) => void;
  isDiagnosing: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
  queued: { label: '排队中', variant: 'outline', icon: Clock },
  processing: { label: '处理中', variant: 'secondary', icon: Loader2 },
  completed: { label: '已完成', variant: 'default', icon: CheckCircle2 },
  failed: { label: '失败', variant: 'destructive', icon: AlertCircle },
};

export function MonitorJobCard({ job, onStartDiagnosis, isDiagnosing }: MonitorJobCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusInfo = statusConfig[job.status || 'queued'] || statusConfig.queued;
  const StatusIcon = statusInfo.icon;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score <= 40) return 'text-destructive';
    if (score <= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base font-medium line-clamp-1">
                {job.search_query}
              </CardTitle>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {job.brand_name}
                </span>
                <span className="text-muted-foreground">
                  {job.created_at 
                    ? format(new Date(job.created_at), 'MM月dd日 HH:mm', { locale: zhCN })
                    : '-'
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusInfo.variant} className="gap-1.5">
                <StatusIcon className={`h-3 w-3 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                {statusInfo.label}
              </Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {job.scan_results.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                {job.status === 'processing' ? '正在分析中...' : '暂无分析结果'}
              </div>
            ) : (
              <div className="space-y-3">
                {job.scan_results.map((result) => (
                  <div 
                    key={result.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/20"
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <span className="text-muted-foreground">模型:</span>{' '}
                        <span className="font-medium">{result.model_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {result.rank_position === null || result.rank_position === 100
                            ? '未上榜'
                            : `第 ${result.rank_position} 名`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-sm font-medium ${getScoreColor(result.avs_score)}`}>
                          {result.avs_score !== null ? `${result.avs_score} 分` : '-'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStartDiagnosis(result.id)}
                      disabled={isDiagnosing === result.id}
                      className="gap-2"
                    >
                      {isDiagnosing === result.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          诊断中...
                        </>
                      ) : (
                        <>
                          <Stethoscope className="h-4 w-4" />
                          归因诊断
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
