-- ⚠️ DESTRUCTIVE: Clean up old tables to remove redundancy
DROP TABLE IF EXISTS public.simulation_results CASCADE;
DROP TABLE IF EXISTS public.diagnosis_reports CASCADE;
DROP TABLE IF EXISTS public.scan_results CASCADE;
DROP TABLE IF EXISTS public.scan_jobs CASCADE;

-- 1. [Intent Layer] Scan Jobs (用户发起的一次性任务)
CREATE TABLE public.scan_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  brand_name text NOT NULL,
  search_query text NOT NULL,
  competitors text[],
  target_region text DEFAULT 'CN',
  selected_models jsonb DEFAULT '["DeepSeek-V3"]'::jsonb,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- 2. [Fact Layer / Link 0] Scan Results (AI 的原始回答)
CREATE TABLE public.scan_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.scan_jobs(id) ON DELETE CASCADE NOT NULL,
  model_name text NOT NULL,
  raw_response_text text,
  rank_position int,
  avs_score numeric(5,2),
  sentiment_score numeric(5,2),
  citations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. [Analysis Layer / Link 2] Diagnosis Reports (归因诊断)
CREATE TABLE public.diagnosis_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_result_id uuid REFERENCES public.scan_results(id) ON DELETE CASCADE NOT NULL,
  diagnostic_model text DEFAULT 'DeepSeek-R1',
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  root_cause_summary text,
  report_markdown text,
  suggested_strategy_ids jsonb DEFAULT '[]'::jsonb,
  tokens_used int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. [Action Layer / Link 1] Simulation Results (战略模拟)
CREATE TABLE public.simulation_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnosis_id uuid REFERENCES public.diagnosis_reports(id) ON DELETE CASCADE NOT NULL,
  applied_strategy_id text NOT NULL,
  optimized_content_snippet text,
  predicted_rank_change int,
  improvement_analysis text,
  status text DEFAULT 'queued',
  created_at timestamptz DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scan_jobs
CREATE POLICY "Users view own jobs" ON public.scan_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own jobs" ON public.scan_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own jobs" ON public.scan_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own jobs" ON public.scan_jobs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scan_results (cascade via job ownership)
CREATE POLICY "Users view results via job" ON public.scan_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scan_jobs WHERE id = scan_results.job_id AND user_id = auth.uid())
);
CREATE POLICY "Users insert results via job" ON public.scan_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.scan_jobs WHERE id = scan_results.job_id AND user_id = auth.uid())
);

-- RLS Policies for diagnosis_reports (cascade via result -> job ownership)
CREATE POLICY "Users view diagnosis via result" ON public.diagnosis_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scan_results JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id WHERE scan_results.id = diagnosis_reports.scan_result_id AND scan_jobs.user_id = auth.uid())
);
CREATE POLICY "Users insert diagnosis via result" ON public.diagnosis_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.scan_results JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id WHERE scan_results.id = diagnosis_reports.scan_result_id AND scan_jobs.user_id = auth.uid())
);

-- RLS Policies for simulation_results (cascade via diagnosis -> result -> job ownership)
CREATE POLICY "Users view simulation via diagnosis" ON public.simulation_results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.diagnosis_reports 
    JOIN public.scan_results ON diagnosis_reports.scan_result_id = scan_results.id
    JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id 
    WHERE diagnosis_reports.id = simulation_results.diagnosis_id AND scan_jobs.user_id = auth.uid()
  )
);
CREATE POLICY "Users insert simulation via diagnosis" ON public.simulation_results FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.diagnosis_reports 
    JOIN public.scan_results ON diagnosis_reports.scan_result_id = scan_results.id
    JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id 
    WHERE diagnosis_reports.id = simulation_results.diagnosis_id AND scan_jobs.user_id = auth.uid()
  )
);