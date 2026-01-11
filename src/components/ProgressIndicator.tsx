import { cn } from '@/lib/utils';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

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

  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-2.5 px-3 md:px-5 py-2 md:py-2.5 bg-white/[0.08] backdrop-blur-md rounded-full border border-white/15 shadow-lg max-w-[90vw] overflow-x-auto">
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
              "relative rounded-full transition-all duration-500 ease-out cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-400/50",
              // Size based on state
              isActive && "w-6 md:w-7 h-2 md:h-2.5",
              !isActive && "w-2 h-2 md:w-2.5 md:h-2.5",
              // Colors based on state
              isActive && "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.5)]",
              isCompleted && !isActive && "bg-violet-400/70",
              !isActive && !isCompleted && "bg-white/20 hover:bg-white/40",
              // Core indicator styling
              isCore && !isCompleted && !isActive && "ring-2 ring-violet-400/30"
            )}
            title={step.label}
            aria-label={`${step.label}${isCore ? ' (Required)' : ''}${isCompleted ? ' (Completed)' : ''}`}
          >
            {/* Completed checkmark for larger dots */}
            {isCompleted && !isActive && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="w-1.5 h-1.5 text-white" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
