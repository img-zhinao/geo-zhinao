import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

// 积分消耗定价
export const CREDIT_COSTS = {
  monitoring: 2,  // 每个模型消耗 2 积分
  diagnosis: 5,   // 归因诊断消耗 5 积分
  simulation: 3,  // 策略模拟消耗 3 积分
} as const;

export type CreditOperationType = keyof typeof CREDIT_COSTS;

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

// 获取积分余额 - 复用 useProfile
export function useCreditsBalance() {
  const { data: profile, isLoading, refetch } = useProfile();
  
  return {
    balance: profile?.credits_balance ?? 0,
    isLoading,
    refetch,
  };
}

// 获取积分交易历史
export function useCreditTransactions(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['credit-transactions', user?.id, limit],
    queryFn: async (): Promise<CreditTransaction[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// 获取本月已使用积分
export function useMonthlyUsage() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-credit-usage', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user) return 0;

      // 获取本月第一天
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('transaction_type', 'deduction')
        .gte('created_at', firstDayOfMonth.toISOString());

      if (error) throw error;

      // 累加所有扣减（amount 是负数，所以取绝对值）
      return (data || []).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    },
    enabled: !!user,
  });
}

// 检查积分是否充足
export function hasEnoughCredits(balance: number, operationType: CreditOperationType, modelCount = 1): boolean {
  const cost = operationType === 'monitoring' 
    ? CREDIT_COSTS.monitoring * modelCount 
    : CREDIT_COSTS[operationType];
  return balance >= cost;
}

// 计算操作所需积分
export function calculateCreditCost(operationType: CreditOperationType, modelCount = 1): number {
  if (operationType === 'monitoring') {
    return CREDIT_COSTS.monitoring * modelCount;
  }
  return CREDIT_COSTS[operationType];
}
