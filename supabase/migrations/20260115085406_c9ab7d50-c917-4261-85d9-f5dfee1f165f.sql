-- 创建触发器函数：当充值请求被批准时自动增加用户积分
CREATE OR REPLACE FUNCTION public.handle_topup_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 仅在状态从非 approved 变为 approved 时触发
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- 更新用户积分余额
    UPDATE profiles
    SET credits_balance = credits_balance + NEW.credits_requested
    WHERE id = NEW.user_id;

    -- 记录积分交易
    INSERT INTO credit_transactions (
      user_id,
      amount,
      balance_after,
      transaction_type,
      reference_type,
      reference_id,
      description
    )
    SELECT
      NEW.user_id,
      NEW.credits_requested,
      p.credits_balance,
      'topup',
      'top_up_request',
      NEW.id,
      '充值 ' || NEW.credits_requested || ' 积分（¥' || NEW.amount_cny || '）'
    FROM profiles p
    WHERE p.id = NEW.user_id;

    -- 更新处理时间
    NEW.processed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- 创建触发器
DROP TRIGGER IF EXISTS on_topup_approved ON public.top_up_requests;
CREATE TRIGGER on_topup_approved
  BEFORE UPDATE ON public.top_up_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_topup_approved();