-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  affiliate_code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add business_id to profiles
ALTER TABLE public.profiles ADD COLUMN business_id UUID REFERENCES public.businesses(id);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for business-based access

-- Profiles: Users can see profiles from their business + admins see all
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view profiles from their business"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR business_id = (SELECT business_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Listings: Users can see listings from their business + published ones
DROP POLICY IF EXISTS "Everyone can view published listings" ON public.listings;
CREATE POLICY "Users can view listings from their business"
ON public.listings
FOR SELECT
TO authenticated
USING (
  -- Admins can see everything
  public.has_role(auth.uid(), 'admin')
  -- Backoffice can see everything
  OR public.has_role(auth.uid(), 'backoffice')
  -- Own listings
  OR auth.uid() = user_id
  -- Same business listings
  OR (
    SELECT business_id FROM public.profiles WHERE user_id = auth.uid()
  ) = (
    SELECT business_id FROM public.profiles WHERE user_id = listings.user_id
  )
);

-- Businesses: Users can see their own business
CREATE POLICY "Users can view their business"
ON public.businesses
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR id = (SELECT business_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Only admins can manage businesses
CREATE POLICY "Admins can manage businesses"
ON public.businesses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for businesses timestamps
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert test businesses
INSERT INTO public.businesses (name, affiliate_code, description) VALUES
('Tech Solutions Inc', 'TECH2024', 'Leading technology consulting firm'),
('Green Energy Corp', 'GREEN2024', 'Renewable energy solutions provider'),
('Digital Marketing Pro', 'DIGITAL2024', 'Full-service digital marketing agency'),
('Finance Experts Ltd', 'FINANCE2024', 'Professional accounting and finance services');

-- Function to get business by affiliate code
CREATE OR REPLACE FUNCTION public.get_business_by_affiliate_code(code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.businesses WHERE affiliate_code = code LIMIT 1;
$$;