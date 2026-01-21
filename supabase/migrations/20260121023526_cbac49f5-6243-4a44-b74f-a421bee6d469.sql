-- 添加 website 列到 contact_inquiries 表
ALTER TABLE contact_inquiries 
ADD COLUMN website text;

-- 更新验证触发器，增加网站字段的验证
CREATE OR REPLACE FUNCTION public.validate_contact_inquiry_inputs()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
  
  -- Validate website: optional, max 500 characters if provided
  IF NEW.website IS NOT NULL AND length(NEW.website) > 500 THEN
    RAISE EXCEPTION 'website must be 500 characters or less';
  END IF;
  
  RETURN NEW;
END;
$function$;