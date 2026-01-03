import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const ethnicityOptions = [
  { id: 'Caucasian', label: 'Caucasian' },
  { id: 'African', label: 'African' },
  { id: 'Asian', label: 'Asian' },
  { id: 'Hispanic', label: 'Hispanic' },
  { id: 'Middle Eastern', label: 'Middle Eastern' },
  { id: 'South Asian', label: 'South Asian' },
  { id: 'Mixed', label: 'Mixed' },
  { id: 'Pacific Islander', label: 'Pacific Islander' },
  { id: 'Indigenous', label: 'Indigenous' },
];

const skinToneOptions = ['Fair', 'Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark', 'Deep', 'Ebony', 'Olive'];
const hairColorOptions = ['Black', 'Dark Brown', 'Brown', 'Light Brown', 'Blonde', 'Platinum', 'Red', 'Auburn', 'Gray'];
const eyeColorOptions = ['Brown', 'Dark Brown', 'Hazel', 'Green', 'Blue', 'Light Blue', 'Gray', 'Amber', 'Black'];
const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Plus Size', 'Petite', 'Tall', 'Hourglass'];
const hairTypeOptions = ['Straight', 'Wavy', 'Curly', 'Coily', 'Kinky', 'Bald', 'Short', 'Long', 'Braided'];
const beardTypeOptions = ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops'];

export default function FilterEthnicity() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleSelect = useCallback((ethnicity: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(ethnicity);
    updateConfig('ethnicity', ethnicity);

    setTimeout(() => {
      navigate('/filter/skin-tone');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const handleRandomAll = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Randomly select all filters
    const randomEthnicity = ethnicityOptions[Math.floor(Math.random() * ethnicityOptions.length)].id;
    const randomSkinTone = skinToneOptions[Math.floor(Math.random() * skinToneOptions.length)];
    const randomHairColor = hairColorOptions[Math.floor(Math.random() * hairColorOptions.length)];
    const randomEyeColor = eyeColorOptions[Math.floor(Math.random() * eyeColorOptions.length)];
    const randomBodyType = bodyTypeOptions[Math.floor(Math.random() * bodyTypeOptions.length)];
    const randomHairType = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)];
    const randomBeardType = beardTypeOptions[Math.floor(Math.random() * beardTypeOptions.length)];
    
    setSelectedId(randomEthnicity);
    
    // Update all configs
    updateConfig('ethnicity', randomEthnicity);
    updateConfig('skinTone', randomSkinTone);
    updateConfig('hairColor', randomHairColor);
    updateConfig('eyeColor', randomEyeColor);
    updateConfig('bodyType', randomBodyType);
    updateConfig('hairType', randomHairType);
    
    // Only set beard type if male
    if (config.gender === 'Male') {
      updateConfig('beardType', randomBeardType);
    }

    setTimeout(() => {
      navigate('/clothing');
    }, 1000);
  }, [isAnimating, navigate, updateConfig, config.gender]);

  return (
    <FilterStepLayout 
      title="Select Ethnicity"
      subtitle="Choose the ethnicity for your model"
      onBack={() => navigate('/filter/gender')}
      onRandom={handleRandomAll}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-4 relative">
        {ethnicityOptions.map((option, index) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            selected={config.ethnicity === option.id}
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
