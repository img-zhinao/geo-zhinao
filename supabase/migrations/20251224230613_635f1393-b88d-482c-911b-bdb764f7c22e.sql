-- Add UPDATE and DELETE policies for scan_results
CREATE POLICY "Users update results via job" ON public.scan_results 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.scan_jobs WHERE id = scan_results.job_id AND user_id = auth.uid())
);

CREATE POLICY "Users delete results via job" ON public.scan_results 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.scan_jobs WHERE id = scan_results.job_id AND user_id = auth.uid())
);

-- Add UPDATE and DELETE policies for diagnosis_reports
CREATE POLICY "Users update diagnosis via result" ON public.diagnosis_reports 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.scan_results 
    JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id 
    WHERE scan_results.id = diagnosis_reports.scan_result_id 
    AND scan_jobs.user_id = auth.uid()
  )
);

CREATE POLICY "Users delete diagnosis via result" ON public.diagnosis_reports 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.scan_results 
    JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id 
    WHERE scan_results.id = diagnosis_reports.scan_result_id 
    AND scan_jobs.user_id = auth.uid()
  )
);

-- Add UPDATE and DELETE policies for simulation_results
CREATE POLICY "Users update simulation via diagnosis" ON public.simulation_results 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.diagnosis_reports 
    JOIN public.scan_results ON diagnosis_reports.scan_result_id = scan_results.id
    JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id 
    WHERE diagnosis_reports.id = simulation_results.diagnosis_id 
    AND scan_jobs.user_id = auth.uid()
  )
);

CREATE POLICY "Users delete simulation via diagnosis" ON public.simulation_results 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.diagnosis_reports 
    JOIN public.scan_results ON diagnosis_reports.scan_result_id = scan_results.id
    JOIN public.scan_jobs ON scan_results.job_id = scan_jobs.id 
    WHERE diagnosis_reports.id = simulation_results.diagnosis_id 
    AND scan_jobs.user_id = auth.uid()
  )
);