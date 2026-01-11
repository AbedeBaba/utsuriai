import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white/[0.08] backdrop-blur-md rounded-full border border-white/15 shadow-lg">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        
        return (
          <div
            key={step}
            className={cn(
              "rounded-full transition-all duration-500 ease-out",
              isActive && "w-7 h-2.5 bg-gradient-to-r from-violet-400 via-purple-400 to-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.5)]",
              isCompleted && "w-2.5 h-2.5 bg-violet-400/50",
              !isActive && !isCompleted && "w-2 h-2 bg-white/20"
            )}
          />
        );
      })}
    </div>
  );
}
