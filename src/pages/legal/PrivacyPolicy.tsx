import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Gizlilik Politikası</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Bu Gizlilik Politikası, UtsuriAI ("Site") tarafından işletilen www.utsuriai.com alan adı üzerinden sunulan dijital ürünler ve e‑ticaret hizmetleri kapsamında, kullanıcıların kişisel verilerinin nasıl toplandığını, işlendiğini, saklandığını ve korunduğunu açıklamak amacıyla hazırlanmıştır.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1.1 Toplanan Kişisel Veriler</h2>
          <p className="text-muted-foreground mb-4">Hizmetlerin sunulabilmesi amacıyla aşağıdaki kişisel veriler toplanabilir:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Ad, soyad</li>
            <li>E‑posta adresi</li>
            <li>Telefon numarası</li>
            <li>Fatura ve ödeme bilgileri</li>
            <li>IP adresi, cihaz, işletim sistemi ve tarayıcı bilgileri</li>
            <li>Kullanıcı işlem ve kullanım geçmişi</li>
            <li>Satın alınan dijital ürün ve hizmetlere ilişkin bilgiler</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1.2 Kişisel Verilerin Toplanma Yöntemi</h2>
          <p className="text-muted-foreground mb-4">Kişisel veriler;</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Site üzerindeki üyelik, iletişim ve satın alma formları,</li>
            <li>Kullanıcı hesap oluşturma ve giriş işlemleri,</li>
            <li>Çerezler (cookies) ve benzeri teknolojiler,</li>
            <li>E‑posta ve diğer iletişim kanalları</li>
          </ul>
          <p className="text-muted-foreground mb-6">aracılığıyla otomatik veya kısmen otomatik yollarla toplanmaktadır.</p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1.3 Kişisel Verilerin İşlenme Amaçları</h2>
          <p className="text-muted-foreground mb-4">Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Dijital ürün ve hizmetlerin sunulması</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Kullanıcı hesabının oluşturulması ve yönetilmesi</li>
            <li>Müşteri destek süreçlerinin yürütülmesi</li>
            <li>Hukuki ve yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Kullanıcı deneyiminin geliştirilmesi</li>
            <li>Kullanıcının açık rızası bulunması halinde pazarlama ve bilgilendirme faaliyetleri</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1.4 Kişisel Verilerin Saklanması ve Korunması</h2>
          <p className="text-muted-foreground mb-4">Kişisel veriler;</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Güvenli sunucularda saklanır,</li>
            <li>Yetkisiz erişim, kayıp ve kötüye kullanım risklerine karşı korunur,</li>
            <li>Güncel teknik ve idari güvenlik önlemleri ile muhafaza edilir.</li>
          </ul>
          <p className="text-muted-foreground mb-6">Veriler, ilgili mevzuatta öngörülen süreler boyunca saklanır ve sürenin sonunda silinir, yok edilir veya anonim hale getirilir.</p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1.5 Üçüncü Taraflarla Paylaşım</h2>
          <p className="text-muted-foreground mb-4">Kişisel veriler, yalnızca hizmetin gerektirdiği ölçüde ve hukuka uygun olarak;</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Ödeme hizmeti sağlayıcıları (örn. sanal POS ve ödeme altyapıları),</li>
            <li>Sunucu, yazılım ve barındırma hizmeti sağlayıcıları,</li>
            <li>Yasal merciler</li>
          </ul>
          <p className="text-muted-foreground mb-6">ile paylaşılabilir.</p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1.6 KVKK Kapsamındaki Haklarınız</h2>
          <p className="text-muted-foreground mb-4">6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kullanıcılar;</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
            <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme,</li>
            <li>Kişisel verilerin silinmesini veya yok edilmesini talep etme,</li>
            <li>İşleme faaliyetlerine itiraz etme</li>
          </ul>
          <p className="text-muted-foreground mb-6">haklarına sahiptir.</p>
          <p className="text-muted-foreground">Bu haklara ilişkin talepler <a href="mailto:bussiness@utsuriai.com" className="text-primary hover:underline">bussiness@utsuriai.com</a> adresi üzerinden iletilebilir.</p>
        </div>
      </main>
    </div>
  );
}
