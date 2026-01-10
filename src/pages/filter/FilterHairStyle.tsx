import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Scissors, Sparkles } from 'lucide-react';

const hairStyleOptions = [
  { id: 'Braided', label: 'Braided', subtitle: 'Intricate braids' },
  { id: 'Tied', label: 'Tied', subtitle: 'Pulled back' },
  { id: 'Styled', label: 'Styled', subtitle: 'Professionally done' },
  { id: 'Natural', label: 'Natural', subtitle: 'Free flowing' },
  { id: 'Ponytail', label: 'Ponytail', subtitle: 'Classic tied back' },
  { id: 'Bun', label: 'Bun', subtitle: 'Elegant updo' },
];

export default function FilterHairStyle() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(8);
  }, [setCurrentStep]);

  const handleSelect = useCallback((hairStyle: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(hairStyle);
    updateConfig('hairStyle', hairStyle);

    setTimeout(() => {
      if (config.gender === 'Male') {
        navigate('/filter/beard-type');
      } else {
        navigate('/filter/modest-option');
      }
    }, 1000);
  }, [isAnimating, navigate, updateConfig, config.gender]);

  return (
    <FilterStepLayout 
      title="Select Hair Style"
      subtitle="Choose how the hair should be styled"
      onBack={() => navigate('/filter/hair-type')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative">
        {hairStyleOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            icon={<Scissors className="h-6 w-6" />}
            selected={config.hairStyle === option.id}
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
