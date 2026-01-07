-- Add category and custom_name columns to model_generations
ALTER TABLE public.model_generations 
ADD COLUMN category text CHECK (category IN ('Bottomwear', 'Topwear', 'Shoes', 'Dresses')),
ADD COLUMN custom_name text;

-- Create index for category filtering
CREATE INDEX idx_model_generations_category ON public.model_generations(category);