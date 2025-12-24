import { 
  Eye, 
  EyeOff, 
  Trophy, 
  Activity, 
  Users, 
  FileText, 
  Link as LinkIcon,
  Stethoscope,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import type { Json } from '@/integrations/supabase/types';

export interface ScanResultData {
  id: string;
  model_name: string;
  rank_position: number | null;
  avs_score: number | null;
  spi_score: number | null;
  sentiment_score: number | null;
  is_visible: boolean | null;
  competitors_mentioned: string | null;
  raw_response_text: string | null;
  citations: Json | null;
  created_at: string | null;
}

interface ScanResultDetailProps {
  result: ScanResultData;
  onStartDiagnosis: (scanResultId: string) => void;
  isDiagnosing: string | null;
}

// Helper to get AVS color based on score
const getAVSColor = (score: number | null) => {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-destructive';
};

// Helper to get AVS stroke color for radial chart
const getAVSStrokeColor = (score: number | null) => {
  if (score === null) return 'hsl(var(--muted))';
  if (score >= 80) return 'hsl(142, 76%, 36%)'; // green
  if (score >= 50) return 'hsl(48, 96%, 53%)'; // yellow
  return 'hsl(var(--destructive))'; // red
};

// Helper to get SPI sentiment label
const getSPILabel = (score: number | null) => {
  if (score === null) return { label: '无数据', variant: 'outline' as const };
  if (score > 60) return { label: '正面', variant: 'default' as const };
  if (score >= 40) return { label: '中性', variant: 'secondary' as const };
  return { label: '负面', variant: 'destructive' as const };
};

// Radial progress component for AVS
function RadialProgress({ score, size = 100 }: { score: number | null; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = score ?? 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getAVSStrokeColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getAVSColor(score)}`}>
          {score !== null ? Math.round(score) : '-'}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function ScanResultDetail({ result, onStartDiagnosis, isDiagnosing }: ScanResultDetailProps) {
  const spiInfo = getSPILabel(result.spi_score);
  
  // Parse competitors from string (comma-separated or JSON)
  const parseCompetitors = (competitors: string | null): string[] => {
    if (!competitors) return [];
    try {
      const parsed = JSON.parse(competitors);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // If not JSON, split by comma
      return competitors.split(',').map(c => c.trim()).filter(Boolean);
    }
    return [];
  };
  
  const competitors = parseCompetitors(result.competitors_mentioned);
  
  // Parse citations from JSONB
  const parseCitations = (citations: Json | null): string[] => {
    if (!citations) return [];
    if (Array.isArray(citations)) {
      return citations.filter((c): c is string => typeof c === 'string');
    }
    return [];
  };
  
  const citationsList = parseCitations(result.citations);
  
  const isNotRanked = result.rank_position === null || result.rank_position === 0 || result.rank_position >= 100;

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AVS Score Card */}
        <Card className="bg-muted/20 border-border/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              AI 可见性 (AVS)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <RadialProgress score={result.avs_score} />
          </CardContent>
        </Card>

        {/* SPI Score Card */}
        <Card className="bg-muted/20 border-border/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              情感极性 (SPI)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>负面</span>
                <span>中性</span>
                <span>正面</span>
              </div>
              <Progress 
                value={result.spi_score ?? 50} 
                className="h-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {result.spi_score !== null ? Math.round(result.spi_score) : '-'}
              </span>
              <Badge variant={spiInfo.variant}>{spiInfo.label}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rank Position Card */}
        <Card className="bg-muted/20 border-border/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              推荐排名
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isNotRanked ? (
                  <>
                    <span className="text-3xl font-bold text-muted-foreground">-</span>
                    <span className="text-sm text-muted-foreground">未上榜</span>
                  </>
                ) : (
                  <>
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-3xl font-bold">#{result.rank_position}</span>
                  </>
                )}
              </div>
              <Badge 
                variant={result.is_visible ? 'default' : 'destructive'}
                className="gap-1"
              >
                {result.is_visible ? (
                  <>
                    <Eye className="h-3 w-3" />
                    可见
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    不可见
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitors Section */}
      {competitors.length > 0 && (
        <Card className="bg-muted/20 border-border/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              竞品提及 (Competitors Found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {competitors.map((competitor, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {competitor}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response Section */}
      {result.raw_response_text && (
        <Card className="bg-muted/20 border-border/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              AI 原始回复
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border border-border/20 p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result.raw_response_text}</ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Citations Section */}
      {citationsList.length > 0 && (
        <Card className="bg-muted/20 border-border/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              引用来源 ({citationsList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {citationsList.map((url, idx) => (
                <li key={idx}>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Diagnosis Action */}
      <div className="flex justify-end">
        <Button
          onClick={() => onStartDiagnosis(result.id)}
          disabled={isDiagnosing === result.id}
          className="gap-2"
        >
          {isDiagnosing === result.id ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              诊断中...
            </>
          ) : (
            <>
              <Stethoscope className="h-4 w-4" />
              归因诊断
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
