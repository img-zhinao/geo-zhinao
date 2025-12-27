import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { 
  Stethoscope, 
  ArrowLeft, 
  Loader2,
  FileText,
  Lightbulb,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { StrategySimulator } from '@/components/geo/StrategySimulator';

// Extended report type with related data
interface DiagnosisReportWithRelations {
  id: string;
  scan_result_id: string;
  job_id: string | null;
  root_cause_analysis: string | null;
  missing_geo_pillars: string | null;
  optimization_suggestions: string | null;
  status: string | null;
  diagnostic_model: string | null;
  tokens_used: number | null;
  created_at: string | null;
  scanResult?: {
    id: string;
    raw_response_text: string | null;
    scan_jobs?: {
      id: string;
      brand_name: string;
      search_query: string;
    };
  };
  scanJob?: {
    id: string;
    brand_name: string;
    search_query: string;
  };
}

// Parse missing pillars
const parseMissingPillars = (pillars: string | null | undefined): string[] => {
  if (!pillars) return [];
  try {
    const parsed = JSON.parse(pillars);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return pillars.split(',').map(p => p.trim()).filter(Boolean);
  }
  return [];
};

export default function Diagnosis() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  // Fetch diagnosis report with related scan data
  const { data: report, isLoading, refetch } = useQuery<DiagnosisReportWithRelations | null>({
    queryKey: ['diagnosis-report-full', reportId],
    queryFn: async (): Promise<DiagnosisReportWithRelations | null> => {
      if (!reportId) return null;
      
      // Get diagnosis report
      const { data: diagnosisData, error: diagnosisError } = await supabase
        .from('diagnosis_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (diagnosisError) throw diagnosisError;

      // Get related scan result and job info
      if (diagnosisData.scan_result_id) {
        const { data: scanData } = await supabase
          .from('scan_results')
          .select('*, scan_jobs(*)')
          .eq('id', diagnosisData.scan_result_id)
          .single();

        const result: DiagnosisReportWithRelations = {
          ...diagnosisData,
          scanResult: scanData ? {
            id: scanData.id,
            raw_response_text: scanData.raw_response_text,
            scan_jobs: scanData.scan_jobs as { id: string; brand_name: string; search_query: string } | undefined,
          } : undefined,
          scanJob: scanData?.scan_jobs as { id: string; brand_name: string; search_query: string } | undefined,
        };

        return result;
      }

      return diagnosisData as DiagnosisReportWithRelations;
    },
    enabled: !!reportId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'queued' || data?.status === 'processing') {
        return 3000;
      }
      return false;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!reportId) return;

    const channel = supabase
      .channel(`diagnosis_${reportId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'diagnosis_reports',
          filter: `id=eq.${reportId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, refetch]);

  const missingPillars = parseMissingPillars(report?.missing_geo_pillars);

  return (
    <DashboardLayout>
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/geo-analysis')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回监控中心
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">归因诊断报告</h1>
            <p className="text-muted-foreground">
              基于 DeepSeek-R1 深度分析的诊断结果
            </p>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : !report ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">报告不存在</h3>
              <p className="text-muted-foreground">无法找到该诊断报告</p>
            </CardContent>
          </Card>
        ) : report.status === 'queued' || report.status === 'processing' ? (
          /* Processing State */
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Stethoscope className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
              </div>
              <h3 className="text-xl font-semibold mt-6">AI 正在深度诊断...</h3>
              <p className="text-muted-foreground mt-2">
                DeepSeek-R1 正在分析您的品牌在 AI 回复中的表现
              </p>
              <Badge variant="secondary" className="mt-4 gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {report.status === 'queued' ? '排队中' : '分析中'}
              </Badge>
            </CardContent>
          </Card>
        ) : report.status === 'failed' ? (
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">诊断失败</h3>
              <p className="text-muted-foreground">分析过程中出现错误，请稍后重试</p>
            </CardContent>
          </Card>
        ) : (
          /* Completed State - Show Report */
          <div className="space-y-6">
            {/* Missing GEO Pillars Alert */}
            {missingPillars.length > 0 && (
              <Card className="bg-destructive/5 border-destructive/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/20">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <CardTitle className="text-lg text-destructive">缺失 GEO 支柱</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {missingPillars.map((pillar, idx) => (
                      <Badge key={idx} variant="destructive" className="text-sm">
                        {pillar}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Root Cause Analysis */}
            {report.root_cause_analysis && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">根因分析</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[300px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{report.root_cause_analysis}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Optimization Suggestions */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">优化建议</CardTitle>
                    <CardDescription>
                      诊断模型: {report.diagnostic_model} | Token 消耗: {report.tokens_used}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-lg bg-muted/30 border border-border/30 p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {report.optimization_suggestions || '暂无优化建议'}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Strategy Simulator - The New Component */}
            {report.scan_result_id && (
              <StrategySimulator
                diagnosisId={report.id}
                missingGeoPillars={report.missing_geo_pillars}
                rawResponseText={report.scanResult?.raw_response_text || null}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
