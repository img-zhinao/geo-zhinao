import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NewScanForm } from '@/components/geo/NewScanForm';
import { RecentScansList } from '@/components/geo/RecentScansList';
import { Cpu, Activity, Zap } from 'lucide-react';

export default function GeoAnalysis() {
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
            value="12" 
            trend="+3"
          />
          <StatsCard 
            icon={Zap} 
            label="平均响应时间" 
            value="2.3s" 
          />
          <StatsCard 
            icon={Cpu} 
            label="AI 模型调用" 
            value="156" 
            trend="+24"
          />
        </div>

        {/* Main Form */}
        <NewScanForm />

        {/* Recent Jobs */}
        <RecentScansList />
      </div>
    </DashboardLayout>
  );
}

function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  trend 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string; 
  trend?: string;
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
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span className="text-xs text-green-500 font-medium">{trend}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
