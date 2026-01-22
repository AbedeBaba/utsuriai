import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';

export default function TermsOfUse() {
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
            <BrandLogo size="sm" withText text="UtsuriAI" />
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Kullanım Koşulları</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            www.utsuriai.com alan adlı Site'yi kullanan tüm kullanıcılar aşağıdaki koşulları kabul etmiş sayılır.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2.1 Hizmet Tanımı</h2>
          <p className="text-muted-foreground mb-6">
            UtsuriAI, dijital ürünler ve yapay zekâ tabanlı e‑ticaret çözümleri sunan bir platformdur. Sunulan hizmetler ücretsiz veya ücretli olabilir.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2.2 Kullanıcı Yükümlülükleri</h2>
          <p className="text-muted-foreground mb-4">Kullanıcı;</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Doğru, güncel ve eksiksiz bilgi vermeyi,</li>
            <li>Siteyi hukuka ve ahlaka aykırı şekilde kullanmamayı,</li>
            <li>Üçüncü kişilerin haklarını ihlal etmemeyi</li>
          </ul>
          <p className="text-muted-foreground mb-6">kabul eder.</p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2.3 Fikri Mülkiyet Hakları</h2>
          <p className="text-muted-foreground mb-6">
            Site'de yer alan tüm içerik, yazılım, tasarım, marka ve dijital ürünler UtsuriAI'ye aittir. İzinsiz olarak kopyalanamaz, çoğaltılamaz, satılamaz veya dağıtılamaz.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2.4 Hizmet Değişiklikleri</h2>
          <p className="text-muted-foreground">
            UtsuriAI, sunulan hizmetlerde değişiklik yapma, geçici olarak durdurma veya tamamen sonlandırma hakkını saklı tutar.
          </p>
        </div>
      </main>
    </div>
  );
}
