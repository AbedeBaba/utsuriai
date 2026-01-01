import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const ethnicityOptions = [
  { id: 'Caucasian', label: 'Caucasian' },
  { id: 'African', label: 'African' },
  { id: 'Asian', label: 'Asian' },
  { id: 'Hispanic', label: 'Hispanic' },
  { id: 'Middle Eastern', label: 'Middle Eastern' },
  { id: 'South Asian', label: 'South Asian' },
  { id: 'Mixed', label: 'Mixed' },
  { id: 'Pacific Islander', label: 'Pacific Islander' },
  { id: 'Indigenous', label: 'Indigenous' },
];

export default function FilterEthnicity() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleSelect = useCallback((ethnicity: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(ethnicity);
    updateConfig('ethnicity', ethnicity);

    setTimeout(() => {
      navigate('/filter/skin-tone');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const handleRandom = useCallback(() => {
    const randomOption = ethnicityOptions[Math.floor(Math.random() * ethnicityOptions.length)];
    handleSelect(randomOption.id);
  }, [handleSelect]);

  return (
    <FilterStepLayout 
      title="Select Ethnicity"
      subtitle="Choose the ethnicity for your model"
      onBack={() => navigate('/filter/gender')}
      onRandom={handleRandom}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-4 relative">
        {ethnicityOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            selected={config.ethnicity === option.id}
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
