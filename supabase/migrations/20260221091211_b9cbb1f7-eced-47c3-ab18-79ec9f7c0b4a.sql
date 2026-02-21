
-- Allow anonymous users to insert payment requests (user_id can be null)
DROP POLICY IF EXISTS "Users can insert their own payment requests" ON public.payment_requests;

CREATE POLICY "Anyone can insert payment requests"
ON public.payment_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);
