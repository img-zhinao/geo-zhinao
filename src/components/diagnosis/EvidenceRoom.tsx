import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EvidenceRoomProps {
  rawResponseText: string | null | undefined;
  avsScore: number | null | undefined;
}

export function EvidenceRoom({ rawResponseText, avsScore }: EvidenceRoomProps) {
  const score = avsScore ?? 0;
  const isLowScore = score < 50;
  const isMediumScore = score >= 50 && score < 70;

  const getScoreColor = () => {
    if (isLowScore) return 'text-red-500';
    if (isMediumScore) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreLabel = () => {
    if (isLowScore) return '危险';
    if (isMediumScore) return '警告';
    return '正常';
  };

  const getScoreBorderColor = () => {
    if (isLowScore) return 'border-red-500/50';
    if (isMediumScore) return 'border-yellow-500/50';
    return 'border-green-500/50';
  };

  // Calculate the stroke offset for the circular gauge
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const processedText = (rawResponseText || '暂无原始回复数据')
    .replace(/\\n/g, '\n')
    .replace(/\\#/g, '#');

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* AVS Score Gauge */}
      <Card className={`border-2 ${getScoreBorderColor()} bg-card/50 backdrop-blur`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <ShieldAlert className={`h-5 w-5 ${getScoreColor()}`} />
            品牌可见性评分 (AVS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Circular Gauge */}
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={getScoreColor()}
                />
              </svg>
              {/* Score text in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}</span>
                <span className="text-xs text-muted-foreground">{getScoreLabel()}</span>
              </div>
            </div>
          </div>

          {/* Warning message for low scores */}
          {isLowScore && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-400 font-medium">
                品牌可见性极低，AI 回答中几乎未提及您的品牌
              </span>
            </div>
          )}

          {isMediumScore && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-yellow-400 font-medium">
                品牌可见性中等，仍有较大提升空间
              </span>
            </div>
          )}

          {!isLowScore && !isMediumScore && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-400 font-medium">
                品牌可见性良好
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Evidence Card */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            原始语料证据
            <Badge variant="outline" className="ml-auto text-xs font-mono">
              RAW DATA
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ScrollArea className="h-[400px] rounded-lg bg-muted/20 border border-border/30">
            <div className="p-4 font-mono text-sm">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded">
                <ReactMarkdown>
                  {processedText}
                </ReactMarkdown>
              </div>
            </div>
          </ScrollArea>
          <p className="text-xs text-muted-foreground mt-3">
            💡 提示：可选中文本进行复制
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
