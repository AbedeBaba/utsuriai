import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { User, Camera, ArrowDown, ArrowUp, Armchair, Lock } from 'lucide-react';

const poseOptions = [
  { id: 'Face Close-up', label: 'Face Close-up', subtitle: 'Portrait shot' },
  { id: 'Standing', label: 'Standing', subtitle: 'Full body upright' },
  { id: 'Sitting', label: 'Sitting', subtitle: 'Seated position' },
  { id: 'Leaning', label: 'Leaning', subtitle: 'Casual lean' },
  { id: 'Top-down', label: 'Top-down', subtitle: 'Overhead view' },
  { id: 'Arms Crossed', label: 'Arms Crossed', subtitle: 'Confident pose' },
  { id: 'Back View', label: 'Back View', subtitle: 'Rear angle' },
  { id: 'Low-angle', label: 'Low-angle', subtitle: 'Dramatic upward' },
];

export default function FilterPose() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(config.gender === 'Male' ? 11 : 10);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((pose: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(pose);
    updateConfig('pose', pose);

    setTimeout(() => {
      navigate('/filter/background');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Pose"
      subtitle="Choose the model's pose and camera angle"
      onBack={() => navigate('/filter/modest-option')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
        {poseOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            selected={config.pose === option.id}
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
