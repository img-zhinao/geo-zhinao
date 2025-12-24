import { Radar, Wifi, Bot, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProcessingStateProps {
  brandName: string;
  searchQuery: string;
  onBack?: () => void;
}

export function ProcessingState({ brandName, searchQuery, onBack }: ProcessingStateProps) {
  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          取消并返回
        </Button>
      )}
      <Card className="relative overflow-hidden bg-card/40 backdrop-blur-xl border-primary/20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        
        <CardContent className="relative py-16">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Radar Animation */}
          <div className="relative">
            {/* Outer pulsing rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
            </div>
            
            {/* Center icon */}
            <div className="relative w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <Radar className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>

          {/* Status text */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              AI 智能体正在分析...
            </h3>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span>正在浏览网络并收集信息</span>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-4 text-sm">
            <StepIndicator icon={Search} label="搜索中" active />
            <div className="w-8 h-px bg-border" />
            <StepIndicator icon={Wifi} label="获取数据" />
            <div className="w-8 h-px bg-border" />
            <StepIndicator icon={Bot} label="AI 分析" />
          </div>

          {/* Job info */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30 max-w-md w-full">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">分析品牌</p>
                <p className="font-medium text-primary">{brandName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">搜索问题</p>
                <p className="font-medium truncate">{searchQuery}</p>
              </div>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepIndicator({ 
  icon: Icon, 
  label, 
  active = false 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  active?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-muted-foreground/50'}`}>
      <div className={`p-2 rounded-full ${active ? 'bg-primary/20 border border-primary/40' : 'bg-muted/30'}`}>
        <Icon className={`h-4 w-4 ${active ? 'animate-pulse' : ''}`} />
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
}
