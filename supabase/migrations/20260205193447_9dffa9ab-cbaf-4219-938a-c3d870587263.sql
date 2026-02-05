-- Create trigger for auto-assigning trial subscription on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Create trigger for auto-assigning admin role to specific emails
CREATE OR REPLACE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role();

-- Create trigger for profile creation on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert missing subscription records for existing users who don't have one
INSERT INTO public.user_subscriptions (user_id, plan, credits_remaining, pro_generations_remaining, standard_generations_remaining)
SELECT u.id, 'trial', 0, 2, 5
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_subscriptions us WHERE us.user_id = u.id
);