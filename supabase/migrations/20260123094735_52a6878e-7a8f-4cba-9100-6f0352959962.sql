-- Add Creator-only filter fields to model_generations so Result page and backend generation can apply them
ALTER TABLE public.model_generations
  ADD COLUMN IF NOT EXISTS face_type text,
  ADD COLUMN IF NOT EXISTS facial_expression text,
  ADD COLUMN IF NOT EXISTS modest_option text;

CREATE INDEX IF NOT EXISTS idx_model_generations_face_type ON public.model_generations(face_type);
CREATE INDEX IF NOT EXISTS idx_model_generations_facial_expression ON public.model_generations(facial_expression);