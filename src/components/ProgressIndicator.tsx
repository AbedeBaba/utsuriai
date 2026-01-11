import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        
        return (
          <div
            key={step}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              isActive && "w-6 bg-gradient-to-r from-violet-400 to-purple-500 shadow-lg shadow-violet-500/50",
              isCompleted && "bg-violet-400/60",
              !isActive && !isCompleted && "bg-white/20"
            )}
          />
        );
      })}
    </div>
  );
}
