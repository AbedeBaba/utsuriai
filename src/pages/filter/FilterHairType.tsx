import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const hairTypeOptions = [
  { id: 'Straight', label: 'Straight', subtitle: 'Sleek and smooth' },
  { id: 'Wavy', label: 'Wavy', subtitle: 'Soft waves' },
  { id: 'Curly', label: 'Curly', subtitle: 'Defined curls' },
  { id: 'Coily', label: 'Coily', subtitle: 'Tight coils' },
  { id: 'Kinky', label: 'Kinky', subtitle: 'Dense texture' },
  { id: 'Bald', label: 'Bald', subtitle: 'Clean shaved' },
  { id: 'Short', label: 'Short', subtitle: 'Cropped style' },
  { id: 'Long', label: 'Long', subtitle: 'Flowing length' },
  { id: 'Braided', label: 'Braided', subtitle: 'Styled braids' },
];

export default function FilterHairType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(7);
  }, [setCurrentStep]);

  const handleSelect = useCallback((hairType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(hairType);
    updateConfig('hairType', hairType);

    setTimeout(() => {
      if (config.gender === 'Male') {
        navigate('/filter/beard-type');
      } else {
        navigate('/clothing');
      }
    }, 1000);
  }, [isAnimating, navigate, updateConfig, config.gender]);

  const handleRandom = useCallback(() => {
    const randomOption = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)];
    handleSelect(randomOption.id);
  }, [handleSelect]);

  return (
    <FilterStepLayout 
      title="Select Hair Type"
      subtitle="Choose the hair type for your model"
      onBack={() => navigate('/filter/body-type')}
      onRandom={handleRandom}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-4 relative">
        {hairTypeOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            selected={config.hairType === option.id}
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
