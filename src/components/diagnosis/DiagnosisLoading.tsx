import { Card, CardContent } from '@/components/ui/card';
import { Brain, Microscope, FileSearch, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const steps = [
  { icon: Microscope, label: '病理切片采样' },
  { icon: Brain, label: 'DeepSeek-R1 深度推理' },
  { icon: FileSearch, label: '证据链分析' },
  { icon: Sparkles, label: '生成修复策略' },
];

export function DiagnosisLoading() {
  const [activeStep, setActiveStep] = useState(0);

  // Animate through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Animated Radar Effect */}
          <div className="relative w-32 h-32">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="absolute inset-4 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
            
            {/* Center brain icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 rounded-full bg-primary/20 border border-primary/40">
                <Brain className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
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
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              
              return (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary/20 border-primary/50 text-primary scale-105' 
                      : isPast
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-muted/30 border-border/30 text-muted-foreground'
                  }`}>
                    <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-4 h-0.5 hidden sm:block transition-colors ${
                      isPast ? 'bg-green-500/50' : 'bg-border'
                    }`} />
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
