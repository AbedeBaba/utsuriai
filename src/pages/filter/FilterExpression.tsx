import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Smile, Meh, Frown, Zap, Brain, Heart } from 'lucide-react';

const expressionOptions = [
  { id: 'Neutral', label: 'Neutral', subtitle: 'Calm expression', icon: <Meh className="h-6 w-6" /> },
  { id: 'Smile', label: 'Smile', subtitle: 'Warm and friendly', icon: <Smile className="h-6 w-6" /> },
  { id: 'Serious', label: 'Serious', subtitle: 'Professional look', icon: <Meh className="h-6 w-6" /> },
  { id: 'Confident', label: 'Confident', subtitle: 'Bold presence', icon: <Zap className="h-6 w-6" /> },
  { id: 'Thoughtful', label: 'Thoughtful', subtitle: 'Pensive mood', icon: <Brain className="h-6 w-6" /> },
  { id: 'Joyful', label: 'Joyful', subtitle: 'Radiant happiness', icon: <Heart className="h-6 w-6" /> },
];

export default function FilterExpression() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, totalSteps } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(config.gender === 'Male' ? 14 : 13);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((expression: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(expression);
    updateConfig('facialExpression', expression);

    setTimeout(() => {
      navigate('/clothing');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Expression"
      subtitle="Choose the facial expression for your model"
      onBack={() => navigate('/filter/face-type')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative">
        {expressionOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            icon={option.icon}
            selected={config.facialExpression === option.id}
            onClick={() => handleSelect(option.id)}
            isAnimating={selectedId === option.id}
            isFadingOut={isAnimating && selectedId !== option.id}
            animationDelay={index * 30}
          />
        ))}
      </div>
    </FilterStepLayout>
  );
}
