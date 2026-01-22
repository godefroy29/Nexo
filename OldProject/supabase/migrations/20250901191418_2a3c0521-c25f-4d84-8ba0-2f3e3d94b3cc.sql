-- Fix the handle_new_user function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  business_id UUID;
  user_affiliate_code TEXT;
BEGIN
  -- Get affiliate code from user metadata
  user_affiliate_code := NEW.raw_user_meta_data ->> 'affiliate_code';
  
  -- If affiliate code provided, get the business ID
  IF user_affiliate_code IS NOT NULL THEN
    SELECT id INTO business_id 
    FROM public.businesses 
    WHERE businesses.affiliate_code = user_affiliate_code;
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
$function$;