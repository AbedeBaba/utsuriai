import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';

export default function DistanceSalesAgreement() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Mesafeli Satış Sözleşmesi</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Bu sözleşme, elektronik ortamda dijital ürün veya hizmet satın alan kullanıcı ile UtsuriAI arasında düzenlenmiştir.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5.1 Sözleşmenin Konusu</h2>
          <p className="text-muted-foreground mb-6">
            Bu sözleşme, dijital ürün ve hizmetlerin satışı ile tarafların hak ve yükümlülüklerini kapsar.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5.2 Dijital Ürün Teslimi</h2>
          <p className="text-muted-foreground mb-4">Dijital ürünler;</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Kullanıcı hesabı,</li>
            <li>Kullanıcı paneli</li>
          </ul>
          <p className="text-muted-foreground mb-6">üzerinden teslim edilir.</p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5.3 Cayma Hakkı</h2>
          <p className="text-muted-foreground mb-6">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, dijital içeriklerde kullanıma başlandıktan sonra cayma hakkı bulunmamaktadır.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5.4 Uyuşmazlıkların Çözümü</h2>
          <p className="text-muted-foreground">
            Uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır ve tüketici hakem heyetleri ile mahkemeleri yetkilidir.
          </p>
        </div>
      </main>
    </div>
  );
}
