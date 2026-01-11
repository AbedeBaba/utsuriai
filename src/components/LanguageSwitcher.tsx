import { useLanguage, Language } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={`h-9 w-9 text-muted-foreground hover:text-foreground ${className || ''}`}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-card border border-border shadow-lg z-50"
      >
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-2 cursor-pointer ${language === 'en' ? 'bg-accent' : ''}`}
        >
          <span className="text-lg">🇬🇧</span>
          <span>{t('language.english')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('tr')}
          className={`flex items-center gap-2 cursor-pointer ${language === 'tr' ? 'bg-accent' : ''}`}
        >
          <span className="text-lg">🇹🇷</span>
          <span>{t('language.turkish')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}