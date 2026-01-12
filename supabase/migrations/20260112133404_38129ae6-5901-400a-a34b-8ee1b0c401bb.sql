-- 创建积分交易记录表
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'Asia/Shanghai') NOT NULL
);

-- 启用 RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的交易记录
CREATE POLICY "Users view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 创建索引优化查询
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- 创建积分扣减函数
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 获取当前余额（加锁防止并发问题）
  SELECT credits_balance INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- 检查余额是否充足
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'current_balance', COALESCE(v_current_balance, 0),
      'required', p_amount
    );
  END IF;

  -- 扣减积分
  v_new_balance := v_current_balance - p_amount;
  
  UPDATE profiles
  SET credits_balance = v_new_balance
  WHERE id = p_user_id;

  -- 记录交易
  INSERT INTO credit_transactions (
    user_id, amount, balance_after, transaction_type,
    reference_type, reference_id, description
  ) VALUES (
    p_user_id, -p_amount, v_new_balance, 'deduction',
    p_reference_type, p_reference_id, p_description
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'deducted', p_amount
  );
END;
$$;

-- 创建积分退还函数（用于任务失败时）
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 获取当前余额
  SELECT credits_balance INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- 退还积分
  v_new_balance := COALESCE(v_current_balance, 0) + p_amount;
  
  UPDATE profiles
  SET credits_balance = v_new_balance
  WHERE id = p_user_id;

  -- 记录交易
  INSERT INTO credit_transactions (
    user_id, amount, balance_after, transaction_type,
    reference_type, reference_id, description
  ) VALUES (
    p_user_id, p_amount, v_new_balance, 'refund',
    p_reference_type, p_reference_id, p_description
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'refunded', p_amount
  );
END;
$$;