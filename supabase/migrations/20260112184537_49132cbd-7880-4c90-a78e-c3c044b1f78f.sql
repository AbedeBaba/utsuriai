-- Add standard_generations_remaining column for trial package tracking
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS standard_generations_remaining integer NOT NULL DEFAULT 5;

-- Update the trigger function to set both trial generation counts on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.user_subscriptions (user_id, plan, credits_remaining, pro_generations_remaining, standard_generations_remaining)
    VALUES (new.id, 'trial', 0, 2, 5);
    RETURN new;
END;
$function$;