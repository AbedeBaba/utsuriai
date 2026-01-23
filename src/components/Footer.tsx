import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BrandLogo } from '@/components/BrandLogo';

interface FooterProps {
  variant?: 'light' | 'dark';
}

export function Footer({ variant = 'light' }: FooterProps) {
  const isDark = variant === 'dark';
  const { t } = useLanguage();
  
  return (
    <footer className={`py-12 ${isDark ? 'bg-[#0a0a0f] border-t border-white/10' : 'bg-secondary/30 border-t border-border'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <BrandLogo
                size="xl"
                withText
                text="UtsuriAI"
                textClassName={
                  isDark
                    ? 'text-white font-bold text-xl not-italic'
                    : 'font-bold text-xl not-italic'
                }
              />
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {t('footer.brandDescription')}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-foreground'}`}>{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/faq" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/privacy-policy" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/terms-of-use" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t('footer.termsOfUse')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/membership-agreement" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t('footer.membershipAgreement')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Sales Documents */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-foreground'}`}>{t('footer.sales')}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/legal/pre-information-form" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t('footer.preInformationForm')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/distance-sales-agreement" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t('footer.distanceSalesAgreement')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-foreground'}`}>{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  Gölpazarı / Bilecik, Turkey
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`} />
                <a 
                  href="tel:+905314051484" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  +90 531 405 14 84
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`} />
                <a 
                  href="mailto:support@utsuriai.com" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  support@utsuriai.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <User className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  Çağatay Samet Macar
                </span>
              </li>
              <li className="pt-1">
                <Link 
                  to="/contact" 
                  className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t('footer.contactPage')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-white/10' : 'border-border'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
            © {new Date().getFullYear()} UtsuriAI. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-6">
            <Link 
              to="/faq" 
              className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('footer.faqShort')}
            </Link>
            <Link 
              to="/legal/privacy-policy" 
              className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('footer.privacy')}
            </Link>
            <Link 
              to="/legal/terms-of-use" 
              className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}