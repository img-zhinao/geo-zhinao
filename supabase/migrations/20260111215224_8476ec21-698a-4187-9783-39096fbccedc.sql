-- Enable Realtime for task status notification tables
-- This allows the frontend to receive real-time updates when N8N completes tasks

-- For scan_jobs table
ALTER TABLE public.scan_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_jobs;

-- For diagnosis_reports table
ALTER TABLE public.diagnosis_reports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagnosis_reports;

-- For simulation_results table
ALTER TABLE public.simulation_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.simulation_results;