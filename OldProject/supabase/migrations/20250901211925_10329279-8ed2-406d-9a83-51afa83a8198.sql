-- First, drop all dependent policies and functions
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and backoffice can manage all listings" ON public.listings;
DROP POLICY IF EXISTS "Users can view profiles from their business" ON public.profiles;
DROP POLICY IF EXISTS "Users can view listings from their business" ON public.listings;
DROP POLICY IF EXISTS "Users can view their business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can manage businesses" ON public.businesses;

-- Drop the has_role function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Now update the enum
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('admin', 'backoffice', 'client', 'visitor');

-- Update existing user_roles data
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role 
  USING CASE 
    WHEN role::text = 'buyer_seller' THEN 'client'::public.app_role
    WHEN role::text = 'buyer' THEN 'visitor'::public.app_role
    ELSE role::text::public.app_role
  END;

-- Drop the old enum
DROP TYPE public.app_role_old;

-- Recreate the has_role function
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

-- Recreate all the RLS policies
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins and backoffice can manage all listings" 
ON public.listings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'backoffice'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'backoffice'::app_role));

CREATE POLICY "Users can view profiles from their business" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR (business_id = (SELECT profiles_1.business_id FROM profiles profiles_1 WHERE profiles_1.user_id = auth.uid())));

CREATE POLICY "Users can view listings from their business" 
ON public.listings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'backoffice'::app_role) OR (auth.uid() = user_id) OR ((SELECT profiles.business_id FROM profiles WHERE profiles.user_id = auth.uid()) = (SELECT profiles.business_id FROM profiles WHERE profiles.user_id = listings.user_id)));

CREATE POLICY "Users can view their business" 
ON public.businesses 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR (id = (SELECT profiles.business_id FROM profiles WHERE profiles.user_id = auth.uid())));

CREATE POLICY "Admins can manage businesses" 
ON public.businesses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));