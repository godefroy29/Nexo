-- Create test accounts and assign roles
-- Note: These are the credentials users can use to test different roles:
-- Admin: admin@test.com / admin123
-- Backoffice: backoffice@test.com / backoffice123  
-- Buyer-Seller: seller@test.com / seller123
-- Buyer: buyer@test.com / buyer123

-- Insert test account role assignments (users will need to register these accounts first)
-- This is just a reference - actual user creation happens through the auth system

-- Create a function to help assign roles to users by email when they register
CREATE OR REPLACE FUNCTION public.assign_role_by_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Assign specific roles based on email for test accounts
  IF NEW.email = 'admin@test.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::app_role);
  ELSIF NEW.email = 'backoffice@test.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'backoffice'::app_role);
  ELSIF NEW.email = 'seller@test.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer_seller'::app_role);
  ELSIF NEW.email = 'buyer@test.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer'::app_role);
  ELSE
    -- Default role for all other users
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign roles when user signs up
CREATE TRIGGER assign_role_by_email_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_role_by_email();