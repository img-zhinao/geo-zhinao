import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Hexagon, TrendingUp } from 'lucide-react';

// 数据库字段名格式 (snake_case)
interface SIScoresDB {
  relevance?: number;
  influence?: number;
  uniqueness?: number;
  subjective_position?: number;
  subjective_count?: number;
  follow_up_probability?: number;
  diversity?: number;
}

// geo_metrics 嵌套结构
interface GeoMetricsDB {
  si_scores?: SIScoresDB;
  algorithm_version?: string;
  pawc?: unknown;
  drivers?: string[];
}

interface SIRadarChartProps {
  scores?: SIScoresDB | null;
  geoMetrics?: GeoMetricsDB | null;
}

// 7维 SI 评分标签 - key 匹配数据库 snake_case 格式
const SI_DIMENSIONS = [
  { key: 'relevance', label: '相关性', fullMark: 100 },
  { key: 'influence', label: '影响力', fullMark: 100 },
  { key: 'uniqueness', label: '独特性', fullMark: 100 },
  { key: 'subjective_position', label: '主观位置', fullMark: 100 },
  { key: 'subjective_count', label: '主观数量', fullMark: 100 },
  { key: 'follow_up_probability', label: '追问概率', fullMark: 100 },
  { key: 'diversity', label: '多样性', fullMark: 100 },
];

export function SIRadarChart({ scores, geoMetrics }: SIRadarChartProps) {
  // 按优先级解析 si_scores: scores prop > geoMetrics.si_scores > geoMetrics 本身(兼容旧格式)
  const resolvedScores: SIScoresDB | null = 
    scores ?? 
    geoMetrics?.si_scores ?? 
    (geoMetrics as unknown as SIScoresDB | null);
  
  // 转换数据格式 - 将 1-5 分制转换为百分制
  const chartData = SI_DIMENSIONS.map((dim) => {
    const rawValue = resolvedScores?.[dim.key as keyof SIScoresDB] ?? 0;
    // 数据库存的是 1-5 分，转换为 0-100 分
    const value = typeof rawValue === 'number' ? rawValue * 20 : 0;
    return {
      dimension: dim.label,
      value,
      fullMark: dim.fullMark,
    };
  });

  // 计算平均分 (基于百分制)
  const values = SI_DIMENSIONS.map(dim => {
    const rawValue = resolvedScores?.[dim.key as keyof SIScoresDB];
    return typeof rawValue === 'number' ? rawValue * 20 : null;
  }).filter((v): v is number => v !== null);
  
  const averageScore = values.length > 0
    ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
    : 0;

  // 计算提升等级
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: '优秀', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { label: '良好', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (score >= 40) return { label: '一般', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: '待优化', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const level = getScoreLevel(averageScore);

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Hexagon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">7 维 SI 评分雷达</CardTitle>
              <CardDescription>GEO 优化后的多维度效果评估</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${level.color}`}>{averageScore}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <Badge variant="outline" className={`${level.bg} ${level.color} border-current mt-1`}>
              {level.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!resolvedScores ? (
          <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
            <Hexagon className="h-16 w-16 opacity-30 mb-4" />
            <p>暂无 SI 评分数据</p>
            <p className="text-sm">完成策略模拟后将显示雷达图</p>
          </div>
        ) : (
          <>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid 
                    stroke="hsl(var(--border))" 
                    strokeOpacity={0.5}
                  />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ 
                      fill: 'hsl(var(--muted-foreground))', 
                      fontSize: 12,
                    }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ 
                      fill: 'hsl(var(--muted-foreground))', 
                      fontSize: 10,
                    }}
                    tickCount={5}
                  />
                  <Radar
                    name="SI 评分"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} 分`, '评分']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 维度详情 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
              {SI_DIMENSIONS.map((dim) => {
                const rawValue = resolvedScores?.[dim.key as keyof SIScoresDB] ?? 0;
                const value = typeof rawValue === 'number' ? rawValue * 20 : 0;
                const dimLevel = getScoreLevel(value);
                return (
                  <div 
                    key={dim.key} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-xs text-muted-foreground">{dim.label}</span>
                    <span className={`text-sm font-semibold ${dimLevel.color}`}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
