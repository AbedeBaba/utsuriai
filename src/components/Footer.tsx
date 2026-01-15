import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface FooterProps {
  variant?: 'light' | 'dark';
}

export function Footer({ variant = 'light' }: FooterProps) {
  const isDark = variant === 'dark';
  
  return (
    <footer className={`py-12 ${isDark ? 'bg-[#0a0a0f] border-t border-white/10' : 'bg-secondary/30 border-t border-border'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-foreground'}`}>UtsuriAI</span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
              AI-powered fashion photography platform. Create stunning model photos in minutes.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-foreground'}`}>Yasal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/legal/privacy-policy" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/terms-of-use" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/membership-agreement" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Üyelik Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>

          {/* Sales Documents */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-foreground'}`}>Satış</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/legal/pre-information-form" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Ön Bilgilendirme Formu
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/distance-sales-agreement" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-foreground'}`}>Şirket</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/pricing" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Fiyatlandırma
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:bussiness@utsuriai.com" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  İletişim
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-white/10' : 'border-border'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
            © {new Date().getFullYear()} UtsuriAI. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-6">
            <Link 
              to="/legal/privacy-policy" 
              className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Gizlilik
            </Link>
            <Link 
              to="/legal/terms-of-use" 
              className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Koşullar
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
