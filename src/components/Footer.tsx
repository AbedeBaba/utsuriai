import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Utsuri</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered fashion photography platform. Create stunning model photos in minutes.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/legal/privacy-policy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/terms-of-use" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/membership-agreement" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Membership Agreement
                </Link>
              </li>
            </ul>
          </div>

          {/* Sales Documents */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Sales</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/legal/pre-information-form" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pre-Information Form
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/distance-sales-agreement" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Distance Sales Agreement
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/pricing" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@utsuri.ai" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Utsuri. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link 
              to="/legal/privacy-policy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/legal/terms-of-use" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
