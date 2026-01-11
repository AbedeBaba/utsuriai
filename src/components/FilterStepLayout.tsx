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
      <header className="flex items-center justify-between p-6">
        {showBack && onBack ? <Button variant="ghost" size="icon" onClick={onBack} className="text-white/60 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-md rounded-xl transition-all duration-500 hover:border-violet-300/40 hover:shadow-[0_0_20px_rgba(167,139,250,0.15)]">
            <ArrowLeft className="h-5 w-5" />
          </Button> : <div className="w-10" />}
        
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <LanguageSwitcher />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-semibold mb-4 text-white tracking-tight" style={{
            textShadow: '0 2px 20px rgba(167, 139, 250, 0.25), 0 1px 4px rgba(0, 0, 0, 0.3)'
          }}>{title}</h1>
          {subtitle && <p className="text-white/50 text-lg font-light tracking-wide">{subtitle}</p>}
        </div>

        {/* Random Button */}
        {onRandom && <div className="mb-6 animate-fade-in">
            <RandomFilterButton onClick={onRandom} />
          </div>}

        <div className="w-full max-w-3xl animate-slide-up outline-none" tabIndex={-1} style={{
        animationDelay: '0.1s'
      }}>
          {children}
        </div>
      </main>
    </div>;
}