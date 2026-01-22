-- Create test users with profiles, roles, and business assignments
-- Note: These INSERT statements will create auth users and profiles through our trigger

-- First, let's create a helper function to create test users
CREATE OR REPLACE FUNCTION create_test_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_company_name TEXT,
  p_business_id UUID,
  p_role app_role
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_id UUID;
  profile_id UUID;
BEGIN
  -- Insert into auth.users (this will trigger profile creation)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'company_name', p_company_name),
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Update profile with business_id
  UPDATE profiles SET business_id = p_business_id WHERE user_id = user_id;

  -- Insert role
  INSERT INTO user_roles (user_id, role) VALUES (user_id, p_role);

  RETURN user_id;
END;
$$;

-- Get business IDs
DO $$
DECLARE
  tech_business_id UUID;
  green_business_id UUID;
  digital_business_id UUID;
  finance_business_id UUID;
  
  admin_user_id UUID;
  backoffice_user_id UUID;
  tech_seller_id UUID;
  tech_buyer_id UUID;
  green_seller_id UUID;
  green_buyer_id UUID;
  digital_seller_id UUID;
  finance_buyer_id UUID;
BEGIN
  -- Get business IDs
  SELECT id INTO tech_business_id FROM businesses WHERE affiliate_code = 'TECH2024';
  SELECT id INTO green_business_id FROM businesses WHERE affiliate_code = 'GREEN2024';
  SELECT id INTO digital_business_id FROM businesses WHERE affiliate_code = 'DIGITAL2024';
  SELECT id INTO finance_business_id FROM businesses WHERE affiliate_code = 'FINANCE2024';

  -- Create admin (not tied to any business)
  SELECT create_test_user(
    'admin@test.com', 
    'admin123', 
    'Admin', 
    'User', 
    'System Admin', 
    NULL, 
    'admin'
  ) INTO admin_user_id;

  -- Create backoffice (not tied to any business)
  SELECT create_test_user(
    'backoffice@test.com', 
    'backoffice123', 
    'Backoffice', 
    'Manager', 
    'System Backoffice', 
    NULL, 
    'backoffice'
  ) INTO backoffice_user_id;

  -- Tech Solutions Inc users
  SELECT create_test_user(
    'tech.seller@test.com', 
    'seller123', 
    'John', 
    'Smith', 
    'Tech Solutions Inc', 
    tech_business_id, 
    'buyer_seller'
  ) INTO tech_seller_id;

  SELECT create_test_user(
    'tech.buyer@test.com', 
    'buyer123', 
    'Sarah', 
    'Johnson', 
    'Tech Solutions Inc', 
    tech_business_id, 
    'buyer'
  ) INTO tech_buyer_id;

  -- Green Energy Corp users
  SELECT create_test_user(
    'green.seller@test.com', 
    'green123', 
    'Mike', 
    'Wilson', 
    'Green Energy Corp', 
    green_business_id, 
    'buyer_seller'
  ) INTO green_seller_id;

  SELECT create_test_user(
    'green.buyer@test.com', 
    'green456', 
    'Emma', 
    'Davis', 
    'Green Energy Corp', 
    green_business_id, 
    'buyer'
  ) INTO green_buyer_id;

  -- Digital Marketing Pro users
  SELECT create_test_user(
    'digital.seller@test.com', 
    'digital123', 
    'Alex', 
    'Brown', 
    'Digital Marketing Pro', 
    digital_business_id, 
    'buyer_seller'
  ) INTO digital_seller_id;

  -- Finance Experts Ltd users
  SELECT create_test_user(
    'finance.buyer@test.com', 
    'finance123', 
    'Lisa', 
    'Taylor', 
    'Finance Experts Ltd', 
    finance_business_id, 
    'buyer'
  ) INTO finance_buyer_id;

  -- Create sample listings
  INSERT INTO listings (user_id, title, description, price, status) VALUES
  -- Tech Solutions listings
  (tech_seller_id, 'Cloud Infrastructure Setup', 'Complete AWS/Azure cloud setup and migration services', 5000.00, 'published'),
  (tech_seller_id, 'Custom Software Development', 'Full-stack web application development using modern technologies', 15000.00, 'published'),
  
  -- Green Energy listings  
  (green_seller_id, 'Solar Panel Installation', 'Residential solar panel system installation and setup', 8000.00, 'published'),
  (green_seller_id, 'Energy Efficiency Audit', 'Complete home energy audit and optimization recommendations', 500.00, 'published'),
  
  -- Digital Marketing listings
  (digital_seller_id, 'SEO Optimization Package', '6-month comprehensive SEO campaign for your website', 2500.00, 'published'),
  (digital_seller_id, 'Social Media Management', 'Full social media management across all major platforms', 1200.00, 'draft');

END $$;

-- Clean up helper function
DROP FUNCTION create_test_user;