import { useQuery } from '@tanstack/react-query';
import { History, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MonitorJobCard, ScanJobWithResults } from './MonitorJobCard';

export function MonitorList() {
  const { user } = useAuth();

  const { data: scanJobs, isLoading } = useQuery({
    queryKey: ['scan-jobs-with-results', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch jobs with their results
      const { data, error } = await supabase
        .from('scan_jobs')
        .select(`
          id,
          brand_name,
          search_query,
          status,
          selected_models,
          created_at,
          scan_results (
            id,
            model_name,
            rank_position,
            avs_score,
            spi_score,
            sentiment_score,
            is_visible,
            competitors_mentioned,
            raw_response_text,
            citations,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ScanJobWithResults[];
    },
    enabled: !!user,
  });

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/50">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">GEO 监控任务</CardTitle>
            <CardDescription>查看分析任务及结果，点击展开查看详情</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-muted/30" />
            ))}
          </div>
        ) : !scanJobs?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>还没有分析任务</p>
            <p className="text-sm mt-1">创建您的第一个 GEO 分析任务</p>
          </div>
        ) : (
          scanJobs.map((job) => (
            <MonitorJobCard
              key={job.id}
              job={job}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
