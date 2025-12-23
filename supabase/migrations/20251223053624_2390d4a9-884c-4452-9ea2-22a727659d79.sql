-- Fix Issue 1: Add length constraints for scan_jobs inputs
-- Using validation triggers instead of CHECK constraints for better flexibility

-- Create validation trigger function for scan_jobs
CREATE OR REPLACE FUNCTION public.validate_scan_job_inputs()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate brand_name: must be between 1 and 200 characters
  IF NEW.brand_name IS NULL OR length(trim(NEW.brand_name)) = 0 THEN
    RAISE EXCEPTION 'brand_name cannot be empty';
  END IF;
  
  IF length(NEW.brand_name) > 200 THEN
    RAISE EXCEPTION 'brand_name must be 200 characters or less';
  END IF;
  
  -- Validate search_query: must be between 1 and 500 characters
  IF NEW.search_query IS NULL OR length(trim(NEW.search_query)) = 0 THEN
    RAISE EXCEPTION 'search_query cannot be empty';
  END IF;
  
  IF length(NEW.search_query) > 500 THEN
    RAISE EXCEPTION 'search_query must be 500 characters or less';
  END IF;
  
  -- Validate competitors: optional but max 1000 characters if provided
  IF NEW.competitors IS NOT NULL AND length(NEW.competitors) > 1000 THEN
    RAISE EXCEPTION 'competitors must be 1000 characters or less';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT and UPDATE
DROP TRIGGER IF EXISTS validate_scan_job_inputs_trigger ON public.scan_jobs;
CREATE TRIGGER validate_scan_job_inputs_trigger
  BEFORE INSERT OR UPDATE ON public.scan_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_scan_job_inputs();

-- Fix Issue 2: Add NOT NULL constraint to user_id columns
-- First, delete any existing records with NULL user_id (if any)
DELETE FROM public.scan_results WHERE user_id IS NULL;
DELETE FROM public.scan_jobs WHERE user_id IS NULL;

-- Add NOT NULL constraints
ALTER TABLE public.scan_jobs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.scan_results ALTER COLUMN user_id SET NOT NULL;