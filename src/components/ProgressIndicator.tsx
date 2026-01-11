import { cn } from '@/lib/utils';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const navigate = useNavigate();
  const { getVisibleSteps, isStepCompleted, isStepRequired, config } = useModelConfig();
  
  const visibleSteps = getVisibleSteps();

  const handleStepClick = (stepIndex: number) => {
    const step = visibleSteps[stepIndex];
    if (!step) return;
    
    // Always allow navigation to any step
    navigate(step.path);
  };

  const currentStepIndex = currentStep - 1;
  const canGoPrev = currentStepIndex > 0;
  const canGoNext = currentStepIndex < visibleSteps.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      handleStepClick(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      handleStepClick(currentStepIndex + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Previous Arrow */}
      <button
        onClick={handlePrev}
        disabled={!canGoPrev}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          "bg-white/10 hover:bg-white/20 border border-white/20",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "hover:scale-110 active:scale-95"
        )}
        aria-label="Previous step"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-1 md:gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/[0.08] backdrop-blur-md rounded-full border border-white/15 shadow-lg">
        {visibleSteps.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = isStepCompleted(step.id);
          const isCore = isStepRequired(step.id);
          
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(i)}
              className={cn(
                "relative rounded-full transition-all duration-300 ease-out cursor-pointer",
                "hover:scale-125 focus:outline-none focus:ring-2 focus:ring-violet-400/50",
                // Size based on state
                isActive && "w-8 md:w-10 h-3 md:h-3.5",
                !isActive && "w-2.5 h-2.5 md:w-3 md:h-3",
                // Colors based on state
                isActive && "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-300 shadow-[0_0_20px_rgba(167,139,250,0.6)]",
                isCompleted && !isActive && "bg-violet-400/80 hover:bg-violet-400",
                !isActive && !isCompleted && "bg-white/25 hover:bg-white/50",
                // Core indicator styling
                isCore && !isCompleted && !isActive && "ring-2 ring-violet-400/40"
              )}
              title={`${step.label}${isCore ? ' (Required)' : ''}${isCompleted ? ' ✓' : ''} - Click to navigate`}
              aria-label={`${step.label}${isCore ? ' (Required)' : ''}${isCompleted ? ' (Completed)' : ''} - Click to navigate`}
            >
              {/* Completed checkmark */}
              {isCompleted && !isActive && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-2 h-2 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Next Arrow */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          "bg-white/10 hover:bg-white/20 border border-white/20",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "hover:scale-110 active:scale-95"
        )}
        aria-label="Next step"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Step Counter Label */}
      <div className="hidden sm:flex items-center gap-1 ml-2 px-3 py-1 bg-white/10 rounded-full border border-white/15">
        <span className="text-sm font-medium text-white">{currentStep}</span>
        <span className="text-xs text-white/60">/</span>
        <span className="text-sm text-white/60">{totalSteps}</span>
      </div>
    </div>
  );
}
