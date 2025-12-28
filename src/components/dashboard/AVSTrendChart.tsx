import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface AVSDataPoint {
  date: string;
  [model: string]: number | string;
}

const MODEL_COLORS: Record<string, string> = {
  'DeepSeek-V3': '#10b981',    // 科技绿
  '豆包': '#f59e0b',           // 琥珀色
  'ChatGPT': '#3b82f6',        // 蓝色
  'Claude': '#8b5cf6',         // 紫色
  'Gemini': '#ec4899',         // 粉色
  'Kimi': '#06b6d4',           // 青色
};

export function AVSTrendChart() {
  const { user } = useAuth();
  const [data, setData] = useState<AVSDataPoint[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAVSData = async () => {
      if (!user?.id) return;

      try {
        // 获取用户的扫描结果，包含 AVS 分数
        const { data: scanResults, error } = await supabase
          .from('scan_results')
          .select(`
            avs_score,
            model_name,
            created_at,
            scan_jobs!inner(user_id)
          `)
          .eq('scan_jobs.user_id', user.id)
          .not('avs_score', 'is', null)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) throw error;

        // 按日期和模型聚合数据
        const aggregated: Record<string, Record<string, number[]>> = {};
        const uniqueModels = new Set<string>();

        scanResults?.forEach((result) => {
          const date = format(new Date(result.created_at), 'MM/dd', { locale: zhCN });
          const model = result.model_name;
          const score = Number(result.avs_score);

          uniqueModels.add(model);

          if (!aggregated[date]) {
            aggregated[date] = {};
          }
          if (!aggregated[date][model]) {
            aggregated[date][model] = [];
          }
          aggregated[date][model].push(score);
        });

        // 计算每日平均分
        const chartData: AVSDataPoint[] = Object.entries(aggregated).map(([date, modelScores]) => {
          const point: AVSDataPoint = { date };
          Object.entries(modelScores).forEach(([model, scores]) => {
            point[model] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          });
          return point;
        });

        setData(chartData);
        setModels(Array.from(uniqueModels));
      } catch (error) {
        console.error('Error fetching AVS data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAVSData();
  }, [user?.id]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle>AVS 可见度趋势</CardTitle>
              <CardDescription>品牌在不同 AI 模型中的可见度波动</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {models.slice(0, 3).map((model) => (
              <Badge 
                key={model} 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: MODEL_COLORS[model] || '#6b7280',
                  color: MODEL_COLORS[model] || '#6b7280'
                }}
              >
                {model}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <p>暂无 AVS 数据</p>
            <p className="text-sm">完成 GEO 扫描后将显示趋势</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <defs>
                  {models.map((model) => (
                    <linearGradient key={model} id={`gradient-${model}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={MODEL_COLORS[model] || '#6b7280'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={MODEL_COLORS[model] || '#6b7280'} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
                <Legend />
                {models.map((model) => (
                  <Line
                    key={model}
                    type="monotone"
                    dataKey={model}
                    stroke={MODEL_COLORS[model] || '#6b7280'}
                    strokeWidth={2}
                    dot={{ fill: MODEL_COLORS[model] || '#6b7280', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
