import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, CreditCard, Zap, Check, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    credits: 50,
    features: [
      '50 credits/month',
      'Basic GEO analysis',
      '3 AI platforms',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    credits: 500,
    popular: true,
    features: [
      '500 credits/month',
      'Advanced GEO analysis',
      '6 AI platforms',
      'Priority support',
      'Custom reports',
    ],
  },
  {
    name: 'Enterprise',
    price: '$99',
    credits: 2000,
    features: [
      '2000 credits/month',
      'Full GEO suite',
      'All AI platforms',
      'Dedicated support',
      'API access',
      'White-label reports',
    ],
  },
];

export default function Billing() {
  const { data: profile, isLoading } = useProfile();

  const currentPlan = plans.find(
    (p) => p.name.toLowerCase() === profile?.tier_level?.toLowerCase()
  ) || plans[0];

  const maxCredits = currentPlan.credits;
  const usedCredits = maxCredits - (profile?.credits_balance || 0);
  const usagePercentage = (usedCredits / maxCredits) * 100;

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
          <h1 className="text-3xl font-bold">Plan & Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and view usage.
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-secondary" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your current subscription details</CardDescription>
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
                <span className="text-muted-foreground">Credit Usage</span>
                <span className="font-medium">
                  {usedCredits} / {maxCredits} credits used
                </span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Remaining: {profile?.credits_balance || 0} credits
                </span>
                <span className="text-muted-foreground">
                  Resets monthly
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{profile?.credits_balance || 0}</p>
                <p className="text-xs text-muted-foreground">Credits Left</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/5">
                <CreditCard className="h-5 w-5 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold">{currentPlan.price}</p>
                <p className="text-xs text-muted-foreground">Per Month</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <Crown className="h-5 w-5 text-accent-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold capitalize">{profile?.tier_level || 'Free'}</p>
                <p className="text-xs text-muted-foreground">Tier Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan = plan.name.toLowerCase() === profile?.tier_level?.toLowerCase();
              
              return (
                <Card
                  key={plan.name}
                  className={`relative bg-card/50 backdrop-blur-sm transition-all hover:scale-[1.02] ${
                    plan.popular
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-border/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
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
                      variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'secondary'}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
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
