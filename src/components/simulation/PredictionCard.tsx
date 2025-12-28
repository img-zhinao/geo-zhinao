import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Sparkles, Zap } from 'lucide-react';

interface PredictionCardProps {
  predictedRankChange: string | null;
  algorithm?: string;
}

export function PredictionCard({ predictedRankChange, algorithm = 'Princeton-GEO-v1.3' }: PredictionCardProps) {
  // 解析预测值
  const parseChange = (change: string | null): { value: number; display: string; isPositive: boolean } => {
    if (!change) return { value: 0, display: '+0%', isPositive: true };
    
    // 尝试解析数字
    const match = change.match(/([+-]?\d+(?:\.\d+)?)/);
    if (match) {
      const value = parseFloat(match[1]);
      const isPositive = !change.startsWith('-');
      return {
        value: Math.abs(value),
        display: change,
        isPositive,
      };
    }
    
    return { value: 0, display: change, isPositive: true };
  };

  const { value, display, isPositive } = parseChange(predictedRankChange);

  return (
    <Card 
      className="relative overflow-hidden border-2"
      style={{
        background: isPositive 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
        borderColor: isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
      }}
    >
      {/* 装饰性背景元素 */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <TrendingUp className="w-full h-full text-emerald-500" />
      </div>

      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 左侧：主要指标 */}
          <div className="flex items-center gap-6">
            <div 
              className="p-4 rounded-2xl"
              style={{
                background: isPositive 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
              }}
            >
              <TrendingUp 
                className={`h-10 w-10 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} 
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">预测 AI 可见度提升</p>
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-5xl font-bold tracking-tight"
                  style={{
                    background: isPositive 
                      ? 'linear-gradient(135deg, #10b981, #34d399)' 
                      : 'linear-gradient(135deg, #ef4444, #f87171)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {display}
                </span>
                {isPositive && value > 50 && (
                  <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* 右侧：算法背书 */}
          <div className="flex flex-col items-end gap-3">
            <Badge 
              variant="outline" 
              className="gap-2 px-3 py-1.5 bg-primary/5 border-primary/20"
            >
              <Award className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs">{algorithm}</span>
            </Badge>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-amber-500" />
              <span>基于 GEO 论文算法预测</span>
            </div>

            {/* 可信度指示器 */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= Math.min(5, Math.ceil(value / 20))
                      ? 'bg-emerald-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">可信度</span>
            </div>
          </div>
        </div>

        {/* 底部进度条 */}
        {isPositive && (
          <div className="mt-6 pt-4 border-t border-emerald-500/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>可见度提升进度</span>
              <span>{Math.min(100, value)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, value)}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
