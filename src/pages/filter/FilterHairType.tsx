import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
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
];

export default function FilterHairType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { t } = useLanguage();
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
      navigate('/filter/hair-style');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title={t('filter.selectHairType')}
      subtitle={t('filter.hairTypeSubtitle')}
      onBack={() => navigate('/filter/body-type')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
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
