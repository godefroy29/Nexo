-- Create some sample listings for demonstration
-- These will be visible based on business associations once users sign up

INSERT INTO listings (
  user_id,
  title,
  description,
  price,
  status
) VALUES
-- We'll use dummy user IDs for now - these will be replaced when real users sign up
('00000000-0000-0000-0000-000000000001', 'Cloud Infrastructure Setup', 'Complete AWS/Azure cloud setup and migration services for enterprise clients', 5000.00, 'published'),
('00000000-0000-0000-0000-000000000001', 'Custom Software Development', 'Full-stack web application development using React, Node.js, and modern technologies', 15000.00, 'published'),
('00000000-0000-0000-0000-000000000002', 'Solar Panel Installation', 'Residential solar panel system installation and setup with 25-year warranty', 8000.00, 'published'),
('00000000-0000-0000-0000-000000000002', 'Energy Efficiency Audit', 'Complete home energy audit and optimization recommendations to reduce costs', 500.00, 'published'),
('00000000-0000-0000-0000-000000000003', 'SEO Optimization Package', '6-month comprehensive SEO campaign to boost your website ranking', 2500.00, 'published'),
('00000000-0000-0000-0000-000000000003', 'Social Media Management', 'Full social media management across Facebook, Instagram, LinkedIn, and Twitter', 1200.00, 'draft');

-- Add affiliate code validation function for signup
CREATE OR REPLACE FUNCTION public.validate_affiliate_code(code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.businesses WHERE affiliate_code = code);
$$;