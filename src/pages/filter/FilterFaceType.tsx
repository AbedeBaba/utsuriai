import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Circle, Square, Diamond, Heart, Hexagon } from 'lucide-react';

const faceTypeOptions = [
  { id: 'Oval', label: 'Oval', subtitle: 'Balanced proportions', icon: <Circle className="h-6 w-6" /> },
  { id: 'Round', label: 'Round', subtitle: 'Soft curves', icon: <Circle className="h-6 w-6" /> },
  { id: 'Square', label: 'Square', subtitle: 'Strong jawline', icon: <Square className="h-6 w-6" /> },
  { id: 'Heart', label: 'Heart', subtitle: 'Pointed chin', icon: <Heart className="h-6 w-6" /> },
  { id: 'Oblong', label: 'Oblong', subtitle: 'Elongated shape', icon: <Hexagon className="h-6 w-6" /> },
  { id: 'Diamond', label: 'Diamond', subtitle: 'Angular features', icon: <Diamond className="h-6 w-6" /> },
];

export default function FilterFaceType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(config.gender === 'Male' ? 13 : 12);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((faceType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(faceType);
    updateConfig('faceType', faceType);

    setTimeout(() => {
      navigate('/filter/expression');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Face Type"
      subtitle="Choose the face shape for your model"
      onBack={() => navigate('/filter/background')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative">
        {faceTypeOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            icon={option.icon}
            selected={config.faceType === option.id}
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
