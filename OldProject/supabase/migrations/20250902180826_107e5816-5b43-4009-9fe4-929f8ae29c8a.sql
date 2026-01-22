-- Fix the profiles RLS policy infinite recursion issue
DROP POLICY IF EXISTS "Users can view profiles from their business" ON public.profiles;

-- Create a simpler, non-recursive policy for profiles
CREATE POLICY "Users can view profiles from their business" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND business_id IN (
    SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
  ))
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create conditions table  
CREATE TABLE IF NOT EXISTS public.conditions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (readable by everyone)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for conditions (readable by everyone)
CREATE POLICY "Conditions are viewable by everyone" 
ON public.conditions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage conditions" 
ON public.conditions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add category_id and condition_id to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS condition_id uuid REFERENCES public.conditions(id),
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location text;

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Industrial Equipment', 'Heavy machinery and industrial tools'),
('Construction Machinery', 'Construction and building equipment'),
('Office Equipment', 'Office furniture and business equipment'),
('Commercial Real Estate', 'Commercial properties and spaces'),
('Transportation', 'Vehicles and transportation equipment'),
('Technology Hardware', 'IT equipment and technology hardware')
ON CONFLICT (name) DO NOTHING;

-- Insert default conditions
INSERT INTO public.conditions (name, description) VALUES
('New', 'Brand new, unused item'),
('Like New', 'Excellent condition, barely used'),
('Used', 'Previously used but in good working condition'),
('Refurbished', 'Restored to working condition')
ON CONFLICT (name) DO NOTHING;

-- Add trigger for updated_at on new tables
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conditions_updated_at
  BEFORE UPDATE ON public.conditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();