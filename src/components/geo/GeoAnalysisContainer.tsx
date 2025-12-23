import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { NewScanForm } from './NewScanForm';
import { ProcessingState } from './ProcessingState';
import { ResultView } from './ResultView';
import { RecentScansList } from './RecentScansList';

type ViewState = 'form' | 'processing' | 'result';

interface ActiveJob {
  id: string;
  brandName: string;
  searchQuery: string;
}

interface ScanResult {
  id: string;
  job_id: string | null;
  avs_score: number | null;
  rank_position: number | null;
  spi_score: number | null;
  sentiment_score: number | null;
  raw_response_text: string | null;
  model_provider: string | null;
  created_at: string | null;
}

export function GeoAnalysisContainer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewState, setViewState] = useState<ViewState>('form');
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Handle new job submission
  const handleJobSubmitted = (jobId: string, brandName: string, searchQuery: string) => {
    setActiveJob({ id: jobId, brandName, searchQuery });
    setViewState('processing');
  };

  // Subscribe to real-time updates
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
        async (payload) => {
          console.log('Received scan result:', payload);
          const newResult = payload.new as ScanResult;
          setResult(newResult);
          setViewState('result');
          
          // Invalidate queries to refresh the list
          queryClient.invalidateQueries({ queryKey: ['scan-jobs'] });
          
          toast({
            title: '分析完成',
            description: 'AI 分析已完成，正在展示结果...',
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Also poll for existing results (in case the result came before subscription)
    const checkExistingResult = async () => {
      const { data } = await supabase
        .from('scan_results')
        .select('*')
        .eq('job_id', activeJob.id)
        .maybeSingle();

      if (data) {
        console.log('Found existing result:', data);
        setResult(data);
        setViewState('result');
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
    setResult(null);
  };

  // Handle viewing a result from the list
  const handleViewResult = async (jobId: string, brandName: string, searchQuery: string) => {
    const { data } = await supabase
      .from('scan_results')
      .select('*')
      .eq('job_id', jobId)
      .maybeSingle();

    if (data) {
      setActiveJob({ id: jobId, brandName, searchQuery });
      setResult(data);
      setViewState('result');
    } else {
      toast({
        title: '暂无结果',
        description: '该任务尚未完成分析',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      {viewState === 'form' && (
        <>
          <NewScanForm onJobSubmitted={handleJobSubmitted} />
          <RecentScansList onViewResult={handleViewResult} />
        </>
      )}

      {viewState === 'processing' && activeJob && (
        <ProcessingState 
          brandName={activeJob.brandName} 
          searchQuery={activeJob.searchQuery} 
        />
      )}

      {viewState === 'result' && result && activeJob && (
        <ResultView 
          result={result}
          brandName={activeJob.brandName}
          searchQuery={activeJob.searchQuery}
          onBack={handleBackToForm}
        />
      )}
    </div>
  );
}
