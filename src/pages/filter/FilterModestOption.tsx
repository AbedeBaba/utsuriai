import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { User, Heart } from 'lucide-react';

const modestOptions = [
  { id: 'Standard', label: 'Standard', subtitle: 'Regular appearance', icon: <User className="h-6 w-6" /> },
  { id: 'Modest', label: 'Modest', subtitle: 'Conservative styling', icon: <User className="h-6 w-6" /> },
  { id: 'Hijab', label: 'Hijab', subtitle: 'Head covering', icon: <Heart className="h-6 w-6" /> },
];

export default function FilterModestOption() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(config.gender === 'Male' ? 10 : 9);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((modestOption: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(modestOption);
    updateConfig('modestOption', modestOption);

    setTimeout(() => {
      navigate('/filter/pose');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title={t('filter.selectCoverage')}
      subtitle={t('filter.coverageSubtitle')}
      onBack={() => config.gender === 'Male' ? navigate('/filter/beard-type') : navigate('/filter/hair-style')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-4 relative">
        {modestOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            icon={option.icon}
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
