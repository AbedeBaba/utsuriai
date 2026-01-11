-- Fix the permissive INSERT policy by restricting to service role only
-- Drop the old permissive policy
DROP POLICY IF EXISTS "Service can insert subscriptions" ON public.user_subscriptions;

-- Create a policy that only allows inserts matching the user's own ID (for edge function with service role)
-- The trigger handles initial creation, so users shouldn't need to insert directly
CREATE POLICY "Users cannot insert directly" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (false);