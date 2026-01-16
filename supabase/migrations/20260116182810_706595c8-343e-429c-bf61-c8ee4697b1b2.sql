-- Make the generated-images bucket public so NanoBanana API can access uploaded images
UPDATE storage.buckets 
SET public = true 
WHERE id = 'generated-images';