import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Zap, Plus, Gift, TrendingUp } from "lucide-react";

interface CreditsOverviewCardProps {
  creditsBalance: number;
  monthlyFreeQuota: number;
  monthlyUsage: number;
  onTopUp: () => void;
}

export function CreditsOverviewCard({
  creditsBalance,
  monthlyFreeQuota,
  monthlyUsage,
  onTopUp,
}: CreditsOverviewCardProps) {
  // 免费积分优先使用逻辑：
  // 本月用量先扣免费额度，超出部分才扣付费积分
  const freeCreditsUsed = Math.min(monthlyUsage, monthlyFreeQuota);
  const freeCreditsRemaining = monthlyFreeQuota - freeCreditsUsed;
  // 付费积分 = 总余额 - 剩余免费积分
  const paidCredits = Math.max(0, creditsBalance - freeCreditsRemaining);
  const freeUsagePercentage = (freeCreditsUsed / monthlyFreeQuota) * 100;

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Coins className="h-5 w-5 text-primary" />
              积分概览
            </CardTitle>
            <CardDescription className="mt-1">
              您每月享有 {monthlyFreeQuota} 个免费积分，当前余额包含免费额度与充值额度
            </CardDescription>
          </div>
          <Button onClick={onTopUp} size="lg" className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" />
            充值积分
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Main Balance Display */}
        <div className="flex items-end gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold tracking-tight">{creditsBalance}</span>
            <span className="text-xl text-muted-foreground">积分</span>
          </div>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-background/60 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">本月免费额度</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{freeCreditsRemaining}</span>
              <span className="text-muted-foreground">/ {monthlyFreeQuota}</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-background/60 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">充值积分</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{paidCredits}</span>
              <span className="text-muted-foreground">积分</span>
            </div>
          </div>
        </div>

        {/* Free Credits Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              本月免费积分使用情况
            </span>
            <span className="font-medium">
              已用 {freeCreditsUsed} / {monthlyFreeQuota}
            </span>
          </div>
          <Progress value={freeUsagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            免费积分每月 1 日自动重置，充值积分永不过期
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
