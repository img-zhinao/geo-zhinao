import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useMonthlyUsage, useCreditsBalance } from '@/hooks/useCredits';
import { Brain, TrendingUp, Search, Zap, ArrowUpRight, Coins } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AVSTrendChart } from '@/components/dashboard/AVSTrendChart';
import { SPIGauge } from '@/components/dashboard/SPIGauge';
import { useNavigate } from 'react-router-dom';
import { useCreditTransactions } from '@/hooks/useCredits';

export default function Dashboard() {
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const { data: monthlyUsage = 0 } = useMonthlyUsage();
  const { balance } = useCreditsBalance();
  const { data: transactions = [] } = useCreditTransactions(7);

  // Generate credit usage data from recent transactions
  const creditUsageData = (() => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = days[date.getDay()];
      
      // Sum up credits used on this day
      const dayCredits = transactions
        .filter(t => {
          const tDate = new Date(t.created_at);
          return tDate.toDateString() === date.toDateString() && t.amount < 0;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      data.push({ date: dayName, credits: dayCredits });
    }
    
    return data;
  })();

  const statsCards = [
    { title: '总扫描次数', value: '24', change: '+12%', icon: Search },
    { title: '品牌提及', value: '156', change: '+8%', icon: TrendingUp },
    { title: '剩余积分', value: String(balance), change: '可用', icon: Coins },
    { title: '本月已用', value: String(monthlyUsage), change: '积分', icon: Zap },
  ];

  const getGreeting = () => {
    const name = profile?.full_name?.split(' ')[0] || '用户';
    return `欢迎回来，${name}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold">{getGreeting()}</h1>
          <p className="text-muted-foreground mt-1">
            以下是您的 GEO 分析数据概览。
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AVS Trend Chart & SPI Gauge */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AVSTrendChart />
          </div>
          <div>
            <SPIGauge />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Credit Usage Chart */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>积分使用历史</CardTitle>
              <CardDescription>过去7天的积分消耗情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={creditUsageData}>
                    <defs>
                      <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
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
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="credits"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#creditGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>开始常用任务</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div 
                onClick={() => navigate('/dashboard/geo-analysis')}
                className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">新建 GEO 分析</h3>
                  <p className="text-sm text-muted-foreground">分析您的品牌在 AI 平台的可见度</p>
                </div>
              </div>
              <div 
                onClick={() => navigate('/dashboard/keywords')}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20 hover:bg-secondary/10 transition-colors cursor-pointer"
              >
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Brain className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-medium">发现关键词</h3>
                  <p className="text-sm text-muted-foreground">找到高影响力的搜索词</p>
                </div>
              </div>
              <div 
                onClick={() => navigate('/dashboard/diagnosis-list')}
                className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 border border-accent-foreground/20 hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="p-3 rounded-lg bg-accent">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">查看报告</h3>
                  <p className="text-sm text-muted-foreground">访问最新分析报告</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
