
-- Drop all existing policies on payment_requests
DROP POLICY IF EXISTS "Admins can delete payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can view payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Authenticated users can submit their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can update their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can delete payment requests"
ON public.payment_requests FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view payment requests"
ON public.payment_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own payment requests"
ON public.payment_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment requests"
ON public.payment_requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment requests"
ON public.payment_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);
