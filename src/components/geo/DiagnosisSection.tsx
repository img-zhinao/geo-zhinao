import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Loader2, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReactMarkdown from 'react-markdown';
import { 
  triggerDiagnosis, 
  checkExistingDiagnosis, 
  subscribeToDiagnosisUpdates,
  DiagnosisReport,
  DiagnosisTriggerPayload
} from '@/lib/diagnosis';

interface DiagnosisSectionProps {
  scanResultId: string;
  jobId: string;
}

// GEO keywords for highlighting
const GEO_KEYWORDS = [
  'Authority',
  'Statistics',
  'Citation',
  'Structured Data',
  'Entity',
  'E-E-A-T',
  'Trust',
  'Expertise',
  'Experience',
  'Authoritativeness',
];

// Custom component for highlighting GEO keywords
function HighlightedMarkdown({ content }: { content: string }) {
  let highlightedContent = content;
  GEO_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlightedContent = highlightedContent.replace(
      regex, 
      '**$1**'
    );
  });

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-strong:text-primary">
      <ReactMarkdown>{highlightedContent}</ReactMarkdown>
    </div>
  );
}

export function DiagnosisSection({
  scanResultId,
  jobId,
}: DiagnosisSectionProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [diagnosis, setDiagnosis] = useState<DiagnosisReport | null>(null);
  const [isReportExpanded, setIsReportExpanded] = useState(false);

  // Check for existing diagnosis on mount
  useEffect(() => {
    const checkDiagnosis = async () => {
      setIsChecking(true);
      const existing = await checkExistingDiagnosis(scanResultId);
      if (existing) {
        setDiagnosis(existing);
      }
      setIsChecking(false);
    };
    checkDiagnosis();
  }, [scanResultId]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToDiagnosisUpdates(scanResultId, (report) => {
      setDiagnosis(report);
      setIsLoading(false);
      if (report.status === 'completed') {
        setIsReportExpanded(true);
      }
    });

    return unsubscribe;
  }, [scanResultId]);

  const handleStartDiagnosis = async () => {
    setIsLoading(true);

    const payload: DiagnosisTriggerPayload = {
      job_id: jobId,
      scan_result_id: scanResultId,
    };

    const diagnosisId = await triggerDiagnosis(payload);
    
    if (!diagnosisId) {
      setIsLoading(false);
    }
  };

  const handleViewReport = () => {
    if (diagnosis) {
      navigate(`/dashboard/diagnosis/${diagnosis.id}`);
    }
  };

  // Parse missing pillars
  const parseMissingPillars = (pillars: string | null): string[] => {
    if (!pillars) return [];
    try {
      const parsed = JSON.parse(pillars);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return pillars.split(',').map(p => p.trim()).filter(Boolean);
    }
    return [];
  };

  const missingPillars = diagnosis ? parseMissingPillars(diagnosis.missing_geo_pillars) : [];
  const isProcessing = diagnosis?.status === 'queued' || diagnosis?.status === 'processing';
  const isCompleted = diagnosis?.status === 'completed';

  if (isChecking) {
    return (
      <Card className="bg-muted/20 border-border/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>检查诊断状态...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/20 border-border/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            GEO 归因诊断
          </CardTitle>
          
          {/* Action Button */}
          {!diagnosis ? (
            <Button
              onClick={handleStartDiagnosis}
              disabled={isLoading}
              size="sm"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  🤖 生成 GEO 归因诊断
                </>
              )}
            </Button>
          ) : isProcessing ? (
            <Button disabled size="sm" variant="secondary" className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              DeepSeek-R1 正在分析...
            </Button>
          ) : isCompleted ? (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                已完成
              </Badge>
              <Button
                onClick={handleViewReport}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                查看完整报告
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartDiagnosis}
              disabled={isLoading}
              size="sm"
              className="gap-2"
            >
              🤖 重新诊断
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Processing State */}
      {isProcessing && (
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="text-sm font-medium">DeepSeek-R1 正在进行病理分析...</p>
            <p className="text-xs mt-1">分析完成后将自动显示结果</p>
          </div>
        </CardContent>
      )}

      {/* Completed Report Preview */}
      {isCompleted && diagnosis && (
        <CardContent className="pt-0 space-y-4">
          {/* Missing Pillars Alert */}
          {missingPillars.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">缺失 GEO 支柱</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingPillars.map((pillar, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs">
                    {pillar}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Root Cause Analysis Collapsible */}
          {diagnosis.root_cause_analysis && (
            <Collapsible open={isReportExpanded} onOpenChange={setIsReportExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    根因分析报告
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isReportExpanded ? '收起' : '展开'}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-[200px] w-full rounded-md border border-border/20 p-4 mt-2">
                  <HighlightedMarkdown content={diagnosis.root_cause_analysis} />
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Optimization Suggestions */}
          {diagnosis.optimization_suggestions && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  优化建议
                </span>
              </div>
              <ScrollArea className="max-h-[150px]">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{diagnosis.optimization_suggestions}</ReactMarkdown>
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
