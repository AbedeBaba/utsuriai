import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, User } from 'lucide-react';
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            İletişim
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Sorularınız için bizimle iletişime geçin. Size yardımcı olmaktan mutluluk duyarız.
          </p>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Name Card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow min-h-[200px] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">İsim</h2>
              <p className="text-sm text-muted-foreground">
                Çağatay Samet Macar
              </p>
            </div>

            {/* Address Card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow min-h-[200px] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">Adres</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Çukurören Küme Evleri, No:32<br />
                Gölpazarı / Bilecik<br />
                Turkey
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow min-h-[200px] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">Telefon</h2>
              <a 
                href="tel:+905314051484" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                +90 531 405 14 84
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow min-h-[200px] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">E-posta</h2>
              <a 
                href="mailto:support@utsuriai.com" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
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
