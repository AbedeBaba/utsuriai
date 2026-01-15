import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MembershipAgreement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground italic">UtsuriAI</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Üyelik Sözleşmesi</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Bu sözleşme, UtsuriAI ile Site'ye üye olan kullanıcı arasında akdedilmiştir.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3.1 Üyelik</h2>
          <p className="text-muted-foreground mb-6">
            Üyelik ücretsizdir. Kullanıcı, üyelik sırasında verdiği bilgilerin doğru olduğunu kabul eder.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3.2 Hesap Güvenliği</h2>
          <p className="text-muted-foreground mb-6">
            Kullanıcı, hesap bilgilerini gizli tutmakla yükümlüdür. Hesap üzerinden gerçekleştirilen tüm işlemler kullanıcı sorumluluğundadır.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3.3 Üyeliğin Sonlandırılması</h2>
          <p className="text-muted-foreground">
            UtsuriAI, kullanım koşullarına aykırı davranan kullanıcıların üyeliğini askıya alma veya sonlandırma hakkını saklı tutar.
          </p>
        </div>
      </main>
    </div>
  );
}
