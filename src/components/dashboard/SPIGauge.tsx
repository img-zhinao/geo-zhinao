import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SPIData {
  averageSPI: number;
  totalScans: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export function SPIGauge() {
  const { user } = useAuth();
  const [data, setData] = useState<SPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSPIData = async () => {
      if (!user?.id) return;

      try {
        const { data: scanResults, error } = await supabase
          .from('scan_results')
          .select(`
            spi_score,
            scan_jobs!inner(user_id)
          `)
          .eq('scan_jobs.user_id', user.id)
          .not('spi_score', 'is', null);

        if (error) throw error;

        if (scanResults && scanResults.length > 0) {
          const scores = scanResults.map(r => Number(r.spi_score));
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          
          setData({
            averageSPI: Math.round(avg * 10) / 10,
            totalScans: scanResults.length,
            positiveCount: scores.filter(s => s > 60).length,
            neutralCount: scores.filter(s => s >= 40 && s <= 60).length,
            negativeCount: scores.filter(s => s < 40).length,
          });
        }
      } catch (error) {
        console.error('Error fetching SPI data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSPIData();
  }, [user?.id]);

  const getSPIStatus = (score: number) => {
    if (score >= 70) return { label: '积极', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: Smile };
    if (score >= 40) return { label: '中性', color: 'text-amber-500', bg: 'bg-amber-500', icon: Meh };
    return { label: '消极', color: 'text-red-500', bg: 'bg-red-500', icon: Frown };
  };

  const status = data ? getSPIStatus(data.averageSPI) : null;
  const StatusIcon = status?.icon || Meh;

  // 计算仪表盘角度 (0-100 映射到 -90 到 90 度)
  const gaugeAngle = data ? (data.averageSPI / 100) * 180 - 90 : -90;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <StatusIcon className={`h-5 w-5 ${status?.color || 'text-muted-foreground'}`} />
          </div>
          <div>
            <CardTitle>品牌情感极性 (SPI)</CardTitle>
            <CardDescription>AI 对品牌的整体情感倾向</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Meh className="h-12 w-12 mb-4 opacity-30" />
            <p>暂无 SPI 数据</p>
            <p className="text-sm">完成 GEO 扫描后将显示情感分析</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 仪表盘 */}
            <div className="relative flex justify-center">
              <div className="relative w-48 h-24 overflow-hidden">
                {/* 背景弧 */}
                <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-500/20 via-amber-500/20 to-emerald-500/20" />
                
                {/* 刻度线 */}
                <svg className="absolute inset-0" viewBox="0 0 192 96">
                  {[0, 25, 50, 75, 100].map((tick) => {
                    const angle = ((tick / 100) * 180 - 180) * (Math.PI / 180);
                    const x1 = 96 + 80 * Math.cos(angle);
                    const y1 = 96 + 80 * Math.sin(angle);
                    const x2 = 96 + 90 * Math.cos(angle);
                    const y2 = 96 + 90 * Math.sin(angle);
                    return (
                      <line
                        key={tick}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="2"
                        opacity={0.5}
                      />
                    );
                  })}
                </svg>

                {/* 指针 */}
                <div 
                  className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom transition-transform duration-1000 ease-out"
                  style={{ transform: `translateX(-50%) rotate(${gaugeAngle}deg)` }}
                >
                  <div className={`w-full h-full rounded-full ${status?.bg}`} />
                </div>

                {/* 中心圆 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-card border-4 border-border flex items-center justify-center">
                  <StatusIcon className={`h-4 w-4 ${status?.color}`} />
                </div>
              </div>
            </div>

            {/* 分数和状态 */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className={`text-4xl font-bold ${status?.color}`}>
                  {data.averageSPI}
                </span>
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              <Badge 
                variant="outline" 
                className={`${status?.color} border-current`}
              >
                {status?.label}倾向
              </Badge>
            </div>

            {/* 分布统计 */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-500">
                  <Smile className="h-4 w-4" />
                  <span className="font-semibold">{data.positiveCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">积极</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Meh className="h-4 w-4" />
                  <span className="font-semibold">{data.neutralCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">中性</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-500">
                  <Frown className="h-4 w-4" />
                  <span className="font-semibold">{data.negativeCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">消极</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
