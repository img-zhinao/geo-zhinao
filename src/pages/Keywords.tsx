import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Sparkles } from 'lucide-react';

export default function Keywords() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">关键词发现</h1>
          <p className="text-muted-foreground mt-1">
            发现高影响力的 AI 优化关键词。
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              即将推出
            </CardTitle>
            <CardDescription>
              此功能正在开发中
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-secondary/10 mb-4">
              <Sparkles className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-lg font-medium mb-2">关键词发现引擎</h3>
            <p className="text-muted-foreground text-center max-w-md">
              发现 AI 模型与您的行业关联度最高的关键词和短语。
              优化您的内容策略。
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
