import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PreInformationForm() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Ön Bilgilendirme Formu</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Bu form, Mesafeli Satış Sözleşmesi öncesinde kullanıcıyı bilgilendirmek amacıyla hazırlanmıştır.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Satıcı Bilgileri</h2>
          <ul className="list-none pl-0 text-muted-foreground space-y-2 mb-6">
            <li><strong>Ünvan:</strong> UtsuriAI</li>
            <li><strong>E‑posta:</strong> <a href="mailto:bussiness@utsuriai.com" className="text-primary hover:underline">bussiness@utsuriai.com</a></li>
            <li><strong>Web Sitesi:</strong> <a href="https://www.utsuriai.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.utsuriai.com</a></li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Ürün / Hizmet Bilgileri</h2>
          <p className="text-muted-foreground mb-6">
            Satılan ürünler dijital içerik ve dijital hizmetlerden oluşmaktadır. Fiziksel teslimat yapılmaz.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Ödeme ve Teslimat</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Ödeme online olarak alınır.</li>
            <li>Dijital ürünler, ödeme tamamlandıktan sonra kullanıcı hesabı üzerinden erişime açılır.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Cayma Hakkı</h2>
          <p className="text-muted-foreground">
            Dijital içeriklerde, ifaya başlandıktan sonra cayma hakkı bulunmamaktadır.
          </p>
        </div>
      </main>
    </div>
  );
}
