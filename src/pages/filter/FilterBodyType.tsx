import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const bodyTypeOptions = [
  { id: 'Slim', label: 'Slim', subtitle: 'Lean and slender' },
  { id: 'Athletic', label: 'Athletic', subtitle: 'Toned and fit' },
  { id: 'Average', label: 'Average', subtitle: 'Balanced build' },
  { id: 'Muscular', label: 'Muscular', subtitle: 'Strong and defined' },
  { id: 'Curvy', label: 'Curvy', subtitle: 'Full figured' },
  { id: 'Plus Size', label: 'Plus Size', subtitle: 'Full bodied' },
  { id: 'Petite', label: 'Petite', subtitle: 'Small and delicate' },
  { id: 'Tall', label: 'Tall', subtitle: 'Long and lean' },
  { id: 'Hourglass', label: 'Hourglass', subtitle: 'Balanced proportions' },
];

export default function FilterBodyType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(6);
  }, [setCurrentStep]);

  const handleSelect = useCallback((bodyType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(bodyType);
    updateConfig('bodyType', bodyType);

    setTimeout(() => {
      navigate('/filter/hair-type');
    }, 600);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Body Type"
      subtitle="Choose the body type for your model"
      onBack={() => navigate('/filter/eye-color')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-4 relative">
        {bodyTypeOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            selected={config.bodyType === option.id}
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
