import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { GeoAnalysisContainer } from '@/components/geo/GeoAnalysisContainer';
import { Cpu, Activity, Zap, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, subDays } from 'date-fns';
import { useEffect } from 'react';

export default function GeoAnalysis() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Real-time subscription for instant updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scan_jobs' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['today-scans', user.id] });
          queryClient.invalidateQueries({ queryKey: ['avg-response-time', user.id] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scan_results' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['model-calls', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
  
  // Fetch today's scan count with auto-refresh every 30s
  const { data: todayScans, isLoading: loadingToday } = useQuery({
    queryKey: ['today-scans', user?.id],
    queryFn: async () => {
      if (!user) return { today: 0, yesterday: 0 };
      
      const todayStart = startOfDay(new Date()).toISOString();
      const yesterdayStart = startOfDay(subDays(new Date(), 1)).toISOString();
      
      const [todayResult, yesterdayResult] = await Promise.all([
        supabase
          .from('scan_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', todayStart),
        supabase
          .from('scan_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', yesterdayStart)
          .lt('created_at', todayStart)
      ]);
      
      return {
        today: todayResult.count || 0,
        yesterday: yesterdayResult.count || 0
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Fetch total model calls with auto-refresh every 30s
  const { data: modelCalls, isLoading: loadingCalls } = useQuery({
    queryKey: ['model-calls', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, todayCount: 0 };
      
      const todayStart = startOfDay(new Date()).toISOString();
      
      const [totalResult, todayResult] = await Promise.all([
        supabase
          .from('scan_results')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('scan_results')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', todayStart)
      ]);
      
      return {
        total: totalResult.count || 0,
        todayCount: todayResult.count || 0
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Calculate average response time with auto-refresh
  const { data: avgTime, isLoading: loadingTime } = useQuery({
    queryKey: ['avg-response-time', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from('scan_jobs')
        .select('created_at, updata_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('updata_at', 'is', null)
        .limit(20);
      
      if (!data || data.length === 0) return null;
      
      const times = data.map(job => {
        const created = new Date(job.created_at!).getTime();
        const updated = new Date(job.updata_at!).getTime();
        return (updated - created) / 1000;
      }).filter(t => t > 0 && t < 600);
      
      if (times.length === 0) return null;
      return times.reduce((a, b) => a + b, 0) / times.length;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const todayTrend = todayScans ? todayScans.today - todayScans.yesterday : 0;
  const callsTrend = modelCalls?.todayCount || 0;

  return (
    <DashboardLayout>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              GEO 监控中心
            </h1>
          </div>
          <p className="text-muted-foreground ml-[52px]">
            监控和分析您的品牌在生成式 AI 平台中的可见度表现
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            icon={Activity} 
            label="今日分析" 
            value={loadingToday ? undefined : String(todayScans?.today || 0)}
            trend={todayTrend > 0 ? `+${todayTrend}` : undefined}
            loading={loadingToday}
          />
          <StatsCard 
            icon={Zap} 
            label="平均响应时间" 
            value={loadingTime ? undefined : avgTime ? `${avgTime.toFixed(1)}s` : '-'}
            loading={loadingTime}
          />
          <StatsCard 
            icon={Cpu} 
            label="AI 模型调用" 
            value={loadingCalls ? undefined : String(modelCalls?.total || 0)}
            trend={callsTrend > 0 ? `+${callsTrend}` : undefined}
            loading={loadingCalls}
          />
        </div>

        {/* Main Container with real-time visualization */}
        <GeoAnalysisContainer />
      </div>
    </DashboardLayout>
  );
}
function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  loading 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value?: string; 
  trend?: string;
  loading?: boolean;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center gap-4 p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-colors">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <span className="text-2xl font-bold">{value}</span>
                {trend && (
                  <span className="text-xs text-green-500 font-medium">{trend}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
