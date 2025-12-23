import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ArrowRight, TrendingUp, Hash, Heart, FileText, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

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

interface ResultViewProps {
  result: ScanResult;
  brandName: string;
  searchQuery: string;
  onBack: () => void;
}

export function ResultView({ result, brandName, searchQuery, onBack }: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  const avsScore = result.avs_score ?? 0;
  const rankPosition = result.rank_position;
  const spiScore = result.spi_score ?? 0;

  const getScoreColor = (score: number) => {
    if (score <= 40) return 'hsl(0, 84%, 60%)'; // Red
    if (score <= 70) return 'hsl(45, 93%, 47%)'; // Yellow
    return 'hsl(142, 71%, 45%)'; // Green
  };

  const getScoreLabel = (score: number) => {
    if (score <= 40) return '需要优化';
    if (score <= 70) return '中等水平';
    return '表现优秀';
  };

  const handleCopy = async () => {
    if (result.raw_response_text) {
      await navigator.clipboard.writeText(result.raw_response_text);
      setCopied(true);
      toast({
        title: '已复制',
        description: 'AI 回复内容已复制到剪贴板',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const chartData = [
    {
      name: 'AVS',
      value: avsScore,
      fill: getScoreColor(avsScore),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        ← 返回创建新任务
      </Button>

      {/* Header with scores */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* AVS Score - Main */}
        <Card className="md:col-span-2 bg-card/40 backdrop-blur-xl border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <CardHeader className="relative pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              AI 可见度评分 (AVS)
            </CardTitle>
            <CardDescription>您的品牌在 AI 生成内容中的可见度</CardDescription>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="flex items-center gap-8">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={12}
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: 'hsl(var(--muted))' }}
                      dataKey="value"
                      cornerRadius={10}
                      angleAxisId={0}
                    />
                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-3xl font-bold"
                    >
                      {avsScore}
                    </text>
                    <text
                      x="50%"
                      y="60%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      / 100
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                <div 
                  className="text-lg font-semibold"
                  style={{ color: getScoreColor(avsScore) }}
                >
                  {getScoreLabel(avsScore)}
                </div>
                <p className="text-sm text-muted-foreground">
                  品牌「{brandName}」在搜索「{searchQuery}」时的 AI 可见度评分
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side scores */}
        <div className="space-y-4">
          {/* Rank Position */}
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Hash className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">排名位置</p>
                  <p className="text-2xl font-bold">
                    {rankPosition === null || rankPosition === 100 
                      ? '未上榜' 
                      : `第 ${rankPosition} 名`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SPI Score */}
          <Card className="bg-card/40 backdrop-blur-xl border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">情感指数 (SPI)</p>
                  <p className="text-2xl font-bold">{spiScore} / 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Raw Response Section */}
      <Card className="bg-card/40 backdrop-blur-xl border-border/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">AI 原始回复（证据）</CardTitle>
              <CardDescription>AI 模型的完整回复内容</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                复制内容
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-lg bg-muted/30 border border-border/30 p-6">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>
                {result.raw_response_text || '暂无回复内容'}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">想要提升排名？</h3>
                <p className="text-sm text-muted-foreground">
                  进入策略实验室，模拟优化方案
                </p>
              </div>
            </div>
            <Button asChild className="gap-2">
              <Link to={`/dashboard/strategy-lab?job_id=${result.job_id}`}>
                进入策略实验室
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
