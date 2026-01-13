-- =============================================
-- SECURITY HARDENING: RLS & Storage Policies
-- =============================================

-- 1. FIX RATE_LIMITS TABLE
-- Drop the overly permissive policies and create proper ones
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Users can only view their OWN rate limits (properly scoped)
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. FIX USER_SUBSCRIPTIONS TABLE
-- Add service role delete policy for admin operations
CREATE POLICY "Service role can delete subscriptions"
ON public.user_subscriptions
FOR DELETE
TO service_role
USING (true);

-- Add admin delete policy
CREATE POLICY "Admins can delete subscriptions"
ON public.user_subscriptions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add service role full access for backend operations
DROP POLICY IF EXISTS "Service role full access subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role full access subscriptions"
ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. FIX STORAGE BUCKET - Make generated-images private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'generated-images';

-- Drop the overly permissive storage policy
DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;

-- Keep only authenticated user-scoped policies for storage
-- Users can view their own images (already exists but ensure it's correct)
DROP POLICY IF EXISTS "Users can view their own generated images" ON storage.objects;
CREATE POLICY "Users can view their own generated images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload their own generated images" ON storage.objects;
CREATE POLICY "Users can upload their own generated images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own images
DROP POLICY IF EXISTS "Users can delete their own generated images" ON storage.objects;
CREATE POLICY "Users can delete their own generated images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Service role has full access to storage for backend operations
DROP POLICY IF EXISTS "Service role full access to storage" ON storage.objects;
CREATE POLICY "Service role full access to storage"
ON storage.objects
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. SECURE MODEL_GENERATIONS TABLE
-- Ensure users cannot delete their own generations (admin/service role only)
DROP POLICY IF EXISTS "Users can delete their own generations" ON public.model_generations;

-- Add admin delete policy for model_generations
CREATE POLICY "Admins can delete generations"
ON public.model_generations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role full access
DROP POLICY IF EXISTS "Service role full access generations" ON public.model_generations;
CREATE POLICY "Service role full access generations"
ON public.model_generations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. SECURE PROFILES TABLE
-- Add service role access for admin operations
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;
CREATE POLICY "Service role full access profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add admin read access to profiles (for admin panel)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));