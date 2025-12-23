-- Enable RLS on scan_jobs table
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on scan_results table  
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for scan_jobs - users can only see their own jobs
CREATE POLICY "Users can view own scan_jobs" ON public.scan_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan_jobs" ON public.scan_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan_jobs" ON public.scan_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan_jobs" ON public.scan_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for scan_results - users can only see their own results
CREATE POLICY "Users can view own scan_results" ON public.scan_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan_results" ON public.scan_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan_results" ON public.scan_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan_results" ON public.scan_results
  FOR DELETE USING (auth.uid() = user_id);