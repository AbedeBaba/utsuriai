-- Add payment_confirmed column to track when user confirms they made the payment
ALTER TABLE public.payment_requests 
ADD COLUMN payment_confirmed boolean DEFAULT false,
ADD COLUMN payment_confirmed_at timestamp with time zone DEFAULT null;