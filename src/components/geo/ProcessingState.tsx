import { useEffect, useState } from 'react';
import { Radar, Wifi, Bot, Search, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProcessingStateProps {
  brandName: string;
  searchQuery: string;
  currentStep?: number;
  statusMessage?: string;
}

const STEPS = [
  { icon: Search, label: '搜索中', description: '正在检索相关信息' },
  { icon: Wifi, label: '获取数据', description: '正在收集网络数据' },
  { icon: Bot, label: 'AI 分析', description: '智能体正在深度分析' },
  { icon: CheckCircle2, label: '完成', description: '分析完成' },
];

export function ProcessingState({ brandName, searchQuery, currentStep = 0, statusMessage }: ProcessingStateProps) {
  const [animatedStep, setAnimatedStep] = useState(currentStep);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Simulate progress through steps if not controlled externally
  useEffect(() => {
    if (currentStep === 0) {
      const timer = setInterval(() => {
        setAnimatedStep(prev => {
          if (prev < 2) return prev + 1;
          return prev;
        });
      }, 3000);
      return () => clearInterval(timer);
    } else {
      setAnimatedStep(currentStep);
    }
  }, [currentStep]);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.min(((animatedStep + 1) / STEPS.length) * 100, 95);
  const currentStepData = STEPS[Math.min(animatedStep, STEPS.length - 1)];

  return (
    <Card className="relative overflow-hidden bg-card/40 backdrop-blur-xl border-primary/20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      
      <CardContent className="relative py-12">
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
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {statusMessage || currentStepData.description}
            </h3>
            <p className="text-sm text-muted-foreground">
              已运行 {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              步骤 {animatedStep + 1} / {STEPS.length}
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-3 text-sm">
            {STEPS.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <StepIndicator 
                  icon={step.icon} 
                  label={step.label} 
                  active={index === animatedStep}
                  completed={index < animatedStep}
                />
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-px ${index < animatedStep ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Job info */}
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30 max-w-md w-full">
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
  );
}

function StepIndicator({ 
  icon: Icon, 
  label, 
  active = false,
  completed = false
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  active?: boolean;
  completed?: boolean;
}) {
  const isHighlighted = active || completed;
  
  return (
    <div className={`flex flex-col items-center gap-1 transition-colors ${
      active ? 'text-primary' : completed ? 'text-primary/70' : 'text-muted-foreground/50'
    }`}>
      <div className={`p-2 rounded-full transition-colors ${
        active 
          ? 'bg-primary/20 border border-primary/40' 
          : completed 
            ? 'bg-primary/10 border border-primary/20' 
            : 'bg-muted/30'
      }`}>
        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Icon className={`h-4 w-4 ${active ? 'animate-pulse' : ''}`} />
        )}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
}
