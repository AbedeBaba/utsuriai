-- Add columns to track IBAN copy events
ALTER TABLE public.payment_requests
ADD COLUMN iban_copied boolean DEFAULT false,
ADD COLUMN iban_copied_at timestamp with time zone;