import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useCreditTransactions, useMonthlyUsage } from "@/hooks/useCredits";
import { Loader2 } from "lucide-react";
import { CreditsOverviewCard } from "@/components/billing/CreditsOverviewCard";
import { TopUpDialog } from "@/components/billing/TopUpDialog";
import { TransactionHistory } from "@/components/billing/TransactionHistory";
import { PricingInfo } from "@/components/billing/PricingInfo";

export default function Billing() {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: transactions = [], isLoading: transactionsLoading } = useCreditTransactions(50);
  const { data: monthlyUsage = 0 } = useMonthlyUsage();
  const [topUpOpen, setTopUpOpen] = useState(false);

  const handleTopUpSuccess = () => {
    refetchProfile();
  };

  if (profileLoading) {
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
          <h1 className="text-3xl font-bold">套餐与账单</h1>
          <p className="text-muted-foreground mt-1">
            管理您的积分余额和查看消费记录
          </p>
        </div>

        {/* Credits Overview */}
        <CreditsOverviewCard
          creditsBalance={profile?.credits_balance ?? 0}
          monthlyFreeQuota={10}
          monthlyUsage={monthlyUsage}
          onTopUp={() => setTopUpOpen(true)}
        />

        {/* Pricing Info */}
        <PricingInfo />

        {/* Transaction History */}
        <TransactionHistory
          transactions={transactions}
          isLoading={transactionsLoading}
        />

        {/* Top Up Dialog */}
        <TopUpDialog
          open={topUpOpen}
          onOpenChange={setTopUpOpen}
          onSuccess={handleTopUpSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
