import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const beardTypeOptions = [
  { id: 'Clean Shaven', label: 'Clean Shaven', subtitle: 'No facial hair' },
  { id: 'Stubble', label: 'Stubble', subtitle: '5 o\'clock shadow' },
  { id: 'Short Beard', label: 'Short Beard', subtitle: 'Trimmed and neat' },
  { id: 'Full Beard', label: 'Full Beard', subtitle: 'Thick and full' },
  { id: 'Goatee', label: 'Goatee', subtitle: 'Chin beard' },
  { id: 'Mustache', label: 'Mustache', subtitle: 'Upper lip only' },
  { id: 'Van Dyke', label: 'Van Dyke', subtitle: 'Goatee with mustache' },
  { id: 'Circle Beard', label: 'Circle Beard', subtitle: 'Connected style' },
  { id: 'Mutton Chops', label: 'Mutton Chops', subtitle: 'Side whiskers' },
];

export default function FilterBeardType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(8);
  }, [setCurrentStep]);

  useEffect(() => {
    if (config.gender !== 'Male') {
      navigate('/clothing');
    }
  }, [config.gender, navigate]);

  const handleSelect = useCallback((beardType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(beardType);
    updateConfig('beardType', beardType);

    setTimeout(() => {
      navigate('/clothing');
    }, 600);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Beard Type"
      subtitle="Choose the facial hair style for your model"
      onBack={() => navigate('/filter/hair-type')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-4 relative">
        {beardTypeOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            selected={config.beardType === option.id}
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
