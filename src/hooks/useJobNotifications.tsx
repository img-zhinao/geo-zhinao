import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to listen for job completion notifications globally
 */
export function useJobNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const notifiedJobsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('job-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scan_jobs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const job = payload.new as { id: string; status: string; brand_name: string; search_query: string };
          
          // Only notify for completed jobs that haven't been notified yet
          if (job.status === 'completed' && !notifiedJobsRef.current.has(job.id)) {
            notifiedJobsRef.current.add(job.id);
            
            toast({
              title: '✅ 分析完成',
              description: `"${job.brand_name}" 的 GEO 分析已完成`,
            });

            // Invalidate queries to refresh lists
            queryClient.invalidateQueries({ queryKey: ['scan-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['today-scans'] });
            queryClient.invalidateQueries({ queryKey: ['model-calls'] });
            queryClient.invalidateQueries({ queryKey: ['avg-response-time'] });
          }
          
          if (job.status === 'failed' && !notifiedJobsRef.current.has(job.id)) {
            notifiedJobsRef.current.add(job.id);
            
            toast({
              title: '❌ 分析失败',
              description: `"${job.brand_name}" 的分析任务执行失败`,
              variant: 'destructive',
            });

            queryClient.invalidateQueries({ queryKey: ['scan-jobs'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
