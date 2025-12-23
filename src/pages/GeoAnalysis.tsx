import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Brain } from 'lucide-react';

export default function GeoAnalysis() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">GEO 分析</h1>
          <p className="text-muted-foreground mt-1">
            分析您的品牌在各 AI 平台的可见度。
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              即将推出
            </CardTitle>
            <CardDescription>
              此功能正在开发中
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">GEO 分析模块</h3>
            <p className="text-muted-foreground text-center max-w-md">
              强大的 AI 可见度分析工具即将推出。您将能够追踪您的品牌在
              ChatGPT、Claude、Gemini 等平台上的提及情况。
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
