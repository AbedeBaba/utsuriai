import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const ethnicityOptions = [
  { id: 'Arabic', label: 'Arabic' },
  { id: 'Turkish', label: 'Turkish' },
  { id: 'Russian', label: 'Russian' },
  { id: 'Asian', label: 'Asian' },
  { id: 'Latin', label: 'Latin' },
  { id: 'Scandinavian', label: 'Scandinavian' },
  { id: 'Australian', label: 'Australian' },
  { id: 'Hindu', label: 'Hindu' },
  { id: 'Local American', label: 'Local American' },
  { id: 'Afro American', label: 'Afro American' },
  { id: 'Italian', label: 'Italian' },
  { id: 'European', label: 'European' },
];

const skinToneOptions = ['Fair', 'Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark', 'Deep', 'Ebony', 'Olive'];
const hairColorOptions = ['Black', 'White', 'Brown', 'Red', 'Blonde', 'Dark Blonde', 'Blue', 'Purple', 'Green', 'Platinum'];
const eyeColorOptions = ['Brown', 'Blue', 'Hazel', 'Black', 'Green', 'Amber', 'Grey'];
const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Plus Size', 'Petite', 'Tall', 'Hourglass'];
const hairTypeOptions = ['Straight', 'Wavy', 'Curly', 'Coily', 'Kinky', 'Bald', 'Short', 'Long', 'Braided'];
const hairStyleOptions = ['Braided', 'Tied', 'Styled', 'Natural', 'Ponytail', 'Bun'];
const beardTypeOptions = ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops'];
const poseOptions = ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Top-down', 'Arms Crossed', 'Back View', 'Low-angle'];
const backgroundOptions = ['City', 'Fashion White', 'Beach', 'Mountain', 'Forest', 'Snowy', 'Cafe', 'Underwater'];
const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident', 'Thoughtful', 'Joyful'];
const modestOptions = ['Standard', 'Modest', 'Hijab'];

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
    const randomHairStyle = hairStyleOptions[Math.floor(Math.random() * hairStyleOptions.length)];
    const randomBeardType = beardTypeOptions[Math.floor(Math.random() * beardTypeOptions.length)];
    const randomPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
    const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
    const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)];
    const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
    const randomModest = modestOptions[Math.floor(Math.random() * modestOptions.length)];
    
    setSelectedId(randomEthnicity);
    
    // Update all configs
    updateConfig('ethnicity', randomEthnicity);
    updateConfig('skinTone', randomSkinTone);
    updateConfig('hairColor', randomHairColor);
    updateConfig('eyeColor', randomEyeColor);
    updateConfig('bodyType', randomBodyType);
    updateConfig('hairType', randomHairType);
    updateConfig('hairStyle', randomHairStyle);
    updateConfig('pose', randomPose);
    updateConfig('background', randomBackground);
    updateConfig('faceType', randomFaceType);
    updateConfig('facialExpression', randomExpression);
    updateConfig('modestOption', randomModest);
    
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
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 relative">
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
