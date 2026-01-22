-- Add affiliate code validation function for signup
CREATE OR REPLACE FUNCTION public.validate_affiliate_code(code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.businesses WHERE affiliate_code = code);
$$;

-- Update the handle_new_user function to support affiliate codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  business_id UUID;
  affiliate_code TEXT;
BEGIN
  -- Get affiliate code from user metadata
  affiliate_code := NEW.raw_user_meta_data ->> 'affiliate_code';
  
  -- If affiliate code provided, get the business ID
  IF affiliate_code IS NOT NULL THEN
    SELECT id INTO business_id 
    FROM public.businesses 
    WHERE businesses.affiliate_code = affiliate_code;
  END IF;

  -- Insert profile with business association
  INSERT INTO public.profiles (user_id, first_name, last_name, company_name, business_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'company_name',
    business_id
  );
  
  RETURN NEW;
END;
$$;