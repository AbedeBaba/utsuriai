import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const eyeColorOptions = [
  { id: 'Brown', label: 'Brown', color: '#634E34' },
  { id: 'Blue', label: 'Blue', color: '#4682B4' },
  { id: 'Hazel', label: 'Hazel', color: '#8E7618' },
  { id: 'Black', label: 'Black', color: '#1C1C1C' },
  { id: 'Green', label: 'Green', color: '#3D6B4F' },
  { id: 'Amber', label: 'Amber', color: '#CF9B52' },
  { id: 'Grey', label: 'Grey', color: '#808080' },
];

export default function FilterEyeColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const handleSelect = useCallback((eyeColor: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(eyeColor);
    updateConfig('eyeColor', eyeColor);

    setTimeout(() => {
      navigate('/filter/body-type');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title={t('filter.selectEyeColor')}
      subtitle={t('filter.eyeColorSubtitle')}
      onBack={() => navigate('/filter/hair-color')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
        {eyeColorOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            colorSwatch={option.color}
            selected={config.eyeColor === option.id}
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
