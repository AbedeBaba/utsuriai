import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const hairColorOptions = [
  { id: 'Black', label: 'Black', color: '#1C1C1C' },
  { id: 'White', label: 'White', color: '#F5F5F5' },
  { id: 'Brown', label: 'Brown', color: '#6A4E42' },
  { id: 'Red', label: 'Red', color: '#922B21' },
  { id: 'Blonde', label: 'Blonde', color: '#E8D5B5' },
  { id: 'Dark Blonde', label: 'Dark Blonde', color: '#B89B72' },
  { id: 'Blue', label: 'Blue', color: '#4A90D9' },
  { id: 'Purple', label: 'Purple', color: '#7B4B8A' },
  { id: 'Green', label: 'Green', color: '#4A7C59' },
  { id: 'Platinum', label: 'Platinum', color: '#E5E4E2' },
];

export default function FilterHairColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const handleSelect = useCallback((hairColor: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(hairColor);
    updateConfig('hairColor', hairColor);

    setTimeout(() => {
      navigate('/filter/eye-color');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Hair Color"
      subtitle="Choose the hair color for your model"
      onBack={() => navigate('/filter/skin-tone')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
        {hairColorOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            colorSwatch={option.color}
            selected={config.hairColor === option.id}
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
