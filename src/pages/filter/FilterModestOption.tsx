import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import standardImage from '@/assets/modest-options/standard.png';
import hijabImage from '@/assets/modest-options/hijab.png';
import { useFilterFlowGuard } from '@/hooks/useFilterFlowGuard';

const modestOptions = [
  { id: 'Standard', label: 'Standard', subtitle: 'Regular appearance', image: standardImage },
  { id: 'Hijab', label: 'Hijab', subtitle: 'Head covering', image: hijabImage },
];

export default function FilterModestOption() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Guard: redirect to gender selection on page refresh
  useFilterFlowGuard();

  useEffect(() => {
    // Coverage is step 2 for females only
    setCurrentStep(2);
  }, [setCurrentStep]);

  // Redirect males to ethnicity
  useEffect(() => {
    if (config.gender === 'Male') {
      navigate('/filter/ethnicity');
    }
  }, [config.gender, navigate]);

  const handleSelect = useCallback((modestOption: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(modestOption);
    updateConfig('modestOption', modestOption);

    setTimeout(() => {
      navigate('/filter/ethnicity');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title={t('filter.selectCoverage')}
      subtitle={t('filter.coverageSubtitle')}
      onBack={() => navigate('/filter/gender')}
      isCorePage={true}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto relative px-4">
        {modestOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            image={option.image}
            selected={config.modestOption === option.id}
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
