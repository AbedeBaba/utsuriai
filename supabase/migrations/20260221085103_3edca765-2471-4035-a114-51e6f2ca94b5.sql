
CREATE POLICY "Users can view their own payment requests"
ON public.payment_requests
FOR SELECT
USING (auth.uid() = user_id);
