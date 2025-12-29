-- Add reference_image column to store base64 image data
ALTER TABLE public.model_generations 
ADD COLUMN reference_image TEXT;