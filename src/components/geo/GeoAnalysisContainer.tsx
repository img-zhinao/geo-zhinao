import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeNotification } from '@/hooks/useRealtimeNotification';
import { NewScanForm } from './NewScanForm';
import { ProcessingState } from './ProcessingState';
import { MonitorList } from './MonitorList';

type ViewState = 'form' | 'processing';

interface ActiveJob {
  id: string;
  brandName: string;
  searchQuery: string;
}

export function GeoAnalysisContainer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('form');
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);

  // Global realtime notification for scan_jobs status updates
  useRealtimeNotification({
    table: 'scan_jobs',
    userId: user?.id,
    queryKeysToInvalidate: [['scan-jobs-with-results']],
    successMessage: {
      title: '扫描完成！',
      description: '数据已更新。',
    },
    failedMessage: {
      title: '扫描失败',
      description: '请重试。',
    },
    onStatusChange: (newStatus, recordId) => {
      // If the active job completed, return to form view
      if (activeJob?.id === recordId && (newStatus === 'completed' || newStatus === 'failed')) {
        setViewState('form');
        setActiveJob(null);
      }
    },
  });

  // Handle new job submission
  const handleJobSubmitted = (jobId: string, brandName: string, searchQuery: string) => {
    setActiveJob({ id: jobId, brandName, searchQuery });
    setViewState('processing');
  };

  // Subscribe to real-time updates for the active job
  useEffect(() => {
    if (!activeJob || viewState !== 'processing') return;

    console.log('Subscribing to scan_results for job:', activeJob.id);

    const channel = supabase
      .channel(`scan_results_${activeJob.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_results',
          filter: `job_id=eq.${activeJob.id}`,
        },
        async () => {
          console.log('Received scan result for job:', activeJob.id);
          
          // Invalidate queries to refresh the list
          queryClient.invalidateQueries({ queryKey: ['scan-jobs-with-results'] });
          
          toast({
            title: '分析完成',
            description: 'AI 分析已完成，请在列表中查看结果',
          });

          // Return to form view
          setViewState('form');
          setActiveJob(null);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Also poll for existing results (in case the result came before subscription)
    const checkExistingResult = async () => {
      const { data } = await supabase
        .from('scan_results')
        .select('id')
        .eq('job_id', activeJob.id)
        .limit(1);

      if (data && data.length > 0) {
        console.log('Found existing result for job:', activeJob.id);
        queryClient.invalidateQueries({ queryKey: ['scan-jobs-with-results'] });
        setViewState('form');
        setActiveJob(null);
      }
    };

    checkExistingResult();

    return () => {
      console.log('Unsubscribing from channel');
      supabase.removeChannel(channel);
    };
  }, [activeJob, viewState, queryClient]);

  const handleBackToForm = () => {
    setViewState('form');
    setActiveJob(null);
  };

  return (
    <div className="space-y-8">
      {viewState === 'form' && (
        <>
          <NewScanForm onJobSubmitted={handleJobSubmitted} />
          <MonitorList />
        </>
      )}

      {viewState === 'processing' && activeJob && (
        <ProcessingState 
          brandName={activeJob.brandName} 
          searchQuery={activeJob.searchQuery}
          onBack={handleBackToForm}
        />
      )}
    </div>
  );
}
