import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EvidenceRoomProps {
  rawResponseText: string | null | undefined;
  avsScore: number | null | undefined;
}

export function EvidenceRoom({ rawResponseText, avsScore }: EvidenceRoomProps) {
  const score = avsScore ?? 0;
  const isLowScore = score < 50;
  const isMediumScore = score >= 50 && score < 70;

  // Calculate gauge rotation (0-100 maps to -90 to 90 degrees)
  const gaugeRotation = ((score / 100) * 180) - 90;

  const getScoreColor = () => {
    if (isLowScore) return 'text-destructive';
    if (isMediumScore) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreBg = () => {
    if (isLowScore) return 'bg-destructive/10 border-destructive/30';
    if (isMediumScore) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/30';
  };

  const processedText = (rawResponseText || '暂无原始回复数据')
    .replace(/\\n/g, '\n')
    .replace(/\\#/g, '#');

  return (
    <div className="space-y-4">
      {/* AVS Score Gauge */}
      <Card className={`border ${getScoreBg()}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {isLowScore ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className={`h-5 w-5 ${getScoreColor()}`} />
            )}
            品牌可见性评分 (AVS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Gauge Display */}
          <div className="flex flex-col items-center py-4">
            <div className="relative w-40 h-20 overflow-hidden">
              {/* Gauge background */}
              <div className="absolute bottom-0 left-0 right-0 h-40 w-40 rounded-full border-8 border-muted" 
                   style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }} />
              
              {/* Gauge fill */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-40 w-40 rounded-full border-8 ${isLowScore ? 'border-destructive' : isMediumScore ? 'border-yellow-500' : 'border-green-500'}`}
                style={{ 
                  clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
                  transform: `rotate(${gaugeRotation}deg)`,
                  transformOrigin: 'center center'
                }} 
              />
              
              {/* Score number */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
                <span className="text-muted-foreground text-sm">/100</span>
              </div>
            </div>
          </div>

          {/* Warning message for low scores */}
          {isLowScore && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/20 border border-destructive/30 mt-2">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              <span className="text-sm text-destructive font-medium">
                品牌可见性极低，AI 回答中几乎未提及您的品牌
              </span>
            </div>
          )}

          {isMediumScore && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 mt-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                品牌可见性中等，仍有较大提升空间
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Evidence Card */}
      <Card className="border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            原始语料证据
            <Badge variant="outline" className="ml-auto text-xs">
              Raw Evidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] rounded-lg bg-muted/30 border border-border/30">
            <div className="p-4 font-mono text-sm">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded">
                <ReactMarkdown>
                  {processedText}
                </ReactMarkdown>
              </div>
            </div>
          </ScrollArea>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            💡 提示：可选中文本进行复制
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
