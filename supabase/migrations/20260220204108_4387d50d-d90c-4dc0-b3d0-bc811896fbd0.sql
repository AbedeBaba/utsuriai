
-- 1. payment_requests tablosuna user_id kolonunu ekle (nullable - mevcut kayıtlar için)
ALTER TABLE public.payment_requests 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Eski güvensiz INSERT politikasını kaldır
DROP POLICY IF EXISTS "Authenticated users can submit payment requests" ON public.payment_requests;

-- 3. Yeni INSERT politikası: sadece kendi user_id'si ile kayıt ekleyebilir
CREATE POLICY "Authenticated users can submit their own payment requests"
ON public.payment_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. UPDATE politikası ekle: kullanıcılar yalnızca kendi kayıtlarını güncelleyebilir (IBAN kopyalama ve ödeme onayı için)
CREATE POLICY "Users can update their own payment requests"
ON public.payment_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
