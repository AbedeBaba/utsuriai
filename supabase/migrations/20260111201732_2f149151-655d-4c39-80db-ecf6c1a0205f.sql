-- Ensure model_generations table RLS only allows authenticated users
DROP POLICY IF EXISTS "Users can view their own generations" ON public.model_generations;
DROP POLICY IF EXISTS "Users can create their own generations" ON public.model_generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON public.model_generations;
DROP POLICY IF EXISTS "Users can delete their own generations" ON public.model_generations;

-- Recreate with explicit authenticated role requirement
CREATE POLICY "Users can view their own generations"
ON public.model_generations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
ON public.model_generations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
ON public.model_generations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
ON public.model_generations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);