-- Create contact_inquiries table for storing form submissions
CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Shanghai')
);

-- Enable Row Level Security
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public contact form)
CREATE POLICY "Anyone can submit contact inquiry"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can view inquiries
CREATE POLICY "Authenticated users can view inquiries"
ON public.contact_inquiries
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update inquiries
CREATE POLICY "Authenticated users can update inquiries"
ON public.contact_inquiries
FOR UPDATE
TO authenticated
USING (true);

-- Create validation trigger for input length limits
CREATE OR REPLACE FUNCTION public.validate_contact_inquiry_inputs()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate name: 1-100 characters
  IF NEW.name IS NULL OR length(trim(NEW.name)) = 0 THEN
    RAISE EXCEPTION 'name cannot be empty';
  END IF;
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'name must be 100 characters or less';
  END IF;
  
  -- Validate company: 1-200 characters
  IF NEW.company IS NULL OR length(trim(NEW.company)) = 0 THEN
    RAISE EXCEPTION 'company cannot be empty';
  END IF;
  IF length(NEW.company) > 200 THEN
    RAISE EXCEPTION 'company must be 200 characters or less';
  END IF;
  
  -- Validate phone: 1-50 characters
  IF NEW.phone IS NULL OR length(trim(NEW.phone)) = 0 THEN
    RAISE EXCEPTION 'phone cannot be empty';
  END IF;
  IF length(NEW.phone) > 50 THEN
    RAISE EXCEPTION 'phone must be 50 characters or less';
  END IF;
  
  -- Validate message: max 2000 characters if provided
  IF NEW.message IS NOT NULL AND length(NEW.message) > 2000 THEN
    RAISE EXCEPTION 'message must be 2000 characters or less';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER validate_contact_inquiry_inputs_trigger
BEFORE INSERT OR UPDATE ON public.contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.validate_contact_inquiry_inputs();