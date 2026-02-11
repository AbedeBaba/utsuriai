

# Guvenlik Incelemesi Raporu

## Kritik Bulgular

### 1. KRITIK: `payment_requests` Tablosu - Musteri Verileri Herkese Acik
`payment_requests` tablosundaki `"Anyone can submit payment requests"` politikasi `WITH CHECK (true)` kullanarak herkesin (kimlik dogrulamasi olmadan) odeme talebi girmesine izin veriyor. Daha da onemlisi, `"Service role full access payment_requests"` politikasi `USING (true)` ile tum islemler icin acik. Bu tablo e-posta, isim ve IBAN bilgileri gibi hassas verileri iceriyor ve tarayici tarafindan anonim kullanicilar tarafindan okunabiliyor (kanitlanmis: 4 kayit dogrudan okundu).

**Cozum:** `"Anyone can submit payment requests"` politikasi korunabilir (anonim form gonderimi icin gerekli) ancak SELECT erisimi yalnizca adminlerle sinirlandirilmali. `"Service role full access"` politikasi zaten service role icin oldugu icin sorun teskil etmiyor ama anonim SELECT erisimini engellemek gerekli.

### 2. ONEMLI: `user_subscriptions` - Kullanicilar Kendi Aboneliklerini Guncelleyebilir
`"Users can update their own subscription"` politikasi `USING (auth.uid() = user_id)` ile kullanicilarin kendi abonelik kayitlarini guncellemelerine izin veriyor. Bu, kotu niyetli bir kullanicinin kredi bakiyesini, plan turunu veya kalan uretim haklarini dogrudan artirmasina olanak tanir.

**Cozum:** Bu UPDATE politikasini kaldirin. Abonelik guncellemeleri yalnizca edge function'lar (service role) uzerinden yapilmali.

### 3. ORTA: Sizdirilmis Sifre Korumasi Devre Disi
Kimlik dogrulama sisteminde sizdirilmis sifre korumasi kapali durumda. Bu ozellik, bilinen veri ihlallerinde ortaya cikan sifrelerin kullanilmasini onler.

**Cozum:** Lovable Cloud ayarlarindan bu ozelligi etkinlestirin.

### 4. ORTA: `check-generation` Edge Function JWT Dogrulamasi Yok
`check-generation` fonksiyonu `verify_jwt = false` ile yapilandirilmis ve kod icinde JWT dogrulamasi yapiyor, bu dogru yaklasim. Ancak fonksiyon icerisinde kullanici kimlik dogrulamasi yapildiktan sonra, `generationId` parametresi dogrudan kullaniliyor - baska bir kullanicinin `generationId`'sini bilen biri, o kullanicinin gorevinin durumunu sorgulayabilir (ancak sonuc yalnizca dogrulanmis kullanicinin kayitlarina yaziliyor, bu yuzden risk dusuk).

### 5. DUSUK: `Service role full access` Politikalari
`model_generations`, `profiles`, `rate_limits`, `payment_requests` ve `user_subscriptions` tablolarinda `USING (true)` / `WITH CHECK (true)` ile "Service role full access" politikalari var. Bunlar RESTRICTIVE tipinde oldugu ve service role yalnizca edge function'lardan kullanildigi icin teknik olarak sorun teskil etmiyor, ancak en iyi uygulama olarak gereksiz olanlari temizlemek faydali olur.

---

## Uygulama Plani

### Adim 1: `payment_requests` tablosundaki anonim SELECT erisimini engelle
Mevcut RLS politikalari incelendiginde, adminler zaten SELECT yapabiliyor. Anonim kullanicilar icin ek bir RESTRICTIVE SELECT engeli eklenecek veya mevcut politikalar duzeltilecek. Sorun, `"Service role full access payment_requests"` politikasinin `ALL` komutuyla `USING (true)` kullanmasi - bu, anonim kullanicilarin da bu politikayi kullanarak veri okumasina yol acabiliyor.

**SQL:**
```sql
-- Service role full access politikasini kaldir ve yerine sadece service role icin gecerli olanini ekle
-- Mevcut politikalar zaten RESTRICTIVE, anonim erisimi engellemek icin 
-- authenticated kullanicilara sinirlama eklenmeli
```

### Adim 2: `user_subscriptions` UPDATE politikasini kaldir
```sql
DROP POLICY "Users can update their own subscription" ON user_subscriptions;
```
Boylece kullanicilar dogrudan kredi/plan guncellemesi yapamaz, yalnizca edge function'lar (service role ile) guncelleyebilir.

### Adim 3: Sizdirilmis sifre korumasini etkinlestir
Bu ayar Lovable Cloud uzerinden yapilandirma gerektirir.

### Adim 4: Guvenlik bulgularini guncelle
Duzeltilen sorunlari kapat, duzeltilemeyen/kabul edilebilir olanlari isaretleyerek belgelendirin.

---

## Teknik Detaylar

### Dosya Degisiklikleri
- **Veritabani migrasyonu:** `payment_requests` tablosunda anonim SELECT erisimini engelleyen politika eklenmesi
- **Veritabani migrasyonu:** `user_subscriptions` tablosundan kullanici UPDATE politikasinin kaldirilmasi
- **Edge function degisikligi gerekmez** - mevcut edge function'lar service role ile calistigi icin etkilenmez

### Risk Degerlendirmesi
| Bulgu | Seviye | Etki |
|-------|--------|------|
| payment_requests verisi acik | Kritik | Musteri e-posta/isim bilgileri herkese acik |
| user_subscriptions UPDATE | Onemli | Kullanicilar kredi/plan manipule edebilir |
| Sizdirilmis sifre korumasi | Orta | Zayif sifreler kullanilabilir |
| check-generation taskId | Dusuk | Sinirli bilgi sizintisi riski |

