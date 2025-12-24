import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Sparkles, 
  Award, 
  BarChart, 
  Smile, 
  Code,
  ArrowRight,
  Brain
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DiagnosisReportCard } from './DiagnosisReportCard';

interface DiagnosisHubProps {
  jobId: string;
  diagReport: string | null | undefined;
  reasoningTrace: string | null | undefined;
  suggestedStrategies: string[] | null | undefined;
}

// Strategy button configuration
const strategyConfig: Record<string, { icon: typeof Award; label: string; color: string; bgColor: string }> = {
  authority_endorsement: {
    icon: Award,
    label: '增加权威背书',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30'
  },
  data_statistics: {
    icon: BarChart,
    label: '注入统计数据',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30'
  },
  sentiment_improvement: {
    icon: Smile,
    label: '优化情感色彩',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30'
  },
  structure_optimization: {
    icon: Code,
    label: '优化 HTML 结构',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30'
  }
};

export function DiagnosisHub({ jobId, diagReport, reasoningTrace, suggestedStrategies }: DiagnosisHubProps) {
  const navigate = useNavigate();

  // Extract core issue from the report (first paragraph or summary)
  const extractCoreIssue = (report: string | null | undefined): string => {
    if (!report) return '正在分析中...';
    
    // Try to find a summary or core issue section
    const lines = report.split('\n').filter(l => l.trim());
    
    // Look for lines that might indicate core issues
    for (const line of lines) {
      if (line.includes('核心') || line.includes('主要') || line.includes('关键')) {
        return line.replace(/^[#\-*\s]+/, '').trim();
      }
    }
    
    // Fall back to first meaningful paragraph
    const firstParagraph = lines.find(l => l.length > 20 && !l.startsWith('#'));
    return firstParagraph?.replace(/^[#\-*\s]+/, '').trim() || '未能提取核心问题';
  };

  const coreIssue = extractCoreIssue(diagReport);
  const isAnalysisComplete = !!diagReport;

  const handleStrategyClick = (strategyId: string) => {
    navigate(`/dashboard/strategy-lab?source_job=${jobId}&strategy=${strategyId}`);
  };

  const processedReasoning = (reasoningTrace || '')
    .replace(/\\n/g, '\n')
    .replace(/\\#/g, '#');

  return (
    <div className="space-y-4">
      {/* Core Issue Alert */}
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <Stethoscope className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">核心死因诊断</AlertTitle>
        <AlertDescription className="text-base mt-2">
          {coreIssue}
        </AlertDescription>
      </Alert>

      {/* Diagnosis Report Card with Edit/Preview/Copy/Download/Save */}
      <DiagnosisReportCard
        jobId={jobId}
        diagReport={diagReport}
        isAnalysisComplete={isAnalysisComplete}
      />

      {/* Reasoning Trace (Collapsible) */}
      {reasoningTrace && (
        <Card className="border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" />
              AI 推理过程
              <Badge variant="outline" className="ml-auto text-xs border-slate-600">
                Reasoning Trace
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
              <div className="prose prose-sm max-w-none prose-invert prose-p:text-slate-400 font-mono text-xs">
                <ReactMarkdown>{processedReasoning}</ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Strategy Recommendations */}
      <Card className="border border-indigo-500/30 bg-indigo-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            智能策略推荐
            <Badge className="ml-auto bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              修复建议
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedStrategies && suggestedStrategies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedStrategies.map((strategyId) => {
                const config = strategyConfig[strategyId];
                if (!config) return null;

                const Icon = config.icon;
                return (
                  <Button
                    key={strategyId}
                    variant="outline"
                    className={`h-auto py-4 px-4 justify-start gap-3 border ${config.bgColor} transition-all`}
                    onClick={() => handleStrategyClick(strategyId)}
                  >
                    <Icon className={`h-6 w-6 ${config.color}`} />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">点击进入战略模拟</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>暂无策略推荐</p>
              <p className="text-sm">请等待 AI 完成诊断分析</p>
            </div>
          )}

          {/* Direct link to strategy lab */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <Button
              variant="default"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate(`/dashboard/strategy-lab?source_job=${jobId}`)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              进入战略模拟实验室
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
