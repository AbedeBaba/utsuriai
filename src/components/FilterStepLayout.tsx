import { ReactNode } from 'react';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { RandomFilterButton } from './RandomFilterButton';
import { RandomSingleFilterButton } from './RandomSingleFilterButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useModelConfig } from '@/context/ModelConfigContext';

interface FilterStepLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  onRandom?: () => void;
  onRandomSingle?: () => void;
  hideSubtitleBackground?: boolean;
  infoText?: string;
  isCorePage?: boolean;
}

export function FilterStepLayout({
  title,
  subtitle,
  children,
  onBack,
  showBack = true,
  onRandom,
  onRandomSingle,
  hideSubtitleBackground = false,
  infoText,
  isCorePage = false
}: FilterStepLayoutProps) {
  const navigate = useNavigate();
  const {
    currentStep,
    totalSteps
  } = useModelConfig();
  
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 w-full max-w-full">
        <div className="flex items-center gap-2">
          {showBack && onBack ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack} 
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-300 hover:border-slate-300 w-11 h-11"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-11" />
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')} 
            className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-300 hover:border-slate-300 w-11 h-11"
            title="Go to Dashboard"
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </div>
        
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <LanguageSwitcher />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 pb-8 pt-2 overflow-x-hidden max-w-full">
        <div className="text-center mb-4 animate-fade-in w-full max-w-full px-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className={`tracking-wide text-slate-600 mx-0 px-0 font-medium text-base ${hideSubtitleBackground ? '' : 'bg-slate-50 rounded-lg px-4 py-2'}`}>
              {subtitle}
            </p>
          )}
          
          {/* Info Text - positioned below subtitle */}
          {infoText && (
            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed mt-3 px-4">
              {infoText}
            </p>
          )}
        </div>

        {/* Random Buttons Row */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          {/* Global Random Button (fills all remaining filters) */}
          {onRandom && (
            <RandomFilterButton onClick={onRandom} />
          )}
          
          {/* Single Filter Random Button (only on non-core pages) */}
          {onRandomSingle && !isCorePage && (
            <RandomSingleFilterButton onClick={onRandomSingle} />
          )}
        </div>

        <div className="w-full flex-1 animate-slide-up outline-none overflow-x-hidden max-w-full" tabIndex={-1} style={{
          animationDelay: '0.1s'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}