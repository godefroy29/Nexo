-- Update the app_role enum to include the new roles
ALTER TYPE public.app_role RENAME TO app_role_old;

-- Create new enum with the desired roles
CREATE TYPE public.app_role AS ENUM ('admin', 'backoffice', 'client', 'visitor');

-- Update the user_roles table to use the new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role 
  USING CASE 
    WHEN role::text = 'buyer_seller' THEN 'client'::public.app_role
    WHEN role::text = 'buyer' THEN 'visitor'::public.app_role
    ELSE role::text::public.app_role
  END;

-- Drop the old enum
DROP TYPE public.app_role_old;

-- Update the has_role function to work with new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;