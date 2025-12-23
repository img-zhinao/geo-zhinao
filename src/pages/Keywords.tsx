import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Sparkles } from 'lucide-react';

export default function Keywords() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Keyword Discovery</h1>
          <p className="text-muted-foreground mt-1">
            Find high-impact keywords for AI optimization.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              This feature is under development
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-secondary/10 mb-4">
              <Sparkles className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Keyword Discovery Engine</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Discover the most impactful keywords and phrases that AI models
              associate with your industry. Optimize your content strategy.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
