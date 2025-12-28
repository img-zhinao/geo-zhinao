-- Block anonymous access to scan_results table
-- Revoke all permissions from anonymous role
REVOKE ALL ON public.scan_results FROM anon;

-- Grant proper permissions to authenticated users only
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_results TO authenticated;

-- Also secure related tables that may have same issue
REVOKE ALL ON public.scan_jobs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_jobs TO authenticated;

REVOKE ALL ON public.diagnosis_reports FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnosis_reports TO authenticated;

REVOKE ALL ON public.simulation_results FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.simulation_results TO authenticated;

REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;