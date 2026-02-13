
-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can submit payment requests" ON public.payment_requests;

-- Create a secure policy requiring authentication
CREATE POLICY "Authenticated users can submit payment requests"
ON public.payment_requests
FOR INSERT
TO authenticated
WITH CHECK (true);
