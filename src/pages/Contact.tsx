import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import { Footer } from '@/components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            İletişim
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Sorularınız için bizimle iletişime geçin. Size yardımcı olmaktan mutluluk duyarız.
          </p>

          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            {/* Address Card */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Adres</h2>
              <p className="text-muted-foreground leading-relaxed">
                Çukurören Küme Evleri, No:32<br />
                Gölpazarı / Bilecik<br />
                Turkey
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Telefon</h2>
              <a 
                href="tel:+905314051484" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                +90 531 405 14 84
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-3">E-posta</h2>
              <a 
                href="mailto:support@utsuriai.com" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                support@utsuriai.com
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              İş birliği ve kurumsal talepler için:{' '}
              <a 
                href="mailto:bussiness@utsuriai.com" 
                className="text-primary hover:underline"
              >
                bussiness@utsuriai.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
