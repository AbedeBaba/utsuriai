import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const skinToneOptions = [
  { id: 'Fair', label: 'Fair', color: '#FFE5D4' },
  { id: 'Light', label: 'Light', color: '#F5D0B5' },
  { id: 'Medium Light', label: 'Medium Light', color: '#D9A87C' },
  { id: 'Medium', label: 'Medium', color: '#C68642' },
  { id: 'Medium Dark', label: 'Medium Dark', color: '#8D5524' },
  { id: 'Dark', label: 'Dark', color: '#6B4423' },
  { id: 'Deep', label: 'Deep', color: '#4A2C17' },
  { id: 'Ebony', label: 'Ebony', color: '#3A1F0D' },
  { id: 'Olive', label: 'Olive', color: '#C4A77D' },
];

export default function FilterSkinTone() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const handleSelect = useCallback((skinTone: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(skinTone);
    updateConfig('skinTone', skinTone);

    setTimeout(() => {
      navigate('/filter/hair-color');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title={t('filter.selectSkinTone')}
      subtitle={t('filter.skinToneSubtitle')}
      onBack={() => navigate('/filter/ethnicity')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-4 relative">
        {skinToneOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            colorSwatch={option.color}
            selected={config.skinTone === option.id}
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
