import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, CreditCard, Zap, Check, Crown } from "lucide-react";

const plans = [
  {
    name: "免费版",
    nameKey: "free",
    price: "¥0",
    credits: 50,
    features: ["50 积分/月", "基础 GEO 分析", "3 个 AI 平台", "邮件支持"],
  },
  {
    name: "专业版",
    nameKey: "pro",
    price: "¥199",
    credits: 500,
    popular: true,
    features: ["500 积分/月", "高级 GEO 分析", "6 个 AI 平台", "优先支持", "自定义报告"],
  },
  {
    name: "企业版",
    nameKey: "enterprise",
    price: "¥1699",
    credits: 2000,
    features: ["2000 积分/月", "完整 GEO 套件", "全部 AI 平台", "专属客服", "API 接入", "白标报告"],
  },
];

export default function Billing() {
  const { data: profile, isLoading } = useProfile();

  const currentPlan = plans.find((p) => p.nameKey === profile?.tier_level?.toLowerCase()) || plans[0];

  const maxCredits = currentPlan.credits;
  const usedCredits = maxCredits - (profile?.credits_balance || 0);
  const usagePercentage = (usedCredits / maxCredits) * 100;

  const getTierLabel = (tier: string | undefined) => {
    switch (tier) {
      case "free":
        return "免费版";
      case "pro":
        return "专业版";
      case "enterprise":
        return "企业版";
      default:
        return "免费版";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">套餐账单</h1>
          <p className="text-muted-foreground mt-1">管理您的订阅和查看使用情况。</p>
        </div>

        {/* Current Plan Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-secondary" />
                  当前套餐
                </CardTitle>
                <CardDescription>您的订阅详情</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {currentPlan.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Credit Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">积分使用</span>
                <span className="font-medium">
                  已用 {usedCredits} / {maxCredits} 积分
                </span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">剩余: {profile?.credits_balance || 0} 积分</span>
                <span className="text-muted-foreground">每月重置</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{profile?.credits_balance || 0}</p>
                <p className="text-xs text-muted-foreground">剩余积分</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/5">
                <CreditCard className="h-5 w-5 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold">{currentPlan.price}</p>
                <p className="text-xs text-muted-foreground">每月</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <Crown className="h-5 w-5 text-accent-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{getTierLabel(profile?.tier_level)}</p>
                <p className="text-xs text-muted-foreground">套餐等级</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">可用套餐</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan = plan.nameKey === profile?.tier_level?.toLowerCase();

              return (
                <Card
                  key={plan.nameKey}
                  className={`relative bg-card/50 backdrop-blur-sm transition-all hover:scale-[1.02] ${
                    plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">最受欢迎</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/月</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "secondary"}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? "当前套餐" : "升级"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
