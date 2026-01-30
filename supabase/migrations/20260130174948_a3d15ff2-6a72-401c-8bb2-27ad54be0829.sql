-- Create table for payment requests
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  package_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to have full access
CREATE POLICY "Service role full access payment_requests"
ON public.payment_requests
FOR ALL
USING (true)
WITH CHECK (true);

-- Create policy to allow anonymous inserts (form submissions)
CREATE POLICY "Anyone can submit payment requests"
ON public.payment_requests
FOR INSERT
WITH CHECK (true);

-- Admins can view all payment requests
CREATE POLICY "Admins can view payment requests"
ON public.payment_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete payment requests
CREATE POLICY "Admins can delete payment requests"
ON public.payment_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));