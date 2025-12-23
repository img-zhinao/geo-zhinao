import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { EvidenceRoom } from '@/components/diagnosis/EvidenceRoom';
import { DiagnosisHub } from '@/components/diagnosis/DiagnosisHub';
import { DiagnosisLoading } from '@/components/diagnosis/DiagnosisLoading';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ScanResult {
  id: string;
  job_id: string;
  raw_response_text: string | null;
  avs_score: number | null;
  diag_attribution_report: string | null;
  diag_reasoning_trace: string | null;
  diag_suggested_strategies: string[] | null;
  diagnosed_at: string | null;
}

interface ScanJob {
  id: string;
  brand_name: string;
  search_query: string;
}

export default function Diagnosis() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanJob, setScanJob] = useState<ScanJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [diagnosisInProgress, setDiagnosisInProgress] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (!user || !jobId) return;

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch scan job info
      const { data: jobData } = await supabase
        .from('scan_jobs')
        .select('id, brand_name, search_query')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (jobData) {
        setScanJob(jobData);
      }

      // Fetch scan result
      const { data: resultData } = await supabase
        .from('scan_results')
        .select('id, job_id, raw_response_text, avs_score, diag_attribution_report, diag_reasoning_trace, diag_suggested_strategies, diagnosed_at')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (resultData) {
        setScanResult({
          ...resultData,
          diag_suggested_strategies: resultData.diag_suggested_strategies as string[] | null
        });
        // Check if diagnosis is still in progress
        setDiagnosisInProgress(!resultData.diag_attribution_report);
      } else {
        setDiagnosisInProgress(true);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, jobId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !jobId || !diagnosisInProgress) return;

    const channel = supabase
      .channel(`diagnosis-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scan_results',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.diag_attribution_report) {
            setScanResult({
              ...updated,
              diag_suggested_strategies: updated.diag_suggested_strategies as string[] | null
            });
            setDiagnosisInProgress(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, jobId, diagnosisInProgress]);

  // Show empty state if no jobId
  if (!jobId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">归因诊断</h1>
          </div>
          
          <Card className="border border-border/50">
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <Stethoscope className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                <h3 className="text-lg font-medium text-foreground">请选择要诊断的扫描任务</h3>
                <p className="text-muted-foreground">
                  请先在 GEO 分析页面完成扫描，然后点击"查看诊断"进入诊断页面
                </p>
                <Button onClick={() => navigate('/dashboard/geo-analysis')}>
                  前往 GEO 分析
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/geo-analysis')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              归因诊断报告
            </h1>
            {scanJob && (
              <p className="text-muted-foreground mt-1">
                品牌: {scanJob.brand_name} · 场景: {scanJob.search_query}
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        {diagnosisInProgress ? (
          <DiagnosisLoading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Evidence Room (40%) */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <EvidenceRoom
                  rawResponseText={scanResult?.raw_response_text}
                  avsScore={scanResult?.avs_score}
                />
              </div>
            </div>

            {/* Right: Diagnosis Hub (60%) */}
            <div className="lg:col-span-3">
              <DiagnosisHub
                jobId={jobId}
                diagReport={scanResult?.diag_attribution_report}
                reasoningTrace={scanResult?.diag_reasoning_trace}
                suggestedStrategies={scanResult?.diag_suggested_strategies}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
