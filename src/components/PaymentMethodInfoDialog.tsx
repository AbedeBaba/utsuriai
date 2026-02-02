import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreditCard, Building2, Shield, Clock } from 'lucide-react';

interface PaymentMethodInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function PaymentMethodInfoDialog({ isOpen, onClose, onContinue }: PaymentMethodInfoDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Ödeme Yöntemleri
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              {/* Current Method */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <Building2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Banka Havalesi
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Şu anda aktif ödeme yöntemi
                    </p>
                  </div>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      Kredi Kartı / Banka Kartı
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Çok yakında eklenecek</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Message */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Güvenliğiniz bizim için en önemli öncelik. Tüm ödeme işlemleriniz 
                  güvenli altyapımız üzerinden gerçekleştirilmektedir.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel 
            onClick={onClose}
            className="sm:flex-1"
          >
            Vazgeç
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinue}
            className="sm:flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Banka Havalesi ile Devam Et
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
