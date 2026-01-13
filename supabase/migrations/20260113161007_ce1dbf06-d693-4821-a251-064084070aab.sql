-- Add explicit restrictive DELETE policy for user_subscriptions
CREATE POLICY "Users cannot delete subscriptions"
ON public.user_subscriptions
FOR DELETE
TO authenticated
USING (false);

-- Add explicit restrictive INSERT policy for rate_limits (users cannot insert)
CREATE POLICY "Users cannot insert rate limits"
ON public.rate_limits
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Add explicit restrictive UPDATE policy for rate_limits (users cannot update)
CREATE POLICY "Users cannot update rate limits"
ON public.rate_limits
FOR UPDATE
TO authenticated
USING (false);

-- Add explicit restrictive DELETE policy for rate_limits (users cannot delete)
CREATE POLICY "Users cannot delete rate limits"
ON public.rate_limits
FOR DELETE
TO authenticated
USING (false);