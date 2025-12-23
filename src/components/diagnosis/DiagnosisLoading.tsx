import { Card, CardContent } from '@/components/ui/card';
import { Brain, Microscope, FileSearch, Sparkles } from 'lucide-react';

const steps = [
  { icon: Microscope, label: '病理切片采样', status: 'active' },
  { icon: Brain, label: 'DeepSeek-R1 深度推理', status: 'pending' },
  { icon: FileSearch, label: '证据链分析', status: 'pending' },
  { icon: Sparkles, label: '生成修复策略', status: 'pending' },
];

export function DiagnosisLoading() {
  return (
    <Card className="border border-border/50">
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Animated Brain Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Brain className="h-20 w-20 text-primary/20" />
            </div>
            <Brain className="h-20 w-20 text-primary animate-pulse" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              AI 正在进行病理切片分析...
            </h3>
            <p className="text-muted-foreground">
              DeepSeek-R1 正在进行深度推理，这通常需要 30-60 秒
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    step.status === 'active' 
                      ? 'bg-primary/10 border-primary/30 text-primary' 
                      : 'bg-muted/30 border-border/30 text-muted-foreground'
                  }`}>
                    <Icon className={`h-4 w-4 ${step.status === 'active' ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-4 h-0.5 bg-border hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Pulse Animation */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
