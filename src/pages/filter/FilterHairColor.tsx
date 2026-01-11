import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Female hair color images
import femaleBlack from '@/assets/hair-colors/female-black.png';
import femaleWhite from '@/assets/hair-colors/female-white.png';
import femaleBrown from '@/assets/hair-colors/female-brown.png';
import femaleRed from '@/assets/hair-colors/female-red.png';
import femaleBlonde from '@/assets/hair-colors/female-blonde.png';
import femaleDarkBlonde from '@/assets/hair-colors/female-dark-blonde.png';
import femaleBlue from '@/assets/hair-colors/female-blue.png';
import femalePurple from '@/assets/hair-colors/female-purple.png';
import femaleGreen from '@/assets/hair-colors/female-green.png';
import femalePlatinum from '@/assets/hair-colors/female-platinum.png';

const hairColorOptions = [
  { id: 'Black', label: 'Black', color: '#1C1C1C', femaleImage: femaleBlack },
  { id: 'White', label: 'White', color: '#F5F5F5', femaleImage: femaleWhite },
  { id: 'Brown', label: 'Brown', color: '#6A4E42', femaleImage: femaleBrown },
  { id: 'Red', label: 'Red', color: '#922B21', femaleImage: femaleRed },
  { id: 'Blonde', label: 'Blonde', color: '#E8D5B5', femaleImage: femaleBlonde },
  { id: 'Dark Blonde', label: 'Dark Blonde', color: '#B89B72', femaleImage: femaleDarkBlonde },
  { id: 'Blue', label: 'Blue', color: '#4A90D9', femaleImage: femaleBlue },
  { id: 'Purple', label: 'Purple', color: '#7B4B8A', femaleImage: femalePurple },
  { id: 'Green', label: 'Green', color: '#4A7C59', femaleImage: femaleGreen },
  { id: 'Platinum', label: 'Platinum', color: '#E5E4E2', femaleImage: femalePlatinum },
];

export default function FilterHairColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isFemale = config.gender === 'Female';

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
            colorSwatch={!isFemale ? option.color : undefined}
            image={isFemale ? option.femaleImage : undefined}
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
