import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Brain } from 'lucide-react';

export default function GeoAnalysis() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">GEO Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your brand's visibility across AI platforms.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              This feature is under development
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">GEO Analysis Module</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Powerful AI visibility analysis tools are coming soon. You'll be able to
              track your brand mentions across ChatGPT, Claude, Gemini, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
