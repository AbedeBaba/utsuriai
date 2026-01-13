-- Create saved_models table for Creator plan users
CREATE TABLE public.saved_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  ethnicity TEXT NOT NULL,
  skin_tone TEXT NOT NULL,
  hair_color TEXT,
  eye_color TEXT NOT NULL,
  body_type TEXT NOT NULL,
  hair_type TEXT,
  beard_type TEXT,
  pose TEXT,
  background TEXT,
  face_type TEXT,
  facial_expression TEXT,
  modest_option TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_models ENABLE ROW LEVEL SECURITY;

-- Users can only view their own saved models
CREATE POLICY "Users can view their own saved models"
ON public.saved_models
FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own saved models
CREATE POLICY "Users can insert their own saved models"
ON public.saved_models
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own saved models
CREATE POLICY "Users can update their own saved models"
ON public.saved_models
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own saved models
CREATE POLICY "Users can delete their own saved models"
ON public.saved_models
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_saved_models_updated_at
BEFORE UPDATE ON public.saved_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();