import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Building2, Palmtree, Mountain, Trees, Snowflake, Coffee, Waves, Square } from 'lucide-react';

const backgroundOptions = [
  { id: 'City', label: 'City', subtitle: 'Urban backdrop', icon: <Building2 className="h-6 w-6" /> },
  { id: 'Fashion White', label: 'Fashion White', subtitle: 'Studio clean', icon: <Square className="h-6 w-6" /> },
  { id: 'Beach', label: 'Beach', subtitle: 'Coastal vibes', icon: <Palmtree className="h-6 w-6" /> },
  { id: 'Mountain', label: 'Mountain', subtitle: 'Scenic peaks', icon: <Mountain className="h-6 w-6" /> },
  { id: 'Forest', label: 'Forest', subtitle: 'Natural green', icon: <Trees className="h-6 w-6" /> },
  { id: 'Snowy', label: 'Snowy', subtitle: 'Winter scene', icon: <Snowflake className="h-6 w-6" /> },
  { id: 'Cafe', label: 'Cafe', subtitle: 'Cozy interior', icon: <Coffee className="h-6 w-6" /> },
  { id: 'Underwater', label: 'Underwater', subtitle: 'Aquatic theme', icon: <Waves className="h-6 w-6" /> },
];

export default function FilterBackground() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(config.gender === 'Male' ? 12 : 11);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((background: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(background);
    updateConfig('background', background);

    setTimeout(() => {
      navigate('/filter/face-type');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Background"
      subtitle="Choose the background scene for your image"
      onBack={() => navigate('/filter/pose')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
        {backgroundOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            icon={option.icon}
            selected={config.background === option.id}
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
