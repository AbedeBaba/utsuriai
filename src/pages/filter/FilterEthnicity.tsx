import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Import ethnicity images
import arabicImg from '@/assets/ethnicities/arabic.png';
import turkishImg from '@/assets/ethnicities/turkish.png';
import russianImg from '@/assets/ethnicities/russian.png';
import asianImg from '@/assets/ethnicities/asian.png';
import latinImg from '@/assets/ethnicities/latin.png';
import scandinavianImg from '@/assets/ethnicities/scandinavian.png';
import australianImg from '@/assets/ethnicities/australian.png';
import indianImg from '@/assets/ethnicities/indian.png';
import localAmericanImg from '@/assets/ethnicities/local-american.png';
import afroAmericanImg from '@/assets/ethnicities/afro-american.png';
import italianImg from '@/assets/ethnicities/italian.png';
import europeanImg from '@/assets/ethnicities/european.png';

const ethnicityOptions = [
  { id: 'Arabic', label: 'Arabic', image: arabicImg },
  { id: 'Turkish', label: 'Turkish', image: turkishImg },
  { id: 'Russian', label: 'Russian', image: russianImg },
  { id: 'Asian', label: 'Asian', image: asianImg },
  { id: 'Latin', label: 'Latin', image: latinImg },
  { id: 'Scandinavian', label: 'Scandinavian', image: scandinavianImg },
  { id: 'Australian', label: 'Australian', image: australianImg },
  { id: 'Indian', label: 'Indian', image: indianImg },
  { id: 'Local American', label: 'Local American', image: localAmericanImg },
  { id: 'Afro American', label: 'Afro American', image: afroAmericanImg },
  { id: 'Italian', label: 'Italian', image: italianImg },
  { id: 'European', label: 'European', image: europeanImg },
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
      <div className="grid grid-cols-3 md:grid-cols-4 gap-5 relative max-w-5xl mx-auto">
        {ethnicityOptions.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "relative flex flex-col items-center justify-end gap-3 aspect-square min-w-[160px] md:min-w-[200px] rounded-2xl cursor-pointer overflow-hidden",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-xl",
              "border border-white/20 hover:border-violet-300/50",
              "shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.2)]",
              "hover:scale-[1.02] hover:-translate-y-1",
              "outline-none ring-0",
              config.ethnicity === option.id && "border-violet-400/70 ring-2 ring-violet-400/50",
              selectedId === option.id && isAnimating && "scale-105 z-10",
              isAnimating && selectedId !== option.id && "opacity-30 scale-95"
            )}
            style={{ 
              animationDelay: `${index * 30}ms`,
            }}
            tabIndex={-1}
          >
            {/* Background Image */}
            {option.image && (
              <div className="absolute inset-0">
                <img 
                  src={option.image} 
                  alt={option.label}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            )}
            
            {/* Label */}
            <div className="relative z-10 text-center pb-4 px-2">
              <p className="font-semibold text-lg text-white drop-shadow-lg">{option.label}</p>
            </div>
          </div>
        ))}
      </div>
    </FilterStepLayout>
  );
}
