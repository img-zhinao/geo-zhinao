import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Clock, CheckCircle2, Loader2, AlertCircle, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ScanJob {
  id: string;
  brand_name: string;
  search_query: string;
  status: string | null;
  job_type: string | null;
  created_at: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
  processing: { label: '处理中', variant: 'secondary', icon: Loader2 },
  completed: { label: '已完成', variant: 'default', icon: CheckCircle2 },
  failed: { label: '失败', variant: 'destructive', icon: AlertCircle },
  pending: { label: '等待中', variant: 'outline', icon: Clock },
};

interface RecentScansListProps {
  onViewResult?: (jobId: string, brandName: string, searchQuery: string) => void;
}

const modelLabels: Record<string, string> = {
  'deepseek-v3': 'DeepSeek-V3',
  'doubao-pro': 'Doubao-Pro',
  'qwen-max': 'Qwen-Max',
  'deep_reasoning': 'DeepSeek-V3',
};

export function RecentScansList({ onViewResult }: RecentScansListProps) {
  const { user } = useAuth();

  const { data: scanJobs, isLoading } = useQuery({
    queryKey: ['scan-jobs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as ScanJob[];
    },
    enabled: !!user,
  });

  const getStatusInfo = (status: string | null) => {
    return statusConfig[status || 'pending'] || statusConfig.pending;
  };

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/50">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">最近的分析任务</CardTitle>
            <CardDescription>查看您最近创建的 GEO 分析任务</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-muted/30" />
            ))}
          </div>
        ) : !scanJobs?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>还没有分析任务</p>
            <p className="text-sm mt-1">创建您的第一个 GEO 分析任务</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">搜索问题</TableHead>
                  <TableHead className="text-muted-foreground">品牌</TableHead>
                  <TableHead className="text-muted-foreground">模型</TableHead>
                  <TableHead className="text-muted-foreground">状态</TableHead>
                  <TableHead className="text-muted-foreground">创建时间</TableHead>
                  <TableHead className="text-muted-foreground text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanJobs.map((job) => {
                  const statusInfo = getStatusInfo(job.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={job.id} className="border-border/20 hover:bg-muted/20">
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {job.search_query}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                          {job.brand_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {modelLabels[job.job_type || ''] || job.job_type || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusInfo.variant}
                          className="gap-1.5"
                        >
                          <StatusIcon className={`h-3 w-3 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {job.created_at 
                          ? format(new Date(job.created_at), 'MM月dd日 HH:mm', { locale: zhCN })
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          disabled={job.status !== 'completed'}
                          onClick={() => onViewResult?.(job.id, job.brand_name, job.search_query)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          查看报告
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
