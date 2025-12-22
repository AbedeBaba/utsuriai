import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { useModelConfig } from '@/context/ModelConfigContext';

interface FilterStepLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export function FilterStepLayout({ 
  title, 
  subtitle, 
  children, 
  onBack,
  showBack = true 
}: FilterStepLayoutProps) {
  const { currentStep, totalSteps } = useModelConfig();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        {showBack && onBack ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
        
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-semibold text-foreground mb-2">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
