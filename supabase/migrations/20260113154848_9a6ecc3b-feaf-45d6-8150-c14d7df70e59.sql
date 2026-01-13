-- Update the assign_admin_role function to include the new admin email
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IN ('bussiness@utsuriai.com', 'abdgl.3356@gmail.com') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- Also insert admin role for existing user with this email (if they already exist)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'abdgl.3356@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;