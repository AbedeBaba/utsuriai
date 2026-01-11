import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { RandomFilterButton } from './RandomFilterButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useModelConfig } from '@/context/ModelConfigContext';
interface FilterStepLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  onRandom?: () => void;
}
export function FilterStepLayout({
  title,
  subtitle,
  children,
  onBack,
  showBack = true,
  onRandom
}: FilterStepLayoutProps) {
  const {
    currentStep,
    totalSteps
  } = useModelConfig();
  return <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        {showBack && onBack ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="relative text-white hover:text-white hover:bg-violet-500/30 border-2 border-white/50 backdrop-blur-xl rounded-xl transition-all duration-300 hover:border-violet-400 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] bg-black/30 w-11 h-11 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : <div className="w-11" />}
        
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <LanguageSwitcher />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 pb-8 pt-2">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white tracking-tight" style={{
            textShadow: '0 2px 20px rgba(167, 139, 250, 0.3), 0 1px 4px rgba(0, 0, 0, 0.4)'
          }}>{title}</h1>
          {subtitle && <p className="text-white/60 text-lg font-light tracking-wide">{subtitle}</p>}
        </div>

        {/* Random Button */}
        {onRandom && <div className="mb-6 animate-fade-in">
            <RandomFilterButton onClick={onRandom} />
          </div>}

        <div className="w-full flex-1 animate-slide-up outline-none" tabIndex={-1} style={{
        animationDelay: '0.1s'
      }}>
          {children}
        </div>
      </main>
    </div>;
}