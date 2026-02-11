
-- Step 1: Fix payment_requests - drop the overly permissive "Service role full access" ALL policy
-- and replace with specific policies that don't grant anonymous SELECT
DROP POLICY IF EXISTS "Service role full access payment_requests" ON public.payment_requests;

-- Step 2: Drop user_subscriptions UPDATE policy to prevent credit manipulation
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
