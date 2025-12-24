import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { History, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { MonitorJobCard, ScanJobWithResults } from './MonitorJobCard';

export function MonitorList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDiagnosing, setIsDiagnosing] = useState<string | null>(null);

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
            sentiment_score,
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

  const handleStartDiagnosis = async (scanResultId: string) => {
    setIsDiagnosing(scanResultId);
    
    try {
      // Insert a new diagnosis report with status 'queued'
      const { data, error } = await supabase
        .from('diagnosis_reports')
        .insert({
          scan_result_id: scanResultId,
          status: 'queued',
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: '诊断任务已创建',
        description: '正在跳转到诊断页面...',
      });

      // Navigate to the diagnosis page
      navigate(`/dashboard/diagnosis/${data.id}`);
    } catch (error) {
      console.error('Error creating diagnosis:', error);
      toast({
        title: '创建诊断失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsDiagnosing(null);
    }
  };

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
              onStartDiagnosis={handleStartDiagnosis}
              isDiagnosing={isDiagnosing}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
