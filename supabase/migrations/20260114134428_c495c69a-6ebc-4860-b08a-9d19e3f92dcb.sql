-- Add monthly_free_quota and last_reset_date to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_free_quota integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS last_reset_date timestamp with time zone DEFAULT (now() AT TIME ZONE 'Asia/Shanghai');

-- Update default credits_balance to 10 for new users (free monthly quota)
ALTER TABLE public.profiles 
ALTER COLUMN credits_balance SET DEFAULT 10;

-- Create top_up_requests table to track pending payments
CREATE TABLE IF NOT EXISTS public.top_up_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cny integer NOT NULL,
  credits_requested integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Shanghai'),
  processed_at timestamp with time zone
);

-- Enable RLS on top_up_requests
ALTER TABLE public.top_up_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own top-up requests
CREATE POLICY "Users view own top_up_requests" 
ON public.top_up_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own top-up requests
CREATE POLICY "Users insert own top_up_requests" 
ON public.top_up_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_top_up_requests_user_id ON public.top_up_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_top_up_requests_status ON public.top_up_requests(status);