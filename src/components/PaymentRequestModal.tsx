import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Copy, CreditCard, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
}

// IBAN info - stored as image for security
const IBAN_INFO = {
  bankName: 'Garanti BBVA',
  recipientName: 'Çağatay Samet Macar',
  iban: 'TR62 0006 2000 4240 0006 5731 15',
};

export function PaymentRequestModal({ isOpen, onClose, packageName }: PaymentRequestModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Ad Soyad zorunludur';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Geçerli bir ad soyad giriniz';
    }
    
    if (!email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (phone && !/^[0-9+\s()-]{10,}$/.test(phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    if (!acceptedTerms) {
      newErrors.terms = 'KVKK ve Mesafeli Satış bilgilendirmesini kabul etmelisiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          package_name: packageName || null,
        });
      
      if (error) throw error;
      
      setSubmittedEmail(email.trim().toLowerCase());
      setIsSubmitted(true);
      
      toast({
        title: 'Başarılı!',
        description: 'Talebiniz alınmıştır.',
      });
    } catch (error) {
      console.error('Payment request error:', error);
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyIBAN = () => {
    navigator.clipboard.writeText(IBAN_INFO.iban.replace(/\s/g, ''));
    toast({
      title: 'Kopyalandı',
      description: 'IBAN panoya kopyalandı.',
    });
  };

  const handleClose = () => {
    // Reset form on close
    setFullName('');
    setEmail('');
    setPhone('');
    setAcceptedTerms(false);
    setErrors({});
    setIsSubmitted(false);
    setSubmittedEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Ödeme Talep Formu
          </DialogTitle>
          <DialogDescription>
            {packageName && (
              <span className="inline-flex items-center gap-1.5 mt-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {packageName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Ad Soyad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adınız ve soyadınız"
                className={errors.fullName ? 'border-destructive' : ''}
                maxLength={100}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-posta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className={errors.email ? 'border-destructive' : ''}
                maxLength={255}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefon <span className="text-muted-foreground text-xs">(isteğe bağlı)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                className={errors.phone ? 'border-destructive' : ''}
                maxLength={20}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  <Link to="/legal/privacy-policy" target="_blank" className="text-primary hover:underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  ,{' '}
                  <Link to="/legal/pre-information-form" target="_blank" className="text-primary hover:underline">
                    Ön Bilgilendirme Formu
                  </Link>
                  {' '}ve{' '}
                  <Link to="/legal/distance-sales-agreement" target="_blank" className="text-primary hover:underline">
                    Mesafeli Satış Sözleşmesi
                  </Link>
                  'ni okudum ve kabul ediyorum.
                  <span className="text-destructive"> *</span>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Ödeme Bilgilerini Göster'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Success Message */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">
                  Talebiniz alınmıştır
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ödeme bilgilerinizi aşağıda bulabilirsiniz.
                </p>
              </div>
            </div>

            {/* IBAN Card */}
            <div className="rounded-xl border bg-card p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b pb-3">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  Banka Havalesi ile Ödeme Bilgileri
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Banka Adı</span>
                  <span className="font-medium text-right">{IBAN_INFO.bankName}</span>
                </div>

                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Alıcı Adı</span>
                  <span className="font-medium text-right">{IBAN_INFO.recipientName}</span>
                </div>

                <div className="flex justify-between items-start py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">IBAN</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-right text-sm">
                      {IBAN_INFO.iban}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyIBAN}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="py-2">
                  <span className="text-muted-foreground text-sm block mb-1">
                    Açıklama <span className="text-destructive">(zorunlu)</span>
                  </span>
                  <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm break-all">
                    UTSURI – {packageName || 'Paket'} – {submittedEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Ödemenizi yaptıktan sonra en kısa sürede hesabınız aktif edilecektir.
              </p>
            </div>

            {/* Close Button */}
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Kapat
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
